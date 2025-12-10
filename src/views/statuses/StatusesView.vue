<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Statuts</h1>
      <p class="mt-1 text-sm text-gray-600">
        Gestion des statuts système
      </p>
    </div>

    <div class="mb-6 flex justify-between items-center">
      <h2 class="text-lg font-medium text-gray-900">Gestion des statuts</h2>
      <button
        @click="showCreateStatusModal = true"
        class="btn btn-primary"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        Ajouter un statut
      </button>
    </div>

    <!-- Filtres -->
    <div class="mb-4 flex flex-wrap gap-4 items-end">
      <div class="flex-1 min-w-[200px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">Groupe</label>
        <select
          v-model="statusGroupFilter"
          class="form-select w-full"
        >
          <option value="">Tous les groupes</option>
          <option :value="StatusGroupEnum.COMMERCIAL">Commercial</option>
          <option :value="StatusGroupEnum.AUDIENCE">Audience</option>
          <option :value="StatusGroupEnum.CONDITION">Condition</option>
          <option :value="StatusGroupEnum.LIFECYCLE">Cycle de vie</option>
        </select>
      </div>
      <div class="flex-1 min-w-[200px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
        <select
          v-model="statusActiveFilter"
          class="form-select w-full"
        >
          <option value="">Tous</option>
          <option value="true">Actif</option>
          <option value="false">Inactif</option>
        </select>
      </div>
    </div>

    <DataTable
      :data="filteredStatuses"
      :columns="statusColumns"
      :is-loading="isLoadingStatuses"
      @edit="handleEditStatus"
      @delete="handleDeleteStatus"
    >
      <template #cell-group="{ item }">
        <span class="text-sm text-gray-900">{{ getGroupLabel(item.group) }}</span>
      </template>
      
      <template #cell-color="{ item }">
        <div class="flex items-center space-x-2">
          <div
            class="h-6 w-6 rounded-full border border-gray-300"
            :style="{ backgroundColor: item.color || '#9CA3AF' }"
          />
          <span v-if="item.color" class="text-xs text-gray-500 font-mono">{{ item.color }}</span>
          <span v-else class="text-xs text-gray-400">Par défaut</span>
        </div>
      </template>

      <template #cell-isActive="{ item }">
        <StatusBadge
          :status="item.isActive ? 'Actif' : 'Inactif'"
          :color="item.isActive ? 'success' : 'danger'"
        />
      </template>

      <template #cell-createdAt="{ item }">
        <span class="text-sm text-gray-900">{{ formatDate(item.createdAt) }}</span>
      </template>
    </DataTable>

    <!-- Modals Statuts -->
    <CreateStatusModal
      v-if="showCreateStatusModal"
      @close="showCreateStatusModal = false"
      @created="handleStatusCreated"
    />
    
    <EditStatusModal
      v-if="showEditStatusModal && selectedStatus"
      :status="selectedStatus"
      @close="showEditStatusModal = false"
      @updated="handleStatusUpdated"
    />
    
    <DeleteStatusModal
      v-if="showDeleteStatusModal && selectedStatus"
      :status="selectedStatus"
      @close="showDeleteStatusModal = false"
      @confirmed="handleStatusDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useStatuses, useDeleteStatus } from '@/composables/useStatuses'
import DataTable from '@/components/DataTable.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import CreateStatusModal from '@/components/modals/CreateStatusModal.vue'
import EditStatusModal from '@/components/modals/EditStatusModal.vue'
import DeleteStatusModal from '@/components/modals/DeleteStatusModal.vue'
import type { Status, StatusGroup } from '@/types'
import { StatusGroup as StatusGroupEnum } from '@/types'
import { formatDate } from '@/utils/formatDate'

// Queries
const { data: statuses, isLoading: isLoadingStatuses } = useStatuses()
const deleteStatusMutation = useDeleteStatus()

// État local
const showCreateStatusModal = ref(false)
const showEditStatusModal = ref(false)
const showDeleteStatusModal = ref(false)
const selectedStatus = ref<Status | null>(null)
const statusGroupFilter = ref<string>('')
const statusActiveFilter = ref<string>('')

// Colonnes pour les statuts
const statusColumns = [
  { key: 'label', label: 'Libellé', sortable: true },
  { key: 'group', label: 'Groupe', sortable: true },
  { key: 'color', label: 'Couleur', sortable: false },
  { key: 'sortOrder', label: 'Ordre', sortable: true },
  { key: 'isActive', label: 'Statut', sortable: true },
  { key: 'createdAt', label: 'Créé le', sortable: true },
]

// Actions
const handleEditStatus = (status: Status) => {
  selectedStatus.value = status
  showEditStatusModal.value = true
}

const handleDeleteStatus = (status: Status) => {
  selectedStatus.value = status
  showDeleteStatusModal.value = true
}

const handleStatusCreated = () => {
  showCreateStatusModal.value = false
}

const handleStatusUpdated = () => {
  showEditStatusModal.value = false
  selectedStatus.value = null
}

const handleStatusDeleted = async () => {
  if (!selectedStatus.value) return
  
  try {
    await deleteStatusMutation.mutateAsync(selectedStatus.value.id)
    showDeleteStatusModal.value = false
    selectedStatus.value = null
  } catch (error: any) {
    console.error('Erreur lors de la suppression du statut:', error)
    // Le modal gère déjà l'affichage de l'erreur, on ne fait que nettoyer
    if (error?.response?.status === 404) {
      // Si le statut n'existe pas, on ferme quand même
      showDeleteStatusModal.value = false
      selectedStatus.value = null
    }
  }
}

// Utilitaires
const getGroupLabel = (group: StatusGroup): string => {
  const labels: Record<StatusGroup, string> = {
    [StatusGroupEnum.COMMERCIAL]: 'Commercial',
    [StatusGroupEnum.AUDIENCE]: 'Audience',
    [StatusGroupEnum.CONDITION]: 'Condition',
    [StatusGroupEnum.LIFECYCLE]: 'Cycle de vie',
  }
  return labels[group] || group
}

// Filtrage des statuts
const filteredStatuses = computed(() => {
  let result = statuses.value || []
  
  // Filtre par groupe
  if (statusGroupFilter.value) {
    result = result.filter(status => status.group === statusGroupFilter.value)
  }
  
  // Filtre par statut actif/inactif
  if (statusActiveFilter.value !== '') {
    const isActive = statusActiveFilter.value === 'true'
    result = result.filter(status => status.isActive === isActive)
  }
  
  return result
})
</script>



