# /perf — Análisis de Rendimiento y Bundle

Analiza el rendimiento de la app Nuxt.js: bundle size, imports, imágenes y estrategia de carga.

## Pasos a seguir

1. **Analiza el bundle** (si el proyecto ya está construido):
```bash
npx nuxi analyze 2>/dev/null || echo "Ejecutar después de instalar dependencias"
```

2. **Revisa los archivos del proyecto** buscando estos problemas de rendimiento:

### Imports y dependencias
- Busca imports de librerías pesadas sin tree-shaking (`import _ from 'lodash'` → debería ser `import debounce from 'lodash/debounce'`)
- Detecta componentes que importan Swiper completo en vez de módulos individuales
- Identifica `import` en el nivel raíz que deberían ser dinámicos (`defineAsyncComponent` o `import()`)

### Imágenes
- `<img>` sin `loading="lazy"` en imágenes que no están en el hero inicial
- Ausencia de `<NuxtImg>` o `<NuxtPicture>` (optimización automática de Nuxt Image)
- Imágenes sin `width` y `height` definidos (causan CLS)
- Ausencia del módulo `@nuxt/image` en `nuxt.config.ts`

### Fuentes
- Fuentes de Google Fonts cargadas via `<link>` en lugar de `@nuxtjs/google-fonts`
- Ausencia de `font-display: swap` en fuentes custom
- Más de 2-3 variantes de fuente cargadas

### Componentes y páginas
- Componentes grandes que podrían dividirse con `defineAsyncComponent`
- Páginas sin `useLazyFetch` / `useLazyAsyncData` donde el dato no es crítico para el renderizado inicial
- Watchers o intervals sin cleanup en `onUnmounted`
- Ausencia de `definePageMeta({ keepalive: true })` en páginas con mucho estado

### Tailwind CSS
- Verifica que `content` en `tailwind.config.ts` está correctamente configurado para purgar CSS no usado
- Detecta clases dinámicas generadas con template strings que pueden romper el purge

### nuxt.config.ts
- Verifica que `ssr: true` está activo (mejor SEO y rendimiento inicial)
- Comprueba que `experimental.payloadExtraction` está habilitado
- Verifica configuración de caché de assets estáticos

## Reporte final

Muestra:
1. Los 5 cambios de mayor impacto en rendimiento con estimación de mejora
2. Checklist de optimizaciones implementadas vs pendientes
3. Configuración recomendada de `nuxt.config.ts` para este proyecto
