<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Ventes Buvette</h1>
      <p class="mt-1 text-sm text-gray-600">
        Gestion des ventes de la buvette
      </p>
    </div>

    <div v-if="authStore.canWrite" class="mb-6">
      <button
        @click="showCreateModal = true"
        class="btn btn-primary"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        Nouvelle vente
      </button>
    </div>

    <DataTable
      v-if="sales"
      :data="sales"
      :columns="columns"
      :is-loading="isLoading"
      title="Historique des ventes"
    >
      <template #cell-saleDate="{ item }">
        <div class="text-sm text-gray-900">
          {{ formatDate(item.saleDate) }}
        </div>
      </template>

      <template #cell-counterparty="{ item }">
        <div class="text-sm text-gray-900">
          {{ item.counterpartyUser?.username || item.counterpartyTeam?.name || item.externalName || '-' }}
        </div>
      </template>

      <template #cell-totalAmount="{ item }">
        <span v-if="item.totalAmount" class="text-sm font-medium text-gray-900">
          {{ parseFloat(item.totalAmount).toFixed(2) }} €
        </span>
        <span v-else class="text-sm text-gray-500">-</span>
      </template>

      <template #cell-status="{ item }">
        <span
          :class="{
            'bg-green-100 text-green-800': item.status === 'completed',
            'bg-red-100 text-red-800': item.status === 'cancelled'
          }"
          class="px-2 py-1 rounded-full text-xs font-medium"
        >
          {{ item.status === 'completed' ? 'Terminée' : 'Annulée' }}
        </span>
      </template>
    </DataTable>

    <div v-if="isLoading" class="text-center py-8">
      <p class="text-gray-500">Chargement...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useSales } from '@/composables/useSales'
import { useAuthStore } from '@/stores/auth'
import DataTable from '@/components/DataTable.vue'
import { formatDate } from '@/utils/formatDate'

const authStore = useAuthStore()
const { data: sales, isLoading } = useSales()

const showCreateModal = ref(false)

const columns = [
  { key: 'saleDate', label: 'Date' },
  { key: 'counterparty', label: 'Client' },
  { key: 'totalAmount', label: 'Montant' },
  { key: 'status', label: 'Statut' },
]
</script>





