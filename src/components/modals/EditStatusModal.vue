<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[95vh] overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">
            Modifier le statut
          </h3>
          <button
            @click="handleClose"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Contenu -->
      <div class="px-6 py-4 overflow-y-auto max-h-[calc(95vh-180px)]">
        <form @submit.prevent="handleSubmit">
          <!-- Clé (lecture seule) -->
          <div class="mb-4">
            <label for="key" class="form-label">
              Clé
            </label>
            <input
              id="key"
              :value="status?.key"
              type="text"
              disabled
              class="form-input bg-gray-100"
            />
            <p class="mt-1 text-xs text-gray-500">
              La clé ne peut pas être modifiée
            </p>
          </div>

          <!-- Label -->
          <div class="mb-4">
            <label for="label" class="form-label">
              Libellé <span class="text-red-500">*</span>
            </label>
            <input
              id="label"
              v-model="form.label"
              type="text"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.label }"
            />
            <p v-if="errors.label" class="mt-1 text-sm text-red-600">{{ errors.label }}</p>
          </div>

          <!-- Groupe -->
          <div class="mb-4">
            <label for="group" class="form-label">
              Groupe <span class="text-red-500">*</span>
            </label>
            <select
              id="group"
              v-model="form.group"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.group }"
            >
              <option value="">Sélectionner un groupe</option>
              <option :value="StatusGroup.COMMERCIAL">Commercial</option>
              <option :value="StatusGroup.AUDIENCE">Audience</option>
              <option :value="StatusGroup.CONDITION">Condition</option>
              <option :value="StatusGroup.LIFECYCLE">Cycle de vie</option>
            </select>
            <p v-if="errors.group" class="mt-1 text-sm text-red-600">{{ errors.group }}</p>
          </div>

          <!-- Couleur -->
          <div class="mb-4">
            <label for="color" class="form-label">
              Couleur (optionnel)
            </label>
            <div class="flex items-center space-x-3">
              <input
                id="color"
                v-model="form.color"
                type="color"
                class="h-10 w-20 rounded border border-gray-300 cursor-pointer"
              />
              <input
                v-model="form.color"
                type="text"
                class="form-input flex-1"
                placeholder="#FF9800"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
            <p class="mt-1 text-xs text-gray-500">
              Couleur hexadécimale pour le badge (ex: #FF9800)
            </p>
          </div>

          <!-- Ordre de tri -->
          <div class="mb-4">
            <label for="sortOrder" class="form-label">
              Ordre de tri
            </label>
            <input
              id="sortOrder"
              v-model.number="form.sortOrder"
              type="number"
              min="0"
              class="form-input"
            />
            <p class="mt-1 text-xs text-gray-500">
              Ordre d'affichage (plus petit = affiché en premier)
            </p>
          </div>

          <!-- Statut actif -->
          <div class="mb-6">
            <label class="flex items-center">
              <input
                v-model="form.isActive"
                type="checkbox"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="ml-2 text-sm text-gray-900">Statut actif</span>
            </label>
            <p class="mt-1 text-xs text-gray-500">
              Les statuts inactifs ne seront pas disponibles dans les sélections
            </p>
          </div>

          <!-- Erreurs -->
          <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              @click="handleClose"
              class="btn btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="btn btn-primary"
            >
              <span v-if="isSubmitting">Enregistrement...</span>
              <span v-else>Enregistrer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useUpdateStatus } from '@/composables/useStatuses'
import type { Status, UpdateStatusDto } from '@/types'
import { StatusGroup } from '@/types'

interface Props {
  status: Status
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  updated: []
}>()

const updateStatusMutation = useUpdateStatus()

const form = ref<UpdateStatusDto>({
  label: props.status.label,
  group: props.status.group,
  color: props.status.color || '#9CA3AF',
  sortOrder: props.status.sortOrder,
  isActive: props.status.isActive,
})

const errors = ref<Record<string, string>>({})
const error = ref('')
const isSubmitting = ref(false)

// Mettre à jour le formulaire si le statut change
watch(() => props.status, (newStatus) => {
  if (newStatus) {
    form.value = {
      label: newStatus.label,
      group: newStatus.group,
      color: newStatus.color || '#9CA3AF',
      sortOrder: newStatus.sortOrder,
      isActive: newStatus.isActive,
    }
  }
}, { immediate: true })

const handleClose = () => {
  emit('close')
}

const handleSubmit = async () => {
  errors.value = {}
  error.value = ''
  
  // Validation
  if (!form.value.label || !form.value.label.trim()) {
    errors.value.label = 'Le libellé est requis'
    return
  }
  
  if (!form.value.group) {
    errors.value.group = 'Le groupe est requis'
    return
  }

  isSubmitting.value = true

  try {
    await updateStatusMutation.mutateAsync({
      id: props.status.id,
      data: form.value,
    })
    emit('updated')
    handleClose()
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || 'Une erreur est survenue lors de la modification'
  } finally {
    isSubmitting.value = false
  }
}
</script>

