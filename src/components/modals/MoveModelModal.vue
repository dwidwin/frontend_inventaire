<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">
            Déplacer le modèle
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
      <div class="px-6 py-4 overflow-y-auto max-h-[calc(95vh-200px)]">
        <form @submit.prevent="handleSubmit">
          <!-- Sélection de l'emplacement -->
          <div class="mb-6">
            <label for="locationId" class="form-label">
              Nouvel emplacement
            </label>
            <div v-if="isLoadingLocations" class="text-sm text-gray-500">
              Chargement des emplacements...
            </div>
            <select
              v-else
              id="locationId"
              v-model="form.locationId"
              class="form-input"
            >
              <option :value="null">Aucun emplacement</option>
              <option
                v-for="location in locationsWithIndent"
                :key="location.location.id"
                :value="location.location.id"
              >
                {{ location.displayText }}
              </option>
            </select>
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
              <span v-if="isSubmitting">Déplacement...</span>
              <span v-else>Déplacer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useLocations } from '@/composables/useLocations'
import { useMoveModel } from '@/composables/useMaterialModels'
import { getLocationsWithIndent } from '@/utils/locationUtils'
import type { MaterialModel } from '@/types'

interface Props {
  model: MaterialModel
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  moved: []
}>()

// Queries
const { data: locations, isLoading: isLoadingLocations } = useLocations()

// Emplacements avec indentation hiérarchique
const locationsWithIndent = computed(() => getLocationsWithIndent(locations.value))

const moveModelMutation = useMoveModel()

// Emplacement actuel : priorité à locationId, sinon dérivé de location (objet) — comme EditModelModal
const currentLocationId = () =>
  props.model.locationId ?? props.model.location?.id ?? null

// État local
const form = ref({
  locationId: currentLocationId(),
})
const error = ref('')
const isSubmitting = ref(false)

const handleClose = () => {
  emit('close')
}

const handleSubmit = async () => {
  error.value = ''
  isSubmitting.value = true

  try {
    await moveModelMutation.mutateAsync({
      id: props.model.id,
      data: {
        locationId: form.value.locationId || null,
      },
    })

    emit('moved')
    handleClose()
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || 'Une erreur est survenue'
  } finally {
    isSubmitting.value = false
  }
}
</script>
