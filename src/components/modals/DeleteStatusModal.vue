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
          Êtes-vous sûr de vouloir supprimer ce statut ?
        </p>
        
        <div v-if="status" class="p-3 bg-gray-50 border border-gray-200 rounded-lg mb-4">
          <div class="flex items-center space-x-3">
            <div
              class="h-10 w-10 rounded-full border border-gray-300 flex-shrink-0"
              :style="{ backgroundColor: status.color || '#9CA3AF' }"
            />
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-900">{{ status.label }}</div>
              <div class="text-xs text-gray-500">
                Clé: {{ status.key }} • Groupe: {{ getGroupLabel(status.group) }}
              </div>
            </div>
          </div>
        </div>
        
        <p class="text-sm text-red-600 font-medium">
          Cette action est irréversible. Le statut sera supprimé définitivement.
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
import { ref } from 'vue'
import { useDeleteStatus } from '@/composables/useStatuses'
import { useToast } from '@/composables/useToast'
import type { Status, StatusGroup } from '@/types'
import { StatusGroup as StatusGroupEnum } from '@/types'

const props = defineProps<{
  status: Status
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirmed'): void
}>()

const deleteStatusMutation = useDeleteStatus()
const toast = useToast()
const isDeleting = ref(false)

const getGroupLabel = (group: StatusGroup): string => {
  const labels: Record<StatusGroup, string> = {
    [StatusGroupEnum.COMMERCIAL]: 'Commercial',
    [StatusGroupEnum.AUDIENCE]: 'Audience',
    [StatusGroupEnum.CONDITION]: 'Condition',
    [StatusGroupEnum.LIFECYCLE]: 'Cycle de vie',
  }
  return labels[group] || group
}

const handleConfirm = async () => {
  if (!props.status?.id) {
    toast.error('Erreur: ID du statut manquant')
    emit('close')
    return
  }

  isDeleting.value = true
  
  try {
    await deleteStatusMutation.mutateAsync(props.status.id)
    toast.success('Statut supprimé avec succès')
    emit('confirmed')
    emit('close')
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Erreur lors de la suppression du statut'
    toast.error(errorMessage)
    // Si le statut n'existe pas, on ferme quand même le modal
    if (error?.response?.status === 404) {
      emit('confirmed') // On confirme pour rafraîchir la liste
      emit('close')
    }
  } finally {
    isDeleting.value = false
  }
}
</script>

