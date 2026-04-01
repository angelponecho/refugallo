# Prompt: REFUGALLO — Sistema de Votaciones Web

## ROL

Eres un desarrollador full-stack senior. Debes desarrollar una aplicación web de sistema de votaciones llamada **REFUGALLO** siguiendo estrictamente estas especificaciones. La calidad y completitud del resultado es crítica.

### Si el usuario está registrado
Si el usuario está registrado
Cada usuario puede cambiar su voto cuando quiera. Cada vez que vota se elimina su voto al theme anterior y se añade al último theme seleccionado.

### Si el usuario no está registrado
Puede votar una vez pero una vez que vote ya no puede cambiar su voto nunca más a no ser que se registre
Para una votación informal, hazlo por capas. No intentes “garantizar” un voto por persona; intenta poner fricción suficiente para que no sea fácil votar muchas veces.

Lo más práctico

Usa esta combinación:

1. Cookie o token local
Cuando alguien vota, guardas un identificador en el navegador y marcas ese cliente como “ya votó”.

2. Registro en servidor
No confíes solo en la cookie. Guarda en backend:

poll_id
client_token
ip_hash
user_agent_hash
fecha

3. Rate limit por IP
Ejemplo:

máximo 1 voto por encuesta por IP en 24 horas
o 3 intentos por hora

4. CAPTCHA
Antes de aceptar el voto, para frenar bots.

5. Fingerprint suave
No hace falta algo agresivo. Basta una huella aproximada:

user-agent
idioma
zona horaria
resolución
plataforma

Luego haces un hash y lo guardas. Si ves mismo fingerprint + misma encuesta, lo bloqueas o lo marcas como sospechoso.

Flujo recomendado
El usuario abre la encuesta.
El servidor genera un client_token aleatorio y lo guarda en cookie/localStorage.
Al votar, envías:
poll_id
opción elegida
client_token
CAPTCHA
El backend comprueba:
si ya existe voto con ese client_token
si esa IP ya votó
si ese fingerprint ya votó
Si pasa, guarda el voto y marca como usado.
Devuelve “ya has votado” si detecta repetición.
Qué bloquear

Pon estas reglas:

Bloqueo 1: mismo client_token → rechazar
Bloqueo 2: misma IP para la misma encuesta → rechazar o limitar
Bloqueo 3: mismo fingerprint → rechazar o marcar sospechoso
Bloqueo 4: demasiados intentos en poco tiempo → bloqueo temporal
Qué haría yo en una versión informal
Cookie/localStorage
Backend con tabla de votos
Hash de IP
Hash de user-agent/fingerprint
CAPTCHA
Rate limiting

Con eso ya paras la mayoría de duplicados casuales.

Ejemplo de tabla

votes

id
poll_id
choice_id
client_token
ip_hash
fingerprint_hash
created_at

Índices útiles:

único en (poll_id, client_token)
índice en (poll_id, ip_hash)
índice en (poll_id, fingerprint_hash)

Si alguin no registrado en el teme apareceran los votos acumulados bajo el nombre de "anonimo"  por ejemplo : theme 1 votaciones:23 nombre anonimo
---

## TECNOLOGÍA

- **Framework:** Nuxt.js 3 (con TypeScript)
- **Estilos:** Tailwind CSS + `@nuxtjs/tailwindcss`
- **Slider:** Swiper.js
- **Base de datos:** Supabase (PostgreSQL) — **ya elegido e implementado**
- **Autenticación:** `@nuxtjs/supabase` (Supabase Auth)
- **Estado global:** Pinia (`@pinia/nuxt`)
- **Utilidades:** `@vueuse/core`, `@vueuse/motion`, `@vueuse/nuxt`
- **Iconos:** `lucide-vue-next`
- **Galería masonry:** `vue3-masonry-css`

---

## BASE DE DATOS (Supabase)

### Tabla `themes`

| Campo       | Tipo                      |
|-------------|---------------------------|
| id          | SERIAL (PK)               |
| title       | TEXT NOT NULL             |
| subtitle    | TEXT                      |
| description | TEXT                      |
| text        | TEXT                      |
| mainImg     | TEXT (URL)                |
| heroImg     | TEXT (URL)                |
| thumbImg    | TEXT (URL)                |
| likes       | INTEGER (default 0)       |
| visible     | BOOLEAN (default true)    |
| order       | INTEGER (default 0)       |
| created_at  | TIMESTAMPTZ               |

### Tabla `profiles` (extiende `auth.users` de Supabase)

| Campo      | Tipo                        |
|------------|-----------------------------|
| id         | UUID (FK → auth.users.id)   |
| name       | TEXT NOT NULL               |
| email      | TEXT                        |
| photo      | TEXT (URL, opcional)        |
| role       | TEXT: `user` / `admin`      |
| created_at | TIMESTAMPTZ                 |

### Tabla `votes`

| Campo      | Tipo                              |
|------------|-----------------------------------|
| id         | SERIAL (PK)                       |
| user_id    | UUID (FK → auth.users.id)         |
| theme_id   | INTEGER (FK → themes.id)          |
| created_at | TIMESTAMPTZ                       |

**Constraint:** `UNIQUE(user_id)` — un usuario solo puede tener un voto activo a la vez.
**Lógica:** al votar, se hace `UPSERT` por `user_id` actualizando `theme_id` y ajustando los `likes` de ambos themes.

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
/admin/usuarios      → Gestión de usuarios (solo admin)
/admin/themes        → Gestión de themes (solo admin)
/admin/usuario       → Perfil propio (solo role: user — nunca admin ni themes ajenos)
```

---

## COMPONENTES GLOBALES

### NAVEGADOR (Header)

- Logo a la izquierda
- Menú centrado con las secciones: **Ranking | Quiénes somos | Galería | Contacto**
- A la derecha: si no hay sesión iniciada → botón **"Iniciar sesión"**; - Si hay sesión → nombre del usuario con opción de cerrar sesión
y en ese nombre al pulsar sobre el que tenga un enlace hacia /admin (en caso de que sea administrador) y admin/usuario en  caso de que sea user

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
- Navegación con flechas laterales y bullets
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

- Hero con titular dinámico: *"[Título del theme más votado] es el #1"* e imagen de fondo (~400px de altura)
- Subtítulo animando a registrarse y votar
- Botón **"Ver themes"** → `/`
- Lista ordenada de todos los themes de mayor a menor `likes`, mostrando: posición, imagen `thumbImg`, título, número de votos

---

### QUIÉNES SOMOS (`/quienes-somos`)

- Hero con titular dinámico: *"[Título del theme más votado] es el #1"* e imagen de fondo (~400px de altura)
- Logo centrado
- Titular centrado
- Texto explicativo debajo

---

### GALERÍA (`/galeria`)
- Hero con titular dinámico: *"[Título del theme más votado] es el #1"* e imagen de fondo (~400px de altura)
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
  - Email (obligatorio para Supabase Auth)
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

## PANEL DE ADMINISTRACIÓN (`/admin`)

Ruta privada protegida por middleware de autenticación. Si el usuario no está registrado, redirigir a `/`.

### Si el usuario tiene `role: admin`

#### `/admin/usuarios`

- Lista paginada de usuarios registrados
- Acciones por fila: **Ver | Editar | Eliminar**
- Botón **"Añadir usuario"**

#### `/admin/themes`

- Lista paginada de themes
- Acciones por fila: **Ver | Editar | Eliminar**
- Campos editables: todos los de la tabla `themes` incluyendo `visible` y `order`
- Botón **"Añadir theme"**

#### 'votos'
- Lista paginada de votos con nombre de usuario y theme votado 
- Acciones por fila: **Ver | Editar | Eliminar**

---

### Si el usuario tiene `role: user`

#### `/admin/usuario`

- Muestra sus datos (solo los suyos — **nunca puede modificar themes ni otros usuarios**)
- Puede modificar sus datos personales (nombre, foto)
- Puede eliminarse (si se elimina, se elimina también su voto y se resta 1 del `likes` del theme votado)
- Puede ver qué theme votó
- No puede cambiar de rol. Solo puede ser user

#### Sección "Tu voto" dentro de `/admin/usuario`

- Muestra el theme votado actualmente: imagen thumb, título, número de likes y enlace "Ver theme"
- Si no ha votado, muestra un mensaje con enlace a la página principal
- Dropdown con todos los themes disponibles, preseleccionado en el voto actual
- Botón "Guardar voto" — deshabilitado si no hay selección o si se elige el mismo theme ya votado
- Al guardar se llama al RPC `vote_theme` (UPSERT): descuenta likes al theme anterior y los suma al nuevo
- La sección se actualiza automáticamente tras guardar sin recargar la página
---


## DISEÑO Y ESTILOS

### Estética general

La web debe transmitir una estética **oscura, premium y cinematográfica**, similar a la experiencia de usuario de Netflix. El objetivo es que el usuario sienta que está navegando por una plataforma de contenido de alto nivel.

### Paleta de colores

| Rol                       | Color                     | Hex                  |
|---------------------------|---------------------------|----------------------|
| Fondo principal           | Negro profundo            | `#0A0A0A`            |
| Fondo secundario          | Gris oscuro               | `#141414`            |
| Fondo de cards/bloques    | Gris carbón               | `#1E1E1E`            |
| Color principal           | Azul eléctrico            | `#0094C6`            |
| Color principal hover     | Azul claro                | `#00B4F0`            |
| Texto principal           | Blanco                    | `#FFFFFF`            |
| Texto secundario          | Gris claro                | `#A3A3A3`            |
| Bordes y separadores      | Gris oscuro               | `#2A2A2A`            |
| Overlay sobre imágenes    | Negro semitransparente    | `rgba(0,0,0,0.6)`    |

Configurados en `tailwind.config.ts` como colores personalizados.

### Tipografía

- **Fuente principal:** `Inter` (Google Fonts) — para cuerpos de texto, navegación y UI general
- **Fuente de titulares:** `Bebas Neue` o `Oswald` (Google Fonts) — para títulos de hero, rankings y secciones destacadas
- Tamaños base:
  - Títulos hero: `4xl` a `6xl`, bold, color blanco
  - Subtítulos: `xl` a `2xl`, color gris claro `#A3A3A3`
  - Cuerpo de texto: `base` a `lg`, color blanco o gris claro
  - Labels y meta: `sm`, color `#A3A3A3`

### Experiencia de usuario — inspiración Netflix

- **Header transparente** que se vuelve sólido (`#0A0A0A` con sombra) al hacer scroll
- **Hero a pantalla completa** con imagen que ocupa todo el viewport, oscurecida con un gradiente negro hacia la izquierda
- El gradiente del hero: `rgba(0,0,0,0.85)` en zona de texto → `rgba(0,0,0,0)` en zona de imagen
- **Slider de thumbs** con efecto hover: `scale-105` + overlay con el título
- Cards con bordes redondeados (`rounded-lg`) y sombra oscura
- Transiciones de slides suaves (fade o slide horizontal)

### Botones

```
Primario:   bg-[#0094C6]  text-white  hover:bg-[#00B4F0]  rounded-lg  px-6 py-3  font-semibold  transition
Secundario: bg-transparent  border border-white  text-white  hover:bg-white  hover:text-black  rounded-lg  px-6 py-3  transition
```

### Componentes UI

- **Cards de themes:** fondo `#1E1E1E`, imagen con aspect-ratio vertical, título en blanco, subtítulo en gris, efecto hover con borde azul `#0094C6`
- **Inputs de formulario:** fondo `#1E1E1E`, borde `#2A2A2A`, texto blanco, focus con borde `#0094C6`
- **Separadores de sección:** línea sutil `#2A2A2A` o cambio de fondo entre `#0A0A0A` y `#141414`
- **Scrollbar:** personalizada oscura (CSS `scrollbar-color`)

### Animaciones

- Transiciones de página: fade suave con `Nuxt Transition` (`opacity 0.3s ease`)
- Hover en imágenes y cards: `transition-transform duration-300 ease-in-out`
- Aparición de secciones al hacer scroll: `fade-up` con `@vueuse/motion`
- Slider Swiper: efecto `fade` o `coverflow` para el hero; `slide` para el carrusel de thumbs

### Responsive

- Mobile: menú colapsado en hamburguesa, hero a pantalla completa, slider de thumbs horizontal scrollable
- Tablet: grid de 2 columnas en galería y ranking
- Desktop: experiencia completa tal como se describe

---

## REQUISITOS GENERALES

- Diseño **responsive** (mobile-first)
- Animaciones suaves en transiciones de página y sliders
- Protección de rutas privadas con middleware
- Las votaciones solo pueden d usuarios con sesión iniciada
- Cada usuario solo puede tener **un voto activo** (cambiable, no múltiple)
- Si el usuario ya votó y está registrado en el theme votado debera aparecer un texto de "Tu elección" en lugar del boton
- Si el usuario no esta registrado el botón de votar debe redirigir a la pagina de registro
- Seed de datos de ejemplo en Supabase para poder probar la aplicación desde el primer arranque
