# CLAUDE.md — REFUGALLO: Sistema de Votaciones Web

Fuente de verdad: `prompt.md` | Arquitectura de agentes: `agents.md`

> **Al iniciar cada sesión:** leer `MEMORY.md` en la raíz del proyecto antes de cualquier tarea.
> **Durante la sesión:** cada vez que el usuario corrija algo o se aprenda algo nuevo, escribirlo en `MEMORY.md` inmediatamente.

---

## Stack tecnológico

| Capa            | Tecnología                                                             |
|-----------------|------------------------------------------------------------------------|
| Framework       | Nuxt.js 3 + TypeScript                                                 |
| Estilos         | Tailwind CSS (`@nuxtjs/tailwindcss`) — colores siempre en config, nunca inline |
| Slider          | Swiper.js                                                              |
| Base de datos   | Supabase (PostgreSQL) con Row Level Security                           |
| Auth            | `@nuxtjs/supabase` (Supabase Auth)                                     |
| Estado global   | Pinia (`@pinia/nuxt`)                                                  |
| Utilidades      | `@vueuse/core`, `@vueuse/motion`, `@vueuse/nuxt`                       |
| Iconos          | `lucide-vue-next`                                                      |
| Galería masonry | `vue3-masonry-css`                                                     |

---

## Decisiones arquitectónicas clave

- La tabla `profiles` **no existe**. Nombre, email y rol se gestionan sobre `auth.users` vía Admin API de Supabase.
- El rol (`user` / `admin`) vive en `raw_app_meta_data` (no editable por el usuario; accesible en el JWT).
- `is_admin()` lee de `auth.jwt() -> 'app_metadata' ->> 'role'`.
- Endpoints de perfil usan Bearer token: el cliente pasa `Authorization: Bearer <access_token>`.
- `serverSupabaseServiceRole` solo en endpoints admin — nunca en endpoints públicos.
- La lógica de voto registrado (UPSERT + ajuste de likes) usa el RPC `vote_theme` en Supabase; no hay endpoint REST propio para ello.
- `(supabase as any).rpc(...)` para evitar errores TypeScript por tipos no generados del RPC.

---

## Base de datos

### `themes`

| Campo       | Tipo                   |
|-------------|------------------------|
| id          | SERIAL (PK)            |
| title       | TEXT NOT NULL          |
| subtitle    | TEXT                   |
| description | TEXT                   |
| text        | TEXT                   |
| mainImg     | TEXT (URL)             |
| heroImg     | TEXT (URL)             |
| thumbImg    | TEXT (URL)             |
| likes       | INTEGER (default 0)    |
| visible     | BOOLEAN (default true) |
| order       | INTEGER (default 0)    |
| created_at  | TIMESTAMPTZ            |

### `votes` — usuarios registrados

| Campo      | Tipo                      |
|------------|---------------------------|
| id         | SERIAL (PK)               |
| user_id    | UUID (FK → auth.users.id) |
| theme_id   | INTEGER (FK → themes.id)  |
| created_at | TIMESTAMPTZ               |

**Constraint:** `UNIQUE(user_id)` — un registro registrado tiene un solo voto activo. Se hace UPSERT al cambiar de theme.

### `anonymous_votes` — usuarios NO registrados

| Campo            | Tipo                     |
|------------------|--------------------------|
| id               | SERIAL (PK)              |
| poll_id          | INTEGER (FK → themes.id) |
| client_token     | TEXT NOT NULL            |
| ip_hash          | TEXT                     |
| fingerprint_hash | TEXT                     |
| created_at       | TIMESTAMPTZ              |

**Índices:**
- `UNIQUE(poll_id, client_token)`
- índice en `(poll_id, ip_hash)`
- índice en `(poll_id, fingerprint_hash)`

---

## Lógica de votación

### Usuario registrado
- Puede votar y **cambiar su voto cuando quiera** (UPSERT via RPC `vote_theme`).
- Al cambiar de voto: se resta 1 del `likes` del theme anterior y se suma 1 al nuevo.
- Si ya votó ese theme → se muestra `"Tu elección"` en lugar del botón Votar.

### Usuario NO registrado
- Puede votar **una sola vez**. No puede cambiar su voto (salvo que se registre).
- No se intenta "garantizar" un voto por persona; se añade fricción suficiente para evitar duplicados casuales.

**Sistema de capas anti-duplicado:**

| Capa | Mecanismo |
|------|-----------|
| 1 | **Cookie/localStorage** — `client_token` aleatorio generado por el servidor al abrir la encuesta |
| 2 | **Registro en servidor** — `poll_id`, `client_token`, `ip_hash`, `user_agent_hash`, `created_at` en `anonymous_votes` |
| 3 | **Rate limit por IP** — máximo 1 voto por encuesta/IP en 24h (o 3 intentos/hora) |
| 4 | **CAPTCHA** — obligatorio antes de aceptar el voto |
| 5 | **Fingerprint suave** — hash de: user-agent + idioma + zona horaria + resolución + plataforma |

**Flujo de voto anónimo:**
1. El servidor genera `client_token` → lo entrega al cliente via cookie/localStorage al cargar la encuesta.
2. Al votar, el cliente envía: `poll_id`, opción elegida, `client_token`, respuesta CAPTCHA, fingerprint.
3. El backend verifica:
   - `client_token` no existe en `anonymous_votes` para ese `poll_id` → Bloqueo 1
   - IP ya votó en esa encuesta → Bloqueo 2 (rechazar o limitar)
   - Fingerprint ya votó en esa encuesta → Bloqueo 3 (rechazar o marcar sospechoso)
   - Demasiados intentos en poco tiempo → Bloqueo 4 (bloqueo temporal)
4. Si pasa todos los controles → guarda el voto y devuelve confirmación.
5. Si falla → devuelve `"ya has votado"`.

**Botón Votar cuando el usuario NO está registrado:** redirige a `/registro`.

---

## Rutas

```
/                    → Página principal
/theme/:id           → Detalle de un theme
/ranking             → Ranking de votaciones
/quienes-somos       → Quiénes somos
/galeria             → Galería de fotos y vídeos
/contacto            → Contacto
/registro            → Registro / Login
/politica-de-cookies → Política de cookies
/textos-legales      → Textos legales
/admin               → Panel de administración (solo admin)
/admin/usuarios      → Gestión de usuarios (solo admin)
/admin/themes        → Gestión de themes (solo admin)
/admin/usuario       → Perfil propio (solo role: user — nunca admin ni themes ajenos)
```

---

## Header (comportamiento del nombre de usuario)

- Sin sesión: botón **"Iniciar sesión"**
- Con sesión (`role: admin`): nombre del usuario → enlace a `/admin`
- Con sesión (`role: user`): nombre del usuario → enlace a `/admin/usuario`
- Opción de cerrar sesión siempre visible cuando hay sesión

**Fuente del nombre (orden de prioridad):**
1. `profile.value?.name` — del fetch a `/api/profile` (Admin API)
2. `user.value?.user_metadata?.name` — de la sesión Supabase, disponible inmediatamente sin fetch
3. Fallback literal `'Usuario'` / `'Admin'`

El nombre se lee de `user_metadata` para mostrarse sin esperar el fetch a la API. Aplica en `AppHeader.vue` y `layouts/admin.vue`.

---

## Diseño

**Estética:** oscura, premium, cinematográfica (inspiración Netflix)

### Paleta de colores (en `tailwind.config.ts`)

| Rol                    | Hex                 |
|------------------------|---------------------|
| Fondo principal        | `#0A0A0A`           |
| Fondo secundario       | `#141414`           |
| Fondo cards/bloques    | `#1E1E1E`           |
| Color principal        | `#0094C6`           |
| Color principal hover  | `#00B4F0`           |
| Texto principal        | `#FFFFFF`           |
| Texto secundario       | `#A3A3A3`           |
| Bordes y separadores   | `#2A2A2A`           |
| Overlay imágenes       | `rgba(0,0,0,0.6)`   |

### Tipografía

- **Cuerpo / UI:** `Inter` (Google Fonts)
- **Titulares:** `Bebas Neue` o `Oswald` (Google Fonts)
- Hero: `4xl`–`6xl` bold blanco | Subtítulos: `xl`–`2xl` `#A3A3A3` | Cuerpo: `base`–`lg`

### Botones

```
Primario:   bg-[#0094C6] text-white hover:bg-[#00B4F0] rounded-lg px-6 py-3 font-semibold transition
Secundario: bg-transparent border border-white text-white hover:bg-white hover:text-black rounded-lg px-6 py-3 transition
```

### Comportamiento UX

- Header transparente → sólido `#0A0A0A` + sombra al hacer scroll
- Hero a pantalla completa con gradiente `rgba(0,0,0,0.85)` en zona de texto → `rgba(0,0,0,0)` en zona de imagen
- Thumb slider: hover con `scale-105` + overlay con título
- Transición de página: fade `opacity 0.3s ease`
- Animaciones de entrada al scroll con `@vueuse/motion`
- Swiper hero: efecto `fade` o `coverflow` | Swiper thumbs: `slide`

### Responsive

- Mobile: menú hamburguesa, hero fullscreen, thumbs horizontal scrollable
- Tablet: grid 2 columnas en galería y ranking
- Desktop: experiencia completa

---

## Reglas de desarrollo

1. Leer `prompt.md` completo antes de empezar cualquier tarea.
2. Nunca hardcodear configuración — usar `.env`.
3. Colores siempre desde clases Tailwind configuradas, nunca inline.
4. Componentes responsivos por defecto (mobile-first).
5. No instalar librerías sin verificar que no existe alternativa en el stack.
6. `serverSupabaseServiceRole` solo en endpoints admin.
7. Validar siempre el `role` del usuario en endpoints privilegiados.
8. La tabla `profiles` no existe — usar `auth.users` vía Admin API.
9. Documentar decisiones técnicas no obvias con comentarios breves en el código.
10. Ante cualquier ambigüedad en `prompt.md`, elegir la solución más simple que cumpla el objetivo.

---

## Variables de entorno (`.env`)

```env
SUPABASE_URL=https://TU_REF.supabase.co
SUPABASE_KEY=TU_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
NUXT_SESSION_PASSWORD=una-cadena-secreta-de-al-menos-32-caracteres
```
