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
            v-for="item in categoriesWithIndent"
            :key="item.category.id"
            :value="item.category.id"
          >
            {{ item.displayText }}
          </option>
        </select>

        <!-- Filtre par emplacement -->
        <select
          v-model="selectedLocationId"
          class="form-select"
        >
          <option value="">Tous les emplacements</option>
          <option
            v-for="item in locationsWithIndent"
            :key="item.location.id"
            :value="item.location.id"
          >
            {{ item.displayText }}
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
            class="w-full h-full object-contain"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <CubeIcon class="h-16 w-16 text-gray-400" />
          </div>
          <!-- Badges statuts -->
          <div class="absolute top-2 right-2 flex flex-wrap gap-1 justify-end">
            <template v-if="itemStatusesMap[item.id]?.length">
              <StatusBadge 
                v-for="itemStatus in itemStatusesMap[item.id]" 
                :key="itemStatus.status?.id || itemStatus.statusKey"
                :status="itemStatus.status" 
              />
            </template>
            <StatusBadge v-else status="Non défini" />
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
import { ref, computed, unref } from 'vue'
import { RouterLink } from 'vue-router'
import { MagnifyingGlassIcon, CubeIcon } from '@heroicons/vue/24/outline'
import { useItems } from '@/composables/useItems'
import { useCategories } from '@/composables/useCategories'
import { useLocations } from '@/composables/useLocations'
import { useStatuses } from '@/composables/useStatuses'
import { useQueries } from '@tanstack/vue-query'
import { getCategoriesWithIndent } from '@/utils/categoryUtils'
import { getLocationsWithIndent } from '@/utils/locationUtils'
import StatusBadge from '@/components/StatusBadge.vue'
import type { Item } from '@/types'

// Queries
const { data: items, isLoading } = useItems()
const { data: categories } = useCategories()
const { data: locations } = useLocations()
const { data: statuses } = useStatuses()

// Récupérer les statuts actifs pour tous les items
const statusQueries = useQueries({
  queries: computed(() => {
    if (!items.value) return []
    return items.value.map((item) => ({
      queryKey: ['item-statuses', 'active', item.id],
      queryFn: async () => {
        const { statusesApi } = await import('@/api/endpoints/statuses')
        return statusesApi.getItemActiveStatus(item.id)
      },
      enabled: !!item.id,
    }))
  }),
})

// Mapper les statuts actifs par item ID
const itemStatusesMap = computed(() => {
  const map: Record<string, any[]> = {}
  if (!items.value) return map
  
  items.value.forEach((item, index) => {
    const queryResult = statusQueries.value[index]
    if (!queryResult || !queryResult.isSuccess) return
    
    // Dans Vue Query v5, data est un Ref. Utilisons unref pour être sûr de déballer le Ref
    const statuses = unref(queryResult.data) || []
    
    if (Array.isArray(statuses) && statuses.length > 0) {
      map[item.id] = statuses
    }
  })
  
  return map
})

// Catégories avec indentation hiérarchique
const categoriesWithIndent = computed(() => getCategoriesWithIndent(categories.value))

// Emplacements avec indentation hiérarchique
const locationsWithIndent = computed(() => getLocationsWithIndent(locations.value))

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
  let result = (items.value || []).filter(Boolean) as Item[]

  // Recherche textuelle
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((item: Item) => {
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
    result = result.filter((item: Item) => 
      item.model?.category?.id === selectedCategoryId.value
    )
  }

  // Filtre par emplacement
  if (selectedLocationId.value) {
    result = result.filter((item: Item) => 
      item.location?.id === selectedLocationId.value
    )
  }

  // Filtre par état
  if (selectedStatus.value) {
    result = result.filter((item: Item) => 
      item.etat === selectedStatus.value
    )
  }

  return result
})
</script>
