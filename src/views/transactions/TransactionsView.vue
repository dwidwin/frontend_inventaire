<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Transactions</h1>
      <p class="mt-1 text-sm text-gray-600">
        Gestion des locations et ventes
      </p>
    </div>

    <!-- Actions -->
    <div v-if="authStore.canWrite" class="mb-6 flex justify-between items-center">
      <div class="flex items-center space-x-3">
        <button
          @click="showCreateRentalModal = true"
          class="btn btn-primary"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Nouvelle location
        </button>
        <button
          @click="showCreateSaleModal = true"
          class="btn btn-secondary"
        >
          <CurrencyDollarIcon class="h-5 w-5 mr-2" />
          Nouvelle vente
        </button>
      </div>
    </div>

    <!-- Tableau des transactions -->
    <DataTable
      :data="transactions || []"
      :columns="columns"
      :is-loading="isLoading"
      title="Liste des transactions"
      :show-edit="authStore.canWrite"
      :show-delete="authStore.canWrite"
      @edit="handleEdit"
      @delete="handleDelete"
    >
      <template #cell-type="{ item }">
        <StatusBadge
          :status="item.type === 'rent' ? 'Location' : 'Vente'"
          :color="item.type === 'rent' ? 'primary' : 'success'"
        />
      </template>
      
      <template #cell-counterparty="{ item }">
        <div v-if="item.counterpartyUser" class="text-sm text-gray-900">
          {{ item.counterpartyUser.username }}
        </div>
        <div v-else-if="item.counterpartyTeam" class="text-sm text-gray-900">
          {{ item.counterpartyTeam.name }}
        </div>
        <div v-else-if="item.externalName" class="text-sm text-gray-900">
          {{ item.externalName }}
        </div>
        <span v-else class="text-sm text-gray-500">-</span>
      </template>
      
      <template #cell-startAt="{ item }">
        <div class="text-sm text-gray-900">
          {{ formatDate(item.startAt) }}
        </div>
      </template>
      
      <template #cell-dueAt="{ item }">
        <div class="text-sm text-gray-900">
          {{ formatDate(item.dueAt) }}
        </div>
      </template>
      
      <template #cell-status="{ item }">
        <StatusBadge
          :status="item.closedAt ? 'Clôturée' : 'En cours'"
          :color="item.closedAt ? 'gray' : 'warning'"
        />
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PlusIcon, CurrencyDollarIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useQuery } from '@tanstack/vue-query'
import { transactionsApi } from '@/api/endpoints/transactions'
import DataTable from '@/components/DataTable.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { formatDate } from '@/utils/formatDate'
import type { Transaction } from '@/types'

const authStore = useAuthStore()

// Queries
const { data: transactions, isLoading } = useQuery({
  queryKey: ['transactions'],
  queryFn: () => transactionsApi.list(),
})

// État local
const showCreateRentalModal = ref(false)
const showCreateSaleModal = ref(false)
const selectedTransaction = ref<Transaction | null>(null)

// Colonnes du tableau
const columns = [
  { key: 'type', label: 'Type', sortable: true },
  { key: 'counterparty', label: 'Contrepartie', sortable: true },
  { key: 'startAt', label: 'Début', sortable: true },
  { key: 'dueAt', label: 'Échéance', sortable: true },
  { key: 'totalAmount', label: 'Montant', sortable: true },
  { key: 'status', label: 'Statut', sortable: true },
]

// Actions
const handleEdit = (transaction: Transaction) => {
  selectedTransaction.value = transaction
  // TODO: Ouvrir modal d'édition
  console.log('Edit transaction:', transaction)
}

const handleDelete = (transaction: Transaction) => {
  selectedTransaction.value = transaction
  // TODO: Ouvrir modal de confirmation
  console.log('Delete transaction:', transaction)
}
</script>
