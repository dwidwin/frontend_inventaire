import { ref } from 'vue'
import { config } from '@/config'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

const toasts = ref<Toast[]>([])

let toastIdCounter = 0

const generateId = (): string => {
  return `toast-${Date.now()}-${toastIdCounter++}`
}

export const useToast = () => {
  const addToast = (
    message: string,
    type: ToastType = 'info',
    duration?: number
  ): string => {
    const defaultDuration = type === 'error' 
      ? config.toast.errorDuration 
      : config.toast.defaultDuration
    const finalDuration = duration ?? defaultDuration
    const id = generateId()
    const toast: Toast = {
      id,
      type,
      message,
      duration,
    }

    toasts.value.push(toast)

    // Auto-remove après la durée spécifiée
    if (finalDuration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, finalDuration)
    }

    return id
  }

  const removeToast = (id: string): void => {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message: string, duration?: number): string => {
    return addToast(message, 'success', duration)
  }

  const error = (message: string, duration?: number): string => {
    return addToast(message, 'error', duration || 7000) // Erreurs restent plus longtemps
  }

  const warning = (message: string, duration?: number): string => {
    return addToast(message, 'warning', duration)
  }

  const info = (message: string, duration?: number): string => {
    return addToast(message, 'info', duration)
  }

  const clear = (): void => {
    toasts.value = []
  }

  return {
    toasts,
    success,
    error,
    warning,
    info,
    removeToast,
    clear,
  }
}
