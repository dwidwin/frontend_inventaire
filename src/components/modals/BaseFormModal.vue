<template>
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4" 
    @click.self="handleClose"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 :id="titleId" class="text-lg font-medium text-gray-900">
            <slot name="title">{{ title }}</slot>
          </h3>
          <button
            @click="handleClose"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
            type="button"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Contenu du formulaire -->
      <div class="px-4 sm:px-6 py-4 overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-200px)]">
        <slot name="content">
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <slot name="form"></slot>
          </form>
        </slot>
      </div>

      <!-- Footer avec boutons -->
      <div class="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div class="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <slot name="footer">
            <button
              @click="handleClose"
              type="button"
              class="btn btn-secondary w-full sm:w-auto order-2 sm:order-1"
            >
              Annuler
            </button>
            
            <button
              @click="handleSubmit"
              type="button"
              :disabled="isSubmitting || !canSubmit"
              class="btn btn-primary w-full sm:w-auto order-1 sm:order-2"
            >
              <span v-if="isSubmitting" class="flex items-center justify-center space-x-2">
                <div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>{{ submittingText }}</span>
              </span>
              <span v-else>{{ submitText }}</span>
            </button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

interface Props {
  title?: string
  submitText?: string
  submittingText?: string
  canSubmit?: boolean
  isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Formulaire',
  submitText: 'Enregistrer',
  submittingText: 'Enregistrement...',
  canSubmit: true,
  isSubmitting: false,
})

const emit = defineEmits<{
  close: []
  submit: []
}>()

const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`

// Gestion du focus et de la navigation clavier
let previousActiveElement: HTMLElement | null = null

onMounted(() => {
  // Sauvegarder l'élément actif
  previousActiveElement = document.activeElement as HTMLElement
  
  // Focus sur le premier élément focusable du modal
  const firstFocusable = document.querySelector<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  firstFocusable?.focus()
  
  // Empêcher le scroll du body
  document.body.style.overflow = 'hidden'
  
  // Gérer la touche Escape
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose()
    }
  }
  document.addEventListener('keydown', handleEscape)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})

onUnmounted(() => {
  // Restaurer le scroll
  document.body.style.overflow = ''
  
  // Restaurer le focus
  previousActiveElement?.focus()
})

const handleClose = () => {
  emit('close')
}

const handleSubmit = () => {
  if (props.canSubmit && !props.isSubmitting) {
    emit('submit')
  }
}
</script>
