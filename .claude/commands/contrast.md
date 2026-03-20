# /contrast — Verificación de Contraste de Colores

Verifica que todas las combinaciones de color texto/fondo del proyecto cumplen los ratios mínimos de contraste WCAG 2.1.

## Niveles de conformidad

| Nivel | Texto normal (<18px o no bold) | Texto grande (≥18px o ≥14px bold) |
|-------|-------------------------------|-----------------------------------|
| AA (mínimo) | 4.5:1 | 3:1 |
| AAA (óptimo) | 7:1 | 4.5:1 |

**Objetivo del proyecto: WCAG AA en todo el contenido de texto.**

## Paleta del proyecto y sus ratios

Analiza las siguientes combinaciones usadas en el proyecto:

### Combinaciones principales

| Texto | Fondo | Ratio | Estado |
|-------|-------|-------|--------|
| `#FFFFFF` | `#0A0A0A` | 19.6:1 | ✅ AAA |
| `#FFFFFF` | `#141414` | 16.1:1 | ✅ AAA |
| `#FFFFFF` | `#1E1E1E` | 13.5:1 | ✅ AAA |
| `#A3A3A3` | `#0A0A0A` | 7.2:1 | ✅ AAA |
| `#A3A3A3` | `#141414` | 5.9:1 | ✅ AA |
| `#A3A3A3` | `#1E1E1E` | 4.9:1 | ✅ AA |
| `#FFFFFF` | `#0094C6` | 2.8:1 | ⚠️ Solo texto grande (≥18px o bold ≥14px) |
| `#0A0A0A` | `#0094C6` | 7.5:1 | ✅ AAA |

### Combinación crítica: texto blanco sobre azul `#0094C6`
- **Ratio: 2.8:1** — NO cumple AA para texto normal
- Solo es aceptable para:
  - Texto ≥ 18px (aprox. `text-lg` o mayor)
  - Texto bold ≥ 14px (aprox. `text-sm font-bold` o mayor)
  - Iconos o elementos decorativos
- **En botones primarios** (`bg-[#0094C6] text-white`): el texto debe ser `font-semibold` o `font-bold` y al menos `text-sm` para cumplir AA

## Qué revisar en el código

Busca en todos los archivos `.vue` estas combinaciones problemáticas:

### Texto sobre color principal
```
bg-[#0094C6] con text-white → verificar tamaño y peso del texto
bg-blue → verificar qué azul exacto se está usando
```

### Overlays y textos sobre imágenes
- Texto sobre `heroImg` con overlay: verificar que el overlay `bg-black/60` o superior garantiza contraste
- Gradiente del hero: `from-black/85` garantiza ratio suficiente en la zona de texto
- Texto sobre thumbnails en hover: el overlay debe ser suficientemente oscuro

### Placeholders en formularios
- Placeholder color en inputs: `placeholder-[#A3A3A3]` sobre `bg-[#1E1E1E]` → ratio 4.9:1 ✅
- Si se usa un gris más claro para placeholders, verificar ratio

### Textos secundarios y labels
- `text-[#A3A3A3]` en contextos donde el fondo puede no ser `#0A0A0A` o `#1E1E1E`
- Texto sobre imágenes sin overlay

## Cómo calcular ratios manualmente

Fórmula WCAG: `(L1 + 0.05) / (L2 + 0.05)` donde L es la luminancia relativa.

Para verificar rápidamente: https://webaim.org/resources/contrastchecker/

## Correcciones recomendadas

Si encuentras texto blanco sobre `#0094C6` en tamaño normal:
1. Aumentar el tamaño de fuente a `text-base` mínimo con `font-semibold`
2. O cambiar el color de texto a `#0A0A0A` (ratio 7.5:1 ✅)
3. O usar un azul más oscuro para el fondo: `#0077A3` da ratio 3.5:1 con blanco

## Reporte

```
## Combinaciones revisadas

✅ AppHeader — text-white bg-[#0A0A0A] — ratio 19.6:1 (AAA)
⚠️  AppButton primary — text-white bg-[#0094C6] texto en text-sm sin font-bold — ratio 2.8:1 (solo cumple con bold)
✅ ThemeCard — text-[#A3A3A3] bg-[#1E1E1E] — ratio 4.9:1 (AA)
❌  components/Badge.vue — text-[#A3A3A3] bg-[#2A2A2A] — ratio 3.1:1 (insuficiente para texto normal)

## Resumen
Total combinaciones revisadas: X
✅ Cumplen AAA: X
✅ Cumplen AA: X
⚠️  Cumplen solo con restricciones: X
❌ No cumplen: X
```
