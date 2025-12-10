<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ model?.name }}</h1>
          <p class="mt-1 text-sm text-gray-600">
            {{ model?.category?.name }} • {{ itemsCount || 0 }} item{{ (itemsCount || 0) > 1 ? 's' : '' }}
          </p>
        </div>
        <div v-if="authStore.canWrite" class="flex items-center space-x-3">
          <button
            @click="showCreateItemModal = true"
            class="btn btn-primary"
          >
            <PlusIcon class="h-5 w-5 mr-2" />
            Ajouter un item
          </button>
          <button
            @click="showEditModal = true"
            class="btn btn-secondary"
          >
            Modifier le modèle
          </button>
        </div>
      </div>
    </div>

    <!-- Informations du modèle -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      <div class="lg:col-span-2">
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-medium text-gray-900">Informations du modèle</h3>
          </div>
          <div class="card-body">
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Nom</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ model?.name }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Catégorie</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ model?.category?.name }}</dd>
              </div>
              <div v-if="model?.referenceFournisseur">
                <dt class="text-sm font-medium text-gray-500">Référence fournisseur</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ model.referenceFournisseur }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Nombre d'items</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ itemsCount || 0 }}</dd>
              </div>
              <div v-if="model?.description" class="sm:col-span-2">
                <dt class="text-sm font-medium text-gray-500">Description</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ model.description }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Image du modèle -->
        <div v-if="model?.mainImageUrl" class="card mt-6">
          <div class="card-header">
            <h3 class="text-lg font-medium text-gray-900">Image du modèle</h3>
          </div>
          <div class="card-body">
            <img
              :src="model.mainImageUrl"
              :alt="model.name"
              class="w-full h-64 object-contain rounded-lg"
            />
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Statistiques -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-medium text-gray-900">Statistiques</h3>
          </div>
          <div class="card-body">
            <div class="space-y-3">
              <div>
                <div class="text-sm text-gray-500">Total d'items</div>
                <div class="text-2xl font-bold text-gray-900">{{ itemsCount || 0 }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions rapides -->
        <div v-if="authStore.canWrite" class="card">
          <div class="card-header">
            <h3 class="text-lg font-medium text-gray-900">Actions rapides</h3>
          </div>
          <div class="card-body space-y-2">
            <button
              @click="showCreateItemModal = true"
              class="w-full btn btn-primary btn-sm"
            >
              Créer un item
            </button>
            <button
              @click="showEditModal = true"
              class="w-full btn btn-secondary btn-sm"
            >
              Modifier le modèle
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des items -->
    <div class="card">
      <div class="card-header">
        <h3 class="text-lg font-medium text-gray-900">Items utilisant ce modèle</h3>
      </div>
      <div class="card-body">
        <div v-if="isLoadingItems" class="text-center py-8 text-gray-500">
          Chargement des items...
        </div>
        <div v-else-if="!items || items.length === 0" class="text-center py-8 text-gray-500">
          Aucun item n'utilise ce modèle pour le moment.
        </div>
        <DataTable
          v-else
          :data="items"
          :columns="columns"
          :is-loading="false"
          title=""
          :show-edit="authStore.canWrite"
          :show-delete="authStore.canWrite"
          @edit="handleEdit"
          @delete="handleDelete"
        >
          <template #cell-location="{ item }">
            <div v-if="item.location" class="text-sm text-gray-900">
              {{ item.location.name }}
            </div>
            <span v-else class="text-sm text-gray-500">Non localisé</span>
          </template>

          <template #cell-codeBarre="{ item }">
            <span v-if="item.codeBarre" class="font-mono text-sm text-gray-900">
              {{ item.codeBarre }}
            </span>
            <span v-else class="text-sm text-gray-500">-</span>
          </template>

          <template #cell-createdAt="{ item }">
            <div class="text-sm text-gray-900">
              {{ formatDate(item.createdAt) }}
            </div>
          </template>

          <template #actions="{ item }">
            <div v-if="item && item.id" class="flex items-center space-x-2">
              <RouterLink
                :to="`/items/${item.id}`"
                class="text-primary-600 hover:text-primary-900 text-sm"
              >
                Voir
              </RouterLink>
              <button
                @click="handleEdit(item)"
                class="text-primary-600 hover:text-primary-900 text-sm"
              >
                Modifier
              </button>
              <button
                @click="handleDelete(item)"
                class="text-danger-600 hover:text-danger-900 text-sm"
              >
                Supprimer
              </button>
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <!-- Modals -->
    <CreateItemModal
      v-if="showCreateItemModal"
      :preselected-model-id="modelId"
      @close="showCreateItemModal = false"
      @created="handleItemCreated"
    />
    
    <EditItemModal
      v-if="showEditModalItem && selectedItem"
      :item="selectedItem"
      @close="showEditModalItem = false"
      @updated="handleItemUpdated"
    />
    
    <EditModelModal
      v-if="showEditModal && model"
      :model="model"
      @close="showEditModal = false"
      @updated="handleModelUpdated"
    />
    
    <DeleteConfirmModal
      v-if="showDeleteModal && selectedItem"
      :item="selectedItem"
      @close="showDeleteModal = false"
      @confirmed="handleItemDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useMaterialModel, useModelItems, useModelItemsCount } from '@/composables/useMaterialModels'
import DataTable from '@/components/DataTable.vue'
import CreateItemModal from '@/components/modals/CreateItemModal.vue'
import EditItemModal from '@/components/modals/EditItemModal.vue'
import EditModelModal from '@/components/modals/EditModelModal.vue'
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal.vue'
import { formatDate } from '@/utils/formatDate'
import type { Item } from '@/types'

const authStore = useAuthStore()
const route = useRoute()
const modelId = route.params.id as string

// Queries
const { data: model, isLoading: isLoadingModel } = useMaterialModel(modelId)
const { data: items, isLoading: isLoadingItems } = useModelItems(modelId)
const { data: itemsCount } = useModelItemsCount(modelId)

// État local
const showCreateItemModal = ref(false)
const showEditModal = ref(false)
const showEditModalItem = ref(false)
const showDeleteModal = ref(false)
const selectedItem = ref<Item | null>(null)

// Colonnes du tableau
const columns = [
  { key: 'codeBarre', label: 'Code-barres', sortable: true },
  { key: 'location', label: 'Emplacement', sortable: true },
  { key: 'createdAt', label: 'Créé le', sortable: true },
]

// Actions
const handleEdit = (item: Item) => {
  selectedItem.value = item
  showEditModalItem.value = true
}

const handleDelete = (item: Item) => {
  selectedItem.value = item
  showDeleteModal.value = true
}

const handleItemCreated = () => {
  showCreateItemModal.value = false
}

const handleItemUpdated = () => {
  showEditModalItem.value = false
  selectedItem.value = null
}

const handleItemDeleted = () => {
  showDeleteModal.value = false
  selectedItem.value = null
}

const handleModelUpdated = () => {
  showEditModal.value = false
}
</script>

