<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Emplacements</h1>
      <p class="mt-1 text-sm text-gray-600">
        Gestion des localisations du matériel
      </p>
    </div>

    <!-- Actions -->
    <div v-if="authStore.canWrite" class="mb-6 flex justify-between items-center">
      <div class="flex items-center space-x-3">
        <button
          @click="showCreateModal = true"
          class="btn btn-primary"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Ajouter un emplacement
        </button>
      </div>
    </div>

    <!-- Liste des emplacements en arbre -->
    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="skeleton h-16"></div>
    </div>
    
    <div v-else-if="!locationRoots?.length" class="text-center py-8 text-gray-500">
      Aucun emplacement trouvé
    </div>
    
    <div v-else class="space-y-3">
      <LocationTree
        v-for="location in locationRoots"
        :key="location.id"
        :node="location"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>

    <!-- Modals -->
    <CreateLocationModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handleCreated"
    />

    <EditLocationModal
      v-if="selectedLocation && showEditModal"
      :location="selectedLocation"
      @close="handleCloseEdit"
      @updated="handleUpdated"
    />

    <DeleteLocationModal
      v-if="selectedLocation && showDeleteModal"
      :location="selectedLocation"
      @close="handleCloseDelete"
      @confirmed="handleDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useLocations } from '@/composables/useLocations'
import { buildLocationTree } from '@/utils/locationUtils'
import LocationTree from '@/components/LocationTree.vue'
import CreateLocationModal from '@/components/modals/CreateLocationModal.vue'
import EditLocationModal from '@/components/modals/EditLocationModal.vue'
import DeleteLocationModal from '@/components/modals/DeleteLocationModal.vue'
import type { Location } from '@/types'

const authStore = useAuthStore()

// Queries
const { data: locations, isLoading } = useLocations()

// Construire l'arbre hiérarchique
const locationRoots = computed(() => {
  return buildLocationTree(locations.value)
})

// État local
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedLocation = ref<Location | null>(null)

// Actions
const handleEdit = (location: Location) => {
  selectedLocation.value = location
  showEditModal.value = true
}

const handleDelete = (location: Location) => {
  selectedLocation.value = location
  showDeleteModal.value = true
}

const handleCloseEdit = () => {
  showEditModal.value = false
  selectedLocation.value = null
}

const handleCloseDelete = () => {
  showDeleteModal.value = false
  selectedLocation.value = null
}

const handleCreated = () => {
  // La query sera automatiquement invalidée par le composable
}

const handleUpdated = () => {
  handleCloseEdit()
  // La query sera automatiquement invalidée par le composable
}

const handleDeleted = () => {
  handleCloseDelete()
  // La query sera automatiquement invalidée par le composable
}
</script>
