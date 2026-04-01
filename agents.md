# agents.md — REFUGALLO: Sistema de Votaciones Web

Este archivo define la arquitectura de agentes para construir el proyecto descrito en `prompt.md`.
Cada agente tiene un rol único, herramientas asignadas, entradas esperadas y salidas concretas.
Los agentes se orquestan de forma secuencial o paralela según sus dependencias.

> **Estado del proyecto:** 2026-04-01 (actualizado)
> Leyenda de estado: ✅ Completado · 🔄 Parcialmente implementado · ⏳ Pendiente

---

## ARQUITECTURA GENERAL

```
                        ┌─────────────────────┐
                        │   ORCHESTRATOR      │
                        │  (agente principal) │
                        └────────┬────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
   ┌──────▼──────┐       ┌───────▼──────┐      ┌───────▼──────┐
   │   AGENT 1   │  ✅   │   AGENT 2    │  ✅  │   AGENT 3    │  ✅
   │   Setup &   │       │  Database &  │      │     Auth     │
   │  Scaffolding│       │     API      │      │   & Roles    │
   └──────┬──────┘       └───────┬──────┘      └───────┬──────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
   ┌──────▼──────┐       ┌───────▼──────┐      ┌───────▼──────┐
   │   AGENT 4   │  ✅   │   AGENT 5    │  ✅  │   AGENT 6    │  🔄
   │  UI / Pages │       │   Voting     │      │    Admin     │
   │  Frontend   │       │   Logic      │      │    Panel     │
   └──────┬──────┘       └───────┬──────┘      └───────┬──────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                        ┌────────▼────────────┐
                        │      AGENT 7        │  ⏳
                        │   QA & Polish       │
                        └─────────────────────┘
```

---

## AGENTES

---

### AGENT 0 — ORCHESTRATOR

**Rol:** Coordina la ejecución de todos los agentes. Lee `prompt.md`, divide el trabajo, lanza agentes en orden y valida que cada entrega cumple los requisitos antes de continuar.

**Responsabilidades:**
- Leer y parsear `prompt.md` como fuente de verdad
- Determinar el orden de ejecución según dependencias
- Pasar contexto relevante a cada agente
- Validar outputs antes de activar el siguiente agente
- Reportar estado al usuario al finalizar cada fase

**Inputs:** `prompt.md`

**Outputs:** Proyecto Nuxt.js 3 completo y funcional

**Reglas:**
- Si un agente falla, detener la cadena y reportar el error con contexto suficiente para depurar
- No continuar al siguiente agente si el anterior no ha completado sus outputs obligatorios
- Mantener un `build-log.md` actualizado con el estado de cada agente

---

### AGENT 1 — SETUP & SCAFFOLDING ✅ COMPLETADO

**Rol:** Inicializa el proyecto, instala dependencias y configura el entorno base.

**Se ejecuta:** Primero. Sin dependencias previas.

**Lo que se hizo:**
- Proyecto Nuxt.js 3 con TypeScript inicializado
- Tailwind CSS configurado con paleta de colores personalizada en `tailwind.config.ts`
- Stack completo instalado: `@nuxtjs/supabase`, `@nuxtjs/tailwindcss`, `@vueuse/motion`, `@vueuse/core`, `@vueuse/nuxt`, `@pinia/nuxt`, `lucide-vue-next`, `vue3-masonry-css`, `swiper`
- Estructura de carpetas creada: `pages/`, `components/`, `layouts/`, `composables/`, `server/api/`, `middleware/`, `assets/`, `stores/`, `types/`, `utils/`
- Fuentes `Inter` y `Bebas Neue` configuradas en `nuxt.config.ts`
- Layouts `default.vue` y `admin.vue` creados
- `nuxt.config.ts` configurado con todos los módulos

---

### AGENT 2 — DATABASE & API ✅ COMPLETADO (2026-04-01)

**Rol:** Define el esquema de base de datos y construye todos los endpoints de la API.

**Se ejecuta:** En paralelo con AGENT 3, después de AGENT 1.

**Decisiones arquitectónicas:**
- La tabla `profiles` fue **eliminada**. Nombre, email y rol se gestionan sobre `auth.users` vía Admin API de Supabase.
- El rol (`user` / `admin`) vive en `raw_app_meta_data` (no editable por el usuario; accesible en el JWT).
- `is_admin()` lee de `auth.jwt() -> 'app_metadata' ->> 'role'`.
- Endpoints de perfil usan Bearer token (`Authorization: Bearer <access_token>`).
- La lógica de voto registrado usa el RPC `vote_theme` (UPSERT + ajuste de likes); sin endpoint REST propio.

**Schema — tablas:**

`themes` | `votes` (usuarios registrados) | `anonymous_votes` (usuarios NO registrados)

```sql
-- anonymous_votes (nueva)
CREATE TABLE anonymous_votes (
  id               SERIAL PRIMARY KEY,
  poll_id          INTEGER REFERENCES themes(id),
  client_token     TEXT NOT NULL,
  ip_hash          TEXT,
  fingerprint_hash TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE(poll_id, client_token)
);
CREATE INDEX ON anonymous_votes (poll_id, ip_hash);
CREATE INDEX ON anonymous_votes (poll_id, fingerprint_hash);
```

**Endpoints completados:**

| Método | Ruta                        | Descripción                                | Estado |
|--------|-----------------------------|--------------------------------------------|--------|
| GET    | `/api/profile`              | Ver datos propios (bearer token)           | ✅     |
| PUT    | `/api/profile`              | Editar nombre, email propios               | ✅     |
| DELETE | `/api/profile`              | Borrar propia cuenta (elimina voto)        | ✅     |
| GET    | `/api/admin/users`          | Lista usuarios (solo admin)                | ✅     |
| POST   | `/api/admin/users`          | Crear usuario (solo admin)                 | ✅     |
| PUT    | `/api/admin/users/[id]`     | Editar usuario (solo admin)                | ✅     |
| DELETE | `/api/admin/users/[id]`     | Eliminar usuario (solo admin)              | ✅     |
| GET    | `/api/admin/votes`          | Lista votos con usuario y theme (admin)    | ✅     |
| PUT    | `/api/admin/votes/[id]`     | Cambiar theme votado, ajusta likes (admin) | ✅     |
| DELETE | `/api/admin/votes/[id]`     | Eliminar voto, ajusta likes (admin)        | ✅     |

**Endpoints completados en esta iteración:**

| Método | Ruta                         | Descripción                                                     | Estado |
|--------|------------------------------|-----------------------------------------------------------------|--------|
| GET    | `/api/themes`                | Lista themes visibles ordenados por `order`                     | ✅     |
| GET    | `/api/themes/[id]`           | Detalle de un theme                                             | ✅     |
| POST   | `/api/themes`                | Crear theme (valida role admin server-side)                     | ✅     |
| PUT    | `/api/themes/[id]`           | Editar theme (valida role admin server-side)                    | ✅     |
| DELETE | `/api/themes/[id]`           | Eliminar theme (valida role admin server-side)                  | ✅     |
| GET    | `/api/ranking`               | Themes ordenados por `likes` desc                               | ✅     |
| POST   | `/api/votes/token`           | Genera `client_token` para visitante anónimo                    | ✅     |
| GET    | `/api/votes/anonymous/check` | Comprueba si `client_token` ya votó (global o por `poll_id`)    | ✅     |
| POST   | `/api/votes/anonymous`       | Registra voto anónimo (3 bloqueos + rate limit IP + CAPTCHA opt)| ✅     |

**Notas de implementación:**
- `serverSupabaseServiceRole` para operaciones admin; Bearer token para endpoints de perfil
- Validar `role` del usuario en cada endpoint admin antes de ejecutar operaciones privilegiadas
- El endpoint `POST /api/votes/anonymous` debe: verificar CAPTCHA, hashear IP y fingerprint del request, comprobar los tres bloqueos (token, IP, fingerprint), aplicar rate limiting (1 voto/encuesta/IP en 24h)
- El `client_token` lo genera el servidor en `POST /api/votes/token` y se entrega al cliente via cookie/localStorage

**Outputs obligatorios:**
- Todos los endpoints funcionando y devolviendo JSON correcto
- `supabase/schema.sql` ejecutable (incluye `anonymous_votes`)
- `supabase/seed.sql` ejecutable

---

### AGENT 3 — AUTH & ROLES ✅ COMPLETADO

**Rol:** Implementa autenticación, sesiones y control de acceso por roles.

**Se ejecuta:** En paralelo con AGENT 2, después de AGENT 1.

**Lo que está hecho:**
- `composables/useAuth.ts` — `user`, `profile`, `isLoggedIn`, `isAdmin`, `login()`, `logout()`, `register()`, `fetchProfile()` ✅
- `middleware/auth.ts` — redirige a `/registro` si no hay sesión ✅
- `middleware/admin.ts` — redirige a `/` si el usuario no tiene `role: admin` ✅
- Rutas `/admin/*` protegidas ✅

**Notas:**
- `isAdmin`: `user.value?.app_metadata?.role === 'admin'`
- `fetchProfile()` llama a `GET /api/profile` con `Authorization: Bearer <token>`
- El `role` solo es modificable con service role key
- Recuperación de contraseña: flujo nativo Supabase Auth (email con enlace)
- `useAuth` expone `user` (ref de `useSupabaseUser()`): el nombre ya está en `user.value?.user_metadata?.name` desde la sesión, sin necesidad de esperar `fetchProfile`. Los componentes lo usan como fallback inmediato.

---

### AGENT 4 — UI / PAGES FRONTEND ✅ COMPLETADO

**Rol:** Construye todas las páginas y componentes visuales de la web pública.

**Se ejecuta:** Después de AGENT 1, AGENT 2 y AGENT 3.

**Componentes creados:**

| Archivo                           | Estado |
|-----------------------------------|--------|
| `components/App/AppHeader.vue`    | ✅     |
| `components/App/AppFooter.vue`    | ✅     |
| `components/App/AppButton.vue`    | ✅     |
| `components/App/AppSlider.vue`    | ✅     |
| `components/App/AppInput.vue`     | ✅     |
| `components/App/AppModal.vue`     | ✅     |
| `components/App/AppToast.vue`     | ✅     |
| `components/Theme/ThemeCard.vue`  | ✅     |
| `components/Admin/DataTable.vue`  | ✅     |
| `components/Admin/ModalForm.vue`  | ✅     |

**Páginas creadas:**

| Archivo                         | Estado |
|---------------------------------|--------|
| `pages/index.vue`               | ✅     |
| `pages/theme/[id].vue`          | ✅     |
| `pages/ranking.vue`             | ✅     |
| `pages/quienes-somos.vue`       | ✅     |
| `pages/galeria.vue`             | ✅     |
| `pages/contacto.vue`            | ✅     |
| `pages/registro.vue`            | ✅     |
| `pages/textos-legales.vue`      | ✅     |
| `pages/politica-de-cookies.vue` | ✅     |
| `pages/admin/index.vue`         | ✅     |
| `pages/admin/usuarios.vue`      | ✅     |
| `pages/admin/themes.vue`        | ✅     |
| `pages/admin/usuario.vue`       | ✅     |
| `pages/admin/votaciones.vue`    | ✅     |

**Archivos auxiliares:**
- `stores/toast.ts` — store Pinia para notificaciones ✅
- `types/database.types.ts` — tipos del proyecto (sin `profiles`) ✅
- `types/index.ts` — tipos globales ✅
- `utils/textChunker.ts` — divide `text` del theme en bloques para el slider ✅

**Comportamiento del header ✅ verificado y corregido:**
- Sin sesión: botón "Iniciar sesión"
- Sesión `role: admin`: nombre de usuario → enlace a `/admin`
- Sesión `role: user`: nombre de usuario → enlace a `/admin/usuario`
- El nombre se resuelve con prioridad: `profile.value?.name` → `user.value?.user_metadata?.name` → fallback literal. Esto evita mostrar "Usuario"/"Admin" mientras el fetch a `/api/profile` no ha completado.

---

### AGENT 5 — VOTING LOGIC ✅ COMPLETADO (2026-04-01)

**Rol:** Implementa toda la lógica de votación — tanto para usuarios registrados como para anónimos.

**Se ejecuta:** Después de AGENT 2, AGENT 3 y AGENT 4.

**Lo que está hecho (usuarios registrados):**
- `composables/useVotes.ts` ✅
  - `vote(themeId)` — llama al RPC `vote_theme` (UPSERT + ajuste de likes)
  - `getCurrentVote()` — consulta `votes` filtrando por `user_id`
  - `hasVoted(themeId)` — comprueba si el voto activo es ese theme
- Si ya votó ese theme → muestra "Tu elección" en lugar del botón Votar ✅
- Si no tiene sesión → botón Votar redirige a `/registro` ✅
- Toast de confirmación al votar ✅

**Completado (usuarios NO registrados):**
- `utils/fingerprint.ts` — fingerprint hash ligero (djb2) de: user-agent, idioma, zona horaria, resolución, plataforma ✅
- `composables/useAnonymousVote.ts` ✅:
  - `getClientToken()` — obtiene o genera token en localStorage via `POST /api/votes/token`
  - `getAnonymousVoteId()` — devuelve el theme_id votado (localStorage + verificación servidor)
  - `voteAnonymously(pollId, captchaToken?)` — llama a `POST /api/votes/anonymous`
- CAPTCHA: estructurado y validado en servidor si `CAPTCHA_SECRET` está en `.env` (hCaptcha) ✅
- `useVotes.vote()` ya no redirige a `/registro` — devuelve `false` si no hay sesión ✅
- Botón Votar distingue 4 estados en `pages/index.vue` y `pages/theme/[id].vue`: ✅
  1. Usuario registrado con voto en ese theme → "Tu elección"
  2. Usuario anónimo que votó ese theme → "Tu voto"
  3. Usuario anónimo que ya votó otro theme → "Ya votaste" (sin botón)
  4. Sin voto → Botón "Votar" (lanza flujo registrado o anónimo según sesión)

**Notas de implementación:**
- `(supabase as any).rpc(...)` para evitar errores TypeScript por tipos no generados del RPC
- El fingerprint no debe ser agresivo — basta una huella aproximada para detectar duplicados casuales
- El CAPTCHA se valida en el servidor, nunca solo en el cliente

---

### AGENT 6 — ADMIN PANEL 🔄 PARCIALMENTE IMPLEMENTADO

**Rol:** Construye el panel de administración privado para gestionar usuarios, themes y votos.

**Se ejecuta:** Después de AGENT 2, AGENT 3 y AGENT 4.

**Lo que está hecho:**

| Archivo / Endpoint                       | Estado |
|------------------------------------------|--------|
| `pages/admin/index.vue`                  | ✅     |
| `pages/admin/usuarios.vue`               | ✅     |
| `pages/admin/themes.vue`                 | ✅     |
| `pages/admin/usuario.vue`                | ✅     |
| `pages/admin/votaciones.vue`             | ✅     |
| `layouts/admin.vue` (con nav Votaciones) | ✅     |
| `server/api/admin/users/index.get.ts`    | ✅     |
| `server/api/admin/users/index.post.ts`   | ✅     |
| `server/api/admin/users/[id].put.ts`     | ✅     |
| `server/api/admin/users/[id].delete.ts`  | ✅     |
| `server/api/admin/votes/index.get.ts`    | ✅     |
| `server/api/admin/votes/[id].put.ts`     | ✅     |
| `server/api/admin/votes/[id].delete.ts`  | ✅     |

**Pendiente:**
- Endpoints CRUD de themes (`server/api/themes/`) — actualmente los themes se gestionan client-side en `pages/admin/themes.vue` mediante `useThemes.ts`; pendiente mover a server-side con validación de role admin ⏳

**Descripción de secciones:**

**`/admin/usuarios` (role: admin):**
- Tabla: nombre, email, rol, acciones (Editar modal inline | Eliminar con confirmación)
- Botón "Añadir usuario" → modal con formulario completo
- Búsqueda por nombre/email

**`/admin/votaciones` (role: admin):**
- Tabla: usuario, theme votado, fecha
- Acciones: Editar (cambiar theme via dropdown) | Eliminar (con confirmación)
- Al editar/eliminar se ajustan automáticamente los `likes` de los themes afectados

**`/admin/themes` (role: admin):**
- Tabla paginada: orden, imagen thumb, título, likes, visible, acciones
- Acciones: Editar | Eliminar (confirmación) | Toggle visible
- Botón "Añadir theme" → formulario completo
- Drag & drop para reordenar themes

**`/admin/usuario` (role: user):**
- Datos personales editables (nombre, email) y cambio de contraseña
- Sección "Tu voto": muestra el theme votado actualmente (thumb, título, likes, enlace "Ver theme")
- Si no ha votado: mensaje con enlace a página principal
- Dropdown con todos los themes disponibles preseleccionado en el voto actual
- Botón "Guardar voto" deshabilitado si no hay cambio; llama al RPC `vote_theme` al guardar
- La sección se actualiza automáticamente tras guardar sin recargar la página
- Eliminar cuenta → elimina su voto y resta 1 del `likes` del theme correspondiente
- **Nunca puede ver ni modificar themes ni otros usuarios**

---

### AGENT 7 — QA & POLISH ⏳ PENDIENTE

**Rol:** Revisión final de calidad, corrección de bugs, pulido visual y coherencia de estilos.

**Se ejecuta:** Último, después de todos los demás agentes.

**Checklist de QA:**

*Rutas y navegación:*
- [ ] Todas las rutas accesibles y sin errores 404
- [ ] Header: nombre de usuario enlaza a `/admin` (admin) o `/admin/usuario` (user)
- [ ] Usuario sin sesión no puede acceder a `/admin/*`
- [ ] Usuario `role: user` no puede acceder a `/admin/usuarios` ni `/admin/themes`

*Votación registrados:*
- [ ] Un usuario registrado puede votar y cambiar su voto
- [ ] El cambio de voto resta/suma `likes` correctamente
- [ ] Si ya votó ese theme, aparece "Tu elección" en lugar del botón

*Votación anónima:*
- [ ] Un usuario no registrado puede votar una sola vez
- [ ] El mismo `client_token` no puede votar dos veces en la misma encuesta
- [ ] La misma IP no puede votar dos veces en la misma encuesta en 24h
- [ ] El mismo fingerprint es detectado como sospechoso/bloqueado
- [ ] El CAPTCHA es requerido y validado en el servidor
- [ ] El botón Votar de usuarios no registrados redirige a `/registro`

*Diseño y responsive:*
- [ ] Responsive funciona en 320px, 768px y 1280px
- [ ] Colores, tipografías y espaciados coherentes con `CLAUDE.md`
- [ ] Header transparente → sólido al hacer scroll en todas las páginas
- [ ] Sliders Swiper funcionan en mobile (touch) y desktop

*Calidad técnica:*
- [ ] Seed genera datos correctamente
- [ ] `<meta>` tags SEO básicos en `nuxt.config.ts`
- [ ] Sin `console.error` ni warnings en consola en producción
- [ ] `pages/admin/usuario.vue` funciona correctamente (sección Tu voto)

**Outputs obligatorios:**
- `README.md` completo con pasos de instalación y configuración
- Cero errores de consola en producción
- `qa-report.md` con checklist completado y documentado

---

## ORDEN DE EJECUCIÓN

```
Fase 1 (secuencial):           ✅ COMPLETADA
  └── AGENT 1 — Setup & Scaffolding

Fase 2 (paralelo):             ✅ COMPLETADA
  ├── AGENT 2 — Database & API
  └── AGENT 3 — Auth & Roles

Fase 3 (secuencial):           ✅ COMPLETADA
  └── AGENT 4 — UI / Pages Frontend

Fase 4 (paralelo):             🔄 EN PROGRESO
  ├── AGENT 5 — Voting Logic       ✅
  └── AGENT 6 — Admin Panel        (falta: mover CRUD themes a server-side en admin/themes.vue)

Fase 5 (secuencial):           ⏳ PENDIENTE
  └── AGENT 7 — QA & Polish
```

---

## PRÓXIMAS TAREAS PRIORITARIAS

En este orden:

1. **Actualizar `pages/admin/themes.vue`** — usar los nuevos endpoints `server/api/themes/` en lugar de acceso directo a Supabase desde el cliente
2. **Ejecutar migración** — correr `supabase/migrations/20260401_anonymous_votes.sql` en Supabase Dashboard
3. **CAPTCHA** (opcional) — configurar `CAPTCHA_SECRET` en `.env` para activar validación hCaptcha en votos anónimos
4. **AGENT 7** — QA & Polish final

---

## REGLAS GLOBALES PARA TODOS LOS AGENTES

1. Leer `prompt.md` completo antes de empezar cualquier tarea
2. Nunca hardcodear valores de configuración — usar variables de entorno en `.env`
3. Todos los colores deben venir de las clases Tailwind configuradas, no valores inline
4. Todos los componentes deben ser responsivos por defecto
5. Las imágenes de placeholder pueden obtenerse de `https://picsum.photos`
6. Documentar decisiones técnicas no obvias con comentarios breves en el código
7. Ante cualquier ambigüedad en `prompt.md`, elegir la solución más simple que cumpla el objetivo
8. No instalar librerías sin verificar que no hay alternativa ya incluida en el stack
9. Usar `serverSupabaseServiceRole` solo en endpoints admin; Bearer token para endpoints de perfil
10. Validar siempre el `role` del usuario en los endpoints antes de ejecutar operaciones privilegiadas
11. La tabla `profiles` no existe — todos los datos de usuario se leen/escriben en `auth.users` vía Admin API
12. El CAPTCHA siempre se valida en el servidor, nunca solo en el cliente
13. El fingerprint anónimo es una medida de fricción, no de garantía absoluta — no over-engineerear

---

## ENTORNO LOCAL

- **URL local:** `http://localhost:3000`
- **Comando de desarrollo:** `npm run dev`
- El servidor Nuxt.js arranca por defecto en el puerto **3000**
- Para tests con Playwright apuntar a `http://localhost:3000`

---

## VARIABLES DE ENTORNO REQUERIDAS (`.env`)

```env
SUPABASE_URL=https://TU_REF.supabase.co
SUPABASE_KEY=TU_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
NUXT_SESSION_PASSWORD=una-cadena-secreta-de-al-menos-32-caracteres
```

---

## ESTRUCTURA DE ARCHIVOS DEL PROYECTO

```
refugallo/
├── CLAUDE.md                  ← contexto del proyecto para Claude Code
├── agents.md                  ← este archivo (estado y arquitectura de agentes)
├── prompt.md                  ← fuente de verdad del proyecto
├── build-log.md               ← log de estado generado por el orchestrator
├── qa-report.md               ← checklist de QA generado por Agent 7
├── README.md                  ← instrucciones generadas por Agent 7
├── .env                       ← variables de entorno (no commitear)
├── nuxt.config.ts             ✅
├── tailwind.config.ts         ✅
├── app.vue                    ✅
├── supabase/
│   ├── schema.sql             ✅ (themes, votes, anonymous_votes con RLS)
│   └── seed.sql               ✅
├── server/
│   └── api/
│       ├── themes/
│       │   ├── index.get.ts   ✅
│       │   ├── index.post.ts  ✅ (valida role admin)
│       │   ├── [id].get.ts    ✅
│       │   ├── [id].put.ts    ✅ (valida role admin)
│       │   └── [id].delete.ts ✅ (valida role admin)
│       ├── ranking/
│       │   └── index.get.ts   ✅
│       ├── votes/
│       │   ├── token.post.ts          ✅ (genera client_token para anónimos)
│       │   └── anonymous/
│       │       ├── index.post.ts      ✅ (3 bloqueos + rate limit + CAPTCHA opt.)
│       │       └── check.get.ts       ✅ (check global o por poll_id)
│       ├── profile/
│       │   ├── index.get.ts           ✅
│       │   ├── index.put.ts           ✅
│       │   └── index.delete.ts        ✅
│       └── admin/
│           ├── users/
│           │   ├── index.get.ts       ✅
│           │   ├── index.post.ts      ✅
│           │   ├── [id].put.ts        ✅
│           │   └── [id].delete.ts     ✅
│           └── votes/
│               ├── index.get.ts       ✅
│               ├── [id].put.ts        ✅
│               └── [id].delete.ts     ✅
├── middleware/
│   ├── auth.ts                ✅
│   └── admin.ts               ✅
├── composables/
│   ├── useAuth.ts             ✅
│   ├── useThemes.ts           ✅
│   ├── useVotes.ts            ✅
│   └── useAnonymousVote.ts    ⏳
├── stores/
│   └── toast.ts               ✅
├── types/
│   ├── database.types.ts      ✅ (sin profiles)
│   └── index.ts               ✅
├── utils/
│   ├── textChunker.ts         ✅
│   └── fingerprint.ts         ⏳ (hash de user-agent, idioma, zona horaria, resolución, plataforma)
├── layouts/
│   ├── default.vue            ✅
│   └── admin.vue              ✅ (nav: Dashboard, Usuarios, Themes, Votaciones)
├── pages/
│   ├── index.vue              ✅
│   ├── ranking.vue            ✅
│   ├── quienes-somos.vue      ✅
│   ├── galeria.vue            ✅
│   ├── contacto.vue           ✅
│   ├── registro.vue           ✅
│   ├── textos-legales.vue     ✅
│   ├── politica-de-cookies.vue ✅
│   ├── theme/
│   │   └── [id].vue           ✅
│   └── admin/
│       ├── index.vue          ✅
│       ├── usuarios.vue       ✅
│       ├── themes.vue         ✅
│       ├── usuario.vue        ✅
│       └── votaciones.vue     ✅
└── components/
    ├── App/
    │   ├── AppHeader.vue      ✅
    │   ├── AppFooter.vue      ✅
    │   ├── AppButton.vue      ✅
    │   ├── AppSlider.vue      ✅
    │   ├── AppInput.vue       ✅
    │   ├── AppModal.vue       ✅
    │   └── AppToast.vue       ✅
    ├── Theme/
    │   └── ThemeCard.vue      ✅
    └── Admin/
        ├── DataTable.vue      ✅
        └── ModalForm.vue      ✅
```
