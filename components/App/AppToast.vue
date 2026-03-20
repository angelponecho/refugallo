<template>
  <Teleport to="body">
    <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-sm font-medium min-w-[280px] max-w-sm border"
          :class="toastClasses(toast.type)"
          role="alert"
          aria-live="polite"
        >
          <component :is="toastIcon(toast.type)" class="w-5 h-5 shrink-0" aria-hidden="true" />
          <span>{{ toast.message }}</span>
          <button
            class="ml-auto opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Cerrar notificación"
            @click="toastStore.remove(toast.id)"
          >
            <XIcon class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { CheckCircleIcon, AlertCircleIcon, InfoIcon, AlertTriangleIcon, XIcon } from 'lucide-vue-next'
import type { ToastType } from '~/types'

const toastStore = useToastStore()

function toastClasses(type: ToastType) {
  return {
    success: 'bg-bg-elevated border-green-500/40 text-white',
    error: 'bg-bg-elevated border-red-500/40 text-white',
    info: 'bg-bg-elevated border-brand/40 text-white',
    warning: 'bg-bg-elevated border-yellow-500/40 text-white',
  }[type]
}

function toastIcon(type: ToastType) {
  return {
    success: CheckCircleIcon,
    error: AlertCircleIcon,
    info: InfoIcon,
    warning: AlertTriangleIcon,
  }[type]
}
</script>

<style scoped>
.toast-enter-active { transition: all 0.3s ease; }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from { opacity: 0; transform: translateY(12px); }
.toast-leave-to { opacity: 0; transform: translateX(100%); }
</style>
