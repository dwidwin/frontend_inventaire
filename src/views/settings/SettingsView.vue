<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Paramètres</h1>
      <p class="mt-1 text-sm text-gray-600">
        Gestion des paramètres système et administration
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
              class="h-10 w-10 rounded-lg object-contain"
            />
            <span v-else class="text-sm text-gray-500">Aucune image</span>
          </template>
          
          <template #cell-createdAt="{ item }">
            <span class="text-sm text-gray-900">{{ formatDate(item.createdAt) }}</span>
          </template>
        </DataTable>
      </div>

      <!-- Transactions -->
      <div v-if="activeTab === 'transactions'">
        <div class="mb-6 flex justify-between items-center">
          <h2 class="text-lg font-medium text-gray-900">Transactions</h2>
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

        <DataTable
          :data="transactions || []"
          :columns="transactionColumns"
          :is-loading="isLoadingTransactions"
          @edit="handleEditTransaction"
          @delete="handleDeleteTransaction"
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


      <!-- Statuts -->
      <div v-if="activeTab === 'statuses'">
        <div class="mb-6 flex justify-between items-center">
          <h2 class="text-lg font-medium text-gray-900">Gestion des statuts</h2>
          <button
            @click="showCreateStatusModal = true"
            class="btn btn-primary"
          >
            <PlusIcon class="h-5 w-5 mr-2" />
            Ajouter un statut
          </button>
        </div>

        <!-- Filtres -->
        <div class="mb-4 flex flex-wrap gap-4 items-end">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">Groupe</label>
            <select
              v-model="statusGroupFilter"
              class="form-select w-full"
            >
              <option value="">Tous les groupes</option>
              <option :value="StatusGroupEnum.COMMERCIAL">Commercial</option>
              <option :value="StatusGroupEnum.AUDIENCE">Audience</option>
              <option :value="StatusGroupEnum.CONDITION">Condition</option>
              <option :value="StatusGroupEnum.LIFECYCLE">Cycle de vie</option>
            </select>
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              v-model="statusActiveFilter"
              class="form-select w-full"
            >
              <option value="">Tous</option>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </div>
        </div>

        <DataTable
          :data="filteredStatuses"
          :columns="statusColumns"
          :is-loading="isLoadingStatuses"
          @edit="handleEditStatus"
          @delete="handleDeleteStatus"
        >
          <template #cell-group="{ item }">
            <span class="text-sm text-gray-900">{{ getGroupLabel(item.group) }}</span>
          </template>
          
          <template #cell-color="{ item }">
            <div class="flex items-center space-x-2">
              <div
                class="h-6 w-6 rounded-full border border-gray-300"
                :style="{ backgroundColor: item.color || '#9CA3AF' }"
              />
              <span v-if="item.color" class="text-xs text-gray-500 font-mono">{{ item.color }}</span>
              <span v-else class="text-xs text-gray-400">Par défaut</span>
            </div>
          </template>

          <template #cell-isActive="{ item }">
            <StatusBadge
              :status="item.isActive ? 'Actif' : 'Inactif'"
              :color="item.isActive ? 'success' : 'danger'"
            />
          </template>

          <template #cell-createdAt="{ item }">
            <span class="text-sm text-gray-900">{{ formatDate(item.createdAt) }}</span>
          </template>
        </DataTable>
      </div>

      <!-- Gestion des utilisateurs -->
      <div v-if="activeTab === 'users'">
        <div class="mb-6 flex justify-between items-center">
          <h2 class="text-lg font-medium text-gray-900">Gestion des utilisateurs</h2>
          <button
            @click="showCreateUserModal = true"
            class="btn btn-primary"
          >
            <PlusIcon class="h-5 w-5 mr-2" />
            Ajouter un utilisateur
          </button>
        </div>

        <DataTable
          :data="users || []"
          :columns="userColumns"
          :is-loading="isLoadingUsers"
          @edit="handleEditUser"
          @delete="handleDeleteUser"
        >
          <template #cell-role="{ item }">
            <StatusBadge
              :status="item.role"
              :color="getRoleColor(item.role)"
            />
          </template>
          
          <template #cell-isActive="{ item }">
            <StatusBadge
              :status="item.isActive ? 'Actif' : 'Inactif'"
              :color="item.isActive ? 'success' : 'danger'"
            />
          </template>
          
          <template #cell-createdAt="{ item }">
            <span class="text-sm text-gray-900">{{ formatDate(item.createdAt) }}</span>
          </template>
        </DataTable>
      </div>
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


    <!-- Modals Statuts -->
    <CreateStatusModal
      v-if="showCreateStatusModal"
      @close="showCreateStatusModal = false"
      @created="handleStatusCreated"
    />
    
    <EditStatusModal
      v-if="showEditStatusModal && selectedStatus"
      :status="selectedStatus"
      @close="showEditStatusModal = false"
      @updated="handleStatusUpdated"
    />
    
    <DeleteStatusModal
      v-if="showDeleteStatusModal && selectedStatus"
      :status="selectedStatus"
      @close="showDeleteStatusModal = false"
      @confirmed="handleStatusDeleted"
    />

    <!-- Modals Utilisateurs -->
    <EditUserModal
      v-if="showEditUserModal && selectedUser"
      :user="selectedUser"
      @close="showEditUserModal = false"
      @updated="handleUserUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, unref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PlusIcon, CurrencyDollarIcon } from '@heroicons/vue/24/outline'
import { useCategories } from '@/composables/useCategories'
import { useUsers } from '@/composables/useUsers'
import { useStatuses, useDeleteStatus } from '@/composables/useStatuses'
import { useQuery, useQueries } from '@tanstack/vue-query'
import { materialModelsApi } from '@/api/endpoints/materialModels'
import { transactionsApi } from '@/api/endpoints/transactions'
import DataTable from '@/components/DataTable.vue'
import CategoryTree from '@/components/CategoryTree.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import CreateCategoryModal from '@/components/modals/CreateCategoryModal.vue'
import EditCategoryModal from '@/components/modals/EditCategoryModal.vue'
import CreateModelModal from '@/components/modals/CreateModelModal.vue'
import EditModelModal from '@/components/modals/EditModelModal.vue'
import CreateStatusModal from '@/components/modals/CreateStatusModal.vue'
import EditStatusModal from '@/components/modals/EditStatusModal.vue'
import DeleteStatusModal from '@/components/modals/DeleteStatusModal.vue'
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal.vue'
import EditUserModal from '@/components/modals/EditUserModal.vue'
import type { Category, MaterialModel, Transaction, User, Status, StatusGroup } from '@/types'
import { StatusGroup as StatusGroupEnum } from '@/types'
import { formatDate } from '@/utils/formatDate'

const route = useRoute()
const router = useRouter()

// Tabs
const tabs = [
  { name: 'categories', label: 'Catégories' },
  { name: 'models', label: 'Modèles' },
  { name: 'transactions', label: 'Transactions' },
  { name: 'statuses', label: 'Statuts' },
  { name: 'users', label: 'Gestion des utilisateurs' },
]

// Initialiser l'onglet actif depuis la query string ou utiliser 'categories' par défaut
const getInitialTab = () => {
  const tabFromQuery = route.query.tab as string
  if (tabFromQuery && tabs.some(tab => tab.name === tabFromQuery)) {
    return tabFromQuery
  }
  return 'categories'
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
const { data: categories, isLoading: isLoadingCategories } = useCategories()
const { data: modelsResponse, isLoading: isLoadingModels } = useQuery({
  queryKey: ['material-models'],
  queryFn: () => materialModelsApi.list(),
})

// Extraire le tableau de modèles de la réponse paginée
const models = computed(() => modelsResponse.value?.data || [])

const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
  queryKey: ['transactions'],
  queryFn: () => transactionsApi.list(),
})
const { data: users, isLoading: isLoadingUsers } = useUsers()
const { data: statuses, isLoading: isLoadingStatuses } = useStatuses()
const deleteStatusMutation = useDeleteStatus()

// État local - Catégories
const showCreateCategoryModal = ref(false)
const showEditCategoryModal = ref(false)
const selectedCategory = ref<Category | null>(null)

// État local - Modèles
const showCreateModelModal = ref(false)
const showEditModelModal = ref(false)
const selectedModel = ref<MaterialModel | null>(null)

// État local - Transactions
const showCreateRentalModal = ref(false)
const showCreateSaleModal = ref(false)
const selectedTransaction = ref<Transaction | null>(null)


// État local - Utilisateurs
const showCreateUserModal = ref(false)
const showEditUserModal = ref(false)
const selectedUser = ref<User | null>(null)

// État local - Statuts
const showCreateStatusModal = ref(false)
const showEditStatusModal = ref(false)
const showDeleteStatusModal = ref(false)
const selectedStatus = ref<Status | null>(null)
const statusGroupFilter = ref<string>('')
const statusActiveFilter = ref<string>('')

// Colonnes pour les modèles
const modelColumns = [
  { key: 'name', label: 'Nom', sortable: true },
  { key: 'category', label: 'Catégorie', sortable: true },
  { key: 'referenceFournisseur', label: 'Référence', sortable: true },
  { key: 'mainImageUrl', label: 'Image', sortable: false },
  { key: 'createdAt', label: 'Créé le', sortable: true },
]

// Colonnes pour les transactions
const transactionColumns = [
  { key: 'type', label: 'Type', sortable: true },
  { key: 'counterparty', label: 'Contrepartie', sortable: true },
  { key: 'startAt', label: 'Début', sortable: true },
  { key: 'dueAt', label: 'Échéance', sortable: true },
  { key: 'totalAmount', label: 'Montant', sortable: true },
  { key: 'status', label: 'Statut', sortable: true },
]


// Colonnes pour les statuts
const statusColumns = [
  { key: 'label', label: 'Libellé', sortable: true },
  { key: 'group', label: 'Groupe', sortable: true },
  { key: 'color', label: 'Couleur', sortable: false },
  { key: 'sortOrder', label: 'Ordre', sortable: true },
  { key: 'isActive', label: 'Statut', sortable: true },
  { key: 'createdAt', label: 'Créé le', sortable: true },
]

// Colonnes pour les utilisateurs
const userColumns = [
  { key: 'username', label: 'Nom d\'utilisateur', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Rôle', sortable: true },
  { key: 'isActive', label: 'Statut', sortable: true },
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


// Actions pour les transactions
const handleEditTransaction = (transaction: Transaction) => {
  selectedTransaction.value = transaction
  // TODO: Ouvrir modal d'édition
  console.log('Edit transaction:', transaction)
}

const handleDeleteTransaction = (transaction: Transaction) => {
  selectedTransaction.value = transaction
  // TODO: Ouvrir modal de confirmation
  console.log('Delete transaction:', transaction)
}

// Actions pour les statuts
const handleEditStatus = (status: Status) => {
  selectedStatus.value = status
  showEditStatusModal.value = true
}

const handleDeleteStatus = (status: Status) => {
  selectedStatus.value = status
  showDeleteStatusModal.value = true
}

const handleStatusCreated = () => {
  showCreateStatusModal.value = false
}

const handleStatusUpdated = () => {
  showEditStatusModal.value = false
  selectedStatus.value = null
}

const handleStatusDeleted = async () => {
  if (!selectedStatus.value) return
  
  try {
    await deleteStatusMutation.mutateAsync(selectedStatus.value.id)
    showDeleteStatusModal.value = false
    selectedStatus.value = null
  } catch (error: any) {
    console.error('Erreur lors de la suppression du statut:', error)
    // Le modal gère déjà l'affichage de l'erreur, on ne fait que nettoyer
    if (error?.response?.status === 404) {
      // Si le statut n'existe pas, on ferme quand même
      showDeleteStatusModal.value = false
      selectedStatus.value = null
    }
  }
}

// Actions pour les utilisateurs
const handleEditUser = (user: User) => {
  selectedUser.value = user
  showEditUserModal.value = true
}

const handleDeleteUser = (user: User) => {
  selectedUser.value = user
  // TODO: Ouvrir modal de confirmation
  console.log('Delete user:', user)
}

const handleUserUpdated = () => {
  showEditUserModal.value = false
  selectedUser.value = null
}

// Utilitaires
const getRoleColor = (role: string) => {
  const roleColors = {
    ADMIN: 'danger',
    MANAGER: 'warning',
    USER: 'primary',
  }
  return roleColors[role as keyof typeof roleColors] || 'gray'
}

const getGroupLabel = (group: StatusGroup): string => {
  const labels: Record<StatusGroup, string> = {
    [StatusGroupEnum.COMMERCIAL]: 'Commercial',
    [StatusGroupEnum.AUDIENCE]: 'Audience',
    [StatusGroupEnum.CONDITION]: 'Condition',
    [StatusGroupEnum.LIFECYCLE]: 'Cycle de vie',
  }
  return labels[group] || group
}

// Filtrage des statuts
const filteredStatuses = computed(() => {
  let result = statuses.value || []
  
  // Filtre par groupe
  if (statusGroupFilter.value) {
    result = result.filter(status => status.group === statusGroupFilter.value)
  }
  
  // Filtre par statut actif/inactif
  if (statusActiveFilter.value !== '') {
    const isActive = statusActiveFilter.value === 'true'
    result = result.filter(status => status.isActive === isActive)
  }
  
  return result
})

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


