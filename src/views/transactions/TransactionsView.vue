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
          :status="transactionTypeLabel(item)"
          :color="transactionTypeColor(item)"
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

      <template #cell-totalAmount="{ item }">
        <span v-if="item.totalAmount != null && item.totalAmount !== ''" class="text-sm font-medium text-gray-900">
          {{ Number(item.totalAmount).toFixed(2) }} €
        </span>
        <span v-else class="text-sm text-gray-500">-</span>
      </template>
      
      <template #cell-status="{ item }">
        <StatusBadge
          :status="item.closedAt ? 'Clôturée' : 'En cours'"
          :color="item.closedAt ? 'gray' : 'warning'"
        />
      </template>
    </DataTable>

    <!-- Modals -->
    <CreateRentalModal
      v-if="showCreateRentalModal"
      @close="showCreateRentalModal = false"
      @created="handleRentalCreated"
    />
    <CreateSaleModal
      v-if="showCreateSaleModal"
      @close="showCreateSaleModal = false"
      @created="handleSaleCreated"
    />

    <!-- Modal retour de location (Modifier) -->
    <ReturnRentalModal
      v-if="selectedTransaction && showEditModal && isRentalOpen(selectedTransaction)"
      :transaction="selectedTransaction"
      @close="handleCloseEdit"
      @returned="handleReturned"
    />

    <!-- Modal confirmation suppression -->
    <DeleteConfirmModal
      v-if="selectedTransaction && showDeleteModal"
      :entity="deleteEntityFromTransaction(selectedTransaction)"
      entity-label="cette transaction"
      @close="handleCloseDelete"
      @confirmed="handleDeleteConfirmed"
    />
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
import CreateRentalModal from '@/components/modals/CreateRentalModal.vue'
import CreateSaleModal from '@/components/modals/CreateSaleModal.vue'
import ReturnRentalModal from '@/components/modals/ReturnRentalModal.vue'
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal.vue'
import { useToast } from '@/composables/useToast'
import { useQueryClient } from '@tanstack/vue-query'
import { formatDate } from '@/utils/formatDate'
import type { Transaction } from '@/types'

const toast = useToast()
const queryClient = useQueryClient()
const authStore = useAuthStore()

// Queries
const { data: transactions, isLoading } = useQuery({
  queryKey: ['transactions'],
  queryFn: () => transactionsApi.list(),
})

// État local
const showCreateRentalModal = ref(false)
const showCreateSaleModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedTransaction = ref<Transaction | null>(null)

// Colonnes du tableau
const columns = [
  { key: 'type', label: 'Type', sortable: true },
  { key: 'counterparty', label: 'Assigné à', sortable: true },
  { key: 'startAt', label: 'Début', sortable: true },
  { key: 'dueAt', label: 'Échéance', sortable: true },
  { key: 'totalAmount', label: 'Montant', sortable: true },
  { key: 'status', label: 'Statut', sortable: true },
]

// Helpers pour les modales
function isRentalOpen(transaction: Transaction): boolean {
  const type = transaction.type
  if (type === 'sale') return false
  if (transaction.closedAt) return false
  return true
}

function deleteEntityFromTransaction(transaction: Transaction): { id: string; name: string } {
  const label = transactionTypeLabel(transaction)
  const dateStr = formatDate(transaction.startAt)
  return { id: transaction.id, name: `${label} - ${dateStr}` }
}

// Actions
const handleEdit = (transaction: Transaction) => {
  selectedTransaction.value = transaction
  if (!isRentalOpen(transaction)) {
    toast.info(transaction.type === 'sale' ? 'Les ventes ne sont pas modifiables.' : 'Transaction déjà clôturée.')
    return
  }
  showEditModal.value = true
}

const handleDelete = (transaction: Transaction) => {
  selectedTransaction.value = transaction
  showDeleteModal.value = true
}

const handleCloseEdit = () => {
  showEditModal.value = false
  selectedTransaction.value = null
}

const handleCloseDelete = () => {
  showDeleteModal.value = false
  selectedTransaction.value = null
}

const handleReturned = () => {
  handleCloseEdit()
  toast.success('Retour enregistré')
  queryClient.invalidateQueries({ queryKey: ['transactions'] })
}

const handleDeleteConfirmed = () => {
  handleCloseDelete()
  // L'API ne propose pas de suppression de transaction pour l'instant
  toast.info('Suppression non disponible pour les transactions.')
}

const handleRentalCreated = () => {
  showCreateRentalModal.value = false
  toast.success('Location créée avec succès')
}

const handleSaleCreated = () => {
  showCreateSaleModal.value = false
  toast.success('Vente créée avec succès')
}

function transactionTypeLabel(item: Transaction): string {
  if (item.type === 'sale') return 'Vente'
  return item.isAssignment ? 'Affectation' : 'Location'
}

function transactionTypeColor(item: Transaction): string {
  if (item.type === 'sale') return 'success'
  return item.isAssignment ? 'primary' : 'primary'
}
</script>
