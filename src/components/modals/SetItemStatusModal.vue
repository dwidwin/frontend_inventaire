<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">
            Changer le statut de l'item
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
          <!-- Statuts actifs actuels -->
          <div v-if="activeStatusesByGroup && Object.keys(activeStatusesByGroup).some(g => activeStatusesByGroup[g as StatusGroup])" class="mb-6">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Statuts actifs actuels</h4>
            <div class="space-y-2">
              <div
                v-for="(itemStatus, group) in activeStatusesByGroup"
                :key="group"
                v-if="itemStatus"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center space-x-3">
                  <StatusBadge :status="itemStatus.status" />
                  <span class="text-xs text-gray-500">
                    {{ getGroupLabel(group as StatusGroup) }}
                  </span>
                </div>
                <span class="text-xs text-gray-500">
                  Depuis {{ formatDate(itemStatus.startAt) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Sélection du groupe -->
          <div class="mb-6">
            <label for="statusGroup" class="form-label">
              Groupe de statut <span class="text-red-500">*</span>
            </label>
            <select
              id="statusGroup"
              v-model="selectedGroup"
              @change="selectedStatusId = ''"
              required
              class="form-input"
            >
              <option value="">Sélectionner un groupe</option>
              <option :value="StatusGroup.COMMERCIAL">Commercial</option>
              <option :value="StatusGroup.AUDIENCE">Audience</option>
              <option :value="StatusGroup.CONDITION">Condition</option>
              <option :value="StatusGroup.LIFECYCLE">Cycle de vie</option>
            </select>
          </div>

          <!-- Sélection du statut -->
          <div v-if="selectedGroup" class="mb-6">
            <label for="status" class="form-label">
              Statut <span class="text-red-500">*</span>
            </label>
            <div v-if="isLoadingStatuses" class="text-sm text-gray-500">
              Chargement des statuts...
            </div>
            <select
              v-else
              id="status"
              v-model="selectedStatusId"
              required
              class="form-input"
            >
              <option value="">Sélectionner un statut</option>
              <option
                v-for="status in availableStatuses"
                :key="status.id"
                :value="status.id"
              >
                {{ status.label }}
              </option>
            </select>
            <p v-if="availableStatuses.length === 0" class="mt-2 text-sm text-gray-500">
              Aucun statut disponible pour ce groupe.
            </p>
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
              type="submit"
              :disabled="!selectedGroup || !selectedStatusId || isSubmitting"
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
import { useStatuses, useItemActiveStatusByGroup, useSetItemStatus } from '@/composables/useStatuses'
import { useItem } from '@/composables/useItems'
import { formatDate } from '@/utils/formatDate'
import StatusBadge from '@/components/StatusBadge.vue'
import type { Status, StatusGroup } from '@/types'
import { StatusGroup as StatusGroupEnum } from '@/types'

interface Props {
  itemId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  updated: []
}>()

// Queries
const { data: statuses, isLoading: isLoadingStatuses } = useStatuses()
const { data: item } = useItem(props.itemId)
const activeStatusesByGroup = useItemActiveStatusByGroup(props.itemId)
const setItemStatusMutation = useSetItemStatus()

// État local
const selectedGroup = ref<StatusGroup | ''>('')
const selectedStatusId = ref('')
const form = ref({
  notes: '',
})
const error = ref('')
const isSubmitting = ref(false)

// StatusGroup enum pour le template
const StatusGroup = StatusGroupEnum

// Statuts disponibles filtrés par groupe sélectionné
const availableStatuses = computed<Status[]>(() => {
  if (!statuses.value || !selectedGroup.value) return []
  return statuses.value
    .filter(s => s.group === selectedGroup.value && s.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
})

// Fonction pour obtenir le label du groupe
const getGroupLabel = (group: StatusGroup): string => {
  const labels: Record<StatusGroup, string> = {
    [StatusGroupEnum.COMMERCIAL]: 'Commercial',
    [StatusGroupEnum.AUDIENCE]: 'Audience',
    [StatusGroupEnum.CONDITION]: 'Condition',
    [StatusGroupEnum.LIFECYCLE]: 'Cycle de vie',
  }
  return labels[group] || group
}

// Réinitialiser le formulaire quand le groupe change
watch(selectedGroup, () => {
  selectedStatusId.value = ''
})

const handleClose = () => {
  emit('close')
}

const handleSubmit = async () => {
  if (!selectedGroup.value || !selectedStatusId.value) {
    error.value = 'Veuillez sélectionner un groupe et un statut'
    return
  }

  error.value = ''
  isSubmitting.value = true

  try {
    await setItemStatusMutation.mutateAsync({
      itemId: props.itemId,
      statusId: selectedStatusId.value,
      notes: form.value.notes || undefined,
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

