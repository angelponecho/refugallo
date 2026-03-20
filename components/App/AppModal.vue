<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        @keydown.esc="$emit('update:modelValue', false)"
      >
        <!-- Overlay -->
        <div
          class="absolute inset-0 bg-black/70 backdrop-blur-sm"
          @click="$emit('update:modelValue', false)"
        />
        <!-- Panel -->
        <div
          class="relative bg-bg-secondary border border-border-dark rounded-xl shadow-2xl w-full overflow-y-auto max-h-[90vh]"
          :class="sizeClasses"
        >
          <div v-if="title" class="flex items-center justify-between p-6 border-b border-border-dark">
            <h2 :id="titleId" class="text-lg font-semibold">{{ title }}</h2>
            <button
              class="text-text-muted hover:text-white transition-colors p-1 rounded-lg hover:bg-bg-elevated"
              aria-label="Cerrar modal"
              @click="$emit('update:modelValue', false)"
            >
              <XIcon class="w-5 h-5" />
            </button>
          </div>
          <div class="p-6">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { XIcon } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg'
}>(), { size: 'md' })

defineEmits<{ 'update:modelValue': [value: boolean] }>()

const titleId = `modal-title-${Math.random().toString(36).slice(2)}`

const sizeClasses = computed(() => ({
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-3xl',
}[props.size]))
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
