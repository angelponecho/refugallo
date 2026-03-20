# /responsive — Revisión de Diseño Responsive

Analiza que todos los componentes y páginas funcionan correctamente en los tres breakpoints principales del proyecto.

## Breakpoints de Tailwind (referencia)

| Prefijo | Min-width | Dispositivo |
|---------|-----------|-------------|
| (base)  | 0px       | Mobile (320px–639px) |
| `sm:`   | 640px     | Mobile grande |
| `md:`   | 768px     | Tablet |
| `lg:`   | 1024px    | Desktop pequeño |
| `xl:`   | 1280px    | Desktop estándar |
| `2xl:`  | 1536px    | Desktop grande |

## Qué revisar por componente

### AppHeader.vue
- **Mobile:** menú colapsado en icono hamburguesa, logo visible, botón login/usuario visible
- **Desktop:** menú horizontal centrado, logo izquierda, sesión derecha
- La transición hamburguesa ↔ menú horizontal debe ocurrir en `md:`

### Hero Slider (index.vue)
- **Mobile:** columna de texto ocupa 100% del ancho, imagen de fondo con overlay
- **Tablet:** columna texto 40%, imagen 60%
- **Desktop:** columna texto 1/4 (25%), imagen 3/4 (75%)
- Los botones "Ver" y "Votar" apilados en mobile, lado a lado en desktop

### Slider de thumbs (index.vue)
- Scroll horizontal en todos los breakpoints
- En mobile: thumbs de ~120px de ancho
- En desktop: thumbs de ~180px de ancho

### Galería masonry (/galeria)
- **Mobile:** 1 columna
- **Tablet:** 2 columnas
- **Desktop:** 3 columnas

### Ranking (/ranking)
- **Mobile:** lista en una columna, imagen thumb pequeña
- **Desktop:** layout más espacioso con imagen más grande

### Footer
- **Mobile:** 1 columna (apilado)
- **Tablet:** 2 columnas
- **Desktop:** 4 columnas

### Formularios (registro, contacto)
- **Mobile:** campos a ancho completo
- **Desktop:** puede tener max-width centrado (~480px para login, ~640px para contacto)

### Panel Admin (/admin)
- **Mobile:** sidebar colapsable o menú superior
- **Desktop:** sidebar fijo izquierdo + contenido principal

## Problemas comunes a detectar

- Texto que se desborda del contenedor en mobile (overflow-x)
- Imágenes sin `max-w-full` que rompen el layout
- Grids con columnas fijas que no colapsan en mobile
- Botones demasiado pequeños para touch (mínimo 44x44px — `min-h-[44px] min-w-[44px]`)
- Modales/popups que no se adaptan a pantallas pequeñas
- Texto demasiado pequeño en mobile (mínimo `text-sm` = 14px)
- Espaciados excesivos en mobile que empujan el contenido

## Revisión de clases Tailwind

Busca en los archivos .vue:
- Clases con valores fijos sin variante responsive cuando deberían tenerla
- `w-[valor]` sin breakpoint cuando debería ser `w-full md:w-[valor]`
- `flex-row` sin `flex-col` para mobile
- `grid-cols-3` sin `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- `hidden` y `block` usados correctamente para mostrar/ocultar por breakpoint

## Simulación de viewports con Playwright

Si la app está corriendo en localhost:3000, ejecuta capturas de pantalla:
```bash
# Requiere Playwright MCP activo
# Simula mobile (375px), tablet (768px) y desktop (1280px)
```

## Reporte

Para cada página/componente:
```
[COMPONENTE] AppHeader.vue
✅ Mobile: menú hamburguesa implementado
✅ Desktop: menú horizontal
⚠️  Tablet (768px): menú hamburguesa persiste hasta lg: — revisar breakpoint

[COMPONENTE] pages/index.vue — Hero
❌ Mobile: columna de texto sin flex-col, se desborda
```
