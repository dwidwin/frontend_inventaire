<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">
            {{ isEditMode ? 'Modifier l\'emplacement' : 'Créer un nouvel emplacement' }}
          </h3>
          <button
            @click="handleClose"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Contenu du formulaire -->
      <div class="px-4 sm:px-6 py-4 overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-200px)]">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Nom de l'emplacement -->
          <div>
            <label for="name" class="form-label">
              Nom de l'emplacement <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.name }"
              placeholder="Ex: Entrepôt principal, Armoire 1..."
            />
            <p v-if="errors.name" class="form-error">{{ errors.name }}</p>
          </div>

          <!-- Notes -->
          <div>
            <label for="notes" class="form-label">
              Notes
            </label>
            <textarea
              id="notes"
              v-model="form.notes"
              rows="3"
              class="form-textarea"
              placeholder="Notes sur l'emplacement (optionnel)..."
            ></textarea>
          </div>

          <!-- Capacité -->
          <div>
            <label for="capacity" class="form-label">
              Capacité
            </label>
            <input
              id="capacity"
              v-model.number="form.capacity"
              type="number"
              min="0"
              class="form-input"
              placeholder="Nombre maximum d'items (optionnel)"
            />
            <p class="mt-1 text-sm text-gray-500">
              Nombre maximum d'items que cet emplacement peut contenir.
            </p>
          </div>

          <!-- Emplacement parent -->
          <div>
            <label for="parentId" class="form-label">
              Emplacement parent
            </label>
            <select
              id="parentId"
              v-model="form.parentId"
              class="form-select"
            >
              <option value="">Aucun (emplacement racine)</option>
              <option
                v-for="item in availableParentLocationsWithIndent"
                :key="item.location.id"
                :value="item.location.id"
              >
                {{ item.displayText }}
              </option>
            </select>
            <p class="mt-1 text-sm text-gray-500">
              Laissez vide pour créer un emplacement racine, ou sélectionnez un emplacement existant pour créer un sous-emplacement.
            </p>
          </div>

          <!-- Aperçu de la hiérarchie -->
          <div v-if="form.parentId" class="p-3 bg-gray-50 rounded-lg">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Aperçu de la hiérarchie :</h4>
            <div class="text-sm text-gray-600">
              <div v-for="(parent, index) in getLocationHierarchy(form.parentId)" :key="parent.id" class="flex items-center">
                <span v-if="index > 0" class="text-gray-400 mr-2">└─</span>
                <span v-else class="mr-2"></span>
                <span>{{ parent.name }}</span>
              </div>
              <div class="flex items-center mt-1">
                <span class="text-gray-400 mr-2">└─</span>
                <span class="font-medium text-primary-600">{{ form.name || 'Nouvel emplacement' }}</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer avec boutons -->
      <div class="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div class="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            @click="handleClose"
            type="button"
            class="btn btn-secondary w-full sm:w-auto order-2 sm:order-1"
          >
            Annuler
          </button>
          
          <button
            @click="handleSubmit"
            type="button"
            :disabled="isSubmitting || !canSubmit"
            class="btn btn-primary w-full sm:w-auto order-1 sm:order-2"
          >
            <span v-if="isSubmitting" class="flex items-center justify-center space-x-2">
              <div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>{{ isEditMode ? 'Modification...' : 'Création...' }}</span>
            </span>
            <span v-else>{{ isEditMode ? 'Modifier l\'emplacement' : 'Créer l\'emplacement' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useLocations, useCreateLocation, useUpdateLocation } from '@/composables/useLocations'
import { getLocationHierarchyPath, getLocationsWithIndent } from '@/utils/locationUtils'
import type { CreateLocationDto, UpdateLocationDto, Location } from '@/types'

// Props
const props = defineProps<{
  location?: Location // Emplacement à modifier (optionnel)
}>()

const emit = defineEmits<{ 
  (e: 'close'): void
  (e: 'created'): void
  (e: 'updated'): void
}>()

// Queries
const { data: locations } = useLocations()

// Mutations
const createLocationMutation = useCreateLocation()
const updateLocationMutation = useUpdateLocation()

// État du formulaire
const isSubmitting = ref(false)

// Mode édition
const isEditMode = computed(() => !!props.location)

// Données du formulaire
const form = reactive<CreateLocationDto>({
  name: '',
  notes: '',
  capacity: undefined,
  parentId: ''
})

// Pré-remplir le formulaire en mode édition
const initializeForm = () => {
  if (props.location) {
    form.name = props.location.name
    form.notes = props.location.notes || ''
    form.capacity = props.location.capacity
    // Résoudre le parentId soit via parent.id direct, soit via la liste complète
    const resolvedParentId =
      props.location.parent?.id ||
      (locations.value?.find((l) => l.id === props.location!.id)?.parent?.id ?? '')
    form.parentId = resolvedParentId || ''
  } else {
    form.name = ''
    form.notes = ''
    form.capacity = undefined
    form.parentId = ''
  }
}

// Initialiser le formulaire au montage et quand l'emplacement change
onMounted(() => {
  initializeForm()
})

watch(() => props.location, () => {
  initializeForm()
}, { immediate: true })

// Réinitialiser le formulaire quand les emplacements sont chargés
watch(() => locations.value, () => {
  if (locations.value && props.location) {
    const resolvedParentId =
      props.location.parent?.id ||
      (locations.value.find((l) => l.id === props.location!.id)?.parent?.id ?? '')
    form.parentId = resolvedParentId || ''
  }
}, { immediate: true })

// Erreurs de validation
const errors = reactive({
  name: ''
})

// Validation
const canSubmit = computed(() => {
  return form.name.trim().length > 0 && !isSubmitting.value
})

// Emplacements disponibles comme parents avec indentation (exclut l'emplacement actuel en mode édition)
const availableParentLocationsWithIndent = computed(() => {
  if (!locations.value) return []
  
  // Fonction pour calculer la profondeur d'un emplacement
  const getLocationDepth = (location: Location, allLocations: Location[]): number => {
    const parentId = location.parentId || location.parent?.id
    if (!parentId) return 0
    const parent = allLocations.find(l => l.id === parentId)
    return parent ? 1 + getLocationDepth(parent, allLocations) : 0
  }
  
  // Filtrer les emplacements (limite à 2 niveaux de profondeur maximum)
  let filtered = locations.value.filter(location => {
    const depth = getLocationDepth(location, locations.value!)
    return depth < 2
  })
  
  // En mode édition, exclure l'emplacement actuel et ses descendants pour éviter les références circulaires
  if (isEditMode.value && props.location) {
    const excludeIds = new Set<string>([props.location.id])
    
    // Ajouter tous les descendants
    const addDescendants = (loc: Location) => {
      if (loc.children) {
        loc.children.forEach(child => {
          excludeIds.add(child.id)
          addDescendants(child)
        })
      }
    }
    addDescendants(props.location)
    
    filtered = filtered.filter(loc => !excludeIds.has(loc.id))
  }
  
  // Obtenir la liste avec indentation
  return getLocationsWithIndent(filtered)
})

// Fonction pour obtenir la hiérarchie complète d'un emplacement (tableau)
const getLocationHierarchy = (locationId: string): Location[] => {
  if (!locations.value) return []
  
  const hierarchy: Location[] = []
  let currentId = locationId
  const visited = new Set<string>()
  
  while (currentId && !visited.has(currentId)) {
    visited.add(currentId)
    const location = locations.value.find(l => l.id === currentId)
    if (!location) break
    
    hierarchy.unshift(location)
    // Chercher le parent soit via parentId, soit via la référence parent imbriquée
    currentId = location.parentId || location.parent?.id || ''
  }
  
  return hierarchy
}

// Validation en temps réel
const validateForm = () => {
  errors.name = ''
  
  if (!form.name.trim()) {
    errors.name = 'Le nom de l\'emplacement est obligatoire'
    return false
  }
  
  if (form.name.trim().length < 2) {
    errors.name = 'Le nom doit contenir au moins 2 caractères'
    return false
  }
  
  return true
}

// Soumission du formulaire
const handleSubmit = async () => {
  if (!validateForm()) return
  
  isSubmitting.value = true
  
  try {
    if (isEditMode.value && props.location) {
      // Mode édition
      const updateData: UpdateLocationDto = {
        name: form.name.trim(),
        notes: form.notes.trim() || undefined,
        capacity: form.capacity,
        parentId: form.parentId || null
      }
      
      await updateLocationMutation.mutateAsync({
        id: props.location.id,
        data: updateData
      })
      
      emit('updated')
    } else {
      // Mode création
      const locationData: CreateLocationDto = {
        name: form.name.trim(),
        notes: form.notes.trim() || undefined,
        capacity: form.capacity,
        parentId: form.parentId || undefined
      }
      
      await createLocationMutation.mutateAsync(locationData)
      
      emit('created')
    }
    
    handleClose()
    
  } catch (error) {
    console.error(`Erreur lors de la ${isEditMode.value ? 'modification' : 'création'} de l'emplacement:`, error)
    alert(`Erreur lors de la ${isEditMode.value ? 'modification' : 'création'} de l'emplacement. Veuillez réessayer.`)
  } finally {
    isSubmitting.value = false
  }
}

// Fermer le modal
const handleClose = () => {
  // Réinitialiser le formulaire
  initializeForm()
  errors.name = ''
  
  emit('close')
}
</script>


