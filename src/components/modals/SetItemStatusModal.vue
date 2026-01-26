<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[95vh] overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">
            Changer le statut du modèle
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
        <!-- Statuts actifs actuels -->
        <div v-if="currentActiveStatusKeys.length > 0" class="mb-6">
          <h4 class="text-sm font-medium text-gray-900 mb-3">Statuts actifs actuels</h4>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="itemStatus in currentActiveStatuses"
              :key="itemStatus.status?.id || itemStatus.statusKey"
              class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium"
              :style="getStatusButtonStyle(itemStatus.status)"
              :class="getStatusButtonClasses(itemStatus.status)"
            >
              {{ itemStatus.status?.label || itemStatus.statusKey }}
            </div>
          </div>
        </div>

        <!-- Sélection des statuts avec badges -->
        <div class="mb-6">
          <label class="form-label mb-3">
            Sélectionner les statuts
          </label>
          <div v-if="isLoadingStatuses" class="text-sm text-gray-500">
            Chargement des statuts...
          </div>
          <div v-else class="flex flex-wrap gap-2">
            <button
              v-for="status in statusesList"
              :key="status.id"
              @click="toggleStatus(status.key)"
              :class="[
                'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                'cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2',
                isStatusSelected(status.key)
                  ? 'ring-2 ring-offset-2 ring-gray-900 shadow-md scale-105'
                  : 'opacity-70 hover:opacity-100',
                getStatusButtonClasses(status)
              ]"
              :style="getStatusButtonStyle(status)"
            >
              {{ status.label }}
            </button>
          </div>
          <div v-if="selectedStatusKeys.length > 0" class="mt-3 flex items-center gap-3">
            <button
              @click="clearSelection"
              class="text-xs text-gray-500 hover:text-gray-700 w-fit"
            >
              Effacer {{ selectedStatusKeys.length }} sélectionné{{ selectedStatusKeys.length > 1 ? 's' : '' }}
            </button>
          </div>
        </div>

        <!-- Notes -->
        <div class="mb-6">
          <label for="notes" class="form-label">
            Notes (optionnel)
          </label>
          <textarea
            id="notes"
            v-model="form.notes"
            rows="3"
            class="form-input"
            placeholder="Ajoutez des notes sur ce changement de statut..."
          />
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
            type="button"
            @click="handleSubmit"
            :disabled="isSubmitting || selectedStatusKeys.length === 0"
            class="btn btn-primary"
          >
            <span v-if="isSubmitting">Enregistrement...</span>
            <span v-else>Enregistrer</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useStatuses, useModelActiveStatus, useSetItemStatus } from '@/composables/useStatuses'
import { useMaterialModel } from '@/composables/useMaterialModels'
import { statusesApi } from '@/api/endpoints/statuses'
import type { Status, ItemStatus } from '@/types'

interface Props {
  modelId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  updated: []
}>()

// Queries
const { data: statuses, isLoading: isLoadingStatuses } = useStatuses()
const { data: model } = useMaterialModel(props.modelId)
const { data: activeModelStatuses } = useModelActiveStatus(props.modelId)
const setItemStatusMutation = useSetItemStatus()

// Liste des statuts actifs uniquement
const statusesList = computed(() => {
  return (statuses.value || []).filter((status: Status) => status.isActive !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
})

// Statuts actifs actuels
const currentActiveStatuses = computed(() => {
  return activeModelStatuses.value || []
})

const currentActiveStatusKeys = computed(() => {
  return currentActiveStatuses.value
    .map(is => is.status?.key)
    .filter(Boolean) as string[]
})

// État local
const selectedStatusKeys = ref<string[]>([])
const form = ref({
  notes: '',
})
const error = ref('')
const isSubmitting = ref(false)

// Initialiser avec les statuts actifs actuels
const initializeSelection = () => {
  selectedStatusKeys.value = [...currentActiveStatusKeys.value]
}

// Fonctions pour gérer la sélection multiple des statuts
const toggleStatus = (statusKey: string) => {
  const index = selectedStatusKeys.value.indexOf(statusKey)
  if (index > -1) {
    selectedStatusKeys.value.splice(index, 1)
  } else {
    selectedStatusKeys.value.push(statusKey)
  }
}

const isStatusSelected = (statusKey: string) => {
  return selectedStatusKeys.value.includes(statusKey)
}

const clearSelection = () => {
  selectedStatusKeys.value = []
}

// Fonction pour obtenir le style d'un badge de statut
const getStatusButtonStyle = (status: Status | undefined) => {
  if (!status) return {}
  
  if (status.color && status.color.startsWith('#')) {
    // Calculer la couleur de texte (noir ou blanc selon la luminosité)
    const hex = status.color.replace('#', '')
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255
    const textColor = luminance > 0.5 ? '#1f2937' : '#ffffff'
    
    return {
      backgroundColor: status.color,
      color: textColor,
    }
  }
  return {}
}

// Fonction pour obtenir les classes CSS d'un badge de statut
const getStatusButtonClasses = (status: Status | undefined) => {
  if (!status) return 'bg-gray-100 text-gray-800'
  
  if (status.color && status.color.startsWith('#')) {
    return ''
  }
  
  // Couleurs par défaut selon le groupe
  const groupColors: Record<string, string> = {
    commercial: 'bg-primary-100 text-primary-800',
    audience: 'bg-success-100 text-success-800',
    condition: 'bg-warning-100 text-warning-800',
    lifecycle: 'bg-danger-100 text-danger-800',
  }
  
  return groupColors[status.group] || 'bg-gray-100 text-gray-800'
}

const handleClose = () => {
  emit('close')
}

const handleSubmit = async () => {
  if (selectedStatusKeys.value.length === 0) {
    error.value = 'Veuillez sélectionner au moins un statut'
    return
  }

  error.value = ''
  isSubmitting.value = true

  try {
    // Créer un map des statuts actifs actuels par groupe
    const activeStatusByGroup = new Map<string, string>()
    if (activeModelStatuses.value) {
      activeModelStatuses.value.forEach(itemStatus => {
        if (itemStatus.status?.group && itemStatus.status?.key) {
          activeStatusByGroup.set(itemStatus.status.group, itemStatus.status.key)
        }
      })
    }
    
    // Créer un map des statuts sélectionnés par groupe
    const selectedStatusByGroup = new Map<string, string>()
    for (const statusKey of selectedStatusKeys.value) {
      const status = statuses.value?.find(s => s.key === statusKey)
      if (status && status.group) {
        // Si un groupe a déjà un statut sélectionné, on garde le dernier
        selectedStatusByGroup.set(status.group, statusKey)
      }
    }
    
    // Définir uniquement les statuts qui ont changé ou qui sont nouveaux
    for (const [group, statusKey] of selectedStatusByGroup.entries()) {
      const currentStatusKey = activeStatusByGroup.get(group)
      const hasChanged = currentStatusKey !== statusKey
      
      // Si le statut a changé ou n'existe pas encore, le définir
      if (hasChanged) {
        await setItemStatusMutation.mutateAsync({
          modelId: props.modelId,
          statusKey: statusKey,
          notes: form.value.notes || undefined,
        })
      }
    }
    
    // Fermer les statuts des groupes qui n'ont plus de statut sélectionné
    for (const [group] of activeStatusByGroup.entries()) {
      if (!selectedStatusByGroup.has(group)) {
        try {
          await statusesApi.closeActiveByGroup(props.modelId, group)
        } catch (err) {
          // Ne pas bloquer si la fermeture échoue
          console.error('Erreur lors de la fermeture du statut:', err)
        }
      }
    }

    emit('updated')
    handleClose()
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || 'Une erreur est survenue'
  } finally {
    isSubmitting.value = false
  }
}

// Initialiser la sélection quand les données sont chargées
watch(activeModelStatuses, (newStatuses) => {
  if (newStatuses && newStatuses.length > 0 && selectedStatusKeys.value.length === 0) {
    initializeSelection()
  }
}, { immediate: true })
</script>
