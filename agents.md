# agents.md — REFUGALLO: Sistema de Votaciones Web

Este archivo define la arquitectura de agentes para construir el proyecto descrito en `prompt.md`.
Cada agente tiene un rol único, herramientas asignadas, entradas esperadas y salidas concretas.
Los agentes se orquestan de forma secuencial o paralela según sus dependencias.

> **Estado del proyecto:** 2026-03-30
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
   │   AGENT 1   │  ✅   │   AGENT 2    │  🔄  │   AGENT 3    │  ✅
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

**Inputs:**
- `prompt.md`

**Outputs:**
- Proyecto Nuxt.js 3 completo y funcional

**Reglas:**
- Si un agente falla, detener la cadena y reportar el error con contexto suficiente para depurar
- No continuar al siguiente agente si el anterior no ha completado sus outputs obligatorios
- Mantener un `build-log.md` actualizado con el estado de cada agente

---

### AGENT 1 — SETUP & SCAFFOLDING ✅ COMPLETADO

**Rol:** Inicializa el proyecto, instala dependencias y configura el entorno base.

**Se ejecuta:** Primero. Sin dependencias previas.

**Estado:** Todo completado. El proyecto arranca con `npm run dev`.

**Lo que se hizo:**
- Proyecto Nuxt.js 3 con TypeScript inicializado
- Tailwind CSS configurado con paleta de colores personalizada en `tailwind.config.ts`
- Swiper.js instalado
- Stack completo instalado: `@nuxtjs/supabase`, `@nuxtjs/tailwindcss`, `@vueuse/motion`, `@vueuse/core`, `@vueuse/nuxt`, `@pinia/nuxt`, `lucide-vue-next`, `vue3-masonry-css`
- Estructura de carpetas creada: `pages/`, `components/`, `layouts/`, `composables/`, `server/api/`, `middleware/`, `assets/`, `stores/`, `types/`, `utils/`
- Fuentes `Inter` y `Bebas Neue` configuradas en `nuxt.config.ts`
- Layouts `default.vue` y `admin.vue` creados
- `nuxt.config.ts` configurado con todos los módulos

**Stack instalado:**
```bash
npm install @nuxtjs/supabase @nuxtjs/tailwindcss @vueuse/nuxt @vueuse/motion @pinia/nuxt
npm install swiper lucide-vue-next vue3-masonry-css
```

---

### AGENT 2 — DATABASE & API 🔄 PARCIALMENTE IMPLEMENTADO

**Rol:** Define el esquema de base de datos y construye todos los endpoints de la API.

**Se ejecuta:** En paralelo con AGENT 3, después de AGENT 1.

**Decisión tecnológica:** **Supabase (PostgreSQL)** — elegido por su integración nativa con Nuxt (`@nuxtjs/supabase`), autenticación incluida y Row Level Security.

**Decisión arquitectónica importante:**
- La tabla `profiles` fue **eliminada**. Los datos del usuario (nombre, email, rol) se gestionan directamente sobre `auth.users` vía Admin API de Supabase.
- El rol (`user` / `admin`) se almacena en `raw_app_meta_data` (no editable por el usuario, accesible en el JWT).
- La función `is_admin()` lee de `auth.jwt() -> 'app_metadata' ->> 'role'`.
- Los endpoints de perfil usan Bearer token: el cliente pasa `Authorization: Bearer <access_token>` y el servidor extrae el `userId` del JWT.

**Endpoints completados:**

| Método | Ruta                                   | Descripción                                | Estado |
|--------|----------------------------------------|--------------------------------------------|--------|
| GET    | `/api/profile`                         | Ver datos propios (bearer token)           | ✅     |
| PUT    | `/api/profile`                         | Editar nombre, email propios               | ✅     |
| DELETE | `/api/profile`                         | Borrar propia cuenta (elimina voto)        | ✅     |
| GET    | `/api/admin/users`                     | Lista usuarios (solo admin)                | ✅     |
| POST   | `/api/admin/users`                     | Crear usuario (solo admin)                 | ✅     |
| PUT    | `/api/admin/users/[id]`                | Editar usuario (solo admin)                | ✅     |
| DELETE | `/api/admin/users/[id]`                | Eliminar usuario (solo admin)              | ✅     |
| GET    | `/api/admin/votes`                     | Lista votos con usuario y theme (admin)    | ✅     |
| PUT    | `/api/admin/votes/[id]`                | Cambiar theme votado, ajusta likes (admin) | ✅     |
| DELETE | `/api/admin/votes/[id]`                | Eliminar voto, ajusta likes (admin)        | ✅     |

**Endpoints pendientes:**

| Método | Ruta                              | Descripción                               | Estado |
|--------|-----------------------------------|-------------------------------------------|--------|
| GET    | `/api/themes`                     | Lista themes visibles ordenados por order | ⏳     |
| GET    | `/api/themes/[id]`                | Detalle de un theme                       | ⏳     |
| POST   | `/api/themes`                     | Crear theme (solo admin)                  | ⏳     |
| PUT    | `/api/themes/[id]`                | Editar theme (solo admin)                 | ⏳     |
| DELETE | `/api/themes/[id]`                | Eliminar theme (solo admin)               | ⏳     |
| GET    | `/api/ranking`                    | Themes ordenados por likes desc           | ⏳     |

> **Nota:** La lógica de votación (UPSERT + ajuste de likes) se implementa mediante el RPC `vote_theme` en Supabase, llamado directamente desde `useVotes.ts` con el cliente autenticado. No se necesita endpoint REST propio para votar.

**Notas de implementación:**
- Usar `serverSupabaseServiceRole(event)` para operaciones admin
- Usar Bearer token + extracción manual de JWT para endpoints de perfil
- Validar role en cada endpoint admin leyendo `app_metadata.role` del usuario

**Outputs obligatorios:**
- Todos los endpoints del listado funcionando y devolviendo JSON correcto
- Schema ejecutable en Supabase Dashboard
- Seed ejecutable

---

### AGENT 3 — AUTH & ROLES ✅ COMPLETADO

**Rol:** Implementa el sistema de autenticación, sesiones y control de acceso por roles.

**Se ejecuta:** En paralelo con AGENT 2, después de AGENT 1.

**Lo que está hecho:**
- `composables/useAuth.ts` — composable funcional con `user`, `profile`, `isLoggedIn`, `isAdmin`, `login()`, `logout()`, `register()`, `fetchProfile()` ✅
- `middleware/auth.ts` — redirige a `/registro` si no hay sesión ✅
- `middleware/admin.ts` — redirige a `/` si el usuario no tiene `role: admin` ✅
- Autenticación gestionada por `@nuxtjs/supabase` (Supabase Auth) ✅
- Rutas `/admin/*` protegidas ✅

**Notas:**
- `isAdmin` lee del JWT: `user.value?.app_metadata?.role === 'admin'`
- `fetchProfile()` llama a `GET /api/profile` con `Authorization: Bearer <token>`
- El `role` se almacena en `raw_app_meta_data` (solo modificable con service role key)
- La recuperación de contraseña usa el flujo nativo de Supabase Auth (email con enlace)

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

| Archivo                               | Estado |
|---------------------------------------|--------|
| `pages/index.vue`                     | ✅     |
| `pages/theme/[id].vue`                | ✅     |
| `pages/ranking.vue`                   | ✅     |
| `pages/quienes-somos.vue`             | ✅     |
| `pages/galeria.vue`                   | ✅     |
| `pages/contacto.vue`                  | ✅     |
| `pages/registro.vue`                  | ✅     |
| `pages/textos-legales.vue`            | ✅     |
| `pages/politica-de-cookies.vue`       | ✅     |
| `pages/admin/index.vue`               | ✅     |
| `pages/admin/usuarios.vue`            | ✅     |
| `pages/admin/themes.vue`              | ✅     |
| `pages/admin/usuario.vue`             | ✅     |
| `pages/admin/votaciones.vue`          | ✅     |

**Archivos auxiliares creados:**
- `stores/toast.ts` — store Pinia para notificaciones ✅
- `types/database.types.ts` — tipos del proyecto (tabla `profiles` eliminada) ✅
- `types/index.ts` — tipos globales (`Profile` sin `photo` ni `created_at`) ✅
- `utils/textChunker.ts` — divide el `text` del theme en bloques para el slider ✅

**Reglas de estilo a respetar:**
- Fondo general `#0A0A0A`, secciones alternas `#141414`
- Todos los textos en blanco o `#A3A3A3`
- Botones según especificación de `prompt.md`
- Fuente titulares: Bebas Neue, cuerpo: Inter
- Animaciones de entrada con `@vueuse/motion` en cada sección

---

### AGENT 5 — VOTING LOGIC ✅ COMPLETADO

**Rol:** Implementa toda la lógica de votación en frontend y backend.

**Se ejecuta:** Después de AGENT 2, AGENT 3 y AGENT 4.

**Lo que está hecho:**
- `composables/useVotes.ts` — composable de votación conectado a RPC real ✅
  - `vote(themeId)` — llama al RPC `vote_theme` (UPSERT + ajuste de likes)
  - `getCurrentVote()` — consulta directa a `votes` filtrando por `user_id`
  - `hasVoted(themeId)` — comprueba si el voto activo es ese theme
- Si el usuario ya votó → se muestra "Tu elección" en lugar del botón de votar ✅
- Si el usuario no tiene sesión → el botón de votar redirige a `/registro` ✅
- Toast de confirmación al votar ✅

**Notas de implementación:**
- El RPC `vote_theme` en Supabase gestiona el UPSERT y el ajuste de `likes` (resta al theme anterior, suma al nuevo)
- `(supabase as any).rpc(...)` para evitar error TypeScript por tipos no generados del RPC

---

### AGENT 6 — ADMIN PANEL 🔄 PARCIALMENTE IMPLEMENTADO

**Rol:** Construye el panel de administración privado para gestionar usuarios, themes y votos.

**Se ejecuta:** Después de AGENT 2, AGENT 3 y AGENT 4.

**Lo que está hecho:**

| Archivo / Endpoint                            | Estado |
|-----------------------------------------------|--------|
| `pages/admin/index.vue`                       | ✅     |
| `pages/admin/usuarios.vue`                    | ✅     |
| `pages/admin/themes.vue`                      | ✅     |
| `pages/admin/usuario.vue`                     | ✅     |
| `pages/admin/votaciones.vue`                  | ✅     |
| `layouts/admin.vue` (con nav Votaciones)      | ✅     |
| `server/api/admin/users/index.get.ts`         | ✅     |
| `server/api/admin/users/index.post.ts`        | ✅     |
| `server/api/admin/users/[id].put.ts`          | ✅     |
| `server/api/admin/users/[id].delete.ts`       | ✅     |
| `server/api/admin/votes/index.get.ts`         | ✅     |
| `server/api/admin/votes/[id].put.ts`          | ✅     |
| `server/api/admin/votes/[id].delete.ts`       | ✅     |

**Pendiente:**
- Endpoints CRUD de themes (`server/api/themes/`) — los themes se gestionan actualmente directo desde el cliente en `pages/admin/themes.vue` mediante `useThemes.ts`; pendiente mover a endpoints server-side con validación de role admin

**Descripción de secciones:**

**`/admin/usuarios` (role: admin):**
- Tabla con columnas: nombre, email, rol, acciones
- Acciones: **Editar** (modal inline) | **Eliminar** (confirmación)
- Botón "Añadir usuario" → modal con formulario completo
- Búsqueda por nombre/email

**`/admin/votaciones` (role: admin):**
- Tabla con columnas: usuario, theme votado, fecha
- Acciones: **Editar** (cambiar theme via dropdown) | **Eliminar** (con confirmación)
- Al editar/eliminar se ajustan automáticamente los `likes` de los themes afectados

**`/admin/themes` (role: admin):**
- Tabla paginada: orden, imagen thumb, título, likes, visible, acciones
- Acciones: **Editar** | **Eliminar** (confirmación) | **Toggle visible**
- Botón "Añadir theme" → formulario completo
- Drag & drop para reordenar themes

**`/admin/usuario` (role: user):**
- Datos personales: nombre y email (editables)
- Cambio de contraseña
- Voto actual: muestra el theme votado + dropdown para cambiarlo
- Eliminar cuenta (elimina su voto y resta likes al theme correspondiente)
- **Nunca puede ver ni modificar themes ni otros usuarios**

---

### AGENT 7 — QA & POLISH ⏳ PENDIENTE

**Rol:** Revisión final de calidad, corrección de bugs, pulido visual y coherencia de estilos.

**Se ejecuta:** Último, después de todos los demás agentes.

**Checklist de QA:**
- [ ] Todas las rutas accesibles y sin errores 404
- [ ] Responsive funciona en 320px, 768px y 1280px
- [ ] Colores, tipografías y espaciados coherentes con el diseño
- [ ] Header se vuelve sólido al hacer scroll en todas las páginas
- [ ] Sliders Swiper funcionan en mobile (touch) y desktop
- [ ] Un usuario no puede votar dos veces el mismo theme
- [ ] Cambio de voto funciona correctamente (resta/suma likes)
- [ ] Usuario sin sesión no puede acceder a `/admin/*`
- [ ] Usuario `role: user` no puede acceder a `/admin/usuarios` ni `/admin/themes`
- [ ] Seed genera datos correctamente
- [ ] `<meta>` tags SEO básicos en `nuxt.config.ts`
- [ ] Sin `console.error` ni warnings en consola en producción
- [ ] `pages/admin/usuario.vue` funciona correctamente

**Outputs obligatorios:**
- `README.md` completo con pasos de instalación y configuración
- Cero errores de consola en producción
- Checklist de QA completado y documentado en `qa-report.md`

---

## ORDEN DE EJECUCIÓN

```
Fase 1 (secuencial):           ✅ COMPLETADA
  └── AGENT 1 — Setup & Scaffolding

Fase 2 (paralelo):             🔄 EN PROGRESO (falta CRUD themes server-side)
  ├── AGENT 2 — Database & API
  └── AGENT 3 — Auth & Roles   ✅

Fase 3 (secuencial):           ✅ COMPLETADA
  └── AGENT 4 — UI / Pages Frontend

Fase 4 (paralelo):             🔄 EN PROGRESO (falta CRUD themes server-side)
  ├── AGENT 5 — Voting Logic   ✅
  └── AGENT 6 — Admin Panel

Fase 5 (secuencial):           ⏳ PENDIENTE
  └── AGENT 7 — QA & Polish
```

---

## PRÓXIMAS TAREAS PRIORITARIAS

En este orden:

1. **Completar API de themes** (`server/api/themes/`) — CRUD completo con validación de role admin server-side
2. **Ejecutar AGENT 7** — QA & Polish final

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

---

## VARIABLES DE ENTORNO REQUERIDAS (`.env`)

```env
# Supabase
SUPABASE_URL=https://TU_REF.supabase.co
SUPABASE_KEY=TU_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY

# Autenticación
NUXT_SESSION_PASSWORD=una-cadena-secreta-de-al-menos-32-caracteres
```

---

## ESTRUCTURA DE ARCHIVOS DEL PROYECTO

```
refugallo/
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
│   ├── schema.sql             ✅ (themes, votes con RLS; profiles eliminada)
│   └── seed.sql               ✅
├── server/
│   └── api/
│       ├── themes/
│       │   ├── index.get.ts   ⏳
│       │   ├── index.post.ts  ⏳
│       │   ├── [id].get.ts    ⏳
│       │   ├── [id].put.ts    ⏳
│       │   └── [id].delete.ts ⏳
│       ├── profile/
│       │   ├── index.get.ts   ✅
│       │   ├── index.put.ts   ✅
│       │   └── index.delete.ts ✅
│       └── admin/
│           ├── users/
│           │   ├── index.get.ts    ✅
│           │   ├── index.post.ts   ✅
│           │   ├── [id].put.ts     ✅
│           │   └── [id].delete.ts  ✅
│           └── votes/
│               ├── index.get.ts    ✅
│               ├── [id].put.ts     ✅
│               └── [id].delete.ts  ✅
├── middleware/
│   ├── auth.ts                ✅
│   └── admin.ts               ✅
├── composables/
│   ├── useAuth.ts             ✅
│   ├── useThemes.ts           ✅
│   └── useVotes.ts            ✅
├── stores/
│   └── toast.ts               ✅
├── types/
│   ├── database.types.ts      ✅ (sin profiles)
│   └── index.ts               ✅
├── utils/
│   └── textChunker.ts         ✅
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
