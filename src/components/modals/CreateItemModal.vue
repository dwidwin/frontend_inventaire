<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">
            {{ isEditMode ? 'Modifier l\'item' : 'Créer un nouvel item' }}
          </h3>
          <button
            @click="handleClose"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        
        <!-- Indicateur d'étapes -->
        <div class="mt-4">
          <div class="flex items-center justify-center space-x-1 sm:space-x-2">
            <div
              v-for="(step, index) in steps"
              :key="step.id"
              class="flex items-center"
            >
              <div
                :class="[
                  'w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium',
                  currentStep >= index + 1
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                ]"
              >
                {{ index + 1 }}
              </div>
              <span
                :class="[
                  'ml-1 sm:ml-2 text-xs sm:text-sm font-medium hidden sm:inline',
                  currentStep >= index + 1 ? 'text-primary-600' : 'text-gray-500'
                ]"
              >
                {{ step.name }}
              </span>
              <ChevronRightIcon
                v-if="index < steps.length - 1"
                class="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-1 sm:mx-2"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Contenu du formulaire -->
      <div class="px-4 sm:px-6 py-4 overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-200px)]">
        <form @submit.prevent="handleSubmit">
          <!-- Étape 1: Informations du modèle -->
          <div v-if="currentStep === 1" class="space-y-4">
            <h4 class="text-md font-medium text-gray-900 mb-4">Informations du modèle</h4>
            
            <!-- En mode édition, afficher les infos en lecture seule -->
            <template v-if="isEditMode && item?.model">
              <div class="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label class="form-label">Nom du modèle</label>
                  <div class="text-sm text-gray-900">{{ item.model.name }}</div>
                </div>
                <div>
                  <label class="form-label">Catégorie</label>
                  <div class="text-sm text-gray-900">{{ item.model.category?.name }}</div>
                </div>
                <div v-if="item.model.referenceFournisseur">
                  <label class="form-label">Référence fournisseur</label>
                  <div class="text-sm text-gray-900">{{ item.model.referenceFournisseur }}</div>
                </div>
                <div v-if="item.model.description">
                  <label class="form-label">Description</label>
                  <div class="text-sm text-gray-900">{{ item.model.description }}</div>
                </div>
              </div>
              <p class="text-sm text-gray-500 mt-2">
                Le modèle ne peut pas être modifié car il est partagé par plusieurs items.
              </p>
            </template>

            <!-- En mode création, afficher le formulaire -->
            <template v-else>
              <!-- Nom du modèle -->
              <div>
                <label for="modelName" class="form-label">
                  Nom du modèle <span class="text-red-500">*</span>
                </label>
                <input
                  id="modelName"
                  v-model="form.model.name"
                  type="text"
                  required
                  class="form-input"
                  :class="{ 'border-red-500': errors.model.name }"
                  placeholder="Ex: Crosse 95 cm"
                />
                <p v-if="errors.model.name" class="form-error">{{ errors.model.name }}</p>
              </div>

              <!-- Catégorie -->
              <div>
                <label for="categoryId" class="form-label">
                  Catégorie <span class="text-red-500">*</span>
                </label>
                <select
                  id="categoryId"
                  v-model="form.model.categoryId"
                  required
                  class="form-select"
                  :class="{ 'border-red-500': errors.model.categoryId }"
                >
                  <option value="">Sélectionner une catégorie</option>
                  <option
                    v-for="item in categoriesWithIndent"
                    :key="item.category.id"
                    :value="item.category.id"
                  >
                    {{ item.displayText }}
                  </option>
                </select>
                <p v-if="errors.model.categoryId" class="form-error">{{ errors.model.categoryId }}</p>
              </div>

              <!-- Référence fournisseur -->
              <div>
                <label for="referenceFournisseur" class="form-label">
                  Référence fournisseur
                </label>
                <input
                  id="referenceFournisseur"
                  v-model="form.model.referenceFournisseur"
                  type="text"
                  class="form-input"
                  placeholder="Ex: REF-12345"
                />
              </div>

              <!-- Description -->
              <div>
                <label for="description" class="form-label">
                  Description
                </label>
                <textarea
                  id="description"
                  v-model="form.model.description"
                  rows="3"
                  class="form-textarea"
                  placeholder="Description du modèle..."
                ></textarea>
              </div>
            </template>
          </div>

          <!-- Étape 2: Informations de l'item -->
          <div v-if="currentStep === 2" class="space-y-4">
            <h4 class="text-md font-medium text-gray-900 mb-4">Informations de l'item</h4>
            
            <!-- Code-barres -->
            <div>
              <label for="codeBarre" class="form-label">
                Code-barres
              </label>
              <div class="flex space-x-2">
                <input
                  id="codeBarre"
                  v-model="form.item.codeBarre"
                  type="text"
                  class="form-input flex-1"
                  placeholder="Ex: BAR-001"
                />
                <button
                  type="button"
                  @click="handleScanCode"
                  class="btn btn-secondary"
                >
                  <QrCodeIcon class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Statuts (un par groupe) -->
            <div>
              <label class="form-label mb-2">
                Statuts
              </label>
              <div class="space-y-3">
                <div
                  v-for="group in statusGroups"
                  :key="group.value"
                  class="border border-gray-200 rounded-lg p-3"
                >
                  <label :for="`status-${group.value}`" class="block text-sm font-medium text-gray-700 mb-1">
                    {{ group.label }}
                  </label>
                  <select
                    :id="`status-${group.value}`"
                    v-model="form.item.statuses[group.value]"
                    class="form-select"
                  >
                    <option value="">Aucun statut</option>
                    <option
                      v-for="status in getStatusesByGroup(group.value)"
                      :key="status.id"
                      :value="status.key"
                    >
                      {{ status.label }}
                    </option>
                  </select>
                </div>
              </div>
              <p class="mt-2 text-xs text-gray-500">
                Vous pouvez sélectionner un statut pour chaque groupe. Un seul statut actif est autorisé par groupe.
              </p>
            </div>

            <!-- Emplacement -->
            <div>
              <label for="locationId" class="form-label">
                Emplacement
              </label>
              <select
                id="locationId"
                v-model="form.item.locationId"
                class="form-select"
              >
                <option value="">Sélectionner un emplacement</option>
                <option
                  v-for="item in locationsWithIndent"
                  :key="item.location.id"
                  :value="item.location.id"
                >
                  {{ item.displayText }}
                </option>
              </select>
            </div>
          </div>

          <!-- Étape 3: Photo du matériel -->
          <div v-if="currentStep === 3" class="space-y-4">
            <h4 class="text-md font-medium text-gray-900 mb-4">Photo du matériel</h4>
            
            <!-- Photo actuelle du modèle -->
            <div v-if="form.photos.model || (isEditMode && item?.model?.mainImageUrl)" class="space-y-2">
              <label class="form-label">Photo du modèle</label>
              <div class="relative">
                <img
                  :src="form.photos.model?.preview || (item?.model?.mainImageUrl as string)"
                  alt="Photo du modèle"
                  class="w-full h-48 object-cover rounded-lg border border-gray-300"
                />
                <button
                  v-if="form.photos.model"
                  type="button"
                  @click="removePhoto('model')"
                  class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <XMarkIcon class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Photo actuelle de l'item -->
            <div v-if="form.photos.item || (isEditMode && item?.photoUrl)" class="space-y-2">
              <label class="form-label">Photo de l'item</label>
              <div class="relative">
                <img
                  :src="form.photos.item?.preview || (item?.photoUrl as string)"
                  alt="Photo de l'item"
                  class="w-full h-48 object-cover rounded-lg border border-gray-300"
                />
                <button
                  v-if="form.photos.item"
                  type="button"
                  @click="removePhoto('item')"
                  class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <XMarkIcon class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Boutons de capture -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                @click="openCamera('model')"
                class="btn btn-secondary flex items-center justify-center space-x-2"
              >
                <CameraIcon class="w-5 h-5" />
                <span>Photo du modèle</span>
              </button>
              
              <button
                type="button"
                @click="openCamera('item')"
                class="btn btn-secondary flex items-center justify-center space-x-2"
              >
                <CameraIcon class="w-5 h-5" />
                <span>Photo de l'item</span>
              </button>
            </div>

            <p class="text-sm text-gray-500">
              Vous pouvez prendre une photo du modèle (général) et/ou une photo spécifique de cet item.
            </p>
          </div>

          <!-- Historique (uniquement en mode édition) -->
          <EntityHistory v-if="isEditMode" :entity="item" />
        </form>
      </div>

      <!-- Footer avec boutons de navigation -->
      <div class="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div class="flex flex-col sm:flex-row sm:justify-between space-y-2 sm:space-y-0">
          <button
            v-if="currentStep > 1"
            @click="previousStep"
            type="button"
            class="btn btn-secondary w-full sm:w-auto order-2 sm:order-1"
          >
            Précédent
          </button>
          <div v-else class="order-2 sm:order-1"></div>

          <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 order-1 sm:order-2">
            <button
              @click="handleClose"
              type="button"
              class="btn btn-secondary w-full sm:w-auto"
            >
              Annuler
            </button>
            
            <button
              v-if="currentStep < steps.length"
              @click="nextStep"
              type="button"
              :disabled="!canProceed"
              class="btn btn-primary w-full sm:w-auto"
            >
              Suivant
            </button>
            
            <button
              v-else
              @click="handleSubmit"
              type="button"
              :disabled="isSubmitting"
              class="btn btn-primary w-full sm:w-auto"
            >
              <span v-if="isSubmitting" class="flex items-center justify-center space-x-2">
                <div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>{{ isEditMode ? 'Modification...' : 'Création...' }}</span>
              </span>
              <span v-else>{{ isEditMode ? 'Modifier l\'item' : 'Créer l\'item' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de capture photo -->
    <CameraCapture
      v-if="showCamera"
      @captured="handlePhotoCaptured"
      @cancel="closeCamera"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { XMarkIcon, ChevronRightIcon, CameraIcon, QrCodeIcon } from '@heroicons/vue/24/outline'
import { useCategories } from '@/composables/useCategories'
import { useStatuses } from '@/composables/useStatuses'
import { useLocations } from '@/composables/useLocations'
import { useCreateMaterialModel } from '@/composables/useMaterialModels'
import { useCreateItem, useUpdateItem } from '@/composables/useItems'
import { useSetItemStatus } from '@/composables/useStatuses'
import { statusesApi } from '@/api/endpoints/statuses'
import { uploadsApi } from '@/api/endpoints/uploads'
import { useQuery } from '@tanstack/vue-query'
import { getCategoriesWithIndent } from '@/utils/categoryUtils'
import { getLocationsWithIndent } from '@/utils/locationUtils'
import CameraCapture from '@/components/CameraCapture.vue'
import EntityHistory from '@/components/EntityHistory.vue'
import type { CreateMaterialModelDto, CreateItemDto, Item, StatusGroup } from '@/types'
import { StatusGroup as StatusGroupEnum } from '@/types'

const props = defineProps<{
  item?: Item
}>()

const emit = defineEmits<{ (e: 'close'): void; (e: 'created'): void; (e: 'updated'): void }>()

// Mode édition
const isEditMode = computed(() => !!props.item)

// Queries
const { data: categories } = useCategories()
const { data: statuses } = useStatuses()
const { data: locations } = useLocations()

// Catégories avec indentation hiérarchique
const categoriesWithIndent = computed(() => getCategoriesWithIndent(categories.value))

// Emplacements avec indentation hiérarchique
const locationsWithIndent = computed(() => getLocationsWithIndent(locations.value))

// Récupérer les statuts actifs de l'item en mode édition
const itemId = computed(() => props.item?.id || '')
const { data: activeItemStatuses } = useQuery({
  queryKey: computed(() => ['item-statuses', 'active', itemId.value]),
  queryFn: () => statusesApi.getItemActiveStatus(itemId.value),
  enabled: computed(() => isEditMode.value && !!itemId.value),
})

// Groupes de statuts
const statusGroups = [
  { value: StatusGroupEnum.COMMERCIAL, label: 'Commercial' },
  { value: StatusGroupEnum.AUDIENCE, label: 'Audience' },
  { value: StatusGroupEnum.CONDITION, label: 'Condition' },
  { value: StatusGroupEnum.LIFECYCLE, label: 'Cycle de vie' },
]

// Fonction pour obtenir les statuts d'un groupe
const getStatusesByGroup = (group: StatusGroup) => {
  if (!statuses.value) return []
  return statuses.value
    .filter(s => s.group === group && s.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
}

// Mutations
const createModelMutation = useCreateMaterialModel()
const createItemMutation = useCreateItem()
const updateItemMutation = useUpdateItem()
const setItemStatusMutation = useSetItemStatus()

// État du formulaire
const currentStep = ref(1)
const showCamera = ref(false)
const cameraTarget = ref<'model' | 'item' | null>(null)
const isSubmitting = ref(false)

// Étapes du formulaire
const steps = [
  { id: 'model', name: 'Modèle' },
  { id: 'item', name: 'Item' },
  { id: 'photo', name: 'Photo' }
]

// Données du formulaire
const form = reactive({
  model: {
    name: '',
    categoryId: '',
    referenceFournisseur: '',
    description: ''
  } as CreateMaterialModelDto,
  item: {
    codeBarre: '',
    statusKey: '', // Gardé pour compatibilité avec l'API legacy
    statuses: {
      [StatusGroupEnum.COMMERCIAL]: '',
      [StatusGroupEnum.AUDIENCE]: '',
      [StatusGroupEnum.CONDITION]: '',
      [StatusGroupEnum.LIFECYCLE]: '',
    } as Record<StatusGroup, string>,
    locationId: ''
  } as Partial<CreateItemDto & { statuses: Record<StatusGroup, string> }>,
  photos: {
    model: null as { file: File; preview: string } | null,
    item: null as { file: File; preview: string } | null
  }
})

// Erreurs de validation
const errors = reactive({
  model: {
    name: '',
    categoryId: ''
  },
  item: {}
})

// Réinitialiser le formulaire en mode création
watch(() => props.item, (newItem, oldItem) => {
  if (!isEditMode.value && !newItem && oldItem) {
    // Réinitialiser le formulaire en mode création
    form.item.statuses = {
      [StatusGroupEnum.COMMERCIAL]: '',
      [StatusGroupEnum.AUDIENCE]: '',
      [StatusGroupEnum.CONDITION]: '',
      [StatusGroupEnum.LIFECYCLE]: '',
    }
    form.item.statusKey = ''
  }
})

// Initialiser le formulaire en mode édition
watch([() => props.item, activeItemStatuses, () => statuses.value], ([item, itemStatuses, statusList]) => {
  if (isEditMode.value && item) {
    // En mode édition, commencer à l'étape 2 (Item)
    currentStep.value = 2
    
    // Pré-remplir les informations de l'item
    form.item.codeBarre = item.codeBarre || ''
    form.item.locationId = item.locationId || ''
    
    // Initialiser tous les groupes à vide
    form.item.statuses = {
      [StatusGroupEnum.COMMERCIAL]: '',
      [StatusGroupEnum.AUDIENCE]: '',
      [StatusGroupEnum.CONDITION]: '',
      [StatusGroupEnum.LIFECYCLE]: '',
    }
    
    // Récupérer les statuts actifs par groupe
    if (itemStatuses && itemStatuses.length > 0) {
      itemStatuses.forEach(itemStatus => {
        if (itemStatus.status?.group && itemStatus.status?.key) {
          form.item.statuses[itemStatus.status.group] = itemStatus.status.key
        }
      })
      // Garder le premier statut pour compatibilité avec statusKey legacy
      const firstStatus = itemStatuses.find(is => is.status?.key)
      if (firstStatus?.status?.key) {
        form.item.statusKey = firstStatus.status.key
      }
    } else if (item.etat && statusList) {
      // Fallback sur l'état de l'item, mais seulement s'il existe dans la liste des statuts
      const matchingStatus = statusList.find(s => s.key === item.etat)
      if (matchingStatus) {
        form.item.statuses[matchingStatus.group] = item.etat
        form.item.statusKey = item.etat
      }
    }
  }
}, { immediate: true })

// Validation
const canProceed = computed(() => {
  if (currentStep.value === 1 && !isEditMode.value) {
    return form.model.name.trim() && form.model.categoryId
  }
  return true
})

// Navigation entre étapes
const nextStep = () => {
  if (currentStep.value < steps.length) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// Gestion des photos
const openCamera = (target: 'model' | 'item') => {
  cameraTarget.value = target
  showCamera.value = true
}

const closeCamera = () => {
  showCamera.value = false
  cameraTarget.value = null
}

const handlePhotoCaptured = (file: File) => {
  if (cameraTarget.value) {
    const preview = URL.createObjectURL(file)
    form.photos[cameraTarget.value] = { file, preview }
  }
  closeCamera()
}

const removePhoto = (target: 'model' | 'item') => {
  if (form.photos[target]?.preview) {
    URL.revokeObjectURL(form.photos[target].preview)
  }
  form.photos[target] = null
}

// Scan de code-barres (placeholder)
const handleScanCode = () => {
  // TODO: Implémenter le scan de code-barres
  alert('Fonctionnalité de scan à implémenter')
}

// Soumission du formulaire
const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
    if (isEditMode.value && props.item) {
      // MODE ÉDITION
      
      // 1. Mettre à jour l'item
      await updateItemMutation.mutateAsync({
        id: props.item.id,
        data: {
          locationId: form.item.locationId || undefined,
          codeBarre: form.item.codeBarre || undefined,
          etat: form.item.statusKey || undefined
        }
      })
      
      // 2. Uploader la nouvelle photo de l'item si présente
      if (form.photos.item) {
        await uploadsApi.uploadItemImage(props.item.id, form.photos.item.file)
      }
      
      // 3. Mettre à jour les statuts pour chaque groupe
      const currentStatusesByGroup: Record<StatusGroup, string> = {
        [StatusGroupEnum.COMMERCIAL]: '',
        [StatusGroupEnum.AUDIENCE]: '',
        [StatusGroupEnum.CONDITION]: '',
        [StatusGroupEnum.LIFECYCLE]: '',
      }
      
      // Récupérer les statuts actuels
      if (activeItemStatuses.value) {
        activeItemStatuses.value.forEach(itemStatus => {
          if (itemStatus.status?.group) {
            currentStatusesByGroup[itemStatus.status.group] = itemStatus.status.key || ''
          }
        })
      }
      
      // Définir ou mettre à jour chaque statut sélectionné
      for (const group of statusGroups) {
        const newStatusKey = form.item.statuses[group.value]?.trim() || ''
        const currentStatusKey = currentStatusesByGroup[group.value]
        
        // Vérifier que le statusKey est valide (existe dans la liste des statuts)
        const isValidStatusKey = newStatusKey && statuses.value?.some(s => s.key === newStatusKey)
        
        if (isValidStatusKey && newStatusKey !== currentStatusKey) {
          // Nouveau statut différent de l'actuel, le définir
          await setItemStatusMutation.mutateAsync({
            itemId: props.item.id,
            statusKey: newStatusKey
          })
        }
      }
      
      // Succès
      emit('updated')
      handleClose()
      
    } else {
      // MODE CRÉATION
      
      // 1. Créer le modèle
      const model = await createModelMutation.mutateAsync(form.model)
      
      // 2. Uploader la photo du modèle si présente
      if (form.photos.model) {
        await uploadsApi.uploadModelImage(model.id, form.photos.model.file)
      }
      
      // 3. Créer l'item
      // Déterminer le premier statut pour le champ legacy etat
      const firstStatusKey = Object.values(form.item.statuses).find(key => key.trim()) || ''
      const item = await createItemMutation.mutateAsync({
        modelId: model.id,
        locationId: form.item.locationId || undefined,
        codeBarre: form.item.codeBarre || undefined,
        etat: firstStatusKey || undefined
      })
      
      // 4. Uploader la photo de l'item si présente
      if (form.photos.item) {
        await uploadsApi.uploadItemImage(item.id, form.photos.item.file)
      }
      
      // 5. Définir tous les statuts sélectionnés
      for (const group of statusGroups) {
        const statusKey = form.item.statuses[group.value]?.trim()
        if (statusKey && statuses.value?.some(s => s.key === statusKey)) {
          await setItemStatusMutation.mutateAsync({
            itemId: item.id,
            statusKey: statusKey
          })
        }
      }
      
      // Succès
      emit('created')
      handleClose()
    }
    
  } catch (error) {
    console.error(`Erreur lors de ${isEditMode.value ? 'la modification' : 'la création'}:`, error)
    alert(`Erreur lors de ${isEditMode.value ? 'la modification' : 'la création'} de l'item. Veuillez réessayer.`)
  } finally {
    isSubmitting.value = false
  }
}

// Fermer le modal
const handleClose = () => {
  // Nettoyer les URLs des photos
  if (form.photos.model?.preview) {
    URL.revokeObjectURL(form.photos.model.preview)
  }
  if (form.photos.item?.preview) {
    URL.revokeObjectURL(form.photos.item.preview)
  }
  
  emit('close')
}

// Nettoyage à la fermeture
watch(() => showCamera.value, (newVal) => {
  if (!newVal) {
    cameraTarget.value = null
  }
})
</script>
