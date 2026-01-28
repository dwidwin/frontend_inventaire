<template>
  <div
    aria-live="polite"
    aria-atomic="true"
    class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full sm:w-auto"
  >
    <TransitionGroup
      name="toast"
      tag="div"
      class="flex flex-col gap-2"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'rounded-lg shadow-lg p-4 flex items-start gap-3 min-w-[300px] max-w-md',
          toastClasses[toast.type]
        ]"
        role="alert"
      >
        <!-- Icône -->
        <div class="flex-shrink-0">
          <component :is="iconComponent(toast.type)" class="h-5 w-5" />
        </div>

        <!-- Message -->
        <div class="flex-1 text-sm font-medium">
          {{ toast.message }}
        </div>

        <!-- Bouton fermer -->
        <button
          @click="removeToast(toast.id)"
          class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fermer la notification"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { useToast, type ToastType } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

const toastClasses = {
  success: 'bg-success-50 text-success-800 border border-success-200',
  error: 'bg-danger-50 text-danger-800 border border-danger-200',
  warning: 'bg-warning-50 text-warning-800 border border-warning-200',
  info: 'bg-primary-50 text-primary-800 border border-primary-200',
}

const iconComponent = (type: ToastType) => {
  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
  }
  return icons[type]
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
