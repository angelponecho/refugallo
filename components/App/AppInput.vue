<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="inputId" class="text-sm font-medium text-text-muted">
      {{ label }}
      <span v-if="required" class="text-brand ml-0.5" aria-hidden="true">*</span>
    </label>
    <input
      :id="inputId"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :autocomplete="autocomplete"
      :value="modelValue"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${inputId}-error` : undefined"
      class="w-full bg-bg-elevated border rounded-lg px-4 py-3 text-white placeholder-text-muted text-sm transition-colors duration-200 focus:outline-none focus:border-brand disabled:opacity-50 disabled:cursor-not-allowed"
      :class="error ? 'border-red-500' : 'border-border-dark'"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" :id="`${inputId}-error`" class="text-red-400 text-xs" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
  type?: string
  error?: string
  required?: boolean
  disabled?: boolean
  autocomplete?: string
}>(), {
  type: 'text',
  required: false,
  disabled: false,
})

defineEmits<{ 'update:modelValue': [value: string] }>()

const inputId = `input-${Math.random().toString(36).slice(2)}`
</script>
