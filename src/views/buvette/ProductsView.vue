<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Produits Buvette</h1>
      <p class="mt-1 text-sm text-gray-600">
        Gestion des produits de la buvette
      </p>
    </div>

    <div v-if="authStore.canWrite" class="mb-6">
      <button
        @click="showCreateModal = true"
        class="btn btn-primary"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        Ajouter un produit
      </button>
    </div>

    <DataTable
      v-if="products"
      :data="products"
      :columns="columns"
      :is-loading="isLoading"
      title="Liste des produits"
      :show-edit="authStore.canWrite"
      :show-delete="authStore.canWrite"
      @edit="handleEdit"
      @delete="handleDelete"
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

    <div v-if="isLoading" class="text-center py-8">
      <p class="text-gray-500">Chargement...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useProducts, useDeleteProduct } from '@/composables/useProducts'
import { useAuthStore } from '@/stores/auth'
import DataTable from '@/components/DataTable.vue'
import type { Product } from '@/types'

const authStore = useAuthStore()
const { data: products, isLoading } = useProducts()
const deleteProduct = useDeleteProduct()

const showCreateModal = ref(false)

const columns = [
  { key: 'name', label: 'Nom' },
  { key: 'category', label: 'Catégorie' },
  { key: 'price', label: 'Prix' },
]

const handleEdit = (product: Product) => {
  // TODO: Implémenter modal d'édition
}

const handleDelete = async (product: Product) => {
  if (confirm(`Voulez-vous vraiment supprimer "${product.name}" ?`)) {
    try {
      await deleteProduct.mutateAsync(product.id)
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }
}
</script>







