# /seo — Auditoría SEO

Verifica que todas las páginas del proyecto siguen las mejores prácticas de SEO para Nuxt.js 3.

## Pasos a seguir

Analiza todos los archivos en `pages/` y comprueba lo siguiente:

### Meta tags básicos (por página)

Cada página debe tener `useHead()` o `useSeoMeta()` con:
- `title` — único y descriptivo (50-60 caracteres)
- `meta description` — entre 120-160 caracteres, con llamada a la acción
- `canonical` URL para evitar contenido duplicado

Ejemplo correcto para este proyecto:
```ts
useSeoMeta({
  title: 'Refugallo — Vota por tu theme favorito',
  description: 'Descubre y vota por los mejores themes. Únete a la comunidad y haz que tu favorito llegue al #1.',
  ogTitle: 'Refugallo — Vota por tu theme favorito',
  ogDescription: 'Descubre y vota por los mejores themes.',
  ogImage: '/og-image.jpg',
  ogType: 'website',
  twitterCard: 'summary_large_image'
})
```

### Open Graph y Twitter Cards
- `og:title`, `og:description`, `og:image` (mínimo 1200x630px), `og:url`
- `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- Imágenes OG deben estar en `/public/` y ser accesibles públicamente

### Datos estructurados (JSON-LD)
- La página principal debe incluir `WebSite` schema con `SearchAction`
- Las páginas de themes deben incluir `Article` o `CreativeWork` schema
- El ranking puede incluir `ItemList` schema

### Robots y sitemap
- Verifica que existe o está configurado `robots.txt` (via `@nuxtjs/robots`)
- Verifica que existe o está configurado `sitemap.xml` (via `@nuxtjs/sitemap`)
- Las páginas `/admin/*`, `/registro` deben tener `noindex`

### Estructura de headings (por página)
- Una sola `<h1>` por página con la keyword principal
- Jerarquía lógica h1 → h2 → h3
- No usar headings solo por su tamaño visual (usar clases CSS en su lugar)

### URLs y navegación
- URLs en español y amigables (ya definidas en el router de Nuxt)
- Breadcrumbs en páginas interiores con `aria-label="breadcrumb"`
- Links internos con texto descriptivo

### Rendimiento como factor SEO
- Core Web Vitals aprobados (ver `/perf`)
- Imágenes con atributos `width` y `height`
- Fuentes sin bloqueo de renderizado

## Reporte

Para cada página muestra el estado de cada check:
```
✅ / ❌ / ⚠️  [página] — [check] — [detalle]
```

Al final: lista de acciones prioritarias ordenadas por impacto SEO.
