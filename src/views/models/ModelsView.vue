<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Modèles</h1>
      <p class="mt-1 text-sm text-gray-600">
        Gestion des modèles de matériel
      </p>
    </div>

    <div class="mb-6 flex justify-between items-center">
      <h2 class="text-lg font-medium text-gray-900">Modèles</h2>
      <button
        @click="showCreateModelModal = true"
        class="btn btn-primary"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        Ajouter un modèle
      </button>
    </div>
    
    <DataTable
      :data="models || []"
      :columns="modelColumns"
      :is-loading="isLoadingModels"
      @edit="handleEditModel"
      @delete="handleDeleteModel"
    >
      <template #cell-category="{ item }">
        <span class="text-sm text-gray-900">{{ item.category?.name }}</span>
      </template>
      
      <template #cell-mainImageUrl="{ item }">
        <img
          v-if="item.mainImageUrl"
          :src="item.mainImageUrl"
          :alt="item.name"
          class="h-10 w-10 rounded-lg object-contain"
        />
        <span v-else class="text-sm text-gray-500">Aucune image</span>
      </template>
      
      <template #cell-createdAt="{ item }">
        <span class="text-sm text-gray-900">{{ formatDate(item.createdAt) }}</span>
      </template>
    </DataTable>

    <!-- Modals Modèles -->
    <CreateModelModal
      v-if="showCreateModelModal"
      @close="showCreateModelModal = false"
      @created="handleModelCreated"
    />
    
    <EditModelModal
      v-if="showEditModelModal && selectedModel"
      :model="selectedModel"
      @close="showEditModelModal = false"
      @updated="handleModelUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useQuery } from '@tanstack/vue-query'
import { materialModelsApi } from '@/api/endpoints/materialModels'
import DataTable from '@/components/DataTable.vue'
import CreateModelModal from '@/components/modals/CreateModelModal.vue'
import EditModelModal from '@/components/modals/EditModelModal.vue'
import type { MaterialModel } from '@/types'
import { formatDate } from '@/utils/formatDate'

// Queries
const { data: models, isLoading: isLoadingModels } = useQuery({
  queryKey: ['material-models'],
  queryFn: () => materialModelsApi.list(),
})

// État local
const showCreateModelModal = ref(false)
const showEditModelModal = ref(false)
const selectedModel = ref<MaterialModel | null>(null)

// Colonnes pour les modèles
const modelColumns = [
  { key: 'name', label: 'Nom', sortable: true },
  { key: 'category', label: 'Catégorie', sortable: true },
  { key: 'mainImageUrl', label: 'Image', sortable: false },
  { key: 'createdAt', label: 'Créé le', sortable: true },
]

// Actions
const handleEditModel = (model: MaterialModel) => {
  selectedModel.value = model
  showEditModelModal.value = true
}

const handleDeleteModel = (model: MaterialModel) => {
  // TODO: Implémenter la suppression
  console.log('Delete model:', model)
}

const handleModelCreated = () => {
  showCreateModelModal.value = false
}

const handleModelUpdated = () => {
  showEditModelModal.value = false
  selectedModel.value = null
}
</script>

