<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">
          Confirmer la suppression
        </h3>
      </div>

      <!-- Contenu -->
      <div class="px-6 py-4">
        <p class="text-sm text-gray-600 mb-4">
          Êtes-vous sûr de vouloir supprimer l'emplacement <strong>{{ location.name }}</strong> ?
        </p>
        <div v-if="hasChildren" class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
          <p class="text-sm text-yellow-800">
            ⚠️ Cet emplacement contient {{ location.children?.length || 0 }} sous-emplacement(s). 
            La suppression entraînera également la suppression de tous ses sous-emplacements.
          </p>
        </div>
        <p class="text-sm text-red-600 font-medium">
          Cette action est irréversible.
        </p>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
        <button
          @click="$emit('close')"
          type="button"
          class="btn btn-secondary"
        >
          Annuler
        </button>
        <button
          @click="handleConfirm"
          type="button"
          :disabled="isDeleting"
          class="btn btn-danger"
        >
          <span v-if="isDeleting" class="flex items-center justify-center space-x-2">
            <div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span>Suppression...</span>
          </span>
          <span v-else>Supprimer</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDeleteLocation } from '@/composables/useLocations'
import type { Location } from '@/types'

const props = defineProps<{
  location: Location
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirmed'): void
}>()

const deleteLocationMutation = useDeleteLocation()
const isDeleting = ref(false)

const hasChildren = computed(() => {
  return props.location.children && props.location.children.length > 0
})

const handleConfirm = async () => {
  isDeleting.value = true
  
  try {
    await deleteLocationMutation.mutateAsync(props.location.id)
    emit('confirmed')
    emit('close')
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'emplacement:', error)
    alert('Erreur lors de la suppression de l\'emplacement. Veuillez réessayer.')
  } finally {
    isDeleting.value = false
  }
}
</script>


