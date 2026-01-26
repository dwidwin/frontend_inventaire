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
          Êtes-vous sûr de vouloir supprimer {{ entityType === 'model' ? 'ce modèle' : 'cet élément' }} ?
        </p>
        
        <div v-if="entity" class="p-3 bg-gray-50 border border-gray-200 rounded-lg mb-4">
          <div class="flex items-center space-x-3">
            <img
              v-if="entity.mainImageUrl || entity.photoUrl"
              :src="entity.photoUrl || entity.mainImageUrl"
              :alt="entity.name"
              class="h-12 w-12 rounded-lg object-contain"
            />
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-900">{{ entity.name }}</div>
              <div class="text-xs text-gray-500">
                <span v-if="entity.codeBarre">Code-barres: {{ entity.codeBarre }}</span>
                <span v-if="entity.location"> • {{ entity.location.name }}</span>
              </div>
            </div>
          </div>
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
import { useDeleteMaterialModel } from '@/composables/useMaterialModels'
import type { MaterialModel } from '@/types'

const props = defineProps<{
  model?: MaterialModel
  item?: any // Pour compatibilité avec l'ancien code
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirmed'): void
}>()

const entity = computed(() => props.model || props.item)
const entityType = computed(() => props.model ? 'model' : 'item')

const deleteModelMutation = useDeleteMaterialModel()
const isDeleting = ref(false)

const handleConfirm = async () => {
  if (!entity.value) return
  
  isDeleting.value = true
  
  try {
    if (entityType.value === 'model') {
      await deleteModelMutation.mutateAsync(entity.value.id)
    } else {
      // Fallback pour compatibilité
      console.warn('Suppression d\'item non supportée')
    }
    emit('confirmed')
    emit('close')
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    alert('Erreur lors de la suppression. Veuillez réessayer.')
  } finally {
    isDeleting.value = false
  }
}
</script>
