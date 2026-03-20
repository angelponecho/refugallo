<template>
  <AppModal :model-value="modelValue" :title="title" size="lg" @update:model-value="$emit('update:modelValue', $event)">
    <form class="flex flex-col gap-5" @submit.prevent="$emit('submit')">
      <slot />
      <div class="flex justify-end gap-3 pt-2 border-t border-border-dark">
        <AppButton
          type="button"
          variant="ghost"
          @click="$emit('update:modelValue', false)"
        >
          Cancelar
        </AppButton>
        <AppButton type="submit" :loading="loading">
          {{ submitLabel }}
        </AppButton>
      </div>
    </form>
  </AppModal>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: boolean
  title: string
  submitLabel?: string
  loading?: boolean
}>(), { submitLabel: 'Guardar', loading: false })

defineEmits<{
  'update:modelValue': [value: boolean]
  submit: []
}>()
</script>
