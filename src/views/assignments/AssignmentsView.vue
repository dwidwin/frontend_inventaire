<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Affectations</h1>
      <p class="mt-1 text-sm text-gray-600">
        Gestion des affectations de matériel
      </p>
    </div>

    <!-- Actions -->
    <div v-if="authStore.canWrite" class="mb-6 flex justify-between items-center">
      <div class="flex items-center space-x-3">
        <button
          @click="showCreateModal = true"
          class="btn btn-primary"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Nouvelle affectation
        </button>
      </div>
    </div>

    <!-- Tableau des affectations -->
    <DataTable
      :data="assignments || []"
      :columns="columns"
      :is-loading="isLoading"
      title="Liste des affectations"
      :show-edit="authStore.canWrite"
      :show-delete="authStore.canWrite"
      @edit="handleEdit"
      @delete="handleDelete"
    >
      <template #cell-item="{ item }">
        <div class="text-sm text-gray-900">{{ item.item?.model?.name }}</div>
        <div class="text-xs text-gray-500">{{ item.item?.codeBarre }}</div>
      </template>
      
      <template #cell-assignedTo="{ item }">
        <div v-if="item.user" class="text-sm text-gray-900">
          {{ item.user.username }}
        </div>
        <div v-else-if="item.team" class="text-sm text-gray-900">
          {{ item.team.name }}
        </div>
        <span v-else class="text-sm text-gray-500">-</span>
      </template>
      
      <template #cell-startAt="{ item }">
        <div class="text-sm text-gray-900">
          {{ formatDate(item.startAt) }}
        </div>
      </template>
      
      <template #cell-endAt="{ item }">
        <div class="text-sm text-gray-900">
          {{ item.endAt ? formatDate(item.endAt) : '-' }}
        </div>
      </template>
      
      <template #cell-status="{ item }">
        <StatusBadge
          :status="item.endAt ? 'Clôturée' : 'Active'"
          :color="item.endAt ? 'gray' : 'success'"
        />
      </template>
      
      <template #cell-createdBy="{ item }">
        <div v-if="item.createdBy" class="text-sm text-gray-900">
          {{ item.createdBy.username }}
        </div>
        <span v-else class="text-sm text-gray-500">-</span>
        <div v-if="item.createdAt" class="text-xs text-gray-500">
          {{ formatDate(item.createdAt) }}
        </div>
      </template>
    </DataTable>

    <!-- Modal de création -->
    <CreateAssignmentModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handleAssignmentCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { assignmentsApi } from '@/api/endpoints/assignments'
import DataTable from '@/components/DataTable.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import CreateAssignmentModal from '@/components/modals/CreateAssignmentModal.vue'
import { formatDate } from '@/utils/formatDate'
import type { Assignment } from '@/types'

const authStore = useAuthStore()
const queryClient = useQueryClient()

// Queries
const { data: assignments, isLoading } = useQuery({
  queryKey: ['assignments'],
  queryFn: () => assignmentsApi.list(),
})

// État local
const showCreateModal = ref(false)
const selectedAssignment = ref<Assignment | null>(null)

// Colonnes du tableau
const columns = [
  { key: 'item', label: 'Item', sortable: true },
  { key: 'assignedTo', label: 'Affecté à', sortable: true },
  { key: 'startAt', label: 'Début', sortable: true },
  { key: 'endAt', label: 'Fin', sortable: true },
  { key: 'status', label: 'Statut', sortable: true },
  { key: 'createdBy', label: 'Créé par', sortable: true },
]

// Actions
const handleEdit = (assignment: Assignment) => {
  selectedAssignment.value = assignment
  // TODO: Ouvrir modal d'édition
  console.log('Edit assignment:', assignment)
}

const handleDelete = (assignment: Assignment) => {
  selectedAssignment.value = assignment
  // TODO: Ouvrir modal de confirmation
  console.log('Delete assignment:', assignment)
}

const handleAssignmentCreated = () => {
  // Invalider les queries pour rafraîchir la liste
  queryClient.invalidateQueries({ queryKey: ['assignments'] })
}
</script>
