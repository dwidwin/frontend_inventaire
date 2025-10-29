<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Audit</h1>
      <p class="mt-1 text-sm text-gray-600">
        Journal des actions et modifications
      </p>
    </div>

    <!-- Filtres -->
    <div class="mb-6 card">
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="form-label">Entité</label>
            <select v-model="filters.entityName" class="form-select">
              <option value="">Toutes les entités</option>
              <option value="User">Utilisateurs</option>
              <option value="Item">Items</option>
              <option value="Transaction">Transactions</option>
              <option value="Assignment">Affectations</option>
            </select>
          </div>
          <div>
            <label class="form-label">Action</label>
            <input
              v-model="filters.action"
              type="text"
              placeholder="Rechercher par action"
              class="form-input"
            />
          </div>
          <div>
            <label class="form-label">Date de début</label>
            <input
              v-model="filters.startDate"
              type="date"
              class="form-input"
            />
          </div>
          <div>
            <label class="form-label">Date de fin</label>
            <input
              v-model="filters.endDate"
              type="date"
              class="form-input"
            />
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <button @click="applyFilters" class="btn btn-primary">
            Appliquer les filtres
          </button>
        </div>
      </div>
    </div>

    <!-- Tableau des logs d'audit -->
    <DataTable
      :data="auditLogs || []"
      :columns="columns"
      :is-loading="isLoading"
      title="Journal d'audit"
    >
      <template #cell-actorUser="{ item }">
        <div class="text-sm text-gray-900">
          {{ item.actorUser?.username || 'Système' }}
        </div>
      </template>
      
      <template #cell-action="{ item }">
        <span class="text-sm text-gray-900">{{ item.action }}</span>
      </template>
      
      <template #cell-entityName="{ item }">
        <StatusBadge
          :status="item.entityName"
          :color="getEntityColor(item.entityName)"
        />
      </template>
      
      <template #cell-details="{ item }">
        <button
          @click="showDetails(item)"
          class="text-primary-600 hover:text-primary-900 text-sm"
        >
          Voir détails
        </button>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { auditApi } from '@/api/endpoints/audit'
import DataTable from '@/components/DataTable.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import type { AuditLog, SearchParams } from '@/types'

// Filtres
const filters = reactive<SearchParams>({
  entityName: '',
  action: '',
  startDate: '',
  endDate: '',
})

// Queries
const { data: auditLogs, isLoading, refetch } = useQuery({
  queryKey: ['audit-logs', filters],
  queryFn: () => auditApi.list(filters),
})

// Colonnes du tableau
const columns = [
  { key: 'actorUser', label: 'Utilisateur', sortable: true },
  { key: 'action', label: 'Action', sortable: true },
  { key: 'entityName', label: 'Entité', sortable: true },
  { key: 'entityId', label: 'ID Entité', sortable: true },
  { key: 'createdAt', label: 'Date', sortable: true },
  { key: 'details', label: 'Détails', sortable: false },
]

// Actions
const applyFilters = () => {
  refetch()
}

const showDetails = (item: AuditLog) => {
  // TODO: Ouvrir modal avec les détails
  console.log('Show details:', item)
}

// Utilitaires
const getEntityColor = (entityName: string) => {
  const entityColors = {
    User: 'primary',
    Item: 'success',
    Transaction: 'warning',
    Assignment: 'danger',
  }
  return entityColors[entityName as keyof typeof entityColors] || 'gray'
}
</script>
