# /design — Revisión de Diseño Visual

Auditoría completa de consistencia visual: paleta de colores, tipografía, espaciados y jerarquía visual en todos los componentes y páginas.

## Contexto del proyecto

- **Estética:** Oscura, premium, cinematográfica (inspiración Netflix)
- **Color principal:** `#0094C6` (azul eléctrico)
- **Fondos:** `#0A0A0A` (principal), `#141414` (secundario), `#1E1E1E` (cards)
- **Textos:** `#FFFFFF` (principal), `#A3A3A3` (secundario)
- **Tipografía:** `Bebas Neue` para titulares, `Inter` para cuerpo
- **Bordes:** `#2A2A2A`

## Qué revisar

### 1. Consistencia de colores
- Todos los colores deben venir de las clases Tailwind configuradas, **no valores inline** (`style="color: #fff"` → `text-white`)
- Detecta usos de colores fuera de la paleta definida
- Verifica que los fondos alternan correctamente entre `bg-[#0A0A0A]` y `bg-[#141414]` entre secciones
- Los botones primarios siempre usan `bg-[#0094C6]` y secundarios `border-white bg-transparent`

### 2. Tipografía
- Titulares hero y secciones destacadas: `font-['Bebas_Neue']` o la clase configurada
- Cuerpo de texto: `font-['Inter']`
- Jerarquía de tamaños coherente:
  - Hero title: `text-5xl` o `text-6xl`
  - Section title: `text-3xl` o `text-4xl`
  - Card title: `text-xl` o `text-2xl`
  - Body: `text-base` o `text-lg`
  - Meta/label: `text-sm`
- Pesos: titulares `font-bold`, subtítulos `font-medium`, cuerpo `font-normal`

### 3. Espaciados y ritmo vertical
- Secciones con padding vertical consistente: `py-16` o `py-24` para bloques principales
- Cards con padding interno consistente: `p-4` o `p-6`
- Gaps entre elementos de grid/flex coherentes: `gap-4`, `gap-6`, `gap-8`
- Márgenes entre texto y botones: `mt-6` o `mt-8`

### 4. Componentes reutilizables
- Verifica que los botones usan el componente `<AppButton>` en lugar de `<button>` con clases repetidas
- Los sliders usan `<AppSlider>` en lugar de inicializar Swiper directamente
- Las cards de themes usan `<ThemeCard>` en lugar de markup duplicado

### 5. Jerarquía visual (Z-axis y contraste)
- Los elementos más importantes tienen mayor contraste y tamaño
- Los CTAs (Call to Action) destacan visualmente sobre el contenido circundante
- El overlay del hero tiene gradiente correcto: `from-black/85 to-transparent`
- Las imágenes de fondo tienen suficiente oscurecimiento para que el texto sea legible

### 6. Bordes y radios
- `rounded-lg` en cards, botones e inputs (consistente)
- `rounded-full` solo para avatares o badges circulares
- Bordes sutiles `border border-[#2A2A2A]` en cards sobre fondo oscuro

### 7. Iconos
- Tamaños consistentes: `w-5 h-5` para iconos inline, `w-6 h-6` para botones, `w-8 h-8` para features
- Color coherente con el texto circundante

## Formato del reporte

```
## Colores
✅ AppHeader.vue — colores desde clases Tailwind
❌ pages/ranking.vue:34 — style="color: #fff" → usar text-white
⚠️  components/ThemeCard.vue:12 — fondo #1F1F1F en lugar de #1E1E1E

## Tipografía
✅ Titulares usando Bebas Neue
❌ pages/galeria.vue:8 — título de sección en Inter en lugar de Bebas Neue

## Espaciados
⚠️  components/AppFooter.vue — padding inferior py-8, resto de secciones usan py-16
```

Al final: **puntuación de consistencia visual** (0-100) y top 5 correcciones prioritarias.
