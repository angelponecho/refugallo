# agents.md — REFUGALLO: Sistema de Votaciones Web

Este archivo define la arquitectura de agentes para construir el proyecto descrito en `prompt.md`.
Cada agente tiene un rol único, herramientas asignadas, entradas esperadas y salidas concretas.
Los agentes se orquestan de forma secuencial o paralela según sus dependencias.

> **Estado del proyecto:** 2026-03-24
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
   │   AGENT 4   │  ✅   │   AGENT 5    │  🔄  │   AGENT 6    │  🔄
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

**Lo que está hecho:**
- `supabase/schema.sql` — esquema completo (themes, profiles, votes) con RLS ✅
- `supabase/seed.sql` — datos de ejemplo ✅
- `server/api/admin/users/index.post.ts` — crear usuario (solo admin) ✅
- `server/api/admin/users/[id].delete.ts` — eliminar usuario (solo admin) ✅

**Endpoints pendientes de crear:**

| Método | Ruta                              | Descripción                                    | Estado |
|--------|-----------------------------------|------------------------------------------------|--------|
| GET    | `/api/themes/index.get.ts`        | Lista themes visibles ordenados por order      | ⏳     |
| GET    | `/api/themes/[id].get.ts`         | Detalle de un theme                            | ⏳     |
| POST   | `/api/themes/index.post.ts`       | Crear theme (solo admin)                       | ⏳     |
| PUT    | `/api/themes/[id].put.ts`         | Editar theme (solo admin)                      | ⏳     |
| DELETE | `/api/themes/[id].delete.ts`      | Eliminar theme (solo admin)                    | ⏳     |
| GET    | `/api/ranking/index.get.ts`       | Themes ordenados por likes desc                | ⏳     |
| POST   | `/api/vote/[themeId].post.ts`     | Votar por un theme (UPSERT, requiere sesión)   | ⏳     |
| DELETE | `/api/vote/index.delete.ts`       | Eliminar voto del usuario (al borrar cuenta)   | ⏳     |
| GET    | `/api/admin/users/index.get.ts`   | Lista usuarios paginada (solo admin)           | ⏳     |
| PUT    | `/api/admin/users/[id].put.ts`    | Editar usuario (solo admin)                    | ⏳     |
| GET    | `/api/profile/index.get.ts`       | Ver datos propios (role: user)                 | ⏳     |
| PUT    | `/api/profile/index.put.ts`       | Editar datos propios (role: user)              | ⏳     |
| DELETE | `/api/profile/index.delete.ts`    | Borrar propia cuenta (elimina voto)            | ⏳     |

**Lógica del voto (UPSERT):**
```sql
-- Al votar por themeId nuevo:
-- 1. Obtener voto actual del usuario (si existe) → restar 1 likes al theme anterior
-- 2. UPSERT en votes (user_id unique) con el nuevo theme_id
-- 3. Sumar 1 likes al theme nuevo
```

**Notas de implementación:**
- Usar `serverSupabaseServiceRole(event)` para operaciones admin
- Usar `serverSupabaseClient(event)` para operaciones de usuario autenticado
- Validar role en cada endpoint admin comparando `profiles.role`

**Outputs obligatorios:**
- Todos los endpoints del listado funcionando y devolviendo JSON correcto
- Schema ejecutable en Supabase Dashboard
- Seed ejecutable

---

### AGENT 3 — AUTH & ROLES ✅ COMPLETADO

**Rol:** Implementa el sistema de autenticación, sesiones y control de acceso por roles.

**Se ejecuta:** En paralelo con AGENT 2, después de AGENT 1.

**Lo que está hecho:**
- `composables/useAuth.ts` — composable funcional con `user`, `isLoggedIn`, `isAdmin`, `login()`, `logout()`, `register()` ✅
- `middleware/auth.ts` — redirige a `/registro` si no hay sesión ✅
- `middleware/admin.ts` — redirige a `/` si el usuario no tiene `role: admin` ✅
- Autenticación gestionada por `@nuxtjs/supabase` (Supabase Auth) ✅
- Rutas `/admin/*` protegidas ✅

**Notas:**
- La recuperación de contraseña usa el flujo nativo de Supabase Auth (email con enlace)
- El `role` se almacena en la tabla `profiles`, no en `auth.users`
- El composable `useSupabaseUser()` provee el usuario actual

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
| `pages/admin/usuario.vue`             | ⏳ Pendiente (perfil de usuario `role: user`) |

**Archivos auxiliares creados:**
- `stores/toast.ts` — store Pinia para notificaciones ✅
- `types/database.types.ts` — tipos generados desde Supabase ✅
- `types/index.ts` — tipos globales del proyecto ✅
- `utils/textChunker.ts` — divide el `text` del theme en bloques de 8 líneas para el slider ✅

**Reglas de estilo a respetar:**
- Fondo general `#0A0A0A`, secciones alternas `#141414`
- Todos los textos en blanco o `#A3A3A3`
- Botones según especificación de `prompt.md`
- Fuente titulares: Bebas Neue, cuerpo: Inter
- Animaciones de entrada con `@vueuse/motion` en cada sección

**Pendiente:**
- Crear `pages/admin/usuario.vue` — perfil del usuario con `role: user` (ver datos, editar, borrar cuenta, ver voto actual)

---

### AGENT 5 — VOTING LOGIC 🔄 PARCIALMENTE IMPLEMENTADO

**Rol:** Implementa toda la lógica de votación en frontend y backend, incluyendo validaciones y feedback al usuario.

**Se ejecuta:** Después de AGENT 2, AGENT 3 y AGENT 4.

**Lo que está hecho:**
- `composables/useVotes.ts` — composable de votación ✅

**Pendiente:**
- Crear endpoint `POST /api/vote/[themeId]` con lógica UPSERT
- Crear endpoint `DELETE /api/vote` para cuando el usuario elimina su cuenta
- Conectar `useVotes.ts` al endpoint real (actualmente puede usar datos mock o Supabase directo)
- Validar que al votar:
  - Si no hay sesión → mostrar modal/toast invitando a registrarse con link a `/registro`
  - Si ya votó el mismo theme → mostrar "Ya has votado por este theme"
  - Si cambia de voto → actualizar likes del theme anterior y nuevo
- Toast de confirmación con color `#0094C6`
- Actualización optimista del contador en UI

**Composable `useVotes.ts` debe exponer:**
```typescript
const { hasVoted, currentVoteThemeId, voteCount, castVote, removeVote } = useVotes(themeId?)
```

**Outputs obligatorios:**
- Composable `useVotes()` conectado a API real
- Validación de voto único en frontend y backend
- Feedback visual claro en todos los estados
- Contador de likes actualizado sin recargar la página

---

### AGENT 6 — ADMIN PANEL 🔄 PARCIALMENTE IMPLEMENTADO

**Rol:** Construye el panel de administración privado para gestionar usuarios y themes.

**Se ejecuta:** Después de AGENT 2, AGENT 3 y AGENT 4.

**Lo que está hecho:**
- `pages/admin/index.vue` ✅
- `pages/admin/usuarios.vue` ✅
- `pages/admin/themes.vue` ✅
- `components/Admin/DataTable.vue` ✅
- `components/Admin/ModalForm.vue` ✅
- `server/api/admin/users/index.post.ts` — crear usuario ✅
- `server/api/admin/users/[id].delete.ts` — eliminar usuario ✅

**Pendiente (endpoints de API):**
- `GET /api/admin/users` — listar usuarios paginados
- `PUT /api/admin/users/[id]` — editar usuario
- Todos los endpoints de `/api/themes/*` (CRUD completo)
- Página `pages/admin/usuario.vue` — perfil para `role: user`

**Layout admin:**
- Sidebar izquierdo con navegación: **Usuarios | Themes**
- Header con nombre del admin y botón de logout
- Fondo `#0A0A0A`, sidebar `#141414`

**`/admin/usuarios` (role: admin):**
- Tabla paginada (10 por página): ID, nombre, email, rol, acciones
- Acciones: **Editar** (modal inline) | **Eliminar** (confirmación)
- Botón "Añadir usuario" → modal con formulario completo
- Filtro por rol y búsqueda por nombre/email

**`/admin/themes` (role: admin):**
- Tabla paginada: orden, imagen thumb, título, likes, visible, acciones
- Acciones: **Editar** | **Eliminar** (confirmación) | **Toggle visible**
- Botón "Añadir theme" → formulario completo
- Drag & drop para reordenar themes (actualiza `order`)

**`/admin/usuario` (role: user) — pendiente de crear:**
- Muestra solo sus propios datos
- Puede editar nombre y foto
- Puede borrar su cuenta (elimina su voto, resta likes)
- Puede ver qué theme votó
- **Nunca puede ver ni modificar themes ni otros usuarios**
- **No puede cambiar su rol — siempre `user`, nunca `admin`** (validar tanto en frontend como en el endpoint `PUT /api/profile`)

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

Fase 2 (paralelo):             🔄 EN PROGRESO
  ├── AGENT 2 — Database & API
  └── AGENT 3 — Auth & Roles   ✅

Fase 3 (secuencial):           🔄 EN PROGRESO (falta /admin/usuario)
  └── AGENT 4 — UI / Pages Frontend

Fase 4 (paralelo):             🔄 EN PROGRESO
  ├── AGENT 5 — Voting Logic
  └── AGENT 6 — Admin Panel

Fase 5 (secuencial):           ⏳ PENDIENTE
  └── AGENT 7 — QA & Polish
```

---

## PRÓXIMAS TAREAS PRIORITARIAS

En este orden:

1. **Completar API de themes** (`server/api/themes/`) — CRUD completo con validación de role admin
2. **Completar API de votación** (`server/api/vote/[themeId].post.ts`) — UPSERT con ajuste de likes
3. **Completar API de admin users** — GET lista paginada, PUT editar
4. **Crear API de perfil** (`server/api/profile/`) — para usuarios `role: user`
5. **Crear `pages/admin/usuario.vue`** — perfil propio para `role: user`
6. **Conectar `useVotes.ts`** al endpoint real
7. **Ejecutar AGENT 7** — QA & Polish final

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
9. Usar `serverSupabaseServiceRole` solo en endpoints admin; `serverSupabaseClient` para el resto
10. Validar siempre el `role` del usuario en los endpoints antes de ejecutar operaciones privilegiadas

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
│   ├── schema.sql             ✅ (themes, profiles, votes con RLS)
│   └── seed.sql               ✅
├── server/
│   └── api/
│       ├── themes/
│       │   ├── index.get.ts   ⏳
│       │   ├── index.post.ts  ⏳
│       │   ├── [id].get.ts    ⏳
│       │   ├── [id].put.ts    ⏳
│       │   └── [id].delete.ts ⏳
│       ├── ranking/
│       │   └── index.get.ts   ⏳
│       ├── vote/
│       │   ├── [themeId].post.ts ⏳
│       │   └── index.delete.ts   ⏳
│       ├── profile/
│       │   ├── index.get.ts   ⏳
│       │   ├── index.put.ts   ⏳
│       │   └── index.delete.ts ⏳
│       └── admin/
│           └── users/
│               ├── index.get.ts    ⏳
│               ├── index.post.ts   ✅
│               ├── [id].put.ts     ⏳
│               └── [id].delete.ts  ✅
├── middleware/
│   ├── auth.ts                ✅
│   └── admin.ts               ✅
├── composables/
│   ├── useAuth.ts             ✅
│   ├── useThemes.ts           ✅
│   └── useVotes.ts            ✅ (conectar a API real pendiente)
├── stores/
│   └── toast.ts               ✅
├── types/
│   ├── database.types.ts      ✅
│   └── index.ts               ✅
├── utils/
│   └── textChunker.ts         ✅
├── layouts/
│   ├── default.vue            ✅
│   └── admin.vue              ✅
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
│       └── usuario.vue        ⏳ (perfil para role: user)
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
