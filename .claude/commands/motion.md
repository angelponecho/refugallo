# /motion — Revisión de Animaciones y Micro-interacciones

Audita todas las animaciones, transiciones y micro-interacciones del proyecto para garantizar que son fluidas, coherentes y accesibles.

## Principios de animación para este proyecto

- **Propósito:** cada animación debe tener una razón (guiar la atención, confirmar una acción, suavizar una transición)
- **Duración:** rápidas para feedback (150-200ms), moderadas para transiciones (300ms), lentas para entradas de página (400-600ms)
- **Easing:** `ease-in-out` para la mayoría, `ease-out` para entradas, `ease-in` para salidas
- **Respeto a preferencias:** todas las animaciones deben respetar `prefers-reduced-motion`

## Qué revisar

### Transiciones de página (Nuxt Transitions)
- `nuxt.config.ts` debe tener `pageTransition` configurado con fade suave
- Ejemplo correcto:
```ts
pageTransition: { name: 'page', mode: 'out-in' }
```
- CSS en `assets/css/transitions.css`:
```css
.page-enter-active, .page-leave-active { transition: opacity 0.3s ease; }
.page-enter-from, .page-leave-to { opacity: 0; }
```

### Hover en cards y thumbs
- `transition-transform duration-300 ease-in-out` en cards
- `hover:scale-105` para efecto de zoom sutil en thumbnails
- `hover:border-[#0094C6]` en cards con `transition-colors duration-200`
- Overlay de título en thumbs: `opacity-0 group-hover:opacity-100 transition-opacity duration-200`

### Botones
- Todos los botones deben tener `transition` con al menos `duration-200`
- Efecto hover con cambio de color de fondo: `hover:bg-[#00B4F0]`
- Estado active/pressed: `active:scale-95`
- Estado disabled: `opacity-50 cursor-not-allowed`

### Sliders Swiper
- Efecto del hero: `effect: 'fade'` o `effect: 'slide'` con `speed: 600`
- Slider de thumbs: `speed: 400`
- Lazy loading de imágenes del slider activado

### Entrada de secciones (scroll animations)
- Uso de `@vueuse/motion` para animar secciones al entrar en el viewport
- Directiva `v-motion` con preset `visibleOnce` para evitar re-animación
- Ejemplo:
```vue
<section v-motion :initial="{ opacity: 0, y: 40 }" :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }">
```
- No animar más de 3-4 elementos simultáneamente en la misma sección

### Modales y overlays
- Entrada: fade + scale sutil `scale-95 opacity-0` → `scale-100 opacity-100`
- Fondo overlay: `bg-black/60 backdrop-blur-sm` con fade
- Salida más rápida que la entrada (200ms vs 300ms)

### Formularios
- Focus en inputs: `transition-colors duration-200 focus:border-[#0094C6]`
- Mensajes de error: aparecer con `animate-shake` o fade-in suave
- Botón de submit en estado loading: spinner + `opacity-75`

### Toast / Notificaciones
- Entrada desde abajo o desde arriba con slide + fade
- Auto-dismiss con barra de progreso
- Color de éxito: `#0094C6`, error: `#EF4444`, info: `#A3A3A3`

### Header al hacer scroll
- `transition-all duration-300` para el cambio de transparente a sólido
- `backdrop-blur-md` cuando es sólido para efecto glassmorphism sutil

## Accesibilidad en animaciones

Detecta si falta la implementación de `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
O en Tailwind: usar la variante `motion-reduce:transition-none`

## Problemas comunes a detectar
- Animaciones sin `transition` definido (cambio brusco)
- `transition-all` en elementos con muchas propiedades (costoso, usar propiedades específicas)
- Animaciones de `width`/`height` (usar `transform: scaleX/scaleY` en su lugar)
- `transform` y `opacity` son las propiedades más performantes para animar
- Animaciones que bloquean la interacción del usuario

## Reporte

```
## Transiciones de página
❌ nuxt.config.ts — pageTransition no configurado

## Hover en componentes
✅ ThemeCard.vue — hover:scale-105 con transition correctos
⚠️  AppButton.vue — falta active:scale-95

## Scroll animations
❌ pages/index.vue — secciones sin animación de entrada (v-motion)

## prefers-reduced-motion
❌ No implementado en ningún archivo
```
