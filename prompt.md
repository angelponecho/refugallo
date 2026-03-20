# Prompt: Sistema de Votaciones Web

## ROL

Eres un desarrollador full-stack senior. Debes desarrollar una aplicación web de sistema de votaciones siguiendo estrictamente estas especificaciones. La calidad y completitud del resultado es crítica.

---

## TECNOLOGÍA

- **Framework:** Nuxt.js 3 (con TypeScript)
- **Estilos:** Tailwind CSS
- **Slider:** Swiper.js — elige el que mejor se adapte
- **Base de datos:** Supabase (PostgreSQL) o SQLite con Prisma — elige el que mejor se adapte
- **Autenticación:** Nuxt Auth o similar
- **Galería masonry:** vue-masonry o similar — elige el que mejor se adapte
- Instala las librerías adicionales que consideres necesarias y justifica brevemente tu elección

---

## BASE DE DATOS

### Tabla `themes`

| Campo       | Tipo                      |
|-------------|---------------------------|
| id          | INT (PK, autoincrement)   |
| title       | VARCHAR                   |
| subtitle    | VARCHAR                   |
| description | TEXT                      |
| text        | TEXT                      |
| mainImg     | VARCHAR (URL)             |
| heroImg     | VARCHAR (URL)             |
| thumbImg    | VARCHAR (URL)             |
| likes       | INT (default 0)           |
| visible     | BOOLEAN (default true)    |
| order       | INT                       |

### Tabla `users`

| Campo    | Tipo                        |
|----------|-----------------------------|
| id       | INT (PK, autoincrement)     |
| name     | VARCHAR                     |
| email    | VARCHAR (opcional, único)   |
| photo    | VARCHAR (URL, opcional)     |
| password | VARCHAR (hash)              |
| role     | ENUM: `user` / `admin`      |

---

## ESTRUCTURA DE RUTAS

```
/                    → Página principal
/theme/:id           → Página de detalle de un theme
/ranking             → Ranking de votaciones
/quienes-somos       → Quiénes somos
/galeria             → Galería de fotos y vídeos
/contacto            → Contacto
/registro            → Registro / Login
/politica-de-cookies → Política de cookies
/textos-legales      → Textos legales
/admin               → Panel de administración (privado, solo role: admin)
/admin/usuarios      → Gestión de usuarios
/admin/themes        → Gestión de themes
```

---

## COMPONENTES GLOBALES

### NAVEGADOR (Header)

- Logo a la izquierda
- Menú centrado con las secciones: **Ranking | Quiénes somos | Galería | Contacto**
- A la derecha: si no hay sesión iniciada → botón **"Iniciar sesión"**; si hay sesión → nombre del usuario con opción de cerrar sesión

---

## PÁGINAS

### PÁGINA PRINCIPAL (`/`)

**Sección 1 — Hero Slider (Swiper, ancho completo)**

Cada slide contiene:

- **Columna izquierda (1/4 pantalla):**
  - Título (`title`)
  - Subtítulo (`subtitle`)
  - Botón **"Ver"** → navega a `/theme/:id`
  - Botón **"Votar"** → registra el voto del usuario en ese theme (requiere estar registrado)
- **Columna derecha (3/4 pantalla):**
  - Imagen hero (`heroImg`) a pantalla completa

Solo se muestran los themes con `visible: true`, ordenados por el campo `order`.

**Sección 2 — Slider de thumbs**

- Pequeño titular: *"Themes"*
- Slider horizontal con las imágenes `thumbImg` en formato vertical
- Al hacer clic en un thumb → el hero slider salta al slide del theme correspondiente

**Sección 3 — CTA Registro**

- Titular que anime a registrarse para votar
- Botón **"Registrarse"** → `/registro`

---

### PÁGINA THEME (`/theme/:id`)

**Slider de lectura (Swiper)**

- El campo `text` del theme se divide en bloques de máximo 8 líneas
- Cada bloque ocupa un slide completo
- Layout: imagen `mainImg` a la izquierda | texto a la derecha
- Navegación con flechas laterales y bullets
- En el **último slide** aparecen dos botones:
  - **"Votar"** → registra el voto (requiere sesión iniciada)
  - **"Volver al inicio"** → `/`

---

### RANKING (`/ranking`)

- Hero con titular dinámico: *"[Título del theme más votado] es el #1"*
- Subtítulo animando a registrarse y votar
- Botón **"Ver themes"** → `/`
- Lista ordenada de todos los themes de mayor a menor `likes`, mostrando: posición, imagen `thumbImg`, título, número de votos

---

### QUIÉNES SOMOS (`/quienes-somos`)

- Bloque con imagen de fondo (~400px de altura)
- Logo centrado
- Titular centrado
- Texto explicativo debajo

---

### GALERÍA (`/galeria`)

- Grid tipo **masonry de 3 columnas** con thumbnails de fotos y vídeos
- Al hacer clic en un thumbnail → lightbox/popup con fondo oscurecido mostrando la imagen/vídeo ampliado
- Sección inferior:
  - Titular animando a votar
  - Texto explicativo: *"Elige tu theme favorito y pulsa Votar"*
  - Botón **"Ver themes"** → `/`
  - Botón **"Registrarse"** → `/registro`

---

### CONTACTO (`/contacto`)

- Bloque hero con titular animando a ponerse en contacto
- Texto invitando a compartir ideas y opiniones
- Formulario de contacto: nombre, email, mensaje, botón enviar

---

### REGISTRO / LOGIN (`/registro`)

- Formulario de registro:
  - Nombre (obligatorio)
  - Email (opcional)
  - Contraseña
  - Botón **"Registrarse"**
- Formulario de login:
  - Email
  - Contraseña
  - Link **"Olvidé mi contraseña"**
  - Botón **"Iniciar sesión"**
- Toggle para cambiar entre registro y login

---

### TEXTOS LEGALES (`/textos-legales`)

Genera textos legales por defecto que incluyan:

- Aviso legal e identificación del titular
- Condiciones de uso de la plataforma
- Propiedad intelectual
- Limitación de responsabilidad
- Legislación aplicable (España / UE)

---

### POLÍTICA DE COOKIES (`/politica-de-cookies`)

Texto indicando que únicamente se utilizan las cookies estrictamente necesarias para el mantenimiento de la sesión del usuario. No se usan cookies de rastreo ni publicidad de terceros.

---

## FOOTER

4 columnas:

1. Logo de la web
2. Links a secciones principales (Ranking, Quiénes somos, Galería, Contacto)
3. Links legales (Política de privacidad, Gestión de cookies)
4. *"Síguenos en:"* + iconos de Facebook e Instagram

---

## PANEL DE ADMINISTRACIÓN (`/admin`) — Solo `role: admin`

Ruta privada protegida por middleware de autenticación. Si el usuario no es admin, redirigir a `/`.

### `/admin/usuarios`

- Lista paginada de usuarios registrados
- Acciones por fila: **Ver | Editar | Eliminar**
- Botón **"Añadir usuario"**

### `/admin/themes`

- Lista paginada de themes
- Acciones por fila: **Ver | Editar | Eliminar**
- Campos editables: todos los de la tabla `themes` incluyendo `visible` y `order`
- Botón **"Añadir theme"**

---

## DISEÑO Y ESTILOS

### Estética general

La web debe transmitir una estética **oscura, premium y cinematográfica**, similar a la experiencia de usuario de Netflix. El objetivo es que el usuario sienta que está navegando por una plataforma de contenido de alto nivel.

### Paleta de colores

| Rol                  | Color              | Hex       |
|----------------------|--------------------|-----------|
| Fondo principal      | Negro profundo      | `#0A0A0A` |
| Fondo secundario     | Gris oscuro        | `#141414` |
| Fondo de cards/bloques | Gris carbón      | `#1E1E1E` |
| Color principal      | Azul eléctrico     | `#0094C6` |
| Color principal hover | Azul claro        | `#00B4F0` |
| Texto principal      | Blanco             | `#FFFFFF` |
| Texto secundario     | Gris claro         | `#A3A3A3` |
| Bordes y separadores | Gris oscuro        | `#2A2A2A` |
| Overlay sobre imágenes | Negro semitransparente | `rgba(0,0,0,0.6)` |

Configura estos valores en `tailwind.config.ts` como colores personalizados para usarlos en toda la app.

### Tipografía

- **Fuente principal:** `Inter` (Google Fonts) — para cuerpos de texto, navegación y UI general
- **Fuente de titulares:** `Bebas Neue` o `Oswald` (Google Fonts) — para títulos de hero, rankings y secciones destacadas
- Tamaños base:
  - Títulos hero: `4xl` a `6xl`, bold, color blanco
  - Subtítulos: `xl` a `2xl`, color gris claro `#A3A3A3`
  - Cuerpo de texto: `base` a `lg`, color blanco o gris claro
  - Labels y meta: `sm`, color `#A3A3A3`

### Experiencia de usuario — inspiración Netflix

La página principal debe replicar la lógica visual de Netflix:

- **Header transparente** que se vuelve sólido (`#0A0A0A` con sombra) al hacer scroll
- **Hero a pantalla completa** con imagen que ocupa todo el viewport, oscurecida con un gradiente negro hacia la izquierda para que el texto sea legible
- El gradiente del hero debe ir de `rgba(0,0,0,0.85)` en la zona del texto a `rgba(0,0,0,0)` en la zona de la imagen
- **Slider de thumbs** en formato carrusel horizontal con efecto hover: escalar ligeramente la imagen (`scale-105`) y mostrar un overlay con el título
- Las cards del slider deben tener bordes redondeados (`rounded-lg`) y sombra oscura
- Las transiciones entre slides deben ser suaves (fade o slide horizontal)
- Los botones principales usan el color `#0094C6` con texto blanco, borde redondeado y efecto hover más claro
- Los botones secundarios son transparentes con borde blanco o azul y se rellenan al hacer hover

### Botones

```
Primario:   bg-[#0094C6]  text-white  hover:bg-[#00B4F0]  rounded-lg  px-6 py-3  font-semibold  transition
Secundario: bg-transparent  border border-white  text-white  hover:bg-white  hover:text-black  rounded-lg  px-6 py-3  transition
```

### Componentes UI

- **Cards de themes:** fondo `#1E1E1E`, imagen con aspect-ratio vertical, título en blanco, subtítulo en gris, efecto hover con borde azul `#0094C6`
- **Inputs de formulario:** fondo `#1E1E1E`, borde `#2A2A2A`, texto blanco, focus con borde `#0094C6`
- **Separadores de sección:** línea sutil `#2A2A2A` o simplemente cambio de fondo entre `#0A0A0A` y `#141414`
- **Scrollbar:** personalizada oscura para mantener coherencia visual (usando CSS `scrollbar-color`)

### Animaciones

- Transiciones de página: fade suave con `Nuxt Transition` (`opacity 0.3s ease`)
- Hover en imágenes y cards: `transition-transform duration-300 ease-in-out`
- Aparición de secciones al hacer scroll: animación de entrada `fade-up` con `@vueuse/motion` o similar
- Slider Swiper: efecto `fade` o `coverflow` para el hero; efecto `slide` para el carrusel de thumbs

### Responsive

- Mobile: menú colapsado en hamburguesa, hero a pantalla completa, slider de thumbs en formato horizontal scrollable
- Tablet: grid de 2 columnas en galería y ranking
- Desktop: experiencia completa tal como se describe

---

## REQUISITOS GENERALES

- Diseño **responsive** (mobile-first)
- Animaciones suaves en transiciones de página y sliders
- Protección de rutas privadas con middleware
- Las votaciones solo pueden realizarlas usuarios con sesión iniciada (`role: user` o `role: admin`)
- Cada usuario solo puede votar **una vez** por theme
- Seed de datos de ejemplo en la base de datos para poder probar la aplicación desde el primer arranque
