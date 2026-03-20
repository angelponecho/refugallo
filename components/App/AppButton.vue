<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-label="ariaLabel"
    :class="[baseClasses, variantClasses, sizeClasses, { 'opacity-50 cursor-not-allowed': disabled || loading }]"
    v-bind="$attrs"
  >
    <span v-if="loading" class="inline-flex items-center gap-2">
      <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      <slot />
    </span>
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  ariaLabel?: string
}>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
})

const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand'

const variantClasses = computed(() => ({
  primary: 'bg-brand text-white hover:bg-brand-hover',
  secondary: 'bg-transparent border border-white text-white hover:bg-white hover:text-bg-primary',
  ghost: 'bg-transparent text-text-muted hover:text-white hover:bg-bg-elevated',
  danger: 'bg-red-600 text-white hover:bg-red-500',
}[props.variant]))

const sizeClasses = computed(() => ({
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}[props.size]))
</script>
