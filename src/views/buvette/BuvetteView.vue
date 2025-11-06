<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Buvette</h1>
      <p class="mt-1 text-sm text-gray-600">
        Gestion des produits, du stock et des ventes de la buvette
      </p>
    </div>

    <!-- Tabs -->
    <div class="mb-6">
      <nav class="flex space-x-8" aria-label="Tabs">
        <button
          v-for="tab in tabs"
          :key="tab.name"
          @click="activeTab = tab.name"
          :class="[
            'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === tab.name
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Contenu des tabs -->
    <div class="mt-6">
      <!-- Onglet Produits -->
      <div v-if="activeTab === 'products'">
        <div v-if="authStore.canWrite" class="mb-6">
          <button
            @click="showCreateProductModal = true"
            class="btn btn-primary"
          >
            <PlusIcon class="h-5 w-5 mr-2" />
            Ajouter un produit
          </button>
        </div>

        <DataTable
          v-if="products"
          :data="products"
          :columns="productColumns"
          :is-loading="isLoadingProducts"
          title="Liste des produits"
          :show-edit="authStore.canWrite"
          :show-delete="authStore.canWrite"
          @edit="handleEditProduct"
          @delete="handleDeleteProduct"
        >
          <template #cell-category="{ item }">
            <div class="text-sm text-gray-900">
              {{ item.category?.name || '-' }}
            </div>
          </template>

          <template #cell-price="{ item }">
            <span v-if="item.price" class="text-sm font-medium text-gray-900">
              {{ parseFloat(item.price).toFixed(2) }} €
            </span>
            <span v-else class="text-sm text-gray-500">-</span>
          </template>
        </DataTable>

        <div v-if="isLoadingProducts" class="text-center py-8">
          <p class="text-gray-500">Chargement...</p>
        </div>
      </div>

      <!-- Onglet Stock -->
      <div v-if="activeTab === 'stock'">
        <div v-if="authStore.canWrite" class="mb-6">
          <button
            @click="showCreateStockModal = true"
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
          :columns="stockColumns"
          :is-loading="isLoadingStocks"
          title="Liste du stock"
          :show-edit="authStore.canWrite"
          @edit="handleEditStock"
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

        <div v-if="isLoadingStocks" class="text-center py-8">
          <p class="text-gray-500">Chargement...</p>
        </div>
      </div>

      <!-- Onglet Ventes -->
      <div v-if="activeTab === 'sales'">
        <div v-if="authStore.canWrite" class="mb-6">
          <button
            @click="showCreateSaleModal = true"
            class="btn btn-primary"
          >
            <PlusIcon class="h-5 w-5 mr-2" />
            Nouvelle vente
          </button>
        </div>

        <DataTable
          v-if="sales"
          :data="sales"
          :columns="saleColumns"
          :is-loading="isLoadingSales"
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

        <div v-if="isLoadingSales" class="text-center py-8">
          <p class="text-gray-500">Chargement...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useProducts, useDeleteProduct } from '@/composables/useProducts'
import { useStocks, useLowStock } from '@/composables/useStocks'
import { useSales } from '@/composables/useSales'
import { useAuthStore } from '@/stores/auth'
import DataTable from '@/components/DataTable.vue'
import { formatDate } from '@/utils/formatDate'
import type { Product, Stock } from '@/types'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

// Tabs
const tabs = [
  { name: 'products', label: 'Produits' },
  { name: 'stock', label: 'Stock' },
  { name: 'sales', label: 'Ventes' },
]

// Initialiser l'onglet actif depuis la query string ou utiliser 'products' par défaut
const getInitialTab = () => {
  const tabFromQuery = route.query.tab as string
  if (tabFromQuery && tabs.some(tab => tab.name === tabFromQuery)) {
    return tabFromQuery
  }
  return 'products'
}

const activeTab = ref(getInitialTab())

// Mettre à jour l'URL quand l'onglet change
watch(activeTab, (newTab) => {
  router.replace({ query: { ...route.query, tab: newTab } })
})

// Gérer les changements de query string
watch(() => route.query.tab, (newTab) => {
  if (newTab && tabs.some(tab => tab.name === newTab)) {
    activeTab.value = newTab as string
  }
})

// Queries
const { data: products, isLoading: isLoadingProducts } = useProducts()
const { data: stocks, isLoading: isLoadingStocks } = useStocks()
const { data: lowStockData } = useLowStock()
const { data: sales, isLoading: isLoadingSales } = useSales()
const deleteProduct = useDeleteProduct()

// État local
const showCreateProductModal = ref(false)
const showCreateStockModal = ref(false)
const showCreateSaleModal = ref(false)

// Colonnes pour les produits
const productColumns = [
  { key: 'name', label: 'Nom' },
  { key: 'category', label: 'Catégorie' },
  { key: 'price', label: 'Prix' },
]

// Colonnes pour le stock
const stockColumns = [
  { key: 'product', label: 'Produit' },
  { key: 'location', label: 'Emplacement' },
  { key: 'quantity', label: 'Quantité' },
]

// Colonnes pour les ventes
const saleColumns = [
  { key: 'saleDate', label: 'Date' },
  { key: 'counterparty', label: 'Client' },
  { key: 'totalAmount', label: 'Montant' },
  { key: 'status', label: 'Statut' },
]

// Actions pour les produits
const handleEditProduct = (product: Product) => {
  // TODO: Implémenter modal d'édition
  console.log('Edit product:', product)
}

const handleDeleteProduct = async (product: Product) => {
  if (confirm(`Voulez-vous vraiment supprimer "${product.name}" ?`)) {
    try {
      await deleteProduct.mutateAsync(product.id)
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }
}

// Actions pour le stock
const handleEditStock = (stock: Stock) => {
  // TODO: Implémenter modal d'édition/ajustement
  console.log('Edit stock:', stock)
}
</script>

