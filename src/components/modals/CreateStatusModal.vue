<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[95vh] overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">
            Créer un nouveau statut
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
          <!-- Clé -->
          <div class="mb-4">
            <label for="key" class="form-label">
              Clé <span class="text-red-500">*</span>
            </label>
            <input
              id="key"
              v-model="form.key"
              type="text"
              required
              class="form-input"
              placeholder="ex: a_vendre"
              :class="{ 'border-red-500': errors.key }"
            />
            <p v-if="errors.key" class="mt-1 text-sm text-red-600">{{ errors.key }}</p>
            <p class="mt-1 text-xs text-gray-500">
              Clé unique pour identifier le statut (ex: a_vendre, vendu, stock_jeune)
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
              placeholder="ex: À vendre"
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
              placeholder="0"
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
              <span v-if="isSubmitting">Création...</span>
              <span v-else>Créer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useCreateStatus } from '@/composables/useStatuses'
import type { CreateStatusDto } from '@/types'
import { StatusGroup } from '@/types'

const emit = defineEmits<{
  close: []
  created: []
}>()

const createStatusMutation = useCreateStatus()

const form = ref<CreateStatusDto>({
  key: '',
  label: '',
  group: StatusGroup.COMMERCIAL,
  color: '#9CA3AF',
  sortOrder: 0,
  isActive: true,
})

const errors = ref<Record<string, string>>({})
const error = ref('')
const isSubmitting = ref(false)

const handleClose = () => {
  emit('close')
}

const handleSubmit = async () => {
  errors.value = {}
  error.value = ''
  
  // Validation
  if (!form.value.key || !form.value.key.trim()) {
    errors.value.key = 'La clé est requise'
    return
  }
  
  if (!form.value.label || !form.value.label.trim()) {
    errors.value.label = 'Le libellé est requis'
    return
  }
  
  if (!form.value.group) {
    errors.value.group = 'Le groupe est requis'
    return
  }

  // Normaliser la clé (minuscules, underscores)
  form.value.key = form.value.key.trim().toLowerCase().replace(/\s+/g, '_')

  isSubmitting.value = true

  try {
    await createStatusMutation.mutateAsync(form.value)
    emit('created')
    handleClose()
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || 'Une erreur est survenue lors de la création'
  } finally {
    isSubmitting.value = false
  }
}
</script>

