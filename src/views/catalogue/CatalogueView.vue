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
            class="form-select flex-1 min-w-0"
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
            class="form-select flex-1 min-w-0"
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

          <!-- Filtre par Taille/Pointure (même style que les autres selects, sélection multiple) -->
          <div
            v-if="distinctSizes.length > 0"
            ref="taillePointureDropdownRef"
            class="relative flex-1 min-w-[180px]"
          >
            <button
              type="button"
              class="form-select cursor-pointer relative text-left bg-white bg-none appearance-none"
              :class="{ 'ring-2 ring-primary-500 border-primary-500': isTaillePointureOpen }"
              @click="isTaillePointureOpen = !isTaillePointureOpen"
            >
              <span class="block truncate pr-8 text-gray-700">
                {{ taillePointureLabel }}
              </span>
              <ChevronDownIcon
                class="absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 pointer-events-none text-gray-400"
                :class="{ 'rotate-180': isTaillePointureOpen }"
              />
            </button>
            <Transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <div
                v-show="isTaillePointureOpen"
                class="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg max-h-60 overflow-auto"
              >
                <label
                  v-for="size in distinctSizes"
                  :key="size"
                  class="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-gray-900 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    :checked="selectedSizes.includes(size)"
                    class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    @change="toggleTaillePointure(size)"
                  />
                  <span>{{ size }}</span>
                </label>
              </div>
            </Transition>
          </div>
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
          <p class="mt-1 text-xs text-gray-500">
            <span v-if="modelAssigneeDisplayMap[model.id]">
              Affecté à : {{ modelAssigneeDisplayMap[model.id] }}
            </span>
            <span v-else class="text-gray-400">Non affecté</span>
          </p>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, unref, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import { MagnifyingGlassIcon, CubeIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
import { useMaterialModels } from '@/composables/useMaterialModels'
import { useCategories } from '@/composables/useCategories'
import { useLocations } from '@/composables/useLocations'
import { useStatuses } from '@/composables/useStatuses'
import { useQueries } from '@tanstack/vue-query'
import { getCategoriesWithIndent } from '@/utils/categoryUtils'
import { getLocationsWithIndent, getLocationIdsIncludingDescendants } from '@/utils/locationUtils'
import StatusBadge from '@/components/StatusBadge.vue'
import { transactionsApi } from '@/api/endpoints'
import type { MaterialModel, Status, TransactionItem, Transaction } from '@/types'

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

// Récupérer les lignes de transaction par modèle (locations + ventes) pour afficher à qui est affecté le matériel
const transactionItemsQueriesConfig = computed(() => {
  const modelsList = modelsArray.value
  if (!Array.isArray(modelsList)) return []
  return modelsList.map((model) => ({
    queryKey: ['transactions', 'model', model.id],
    queryFn: () => transactionsApi.getItemsByModel(model.id),
    enabled: !!model.id,
  }))
})

const transactionItemsQueries = useQueries({
  queries: transactionItemsQueriesConfig,
})

/** Nom de l'utilisateur/équipe à qui est affecté le matériel : location en cours (gratuite ou payante) ou vente. */
function getAssigneeDisplayName(tx: Transaction | undefined): string | null {
  if (!tx) return null
  if (tx.counterpartyUser?.username) return tx.counterpartyUser.username
  if (tx.counterpartyTeam?.name) return tx.counterpartyTeam.name
  if (tx.externalName?.trim()) return tx.externalName.trim()
  return null
}

// Mapper le nom de l'assigné actuel par modèle : location en cours (open, non rendue) ou acheteur (vente)
const modelAssigneeDisplayMap = computed(() => {
  const map: Record<string, string> = {}
  const modelsList = modelsArray.value
  if (!modelsList || modelsList.length === 0) return map

  modelsList.forEach((model, index) => {
    const queryResult = transactionItemsQueries.value[index]
    if (!queryResult || !queryResult.isSuccess) return
    const items = (unref(queryResult.data) || []) as TransactionItem[]
    if (!Array.isArray(items)) return
    // Priorité 1 : location en cours (open, non rendue)
    const openRental = items.find(
      (item) =>
        (item.transaction as Transaction)?.type === 'rental' &&
        (item.transaction as Transaction)?.status === 'open' &&
        !item.returnedAt
    )
    if (openRental?.transaction) {
      const name = getAssigneeDisplayName(openRental.transaction as Transaction)
      if (name) map[model.id] = name
      return
    }
    // Priorité 2 : vente (dernier acheteur, liste déjà en ordre DESC)
    const saleItem = items.find((item) => (item.transaction as Transaction)?.type === 'sale')
    if (saleItem?.transaction) {
      const name = getAssigneeDisplayName(saleItem.transaction as Transaction)
      if (name) map[model.id] = name
    }
  })

  return map
})

// Catégories avec indentation hiérarchique
const categoriesWithIndent = computed(() => getCategoriesWithIndent(categories.value))

// Emplacements avec indentation hiérarchique
const locationsWithIndent = computed(() => getLocationsWithIndent(locations.value))

// Liste des tailles/pointures distinctes (pour le filtre catalogue)
const distinctSizes = computed(() => {
  const models = modelsArray.value || []
  const set = new Set<string>()
  models.forEach((m: MaterialModel) => {
    const v = m.taillePointure?.trim()
    if (v) set.add(v)
  })
  return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
})

// État local pour les filtres
const searchQuery = ref('')
const selectedCategoryId = ref('')
const selectedLocationId = ref('')
const selectedSizes = ref<string[]>([])
const selectedStatuses = ref<string[]>([])
const showAllStatuses = ref(false)

// Filtre Taille/Pointure (dropdown personnalisé, même style que les autres selects)
const isTaillePointureOpen = ref(false)
const taillePointureDropdownRef = ref<HTMLElement | null>(null)
const taillePointureLabel = computed(() => {
  if (selectedSizes.value.length === 0) return 'Toutes les tailles'
  if (selectedSizes.value.length <= 2) return selectedSizes.value.join(', ')
  return `${selectedSizes.value.length} tailles`
})
const toggleTaillePointure = (size: string) => {
  const i = selectedSizes.value.indexOf(size)
  if (i > -1) {
    selectedSizes.value = selectedSizes.value.filter((_, idx) => idx !== i)
  } else {
    selectedSizes.value = [...selectedSizes.value, size].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  }
}
const closeTaillePointureOnClickOutside = (e: MouseEvent) => {
  if (taillePointureDropdownRef.value && !taillePointureDropdownRef.value.contains(e.target as Node)) {
    isTaillePointureOpen.value = false
  }
}
onMounted(() => {
  document.addEventListener('click', closeTaillePointureOnClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', closeTaillePointureOnClickOutside)
})

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
      const taillePointure = model.taillePointure?.toLowerCase() || ''
      
      return modelName.includes(query) ||
             categoryNames.includes(query) ||
             codeBarre.includes(query) ||
             locationName.includes(query) ||
             description.includes(query) ||
             taillePointure.includes(query)
    })
  }

  // Filtre par catégorie
  if (selectedCategoryId.value) {
    result = result.filter((model: MaterialModel) => 
      model.categories?.some(cat => cat.id === selectedCategoryId.value)
    )
  }

  // Filtre par emplacement (parent + tous les sous-emplacements)
  if (selectedLocationId.value) {
    const locationIds = getLocationIdsIncludingDescendants(selectedLocationId.value, locations.value ?? undefined)
    const locationIdSet = new Set(locationIds)
    result = result.filter((model: MaterialModel) =>
      model.location?.id != null && locationIdSet.has(model.location.id)
    )
  }

  // Filtre par Taille/Pointure (sélection multiple)
  if (selectedSizes.value.length > 0) {
    result = result.filter((model: MaterialModel) => {
      const size = model.taillePointure?.trim()
      return size && selectedSizes.value.includes(size)
    })
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
