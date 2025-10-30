<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Catalogue</h1>
      <p class="mt-1 text-sm text-gray-600">
        Gestion des catégories et modèles de matériel
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
      <!-- Catégories -->
      <div v-if="activeTab === 'categories'">
        <div class="mb-6 flex justify-between items-center">
          <h2 class="text-lg font-medium text-gray-900">Catégories</h2>
          <button
            @click="showCreateCategoryModal = true"
            class="btn btn-primary"
          >
            <PlusIcon class="h-5 w-5 mr-2" />
            Ajouter une catégorie
          </button>
        </div>
        
        <div v-if="isLoadingCategories" class="space-y-3">
          <div v-for="i in 5" :key="i" class="skeleton h-16"></div>
        </div>
        
        <div v-else-if="!categories?.length" class="text-center py-8 text-gray-500">
          Aucune catégorie trouvée
        </div>
        
        <div v-else class="space-y-3">
          <CategoryTree
            v-for="root in categoryRoots"
            :key="root.id"
            :node="root"
            @edit="handleEditCategory"
            @delete="handleDeleteCategory"
          />
        </div>
      </div>

      <!-- Modèles -->
      <div v-if="activeTab === 'models'">
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
              class="h-10 w-10 rounded-lg object-cover"
            />
            <span v-else class="text-sm text-gray-500">Aucune image</span>
          </template>
        </DataTable>
      </div>
    </div>

    <!-- Modals -->
    <CreateCategoryModal
      v-if="showCreateCategoryModal"
      @close="showCreateCategoryModal = false"
      @created="handleCategoryCreated"
    />
    
    <EditCategoryModal
      v-if="showEditCategoryModal && selectedCategory"
      :category="selectedCategory"
      @close="showEditCategoryModal = false"
      @updated="handleCategoryUpdated"
    />
    
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
import { useCategories } from '@/composables/useCategories'
import { useQuery } from '@tanstack/vue-query'
import { materialModelsApi } from '@/api/endpoints/materialModels'
import DataTable from '@/components/DataTable.vue'
import CategoryCard from '@/components/CategoryCard.vue'
import CategoryTree from '@/components/CategoryTree.vue'
import CreateCategoryModal from '@/components/modals/CreateCategoryModal.vue'
import EditCategoryModal from '@/components/modals/EditCategoryModal.vue'
import CreateModelModal from '@/components/modals/CreateModelModal.vue'
import EditModelModal from '@/components/modals/EditModelModal.vue'
import type { Category, MaterialModel } from '@/types'

// Tabs
const tabs = [
  { name: 'categories', label: 'Catégories' },
  { name: 'models', label: 'Modèles' },
]

const activeTab = ref('categories')

// Queries
const { data: categories, isLoading: isLoadingCategories } = useCategories()
const { data: models, isLoading: isLoadingModels } = useQuery({
  queryKey: ['material-models'],
  queryFn: () => materialModelsApi.list(),
})

// État local
const showCreateCategoryModal = ref(false)
const showEditCategoryModal = ref(false)
const showCreateModelModal = ref(false)
const showEditModelModal = ref(false)
const selectedCategory = ref<Category | null>(null)
const selectedModel = ref<MaterialModel | null>(null)

// Colonnes pour les modèles
const modelColumns = [
  { key: 'name', label: 'Nom', sortable: true },
  { key: 'category', label: 'Catégorie', sortable: true },
  { key: 'referenceFournisseur', label: 'Référence', sortable: true },
  { key: 'mainImageUrl', label: 'Image', sortable: false },
  { key: 'createdAt', label: 'Créé le', sortable: true },
]

// Actions pour les catégories
const handleEditCategory = (category: Category) => {
  selectedCategory.value = category
  showEditCategoryModal.value = true
}

const handleDeleteCategory = (category: Category) => {
  // TODO: Implémenter la suppression
  console.log('Delete category:', category)
}

const handleCategoryCreated = () => {
  showCreateCategoryModal.value = false
}

const handleCategoryUpdated = () => {
  showEditCategoryModal.value = false
  selectedCategory.value = null
}

// Actions pour les modèles
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

// Construire l'arborescence des catégories à partir d'une liste plate si nécessaire
import { computed } from 'vue'

const categoryTree = computed(() => {
  const list = categories.value || []
  if (!list.length) return [] as Category[]

  // Si l'API fournit déjà l'arborescence avec children populés,
  // on ne prend que les catégories racines (sans parent)
  const hasAnyChildren = list.some((c) => c.children && c.children.length)
  if (hasAnyChildren) {
    const roots = list.filter((c) => !c.parentId && !c.parent)
    
    // Trier par nom (racines et enfants)
    const sortDeep = (nodes: Category[]) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name))
      nodes.forEach((n) => n.children && sortDeep(n.children))
    }
    sortDeep(roots)
    return roots
  }

  // Sinon, reconstruire via parentId (logique de fallback)
  const idToNode = new Map<string, Category>()
  list.forEach((c) => idToNode.set(c.id, { ...c, children: c.children ? [...c.children] : [] }))

  const roots: Category[] = []
  const processed = new Set<string>()
  
  idToNode.forEach((node) => {
    if (processed.has(node.id)) return
    
    if (node.parentId) {
      const parent = idToNode.get(node.parentId)
      if (parent) {
        if (!parent.children) parent.children = []
        parent.children.push(node)
        processed.add(node.id)
      } else {
        if (!processed.has(node.id)) {
          roots.push(node)
          processed.add(node.id)
        }
      }
    } else {
      roots.push(node)
      processed.add(node.id)
    }
  })

  const sortDeep = (nodes: Category[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name))
    nodes.forEach((n) => n.children && sortDeep(n.children))
  }
  sortDeep(roots)
  return roots
})

const categoryRoots = categoryTree
</script>
