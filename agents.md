# agents.md — Sistema de Votaciones Web

Este archivo define la arquitectura de agentes para construir el proyecto descrito en `prompt.md`.
Cada agente tiene un rol único, herramientas asignadas, entradas esperadas y salidas concretas.
Los agentes se orquestan de forma secuencial o paralela según sus dependencias.

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
   │   AGENT 1   │       │   AGENT 2    │      │   AGENT 3    │
   │   Setup &   │       │  Database &  │      │     Auth     │
   │  Scaffolding│       │     API      │      │   & Roles    │
   └──────┬──────┘       └───────┬──────┘      └───────┬──────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
   ┌──────▼──────┐       ┌───────▼──────┐      ┌───────▼──────┐
   │   AGENT 4   │       │   AGENT 5    │      │   AGENT 6    │
   │  UI / Pages │       │   Voting     │      │    Admin     │
   │  Frontend   │       │   Logic      │      │    Panel     │
   └──────┬──────┘       └───────┬──────┘      └───────┬──────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                        ┌────────▼────────────┐
                        │      AGENT 7        │
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

### AGENT 1 — SETUP & SCAFFOLDING

**Rol:** Inicializa el proyecto, instala dependencias y configura el entorno base.

**Se ejecuta:** Primero. Sin dependencias previas.

**Responsabilidades:**
- Crear proyecto Nuxt.js 3 con TypeScript: `npx nuxi@latest init`
- Instalar y configurar Tailwind CSS con los colores personalizados del diseño
- Instalar Swiper.js y registrarlo como plugin global
- Instalar librerías de soporte: `@vueuse/motion`, `@vueuse/core`, vue-masonry o `vue3-masonry-css`, iconos (`heroicons` o `lucide-vue-next`)
- Crear estructura de carpetas: `pages/`, `components/`, `layouts/`, `composables/`, `server/api/`, `middleware/`, `assets/`
- Configurar `tailwind.config.ts` con paleta de colores y tipografías del diseño
- Añadir fuentes `Inter` y `Bebas Neue` desde Google Fonts en `nuxt.config.ts`
- Crear layout base `default.vue` con Header y Footer
- Crear layout `admin.vue` para el panel de administración
- Configurar `nuxt.config.ts` con módulos, plugins y variables de entorno

**Outputs obligatorios:**
- Proyecto arranca sin errores con `npm run dev`
- `tailwind.config.ts` con colores `#0094C6`, `#0A0A0A`, `#141414`, `#1E1E1E` configurados
- Estructura de carpetas creada
- Layouts `default.vue` y `admin.vue` creados (pueden estar vacíos)

**Stack a instalar:**
```bash
npx nuxi@latest init voting-app
cd voting-app
npm install -D tailwindcss @tailwindcss/typography postcss autoprefixer
npm install swiper
npm install @vueuse/motion @vueuse/core
npm install lucide-vue-next
npm install vue3-masonry-css
npm install @nuxtjs/color-mode
```

---

### AGENT 2 — DATABASE & API

**Rol:** Define el esquema de base de datos, configura el ORM y construye todos los endpoints de la API.

**Se ejecuta:** En paralelo con AGENT 3, después de AGENT 1.

**Responsabilidades:**
- Elegir entre Supabase o Prisma+SQLite y justificar la elección en un comentario en `server/README.md`
- Definir modelos `Theme` y `User` según el esquema de `prompt.md`
- Añadir tabla `votes` para controlar que cada usuario vota una sola vez por theme:
  ```
  votes: id, userId, themeId, createdAt
  ```
- Crear endpoints REST en `server/api/`:

| Método | Ruta                        | Descripción                              |
|--------|-----------------------------|------------------------------------------|
| GET    | `/api/themes`               | Lista themes visibles ordenados por order|
| GET    | `/api/themes/:id`           | Detalle de un theme                      |
| POST   | `/api/themes`               | Crear theme (solo admin)                 |
| PUT    | `/api/themes/:id`           | Editar theme (solo admin)                |
| DELETE | `/api/themes/:id`           | Eliminar theme (solo admin)              |
| GET    | `/api/ranking`              | Themes ordenados por likes desc          |
| POST   | `/api/vote/:themeId`        | Votar por un theme (requiere sesión)     |
| GET    | `/api/users`                | Lista usuarios paginada (solo admin)     |
| POST   | `/api/users`                | Crear usuario (solo admin)               |
| PUT    | `/api/users/:id`            | Editar usuario (solo admin)              |
| DELETE | `/api/users/:id`            | Eliminar usuario (solo admin)            |

- Crear seed de datos con al menos 6 themes de ejemplo con imágenes placeholder
- Validar que un usuario no pueda votar dos veces el mismo theme (constraint en DB + validación en API)

**Outputs obligatorios:**
- Schema de base de datos creado y migrado
- Todos los endpoints funcionando y devolviendo JSON correcto
- Seed ejecutable con `npm run seed`
- Archivo `server/README.md` con decisión tecnológica justificada

---

### AGENT 3 — AUTH & ROLES

**Rol:** Implementa el sistema de autenticación, sesiones y control de acceso por roles.

**Se ejecuta:** En paralelo con AGENT 2, después de AGENT 1.

**Responsabilidades:**
- Implementar registro de usuario (nombre obligatorio, email opcional, contraseña hasheada con `bcrypt`)
- Implementar login con email + contraseña
- Implementar "Olvidé mi contraseña" (envío de email de recuperación o token temporal)
- Gestionar sesiones con JWT o cookies seguras (`httpOnly`, `sameSite`)
- Crear composable `useAuth()` con: `user`, `isLoggedIn`, `isAdmin`, `login()`, `logout()`, `register()`
- Crear middleware `auth.ts` → redirige a `/registro` si no hay sesión
- Crear middleware `admin.ts` → redirige a `/` si el usuario no tiene `role: admin`
- Proteger rutas `/admin/*` con middleware `admin`
- Exponer el usuario actual en el header (nombre o botón de login)

**Endpoints a crear:**

| Método | Ruta               | Descripción              |
|--------|--------------------|--------------------------|
| POST   | `/api/auth/register` | Registro de usuario    |
| POST   | `/api/auth/login`    | Login                  |
| POST   | `/api/auth/logout`   | Cerrar sesión          |
| GET    | `/api/auth/me`       | Usuario actual         |
| POST   | `/api/auth/forgot-password` | Recuperar contraseña |

**Outputs obligatorios:**
- Composable `useAuth()` exportado y funcional
- Middlewares `auth.ts` y `admin.ts` creados
- Registro y login funcionando end-to-end
- Las rutas `/admin/*` bloqueadas para usuarios sin rol admin

---

### AGENT 4 — UI / PAGES FRONTEND

**Rol:** Construye todas las páginas y componentes visuales de la web pública.

**Se ejecuta:** Después de AGENT 1, AGENT 2 y AGENT 3.

**Responsabilidades:**

#### Componentes globales
- `AppHeader.vue` — logo izquierda, menú centro, sesión derecha; transparente → sólido al scroll
- `AppFooter.vue` — 4 columnas: logo, links secciones, links legales, redes sociales
- `ThemeCard.vue` — card reutilizable con thumbImg, title, likes
- `AppButton.vue` — botón reutilizable (variante primario / secundario)
- `AppSlider.vue` — wrapper de Swiper configurable

#### Páginas a crear

**`/` (index.vue)**
- Hero Swiper full-width: columna texto 1/4 + imagen 3/4, gradiente overlay
- Slider de thumbs con click que sincroniza el hero
- Sección CTA registro

**`/theme/[id].vue`**
- Swiper de lectura: texto dividido en bloques de 8 líneas, imagen izquierda
- Último slide con botones "Votar" y "Volver al inicio"

**`/ranking.vue`**
- Hero con título dinámico del theme #1
- Lista ordenada por likes con posición, imagen, título y contador

**`/quienes-somos.vue`**
- Bloque hero con imagen de fondo, logo, título y texto

**`/galeria.vue`**
- Grid masonry 3 columnas
- Lightbox al hacer clic
- Sección CTA inferior con dos botones

**`/contacto.vue`**
- Hero titular
- Formulario: nombre, email, mensaje, botón enviar

**`/registro.vue`**
- Toggle entre formulario de registro y login
- "Olvidé mi contraseña"

**`/textos-legales.vue`**
- Página de texto con los textos legales generados

**`/politica-de-cookies.vue`**
- Página de texto con la política de cookies

**Reglas de estilo a respetar:**
- Fondo general `#0A0A0A`, secciones alternas `#141414`
- Todos los textos en blanco o `#A3A3A3`
- Botones según especificación de `prompt.md`
- Fuente titulares: Bebas Neue, cuerpo: Inter
- Animaciones de entrada con `@vueuse/motion` en cada sección

**Outputs obligatorios:**
- Todas las páginas creadas y navegables
- Sin errores de consola
- Responsive en mobile, tablet y desktop

---

### AGENT 5 — VOTING LOGIC

**Rol:** Implementa toda la lógica de votación en frontend y backend, incluyendo validaciones y feedback al usuario.

**Se ejecuta:** Después de AGENT 2, AGENT 3 y AGENT 4.

**Responsabilidades:**
- Crear composable `useVoting(themeId)` con: `hasVoted`, `voteCount`, `castVote()`
- Al pulsar "Votar":
  - Si no hay sesión → mostrar modal/toast invitando a registrarse con link a `/registro`
  - Si ya votó → mostrar mensaje "Ya has votado por este theme"
  - Si puede votar → llamar a `POST /api/vote/:themeId`, actualizar contador en UI de forma optimista
- Mostrar el contador de likes en tiempo real en la card y en el ranking
- En la página de ranking, actualizar la lista sin recargar la página tras un voto
- Toast de confirmación al votar exitosamente (color `#0094C6`)

**Outputs obligatorios:**
- Composable `useVoting()` funcional
- Validación de doble voto en frontend y backend
- Feedback visual claro en todos los estados (no logueado, ya votó, voto exitoso)
- Contador de likes actualizado en tiempo real en UI

---

### AGENT 6 — ADMIN PANEL

**Rol:** Construye el panel de administración privado para gestionar usuarios y themes.

**Se ejecuta:** Después de AGENT 2, AGENT 3 y AGENT 4.

**Responsabilidades:**

#### Layout admin
- Sidebar izquierdo con navegación: **Usuarios | Themes**
- Header con nombre del admin y botón de logout
- Fondo `#0A0A0A`, sidebar `#141414`

#### `/admin/usuarios`
- Tabla paginada (10 por página) con columnas: ID, nombre, email, rol, acciones
- Acciones: **Editar** (modal inline) | **Eliminar** (confirmación)
- Botón "Añadir usuario" → modal con formulario completo
- Filtro por rol (user/admin) y búsqueda por nombre/email

#### `/admin/themes`
- Tabla paginada con columnas: orden, imagen thumb, título, likes, visible, acciones
- Acciones: **Editar** | **Eliminar** (confirmación) | **Toggle visible**
- Botón "Añadir theme" → formulario completo con upload de imágenes (o URLs)
- Drag & drop para reordenar themes (actualiza el campo `order`)
- Preview del theme al editarlo

**Outputs obligatorios:**
- Ambas secciones del panel funcionando con CRUD completo
- Rutas protegidas — redirige a `/` si no es admin
- Paginación funcional
- Confirmación antes de eliminar

---

### AGENT 7 — QA & POLISH

**Rol:** Revisión final de calidad, corrección de bugs, pulido visual y coherencia de estilos.

**Se ejecuta:** Último, después de todos los demás agentes.

**Responsabilidades:**
- Verificar que todas las rutas del proyecto están accesibles y sin errores 404
- Comprobar que el responsive funciona en 320px, 768px y 1280px
- Revisar que los colores, tipografías y espaciados son coherentes con el diseño definido
- Verificar que el header se vuelve sólido al hacer scroll en todas las páginas
- Comprobar que los sliders de Swiper funcionan en mobile (touch) y desktop
- Validar que un usuario no puede votar dos veces (test manual del flujo completo)
- Validar que un usuario sin sesión no puede acceder a `/admin/*`
- Verificar que el seed genera datos correctamente con `npm run seed`
- Añadir `<meta>` tags básicos de SEO en `nuxt.config.ts` (title, description, og:image)
- Revisar que no hay `console.error` ni warnings en consola
- Generar `README.md` con instrucciones de instalación, configuración y arranque

**Outputs obligatorios:**
- `README.md` completo con pasos de instalación
- Cero errores de consola en producción
- Checklist de QA completado y documentado en `qa-report.md`

---

## ORDEN DE EJECUCIÓN

```
Fase 1 (secuencial):
  └── AGENT 1 — Setup & Scaffolding

Fase 2 (paralelo):
  ├── AGENT 2 — Database & API
  └── AGENT 3 — Auth & Roles

Fase 3 (secuencial, requiere fase 2 completa):
  └── AGENT 4 — UI / Pages Frontend

Fase 4 (paralelo, requiere fase 3 completa):
  ├── AGENT 5 — Voting Logic
  └── AGENT 6 — Admin Panel

Fase 5 (secuencial, requiere fase 4 completa):
  └── AGENT 7 — QA & Polish
```

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

---

## VARIABLES DE ENTORNO REQUERIDAS (`.env`)

```env
# Base de datos
DATABASE_URL=

# Autenticación
AUTH_SECRET=
AUTH_ORIGIN=http://localhost:3000

# Email (para recuperación de contraseña)
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
```

---

## ARCHIVOS CLAVE DEL PROYECTO

```
voting-app/
├── agents.md              ← este archivo
├── prompt.md              ← fuente de verdad del proyecto
├── build-log.md           ← log de estado generado por el orchestrator
├── qa-report.md           ← checklist de QA generado por Agent 7
├── README.md              ← instrucciones generado por Agent 7
├── .env                   ← variables de entorno (no commitear)
├── nuxt.config.ts
├── tailwind.config.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── server/
│   ├── api/
│   │   ├── themes/
│   │   ├── users/
│   │   ├── auth/
│   │   └── vote/
│   └── README.md
├── middleware/
│   ├── auth.ts
│   └── admin.ts
├── composables/
│   ├── useAuth.ts
│   └── useVoting.ts
├── layouts/
│   ├── default.vue
│   └── admin.vue
├── pages/
│   ├── index.vue
│   ├── ranking.vue
│   ├── quienes-somos.vue
│   ├── galeria.vue
│   ├── contacto.vue
│   ├── registro.vue
│   ├── textos-legales.vue
│   ├── politica-de-cookies.vue
│   ├── theme/
│   │   └── [id].vue
│   └── admin/
│       ├── index.vue
│       ├── usuarios.vue
│       └── themes.vue
└── components/
    ├── AppHeader.vue
    ├── AppFooter.vue
    ├── AppButton.vue
    ├── AppSlider.vue
    ├── ThemeCard.vue
    └── admin/
        ├── DataTable.vue
        └── ModalForm.vue
```
