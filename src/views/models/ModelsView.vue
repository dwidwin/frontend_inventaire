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
      <template #cell-name="{ item }">
        <RouterLink
          :to="`/models/${item.id}`"
          class="text-primary-600 hover:text-primary-900 font-medium"
        >
          {{ item.name }}
        </RouterLink>
      </template>

      <template #cell-categories="{ item }">
        <div class="flex flex-wrap gap-1">
          <span
            v-for="category in item.categories"
            :key="category.id"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {{ category.name }}
          </span>
          <span v-if="!item.categories || item.categories.length === 0" class="text-sm text-gray-500">
            Aucune catégorie
          </span>
        </div>
      </template>

      <template #cell-location="{ item }">
        <span v-if="item.location" class="text-sm text-gray-900">{{ item.location.name }}</span>
        <span v-else class="text-sm text-gray-500">Non localisé</span>
      </template>

      <template #cell-etat="{ item }">
        <div class="flex flex-wrap gap-1">
          <template v-if="modelStatusesMap[item.id]?.length">
            <StatusBadge 
              v-for="modelStatus in modelStatusesMap[item.id]" 
              :key="modelStatus.status?.id || modelStatus.statusKey"
              :status="modelStatus.status" 
            />
          </template>
          <StatusBadge v-else :status="item.etat || 'en_stock'" />
        </div>
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
    
    <DeleteConfirmModal
      v-if="showDeleteModelModal && selectedModel"
      :model="selectedModel"
      @close="showDeleteModelModal = false; selectedModel = null"
      @confirmed="confirmDeleteModel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, unref } from 'vue'
import { RouterLink } from 'vue-router'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useQuery, useQueries } from '@tanstack/vue-query'
import { materialModelsApi } from '@/api/endpoints/materialModels'
import { useDeleteMaterialModel } from '@/composables/useMaterialModels'
import { useToast } from '@/composables/useToast'
import DataTable from '@/components/DataTable.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import CreateModelModal from '@/components/modals/CreateModelModal.vue'
import EditModelModal from '@/components/modals/EditModelModal.vue'
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal.vue'
import type { MaterialModel } from '@/types'
import { formatDate } from '@/utils/formatDate'

// Queries
const { data: modelsResponse, isLoading: isLoadingModels } = useQuery({
  queryKey: ['material-models'],
  queryFn: () => materialModelsApi.list(),
})

// Extraire le tableau de modèles de la réponse paginée
const models = computed(() => modelsResponse.value?.data || [])

// Récupérer les statuts actifs pour tous les modèles
const statusQueriesConfig = computed(() => {
  const modelsList = models.value
  
  if (!Array.isArray(modelsList) || modelsList.length === 0) {
    return []
  }
  
  try {
    return modelsList.map((model) => ({
      queryKey: ['model-statuses', 'active', model.id],
      queryFn: async () => {
        const { statusesApi } = await import('@/api/endpoints/statuses')
        return statusesApi.getModelActiveStatus(model.id)
      },
      enabled: !!model.id,
    }))
  } catch (error) {
    console.error('Erreur lors du mapping des modèles:', error, 'modelsList:', modelsList)
    return []
  }
})

const statusQueries = useQueries({
  queries: statusQueriesConfig,
})

// Mapper les statuts actifs par modèle ID
const modelStatusesMap = computed(() => {
  const map: Record<string, any[]> = {}
  const modelsList = models.value
  if (!modelsList || modelsList.length === 0) return map
  
  modelsList.forEach((model, index) => {
    const queryResult = statusQueries.value[index]
    if (!queryResult || !queryResult.isSuccess) return
    
    // Dans Vue Query v5, data est un Ref. Utilisons unref pour être sûr de déballer le Ref
    const statuses = unref(queryResult.data) || []
    
    if (Array.isArray(statuses) && statuses.length > 0) {
      map[model.id] = statuses
    }
  })
  
  return map
})

const deleteModelMutation = useDeleteMaterialModel()
const toast = useToast()

// État local
const showCreateModelModal = ref(false)
const showEditModelModal = ref(false)
const showDeleteModelModal = ref(false)
const selectedModel = ref<MaterialModel | null>(null)

// Colonnes pour les modèles
const modelColumns = [
  { key: 'name', label: 'Nom', sortable: true },
  { key: 'categories', label: 'Catégories', sortable: false },
  { key: 'location', label: 'Emplacement', sortable: true },
  { key: 'etat', label: 'Statuts', sortable: true },
  { key: 'codeBarre', label: 'Code-barres', sortable: true },
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

