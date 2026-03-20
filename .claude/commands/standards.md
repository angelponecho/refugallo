# /standards — Revisión de Estándares Web

Revisa que el código del proyecto sigue los estándares web modernos: HTML semántico, CSS, JavaScript y buenas prácticas de Vue/Nuxt.

## Pasos a seguir

Analiza los archivos `.vue`, `.ts` y `.css` del proyecto buscando los siguientes problemas:

### HTML Semántico
- Uso correcto de elementos semánticos: `<nav>`, `<main>`, `<aside>`, `<article>`, `<section>`, `<header>`, `<footer>`
- `<section>` y `<article>` deben tener un heading hijo
- No usar `<div>` o `<span>` para elementos que tienen semántica propia
- Tablas de datos con `<thead>`, `<tbody>`, `<th scope="">` correctos
- Listas `<ul>/<ol>` para grupos de items relacionados (menús, rankings, galerías)

### Formularios
- `<form>` con `action` y `method` apropiados o manejo JS explícito
- `<label>` para cada campo
- Tipos de input correctos: `type="email"`, `type="password"`, `type="search"`
- `autocomplete` en campos comunes: `name`, `email`, `current-password`
- Botón de envío `type="submit"` dentro del form

### Vue / Nuxt Best Practices
- Componentes con nombre en PascalCase
- Props con tipos TypeScript definidos
- Eventos emitidos con `defineEmits` tipado
- No mutar props directamente
- `v-for` siempre con `:key` único y estable (no índice de array si el orden puede cambiar)
- Computed properties para lógica derivada, no en template
- `watchEffect` / `watch` con cleanup cuando corresponda
- Uso de `<Teleport>` para modales en lugar de posicionamiento absoluto

### CSS / Tailwind
- No mezclar estilos inline con Tailwind sin razón
- Variables CSS para valores que se repiten fuera de Tailwind
- No usar `!important` salvo casos excepcionales documentados
- Media queries coherentes con el breakpoint system de Tailwind (sm/md/lg/xl/2xl)
- `transition` y `animation` respetan `prefers-reduced-motion`

### TypeScript
- No usar `any` explícito — usar tipos específicos o `unknown`
- Interfaces para objetos de dominio (Theme, User, Vote)
- Funciones asíncronas con manejo de errores (`try/catch` o `.catch()`)
- No usar `!` (non-null assertion) sin comentario justificando por qué es seguro

### Seguridad básica
- No interpolación de HTML sin sanitizar (`v-html` solo con contenido de confianza)
- Variables de entorno privadas solo en `server/` (no exponer en `useRuntimeConfig().public`)
- Endpoints de API con validación de entrada
- Rutas admin protegidas con middleware

### Internacionalización (i18n)
- Textos hardcodeados en español directamente en componentes (aceptable para este proyecto)
- Si se planea soporte multi-idioma: marcar strings con `$t()` desde el inicio

## Formato del reporte

Agrupa los problemas por categoría y archivo:

```
## HTML Semántico
⚠️  components/AppHeader.vue:15 — <div class="nav"> debería ser <nav>
❌  pages/ranking.vue:8 — <section> sin heading hijo

## Vue Best Practices
⚠️  components/ThemeCard.vue:23 — v-for usa índice como key

## TypeScript
❌  composables/useVoting.ts:41 — parámetro 'response' tipado como 'any'
```

Al final: puntuación global estimada y top 5 mejoras de mayor impacto.
