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
    <div class="mb-6 flex justify-between items-center">
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

    <!-- Liste des emplacements -->
    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="skeleton h-16"></div>
    </div>
    
    <div v-else-if="!locations?.length" class="text-center py-8 text-gray-500">
      Aucun emplacement trouvé
    </div>
    
    <div v-else class="space-y-3">
      <LocationCard
        v-for="location in locations"
        :key="location.id"
        :location="location"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useQuery } from '@tanstack/vue-query'
import { locationsApi } from '@/api/endpoints/locations'
import LocationCard from '@/components/LocationCard.vue'
import type { Location } from '@/types'

// Queries
const { data: locations, isLoading } = useQuery({
  queryKey: ['locations'],
  queryFn: () => locationsApi.list(),
})

// État local
const showCreateModal = ref(false)
const selectedLocation = ref<Location | null>(null)

// Actions
const handleEdit = (location: Location) => {
  selectedLocation.value = location
  // TODO: Ouvrir modal d'édition
  console.log('Edit location:', location)
}

const handleDelete = (location: Location) => {
  selectedLocation.value = location
  // TODO: Ouvrir modal de confirmation
  console.log('Delete location:', location)
}
</script>
