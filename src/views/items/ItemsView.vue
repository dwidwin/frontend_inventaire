<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Items</h1>
      <p class="mt-1 text-sm text-gray-600">
        Gestion du matériel et des équipements
      </p>
    </div>

    <!-- Actions -->
    <div v-if="authStore.canWrite" class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
      <div class="flex items-center space-x-3">
        <button
          @click="showCreateModal = true"
          class="btn btn-primary"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Ajouter un item
        </button>
        <button
          @click="showScanModal = true"
          class="btn btn-secondary"
        >
          <QrCodeIcon class="h-5 w-5 mr-2" />
          Scanner code-barres
        </button>
      </div>
    </div>

    <!-- Tableau des items -->
    <DataTable
      :data="items || []"
      :columns="columns"
      :is-loading="isLoading"
      title="Liste des items"
      :show-edit="authStore.canWrite"
      :show-delete="authStore.canWrite"
      @edit="handleEdit"
      @delete="handleDelete"
    >
      <template #cell-model="{ item }">
        <div class="flex items-center">
          <img
            v-if="item.model?.mainImageUrl"
            :src="item.model.mainImageUrl"
            :alt="item.model.name"
            class="h-10 w-10 rounded-lg object-cover mr-3"
          />
          <div>
            <div class="text-sm font-medium text-gray-900">{{ item.model?.name }}</div>
            <div class="text-sm text-gray-500">{{ item.model?.category?.name }}</div>
          </div>
        </div>
      </template>

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

      <template #cell-etat="{ item }">
        <div class="flex flex-wrap gap-1">
          <StatusBadge :status="item.etat || 'Non défini'" />
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

    <!-- Modals -->
    <CreateItemModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handleItemCreated"
    />
    
    <EditItemModal
      v-if="showEditModal && selectedItem"
      :item="selectedItem"
      @close="showEditModal = false"
      @updated="handleItemUpdated"
    />
    
    <DeleteConfirmModal
      v-if="showDeleteModal && selectedItem"
      :item="selectedItem"
      @close="showDeleteModal = false"
      @confirmed="handleItemDeleted"
    />
    
    <ScanModal
      v-if="showScanModal"
      @close="showScanModal = false"
      @scanned="handleCodeScanned"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PlusIcon, QrCodeIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useItems } from '@/composables/useItems'
import DataTable from '@/components/DataTable.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import CreateItemModal from '@/components/modals/CreateItemModal.vue'
import EditItemModal from '@/components/modals/EditItemModal.vue'
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal.vue'
import ScanModal from '@/components/modals/ScanModal.vue'
import type { Item } from '@/types'

const authStore = useAuthStore()

// Queries
const { data: items, isLoading } = useItems()

// État local
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showScanModal = ref(false)
const selectedItem = ref<Item | null>(null)

// Colonnes du tableau
const columns = [
  { key: 'model', label: 'Modèle', sortable: true },
  { key: 'location', label: 'Emplacement', sortable: true },
  { key: 'codeBarre', label: 'Code-barres', sortable: true },
  { key: 'etat', label: 'État', sortable: true },
  { key: 'createdAt', label: 'Créé le', sortable: true },
]

// Actions
const handleEdit = (item: Item) => {
  selectedItem.value = item
  showEditModal.value = true
}

const handleDelete = (item: Item) => {
  selectedItem.value = item
  showDeleteModal.value = true
}

const handleItemCreated = () => {
  showCreateModal.value = false
  // Les données seront automatiquement rechargées par Vue Query
}

const handleItemUpdated = () => {
  showEditModal.value = false
  selectedItem.value = null
}

const handleItemDeleted = () => {
  showDeleteModal.value = false
  selectedItem.value = null
}

const handleCodeScanned = (code: string) => {
  showScanModal.value = false
  // Rechercher l'item par code-barres
  const item = items.value?.find(i => i.codeBarre === code)
  if (item) {
    // Rediriger vers la page de détail
    window.location.href = `/items/${item.id}`
  } else {
    // Afficher un message d'erreur
    alert('Aucun item trouvé avec ce code-barres')
  }
}
</script>
