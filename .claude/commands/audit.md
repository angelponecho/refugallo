# /audit — Auditoría completa Lighthouse

Ejecuta una auditoría completa de rendimiento, accesibilidad, SEO y buenas prácticas sobre la app en local.

## Pasos a seguir

1. Verifica que la app esté corriendo en `http://localhost:3000`. Si no lo está, indícalo al usuario.

2. Instala Lighthouse CLI si no está disponible:
```bash
npx lighthouse --version 2>/dev/null || npm install -g lighthouse
```

3. Ejecuta la auditoría en las páginas principales del proyecto (/, /ranking, /galeria):
```bash
npx lighthouse http://localhost:3000 --output=json --output-path=.claude/audit-report.json --chrome-flags="--headless --no-sandbox" --quiet
```

4. Lee el reporte generado en `.claude/audit-report.json` y muestra un resumen con:
   - Puntuación de **Performance** (objetivo: >90)
   - Puntuación de **Accessibility** (objetivo: >95)
   - Puntuación de **Best Practices** (objetivo: >90)
   - Puntuación de **SEO** (objetivo: >90)
   - Los **3 problemas más críticos** de cada categoría con su impacto estimado

5. Para cada problema crítico, propón la corrección concreta en el código Nuxt.js.

## Métricas clave a revisar

- **LCP** (Largest Contentful Paint): debe ser < 2.5s
- **FID/INP** (Interaction to Next Paint): debe ser < 200ms
- **CLS** (Cumulative Layout Shift): debe ser < 0.1
- **FCP** (First Contentful Paint): debe ser < 1.8s
- **TTFB** (Time to First Byte): debe ser < 800ms
