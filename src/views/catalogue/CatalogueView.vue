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
      <div class="space-y-4">
        <!-- Filtres dropdowns -->
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

          <!-- Bouton réinitialiser -->
          <button
            @click="resetFilters"
            class="btn btn-secondary btn-sm"
          >
            Réinitialiser
          </button>
        </div>

        <!-- Filtre par état avec badges -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-700">Filtrer par état</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(status, index) in statusesList"
              :key="status.id"
              @click="toggleStatus(status.key)"
              :class="[
                'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                'cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2',
                isStatusSelected(status.key)
                  ? 'ring-2 ring-offset-2 ring-gray-900 shadow-md scale-105'
                  : 'opacity-70 hover:opacity-100',
                // Sur mobile, cacher les statuts après le 5ème sauf si showAllStatuses est vrai
                !showAllStatuses && index >= MAX_STATUSES_MOBILE ? 'hidden md:inline-flex' : '',
                getStatusButtonClasses(status)
              ]"
              :style="getStatusButtonStyle(status)"
            >
              {{ status.label }}
            </button>
          </div>
          <div class="flex items-center gap-3 mt-1">
            <button
              v-if="selectedStatuses.length > 0"
              @click="clearStatusFilter"
              class="text-xs text-gray-500 hover:text-gray-700 w-fit"
            >
              Effacer {{ selectedStatuses.length }} sélectionné{{ selectedStatuses.length > 1 ? 's' : '' }}
            </button>
            <button
              v-if="showMoreButton"
              @click="showAllStatuses = !showAllStatuses"
              class="text-xs text-primary-600 hover:text-primary-700 font-medium md:hidden"
            >
              {{ showAllStatuses ? 'Voir moins' : 'Voir plus' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Compteur de résultats -->
    <div class="mb-4 text-sm text-gray-600">
      {{ filteredModels.length }} résultat(s) trouvé(s)
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

    <div v-else-if="!filteredModels.length" class="text-center py-12">
      <p class="text-gray-500">Aucun matériel trouvé</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <RouterLink
        v-for="model in filteredModels"
        :key="model.id"
        :to="`/models/${model.id}`"
        class="card hover:shadow-lg transition-shadow cursor-pointer"
      >
        <!-- Image -->
        <div class="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
          <img
            v-if="model.mainImageUrl || model.photoUrl"
            :src="model.photoUrl || model.mainImageUrl"
            :alt="model.name || 'Matériel'"
            class="w-full h-full object-contain"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <CubeIcon class="h-16 w-16 text-gray-400" />
          </div>
          <!-- Badges statuts -->
          <div class="absolute top-2 right-2 flex flex-wrap gap-1 justify-end">
            <template v-if="modelStatusesMap[model.id]?.length">
              <StatusBadge 
                v-for="itemStatus in modelStatusesMap[model.id]" 
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
            {{ model.name || 'Sans nom' }}
          </h3>
          <p class="text-sm text-gray-600 mb-2">
            <span v-if="model.categories && model.categories.length > 0">
              {{ model.categories.map(c => c.name).join(', ') }}
            </span>
            <span v-else>Sans catégorie</span>
          </p>
          <div class="flex items-center justify-between text-xs text-gray-500">
            <span v-if="model.location">
              📍 {{ model.location.name }}
            </span>
            <span v-else class="text-gray-400">Non localisé</span>
            <span v-if="model.codeBarre" class="font-mono">
              {{ model.codeBarre }}
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
import { useMaterialModels } from '@/composables/useMaterialModels'
import { useCategories } from '@/composables/useCategories'
import { useLocations } from '@/composables/useLocations'
import { useStatuses } from '@/composables/useStatuses'
import { useQueries } from '@tanstack/vue-query'
import { getCategoriesWithIndent } from '@/utils/categoryUtils'
import { getLocationsWithIndent } from '@/utils/locationUtils'
import StatusBadge from '@/components/StatusBadge.vue'
import type { MaterialModel, Status } from '@/types'

// Queries
const { data: modelsResponse, isLoading } = useMaterialModels()

// Extraire le tableau de modèles de la réponse paginée (comme pour usersApi)
const modelsArray = computed(() => {
  return modelsResponse.value?.data || []
})

const { data: categories } = useCategories()
const { data: locations } = useLocations()
const { data: statuses } = useStatuses()

// Liste des statuts avec valeurs par défaut
const statusesList = computed(() => {
  return (statuses.value || []).filter((status: Status) => status.isActive !== false)
})

// Récupérer les statuts actifs pour tous les modèles
// Créer un computed séparé pour les queries pour éviter les problèmes de réactivité
const statusQueriesConfig = computed(() => {
  // Utiliser modelsArray qui garantit toujours un tableau
  const modelsList = modelsArray.value
  
  // Double vérification : s'assurer que modelsList est bien un tableau
  if (!Array.isArray(modelsList)) {
    return []
  }
  
  try {
    return modelsList.map((model) => ({
      queryKey: ['item-statuses', 'active', model.id],
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
  const modelsList = modelsArray.value
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

// Catégories avec indentation hiérarchique
const categoriesWithIndent = computed(() => getCategoriesWithIndent(categories.value))

// Emplacements avec indentation hiérarchique
const locationsWithIndent = computed(() => getLocationsWithIndent(locations.value))

// État local pour les filtres
const searchQuery = ref('')
const selectedCategoryId = ref('')
const selectedLocationId = ref('')
const selectedStatuses = ref<string[]>([])
const showAllStatuses = ref(false)

// Limiter l'affichage à 5 statuts sur mobile
const MAX_STATUSES_MOBILE = 5

const showMoreButton = computed(() => {
  return statusesList.value.length > MAX_STATUSES_MOBILE
})

// Fonctions pour gérer la sélection multiple des statuts
const toggleStatus = (statusKey: string) => {
  const index = selectedStatuses.value.indexOf(statusKey)
  if (index > -1) {
    selectedStatuses.value.splice(index, 1)
  } else {
    selectedStatuses.value.push(statusKey)
  }
}

const isStatusSelected = (statusKey: string) => {
  return selectedStatuses.value.includes(statusKey)
}

const clearStatusFilter = () => {
  selectedStatuses.value = []
}

// Fonction pour obtenir le style d'un badge de statut
const getStatusButtonStyle = (status: Status) => {
  if (status.color && status.color.startsWith('#')) {
    // Calculer la couleur de texte (noir ou blanc selon la luminosité)
    const hex = status.color.replace('#', '')
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255
    const textColor = luminance > 0.5 ? '#1f2937' : '#ffffff'
    
    return {
      backgroundColor: status.color,
      color: textColor,
    }
  }
  return {}
}

// Fonction pour obtenir les classes CSS d'un badge de statut
const getStatusButtonClasses = (status: Status) => {
  if (status.color && status.color.startsWith('#')) {
    return ''
  }
  
  // Couleurs par défaut selon le groupe
  const groupColors: Record<string, string> = {
    commercial: 'bg-primary-100 text-primary-800',
    audience: 'bg-success-100 text-success-800',
    condition: 'bg-warning-100 text-warning-800',
    lifecycle: 'bg-danger-100 text-danger-800',
  }
  
  return groupColors[status.group] || 'bg-gray-100 text-gray-800'
}

// Fonction pour réinitialiser les filtres
const resetFilters = () => {
  searchQuery.value = ''
  selectedCategoryId.value = ''
  selectedLocationId.value = ''
  selectedStatuses.value = []
  showAllStatuses.value = false
}

// Modèles filtrés
const filteredModels = computed(() => {
  // Utiliser modelsArray qui garantit toujours un tableau
  let result = modelsArray.value.filter(Boolean) as MaterialModel[]

  // Recherche textuelle
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((model: MaterialModel) => {
      const modelName = model.name?.toLowerCase() || ''
      const categoryNames = model.categories?.map(c => c.name?.toLowerCase() || '').join(' ') || ''
      const codeBarre = model.codeBarre?.toLowerCase() || ''
      const locationName = model.location?.name?.toLowerCase() || ''
      const description = model.description?.toLowerCase() || ''
      
      return modelName.includes(query) ||
             categoryNames.includes(query) ||
             codeBarre.includes(query) ||
             locationName.includes(query) ||
             description.includes(query)
    })
  }

  // Filtre par catégorie
  if (selectedCategoryId.value) {
    result = result.filter((model: MaterialModel) => 
      model.categories?.some(cat => cat.id === selectedCategoryId.value)
    )
  }

  // Filtre par emplacement
  if (selectedLocationId.value) {
    result = result.filter((model: MaterialModel) => 
      model.location?.id === selectedLocationId.value
    )
  }

  // Filtre par état (sélection multiple)
  if (selectedStatuses.value.length > 0) {
    result = result.filter((model: MaterialModel) => {
      // Vérifier si le modèle a au moins un des statuts sélectionnés
      const modelStatuses = modelStatusesMap.value[model.id] || []
      const modelStatusKeys = modelStatuses
        .map((is: any) => is.status?.key)
        .filter(Boolean)
      
      // Si le modèle a des statuts actifs, vérifier si au moins un correspond
      if (modelStatusKeys.length > 0) {
        return selectedStatuses.value.some(selectedKey => 
          modelStatusKeys.includes(selectedKey)
        )
      }
      
      // Fallback : vérifier l'ancien champ etat si pas de statuts actifs
      return model.etat && selectedStatuses.value.includes(model.etat)
    })
  }

  return result
})
</script>
