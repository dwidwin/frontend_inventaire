<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">
            Créer un nouveau modèle
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
            <div v-if="isLoadingCategories" class="text-sm text-gray-500">
              Chargement des catégories...
            </div>
            <div v-else class="space-y-2 max-h-48 overflow-y-auto">
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
              État initial
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
              L'état peut être modifié après la création via les statuts
            </p>
          </div>

          <!-- Photo -->
          <div class="mb-4">
            <label class="form-label">
              Photo
            </label>
            <div v-if="photoPreview" class="mb-2">
              <img
                :src="photoPreview"
                alt="Aperçu"
                class="h-32 w-32 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                @click="removePhoto"
                class="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Supprimer la photo
              </button>
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
              <span v-if="isSubmitting">Création...</span>
              <span v-else>Créer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useCreateMaterialModel } from '@/composables/useMaterialModels'
import { useCategories } from '@/composables/useCategories'
import { useLocations } from '@/composables/useLocations'
import { useStatuses } from '@/composables/useStatuses'
import { getCategoriesWithIndent } from '@/utils/categoryUtils'
import { getLocationsWithIndent } from '@/utils/locationUtils'
import { uploadsApi } from '@/api/endpoints/uploads'
import type { CreateMaterialModelDto, Status } from '@/types'
import { StatusGroup } from '@/types'

const emit = defineEmits<{
  close: []
  created: []
}>()

const { data: categories, isLoading: isLoadingCategories } = useCategories()
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

const createModelMutation = useCreateMaterialModel()

// Valeur par défaut : utiliser le premier statut lifecycle disponible ou 'en_stock'
const defaultEtat = computed(() => {
  if (lifecycleStatuses.value && lifecycleStatuses.value.length > 0) {
    return lifecycleStatuses.value[0].key
  }
  return 'en_stock'
})

const form = reactive<CreateMaterialModelDto>({
  name: '',
  categoryIds: [],
  referenceFournisseur: '',
  description: '',
  codeBarre: '',
  locationId: undefined,
  etat: 'en_stock', // Sera mis à jour par le watch
  photoUrl: undefined,
})

// Mettre à jour la valeur par défaut quand les statuts sont chargés
watch(defaultEtat, (newDefault) => {
  if (newDefault && !form.etat) {
    form.etat = newDefault
  }
}, { immediate: true })

const photoInputRef = ref<HTMLInputElement | null>(null)
const selectedPhoto = ref<File | null>(null)
const photoPreview = ref<string | null>(null)

const errors = ref<Record<string, string>>({})
const error = ref('')
const isSubmitting = ref(false)

const handleClose = () => {
  // Réinitialiser le formulaire
  form.name = ''
  form.categoryIds = []
  form.referenceFournisseur = ''
  form.description = ''
  form.codeBarre = ''
  form.locationId = undefined
  form.etat = 'en_stock'
  form.photoUrl = undefined
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
    
    // Créer une prévisualisation
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
  if (photoInputRef.value) {
    photoInputRef.value.value = ''
  }
}

const handleSubmit = async () => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/f9f79d86-6216-40ab-95f0-ad8db2c270f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CreateModelModal.vue:handleSubmit',message:'handleSubmit appelé',data:{form:JSON.stringify(form)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  errors.value = {}
  error.value = ''
  
  // Validation
  if (!form.name || !form.name.trim()) {
    errors.value.name = 'Le nom est requis'
    return
  }
  
  if (!form.categoryIds || form.categoryIds.length === 0) {
    errors.value.categoryIds = 'Au moins une catégorie est requise'
    return
  }

  isSubmitting.value = true

  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f9f79d86-6216-40ab-95f0-ad8db2c270f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CreateModelModal.vue:handleSubmit',message:'Avant mutation create',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // Créer le modèle
    const createdModel = await createModelMutation.mutateAsync({
      name: form.name.trim(),
      categoryIds: form.categoryIds,
      referenceFournisseur: form.referenceFournisseur?.trim() || undefined,
      description: form.description?.trim() || undefined,
      codeBarre: form.codeBarre?.trim() || undefined,
      locationId: form.locationId || undefined,
      etat: form.etat || 'en_stock',
      photoUrl: form.photoUrl || undefined,
    })
    
    // Upload de la photo si une photo a été sélectionnée
    if (selectedPhoto.value && createdModel.id) {
      try {
        await uploadsApi.uploadModelPhoto(createdModel.id, selectedPhoto.value)
      } catch (uploadErr: any) {
        // Ne pas bloquer la création si l'upload échoue
        console.error('Erreur lors de l\'upload de la photo:', uploadErr)
        error.value = 'Modèle créé mais erreur lors de l\'upload de la photo: ' + (uploadErr?.response?.data?.message || uploadErr?.message || 'Erreur inconnue')
      }
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f9f79d86-6216-40ab-95f0-ad8db2c270f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CreateModelModal.vue:handleSubmit',message:'Après mutation create réussie',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    emit('created')
    handleClose()
  } catch (err: any) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f9f79d86-6216-40ab-95f0-ad8db2c270f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CreateModelModal.vue:handleSubmit',message:'Erreur lors de la création',data:{error:err?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    error.value = err?.response?.data?.message || err?.message || 'Une erreur est survenue lors de la création'
  } finally {
    isSubmitting.value = false
  }
}
</script>


