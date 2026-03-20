# /ui-components — Revisión de Librería de Componentes

Audita la coherencia, reutilización y calidad de los componentes UI del proyecto.

## Componentes base esperados

Verifica que existen y están correctamente implementados:

| Componente | Ruta | Descripción |
|---|---|---|
| `AppButton.vue` | `components/AppButton.vue` | Botón reutilizable (primario/secundario/ghost) |
| `AppHeader.vue` | `components/AppHeader.vue` | Navegación global |
| `AppFooter.vue` | `components/AppFooter.vue` | Pie de página |
| `AppSlider.vue` | `components/AppSlider.vue` | Wrapper de Swiper configurable |
| `ThemeCard.vue` | `components/ThemeCard.vue` | Card de theme con imagen, título y likes |
| `AppModal.vue` | `components/AppModal.vue` | Modal/popup reutilizable |
| `AppToast.vue` | `components/AppToast.vue` | Notificación toast |
| `AppInput.vue` | `components/AppInput.vue` | Input de formulario con label y error |
| `DataTable.vue` | `components/admin/DataTable.vue` | Tabla paginada para el admin |
| `ModalForm.vue` | `components/admin/ModalForm.vue` | Formulario modal para CRUD |

## AppButton.vue — Especificación

Debe aceptar las siguientes props:
```ts
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()
```

Estilos por variante:
- `primary`: `bg-[#0094C6] text-white hover:bg-[#00B4F0]`
- `secondary`: `bg-transparent border border-white text-white hover:bg-white hover:text-black`
- `ghost`: `bg-transparent text-[#A3A3A3] hover:text-white`
- `danger`: `bg-red-600 text-white hover:bg-red-500`

Estado loading: spinner SVG animado + texto deshabilitado.

## AppInput.vue — Especificación

```ts
defineProps<{
  label?: string
  placeholder?: string
  type?: string
  error?: string
  required?: boolean
  modelValue: string
}>()
```

Estilos: `bg-[#1E1E1E] border border-[#2A2A2A] text-white rounded-lg focus:border-[#0094C6] transition-colors`

## ThemeCard.vue — Especificación

```ts
defineProps<{
  theme: {
    id: number
    title: string
    subtitle: string
    thumbImg: string
    likes: number
  }
  showVoteButton?: boolean
  rank?: number
}>()
```

Emite: `@vote`, `@click`

## AppModal.vue — Especificación

- Props: `modelValue: boolean` (v-model), `title?: string`, `size?: 'sm'|'md'|'lg'`
- Cierra con Escape y clic fuera
- Usa `<Teleport to="body">` para evitar problemas de z-index
- Fondo: `bg-black/60 backdrop-blur-sm`
- Atrapa el foco dentro mientras está abierto (focus trap)

## Qué revisar en cada componente

### Reutilización
- ¿Hay código de botón duplicado en múltiples archivos en lugar de usar `<AppButton>`?
- ¿Hay inputs con estilos repetidos en lugar de usar `<AppInput>`?
- ¿Las cards de themes están implementadas inline en varias páginas?

### Props y tipos
- ¿Todas las props tienen tipos TypeScript definidos con `defineProps<{}>()`?
- ¿Los valores por defecto están definidos con `withDefaults()`?
- ¿Los eventos emitidos usan `defineEmits<{}>()`?

### Slots
- ¿Los componentes que envuelven contenido variable usan `<slot>`?
- ¿`AppModal` tiene slot para header, body y footer?
- ¿`AppButton` tiene slot para icono?

### Accesibilidad del componente
- `AppButton`: `disabled` refleja en el atributo HTML, no solo en estilos
- `AppInput`: `id` y `for` de label vinculados, `aria-invalid` en error
- `AppModal`: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- `ThemeCard`: imagen con alt, botones con aria-label

### Estados visuales
- ¿Todos los componentes interactivos tienen estado hover, focus y active?
- ¿El estado disabled está visualmente diferenciado?
- ¿El estado loading bloquea la interacción?

## Reporte

```
## Componentes faltantes
❌ AppModal.vue — no existe, popups implementados inline
❌ AppInput.vue — no existe, inputs con estilos repetidos en 3 formularios

## Componentes existentes con problemas
⚠️  AppButton.vue — falta prop 'loading' y estado de spinner
❌  ThemeCard.vue — props sin tipos TypeScript

## Duplicación detectada
⚠️  pages/registro.vue:45 y pages/contacto.vue:23 — mismo estilo de input duplicado
```

Al final: lista de componentes a crear/mejorar ordenados por frecuencia de uso.
