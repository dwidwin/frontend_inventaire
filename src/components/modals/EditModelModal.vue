<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">
            Modifier le modèle
          </h3>
          <button
            @click="handleClose"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Contenu -->
      <div class="px-6 py-4 overflow-y-auto max-h-[calc(95vh-180px)]">

        <form @submit.prevent="handleSubmit">
          <!-- Nom -->
          <div class="mb-4">
            <label for="name" class="form-label">
              Nom <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.name }"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
          </div>

          <!-- Catégories -->
          <div class="mb-4">
            <label class="form-label">
              Catégories <span class="text-red-500">*</span>
            </label>
            <div class="space-y-2">
              <div
                v-for="item in categoriesWithIndent"
                :key="item.category.id"
                class="flex items-center"
              >
                <input
                  :id="`category-${item.category.id}`"
                  type="checkbox"
                  :value="item.category.id"
                  v-model="form.categoryIds"
                  class="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  :for="`category-${item.category.id}`"
                  class="text-sm text-gray-900 cursor-pointer"
                >
                  {{ item.displayText }}
                </label>
              </div>
            </div>
            <p v-if="errors.categoryIds" class="mt-1 text-sm text-red-600">{{ errors.categoryIds }}</p>
          </div>

          <!-- Référence fournisseur -->
          <div class="mb-4">
            <label for="referenceFournisseur" class="form-label">
              Référence fournisseur
            </label>
            <input
              id="referenceFournisseur"
              v-model="form.referenceFournisseur"
              type="text"
              class="form-input"
            />
          </div>

          <!-- Description -->
          <div class="mb-4">
            <label for="description" class="form-label">
              Description
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              class="form-textarea"
            ></textarea>
          </div>

          <!-- Code barre -->
          <div class="mb-4">
            <label for="codeBarre" class="form-label">
              Code barre
            </label>
            <input
              id="codeBarre"
              v-model="form.codeBarre"
              type="text"
              class="form-input"
              placeholder="Ex: 1234567890123"
            />
          </div>

          <!-- Emplacement -->
          <div class="mb-4">
            <label for="locationId" class="form-label">
              Emplacement
            </label>
            <div v-if="isLoadingLocations" class="text-sm text-gray-500">
              Chargement des emplacements...
            </div>
            <select
              v-else
              id="locationId"
              v-model="form.locationId"
              class="form-select"
            >
              <option :value="undefined">Aucun emplacement</option>
              <option
                v-for="item in locationsWithIndent"
                :key="item.location.id"
                :value="item.location.id"
              >
                {{ item.displayText }}
              </option>
            </select>
          </div>

          <!-- État -->
          <div class="mb-4">
            <label for="etat" class="form-label">
              État
            </label>
            <div v-if="isLoadingStatuses" class="text-sm text-gray-500">
              Chargement des statuts...
            </div>
            <select
              v-else
              id="etat"
              v-model="form.etat"
              class="form-select"
            >
              <option
                v-for="status in lifecycleStatuses"
                :key="status.id"
                :value="status.key"
              >
                {{ status.label }}
              </option>
            </select>
            <p class="mt-1 text-sm text-gray-500">
              L'état peut aussi être modifié via les statuts
            </p>
          </div>

          <!-- Photo -->
          <div class="mb-4">
            <label class="form-label">
              Photo
            </label>
            <div v-if="currentPhotoUrl || photoPreview" class="mb-2">
              <img
                :src="photoPreview || currentPhotoUrl"
                alt="Photo actuelle"
                class="h-32 w-32 object-cover rounded-lg border border-gray-300"
              />
              <div class="mt-2 flex gap-2">
                <button
                  type="button"
                  @click="selectPhoto"
                  class="text-sm text-primary-600 hover:text-primary-800"
                >
                  Remplacer
                </button>
                <button
                  type="button"
                  @click="removePhoto"
                  class="text-sm text-red-600 hover:text-red-800"
                >
                  Supprimer
                </button>
              </div>
            </div>
            <div v-else class="flex items-center gap-2">
              <input
                ref="photoInputRef"
                type="file"
                accept="image/*"
                @change="handlePhotoSelect"
                class="hidden"
              />
              <button
                type="button"
                @click="selectPhoto"
                class="btn btn-secondary text-sm"
              >
                Sélectionner une photo
              </button>
            </div>
            <p class="mt-1 text-sm text-gray-500">
              Formats acceptés : JPG, PNG, WebP (max 5MB)
            </p>
          </div>

          <!-- Historique -->
          <EntityHistory :entity="model" />

          <!-- Erreurs -->
          <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              @click="handleClose"
              class="btn btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="btn btn-primary"
            >
              <span v-if="isSubmitting">Enregistrement...</span>
              <span v-else>Enregistrer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useUpdateMaterialModel, useMaterialModel } from '@/composables/useMaterialModels'
import { useCategories } from '@/composables/useCategories'
import { useLocations } from '@/composables/useLocations'
import { useStatuses } from '@/composables/useStatuses'
import { getCategoriesWithIndent } from '@/utils/categoryUtils'
import { getLocationsWithIndent } from '@/utils/locationUtils'
import { uploadsApi } from '@/api/endpoints/uploads'
import EntityHistory from '@/components/EntityHistory.vue'
import type { MaterialModel, UpdateMaterialModelDto, Status } from '@/types'
import { StatusGroup } from '@/types'

interface Props {
  model: MaterialModel
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  updated: []
}>()

const { data: categories } = useCategories()
const categoriesWithIndent = computed(() => getCategoriesWithIndent(categories.value))

const { data: locations, isLoading: isLoadingLocations } = useLocations()
const locationsWithIndent = computed(() => getLocationsWithIndent(locations.value))

const { data: statuses, isLoading: isLoadingStatuses } = useStatuses()
// Filtrer uniquement les statuts lifecycle actifs
const lifecycleStatuses = computed(() => {
  return (statuses.value || [])
    .filter((status: Status) => status.group === StatusGroup.LIFECYCLE && status.isActive !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
})

const updateModelMutation = useUpdateMaterialModel()

// Valeur par défaut : utiliser le premier statut lifecycle disponible ou l'état actuel du modèle
const defaultEtat = computed(() => {
  if (lifecycleStatuses.value && lifecycleStatuses.value.length > 0) {
    // Si l'état actuel du modèle correspond à une clé de statut lifecycle, l'utiliser
    const currentEtat = props.model.etat
    const matchingStatus = lifecycleStatuses.value.find(s => s.key === currentEtat)
    if (matchingStatus) {
      return matchingStatus.key
    }
    // Sinon, utiliser le premier statut disponible
    return lifecycleStatuses.value[0].key
  }
  return props.model.etat || 'en_stock'
})

const form = ref<UpdateMaterialModelDto>({
  name: props.model.name,
  categoryIds: props.model.categories?.map(c => c.id) || [],
  referenceFournisseur: props.model.referenceFournisseur || '',
  description: props.model.description || '',
  locationId: props.model.locationId || undefined,
  codeBarre: props.model.codeBarre || '',
  etat: props.model.etat || 'en_stock',
  photoUrl: props.model.photoUrl || undefined,
})

const photoInputRef = ref<HTMLInputElement | null>(null)
const selectedPhoto = ref<File | null>(null)
const photoPreview = ref<string | null>(null)
const currentPhotoUrl = computed(() => props.model.photoUrl)

const errors = ref<Record<string, string>>({})
const error = ref('')
const isSubmitting = ref(false)

// Mettre à jour le formulaire si le modèle change
watch(() => props.model, (newModel) => {
  if (newModel) {
    // Déterminer l'état à utiliser : si l'état actuel correspond à un statut lifecycle, l'utiliser
    let etatToUse = newModel.etat || 'en_stock'
    if (lifecycleStatuses.value && lifecycleStatuses.value.length > 0) {
      const matchingStatus = lifecycleStatuses.value.find(s => s.key === etatToUse)
      if (!matchingStatus && lifecycleStatuses.value.length > 0) {
        // Si l'état ne correspond à aucun statut lifecycle, utiliser le premier disponible
        etatToUse = lifecycleStatuses.value[0].key
      }
    }
    
    form.value = {
      name: newModel.name,
      categoryIds: newModel.categories?.map(c => c.id) || [],
      referenceFournisseur: newModel.referenceFournisseur || '',
      description: newModel.description || '',
      locationId: newModel.locationId || undefined,
      codeBarre: newModel.codeBarre || '',
      etat: etatToUse,
      photoUrl: newModel.photoUrl || undefined,
    }
    // Réinitialiser la photo sélectionnée
    selectedPhoto.value = null
    photoPreview.value = null
    if (photoInputRef.value) {
      photoInputRef.value.value = ''
    }
  }
}, { immediate: true })

// Mettre à jour l'état du formulaire quand les statuts lifecycle sont chargés
watch(lifecycleStatuses, (newStatuses) => {
  if (newStatuses && newStatuses.length > 0 && form.value.etat) {
    // Vérifier si l'état actuel correspond à un statut lifecycle valide
    const matchingStatus = newStatuses.find(s => s.key === form.value.etat)
    if (!matchingStatus) {
      // Si l'état ne correspond à aucun statut lifecycle, utiliser le premier disponible
      form.value.etat = newStatuses[0].key
    }
  }
}, { immediate: true })

const handleClose = () => {
  // Réinitialiser la photo sélectionnée
  selectedPhoto.value = null
  photoPreview.value = null
  if (photoInputRef.value) {
    photoInputRef.value.value = ''
  }
  emit('close')
}

const selectPhoto = () => {
  photoInputRef.value?.click()
}

const handlePhotoSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // Vérifier que c'est bien une image
    if (!file.type.startsWith('image/')) {
      error.value = 'Veuillez sélectionner un fichier image valide.'
      return
    }
    
    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      error.value = 'L\'image est trop volumineuse. Taille maximum : 5MB.'
      return
    }
    
    selectedPhoto.value = file
    
    // Créer une prévisualisation (ne pas modifier photoUrl ici, on le fera après l'upload)
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const removePhoto = () => {
  selectedPhoto.value = null
  photoPreview.value = null
  form.value.photoUrl = null // null pour supprimer la photo
  if (photoInputRef.value) {
    photoInputRef.value.value = ''
  }
}

const handleSubmit = async () => {
  errors.value = {}
  error.value = ''
  
  // Validation
  if (!form.value.name || !form.value.name.trim()) {
    errors.value.name = 'Le nom est requis'
    return
  }
  
  if (!form.value.categoryIds || form.value.categoryIds.length === 0) {
    errors.value.categoryIds = 'Au moins une catégorie est requise'
    return
  }

  isSubmitting.value = true

  try {
    // Préparer les données de mise à jour
    const updateData: UpdateMaterialModelDto = {
      name: form.value.name.trim(),
      categoryIds: form.value.categoryIds,
      referenceFournisseur: form.value.referenceFournisseur?.trim() || undefined,
      description: form.value.description?.trim() || undefined,
      locationId: form.value.locationId || undefined,
      codeBarre: form.value.codeBarre?.trim() || undefined,
      etat: form.value.etat,
    }
    
    // Gérer photoUrl : seulement si on veut supprimer (null) ou si on ne change rien (undefined)
    // Si une nouvelle photo est sélectionnée, on ne modifie pas photoUrl ici, l'upload se fera après
    if (!selectedPhoto.value && form.value.photoUrl !== undefined) {
      updateData.photoUrl = form.value.photoUrl || null
    }
    
    // Mettre à jour le modèle
    await updateModelMutation.mutateAsync({
      id: props.model.id,
      data: updateData,
    })
    
    // Upload de la photo si une nouvelle photo a été sélectionnée
    if (selectedPhoto.value) {
      try {
        await uploadsApi.uploadModelPhoto(props.model.id, selectedPhoto.value)
        // La photoUrl sera mise à jour automatiquement par le backend via l'upload
      } catch (uploadErr: any) {
        // Ne pas bloquer la modification si l'upload échoue
        console.error('Erreur lors de l\'upload de la photo:', uploadErr)
        error.value = 'Modèle modifié mais erreur lors de l\'upload de la photo: ' + (uploadErr?.response?.data?.message || uploadErr?.message || 'Erreur inconnue')
      }
    }
    
    emit('updated')
    handleClose()
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || 'Une erreur est survenue lors de la modification'
  } finally {
    isSubmitting.value = false
  }
}
</script>
