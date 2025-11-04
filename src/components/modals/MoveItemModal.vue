<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">
            Déplacer l'item
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
          <!-- Emplacement actuel -->
          <div v-if="item?.location" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 class="text-sm font-medium text-blue-900 mb-2">Emplacement actuel</h4>
            <div class="text-sm text-blue-800">
              {{ getLocationPath(item.location, locations) }}
            </div>
          </div>
          <div v-else class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Emplacement actuel</h4>
            <div class="text-sm text-gray-600">
              Aucun emplacement défini
            </div>
          </div>

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
              <option :value="''">Aucun emplacement (retirer)</option>
              <option
                v-for="location in locationsWithIndent"
                :key="location.location.id"
                :value="location.location.id"
              >
                {{ location.displayText }}
              </option>
            </select>
            <p class="mt-2 text-sm text-gray-500">
              Sélectionnez un emplacement ou choisissez "Aucun emplacement" pour retirer l'item de son emplacement actuel.
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
import { ref, computed, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useLocations } from '@/composables/useLocations'
import { useMoveItem } from '@/composables/useItems'
import { useItem } from '@/composables/useItems'
import { getLocationsWithIndent, getLocationHierarchyPath } from '@/utils/locationUtils'
import type { Location } from '@/types'

interface Props {
  itemId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  updated: []
}>()

// Queries
const { data: locations, isLoading: isLoadingLocations } = useLocations()
const { data: item } = useItem(props.itemId)
const moveItemMutation = useMoveItem()

// État local
const form = ref({
  locationId: '',
})
const error = ref('')
const isSubmitting = ref(false)

// Initialiser avec l'emplacement actuel de l'item
watch(item, (newItem) => {
  if (newItem?.location?.id && form.value.locationId === '') {
    form.value.locationId = newItem.location.id
  }
}, { immediate: true })

// Locations avec indentation pour le select
const locationsWithIndent = computed(() => {
  return getLocationsWithIndent(locations.value)
})

// Fonction pour obtenir le chemin complet d'une location
const getLocationPath = (location: Location, allLocations: Location[] | undefined): string => {
  return getLocationHierarchyPath(location, allLocations)
}

const handleClose = () => {
  emit('close')
}

const handleSubmit = async () => {
  error.value = ''
  isSubmitting.value = true

  try {
    // Construire l'objet data selon la sélection
    const data: { locationId?: string | null } = {}
    
    if (form.value.locationId === '') {
      // Retirer l'emplacement : envoyer null explicitement
      data.locationId = null
    } else if (form.value.locationId) {
      // Définir un nouvel emplacement : envoyer l'UUID
      data.locationId = form.value.locationId
    }
    
    await moveItemMutation.mutateAsync({
      id: props.itemId,
      data,
    })

    emit('updated')
    handleClose()
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || 'Une erreur est survenue'
  } finally {
    isSubmitting.value = false
  }
}
</script>

