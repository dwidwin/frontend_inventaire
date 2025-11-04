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

            <!-- Statut -->
            <div>
              <label for="statusKey" class="form-label">
                Statut
              </label>
              <select
                id="statusKey"
                v-model="form.item.statusKey"
                class="form-select"
              >
                <option value="">Sélectionner un statut</option>
                <option
                  v-for="status in statuses"
                  :key="status.id"
                  :value="status.key"
                >
                  {{ status.label }}
                </option>
              </select>
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
import type { CreateMaterialModelDto, CreateItemDto, Item } from '@/types'

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

// Récupérer le statut actif de l'item en mode édition
const itemId = computed(() => props.item?.id || '')
const { data: activeItemStatus } = useQuery({
  queryKey: computed(() => ['item-statuses', 'active', itemId.value]),
  queryFn: () => statusesApi.getItemActiveStatus(itemId.value),
  enabled: computed(() => isEditMode.value && !!itemId.value),
})

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
    statusKey: '',
    locationId: ''
  } as Partial<CreateItemDto>,
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

// Initialiser le formulaire en mode édition
watch([() => props.item, activeItemStatus, () => statuses.value], ([item, status, statusList]) => {
  if (isEditMode.value && item) {
    // En mode édition, commencer à l'étape 2 (Item)
    currentStep.value = 2
    
    // Pré-remplir les informations de l'item
    form.item.codeBarre = item.codeBarre || ''
    form.item.locationId = item.locationId || ''
    
    // Récupérer le statut actif si disponible
    if (status?.status?.key) {
      form.item.statusKey = status.status.key
    } else if (item.etat && statusList) {
      // Fallback sur l'état de l'item, mais seulement s'il existe dans la liste des statuts
      const matchingStatus = statusList.find(s => s.key === item.etat)
      if (matchingStatus) {
        form.item.statusKey = item.etat
      } else {
        form.item.statusKey = ''
      }
    } else {
      form.item.statusKey = ''
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
      
      // 3. Mettre à jour le statut si modifié et valide
      const currentStatusKey = activeItemStatus.value?.status?.key
      const newStatusKey = form.item.statusKey?.trim() || ''
      
      // Vérifier que le statusKey est valide (existe dans la liste des statuts)
      const isValidStatusKey = newStatusKey && statuses.value?.some(s => s.key === newStatusKey)
      
      // Mettre à jour le statut seulement si :
      // - Le nouveau statut est valide ET différent du statut actuel
      // - OU si on passe d'un statut à aucun statut (mais on ne peut pas faire ça avec l'API actuelle)
      if (isValidStatusKey && newStatusKey !== currentStatusKey) {
        await setItemStatusMutation.mutateAsync({
          itemId: props.item.id,
          statusKey: newStatusKey
        })
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
      const item = await createItemMutation.mutateAsync({
        modelId: model.id,
        locationId: form.item.locationId || undefined,
        codeBarre: form.item.codeBarre || undefined,
        etat: form.item.statusKey || undefined
      })
      
      // 4. Uploader la photo de l'item si présente
      if (form.photos.item) {
        await uploadsApi.uploadItemImage(item.id, form.photos.item.file)
      }
      
      // 5. Définir le statut si sélectionné
      if (form.item.statusKey) {
        await setItemStatusMutation.mutateAsync({
          itemId: item.id,
          statusKey: form.item.statusKey
        })
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
