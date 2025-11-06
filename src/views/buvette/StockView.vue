<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Stock Buvette</h1>
      <p class="mt-1 text-sm text-gray-600">
        Gestion du stock avec quantités
      </p>
    </div>

    <div v-if="authStore.canWrite" class="mb-6">
      <button
        @click="showCreateModal = true"
        class="btn btn-primary"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        Ajouter au stock
      </button>
    </div>

    <div v-if="lowStockData && lowStockData.length > 0" class="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h3 class="text-sm font-medium text-yellow-800 mb-2">Alertes stock bas</h3>
      <ul class="list-disc list-inside text-sm text-yellow-700">
        <li v-for="stock in lowStockData" :key="stock.id">
          {{ stock.product?.name }} - {{ stock.quantity }} (minimum: {{ stock.minQuantity }})
        </li>
      </ul>
    </div>

    <DataTable
      v-if="stocks"
      :data="stocks"
      :columns="columns"
      :is-loading="isLoading"
      title="Liste du stock"
      :show-edit="authStore.canWrite"
      @edit="handleEdit"
    >
      <template #cell-product="{ item }">
        <div class="text-sm font-medium text-gray-900">
          {{ item.product?.name || '-' }}
        </div>
      </template>

      <template #cell-location="{ item }">
        <div class="text-sm text-gray-900">
          {{ item.location?.name || '-' }}
        </div>
      </template>

      <template #cell-quantity="{ item }">
        <span
          :class="{
            'text-red-600 font-bold': item.minQuantity && item.quantity <= item.minQuantity,
            'text-gray-900': !item.minQuantity || item.quantity > item.minQuantity
          }"
          class="text-sm font-medium"
        >
          {{ item.quantity }}
        </span>
        <span v-if="item.minQuantity" class="text-xs text-gray-500 ml-1">
          (min: {{ item.minQuantity }})
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
import { useStocks, useLowStock } from '@/composables/useStocks'
import { useAuthStore } from '@/stores/auth'
import DataTable from '@/components/DataTable.vue'
import type { Stock } from '@/types'

const authStore = useAuthStore()
const { data: stocks, isLoading } = useStocks()
const { data: lowStockData } = useLowStock()

const showCreateModal = ref(false)

const columns = [
  { key: 'product', label: 'Produit' },
  { key: 'location', label: 'Emplacement' },
  { key: 'quantity', label: 'Quantité' },
]

const handleEdit = (stock: Stock) => {
  // TODO: Implémenter modal d'édition/ajustement
  console.log('Edit stock:', stock)
}
</script>





