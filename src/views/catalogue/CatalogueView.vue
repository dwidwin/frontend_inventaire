<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Catalogue</h1>
      <p class="mt-1 text-sm text-gray-600">
        Liste complète du matériel disponible
      </p>
    </div>

    <!-- Barre de recherche et filtres -->
    <div class="mb-6 space-y-4">
      <!-- Barre de recherche -->
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher un matériel..."
          class="form-input pl-10 w-full"
        />
      </div>

      <!-- Filtres -->
      <div class="flex flex-wrap gap-3">
        <!-- Filtre par catégorie -->
        <select
          v-model="selectedCategoryId"
          class="form-select"
        >
          <option value="">Toutes les catégories</option>
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>

        <!-- Filtre par emplacement -->
        <select
          v-model="selectedLocationId"
          class="form-select"
        >
          <option value="">Tous les emplacements</option>
          <option
            v-for="location in locations"
            :key="location.id"
            :value="location.id"
          >
            {{ location.name }}
          </option>
        </select>

        <!-- Filtre par état -->
        <select
          v-model="selectedStatus"
          class="form-select"
        >
          <option value="">Tous les états</option>
          <option
            v-for="status in statuses"
            :key="status.id"
            :value="status.key"
          >
            {{ status.name }}
          </option>
        </select>

        <!-- Bouton réinitialiser -->
        <button
          @click="resetFilters"
          class="btn btn-secondary btn-sm"
        >
          Réinitialiser
        </button>
      </div>
    </div>

    <!-- Compteur de résultats -->
    <div class="mb-4 text-sm text-gray-600">
      {{ filteredItems.length }} résultat(s) trouvé(s)
    </div>

    <!-- Grille de cartes -->
    <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="i in 8" :key="i" class="card">
        <div class="skeleton h-48"></div>
        <div class="card-body">
          <div class="skeleton h-6 mb-2"></div>
          <div class="skeleton h-4 w-2/3"></div>
        </div>
      </div>
    </div>

    <div v-else-if="!filteredItems.length" class="text-center py-12">
      <p class="text-gray-500">Aucun matériel trouvé</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <RouterLink
        v-for="item in filteredItems"
        :key="item.id"
        :to="`/items/${item.id}`"
        class="card hover:shadow-lg transition-shadow cursor-pointer"
      >
        <!-- Image -->
        <div class="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
          <img
            v-if="item.model?.mainImageUrl || item.photoUrl"
            :src="item.photoUrl || item.model?.mainImageUrl"
            :alt="item.model?.name || 'Matériel'"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <CubeIcon class="h-16 w-16 text-gray-400" />
          </div>
          <!-- Badge état -->
          <div class="absolute top-2 right-2">
            <StatusBadge :status="item.etat || 'Non défini'" />
          </div>
        </div>

        <!-- Contenu de la carte -->
        <div class="card-body">
          <h3 class="font-semibold text-gray-900 mb-1">
            {{ item.model?.name || 'Sans nom' }}
          </h3>
          <p class="text-sm text-gray-600 mb-2">
            {{ item.model?.category?.name || 'Sans catégorie' }}
          </p>
          <div class="flex items-center justify-between text-xs text-gray-500">
            <span v-if="item.location">
              📍 {{ item.location.name }}
            </span>
            <span v-else class="text-gray-400">Non localisé</span>
            <span v-if="item.codeBarre" class="font-mono">
              {{ item.codeBarre }}
            </span>
          </div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { MagnifyingGlassIcon, CubeIcon } from '@heroicons/vue/24/outline'
import { useItems } from '@/composables/useItems'
import { useCategories } from '@/composables/useCategories'
import { useLocations } from '@/composables/useLocations'
import { useStatuses } from '@/composables/useStatuses'
import StatusBadge from '@/components/StatusBadge.vue'
import type { Item } from '@/types'

// Queries
const { data: items, isLoading } = useItems()
const { data: categories } = useCategories()
const { data: locations } = useLocations()
const { data: statuses } = useStatuses()

// État local pour les filtres
const searchQuery = ref('')
const selectedCategoryId = ref('')
const selectedLocationId = ref('')
const selectedStatus = ref('')

// Fonction pour réinitialiser les filtres
const resetFilters = () => {
  searchQuery.value = ''
  selectedCategoryId.value = ''
  selectedLocationId.value = ''
  selectedStatus.value = ''
}

// Items filtrés
const filteredItems = computed(() => {
  let result = (items.value || []).filter(Boolean)

  // Recherche textuelle
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => {
      const modelName = item.model?.name?.toLowerCase() || ''
      const categoryName = item.model?.category?.name?.toLowerCase() || ''
      const codeBarre = item.codeBarre?.toLowerCase() || ''
      const locationName = item.location?.name?.toLowerCase() || ''
      
      return modelName.includes(query) ||
             categoryName.includes(query) ||
             codeBarre.includes(query) ||
             locationName.includes(query)
    })
  }

  // Filtre par catégorie
  if (selectedCategoryId.value) {
    result = result.filter(item => 
      item.model?.category?.id === selectedCategoryId.value
    )
  }

  // Filtre par emplacement
  if (selectedLocationId.value) {
    result = result.filter(item => 
      item.location?.id === selectedLocationId.value
    )
  }

  // Filtre par état
  if (selectedStatus.value) {
    result = result.filter(item => 
      item.etat === selectedStatus.value
    )
  }

  return result
})
</script>
