<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Catégories</h1>
      <p class="mt-1 text-sm text-gray-600">
        Gestion des catégories de matériel
      </p>
    </div>

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

    <!-- Modals Catégories -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useCategories } from '@/composables/useCategories'
import CategoryTree from '@/components/CategoryTree.vue'
import CreateCategoryModal from '@/components/modals/CreateCategoryModal.vue'
import EditCategoryModal from '@/components/modals/EditCategoryModal.vue'
import type { Category } from '@/types'

// Queries
const { data: categories, isLoading: isLoadingCategories } = useCategories()

// État local
const showCreateCategoryModal = ref(false)
const showEditCategoryModal = ref(false)
const selectedCategory = ref<Category | null>(null)

// Actions
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

// Construire l'arborescence des catégories
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



