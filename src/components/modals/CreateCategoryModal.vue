<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">
            {{ isEditMode ? 'Modifier la catégorie' : 'Créer une nouvelle catégorie' }}
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
          <!-- Nom de la catégorie -->
          <div>
            <label for="name" class="form-label">
              Nom de la catégorie <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.name }"
              placeholder="Ex: Textiles, Équipements sportifs..."
            />
            <p v-if="errors.name" class="form-error">{{ errors.name }}</p>
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="form-label">
              Description
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              class="form-textarea"
              placeholder="Description de la catégorie (optionnelle)..."
            ></textarea>
          </div>

          <!-- Catégorie parente -->
          <div>
            <label for="parentId" class="form-label">
              Catégorie parente
            </label>
            <select
              id="parentId"
              v-model="form.parentId"
              class="form-select"
            >
              <option value="">Aucune (catégorie racine)</option>
              <option
                v-for="category in availableParentCategories"
                :key="category.id"
                :value="category.id"
              >
                {{ getCategoryDisplayName(category) }}
              </option>
            </select>
            <p class="mt-1 text-sm text-gray-500">
              Laissez vide pour créer une catégorie racine, ou sélectionnez une catégorie existante pour créer une sous-catégorie.
            </p>
          </div>

          <!-- Aperçu de la hiérarchie -->
          <div v-if="form.parentId" class="p-3 bg-gray-50 rounded-lg">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Aperçu de la hiérarchie :</h4>
            <div class="text-sm text-gray-600">
              <div v-for="(parent, index) in getCategoryHierarchy(form.parentId)" :key="parent.id" class="flex items-center">
                <span v-if="index > 0" class="text-gray-400 mr-2">└─</span>
                <span v-else class="mr-2"></span>
                <span>{{ parent.name }}</span>
              </div>
              <div class="flex items-center mt-1">
                <span class="text-gray-400 mr-2">└─</span>
                <span class="font-medium text-primary-600">{{ form.name || 'Nouvelle catégorie' }}</span>
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
            <span v-else>{{ isEditMode ? 'Modifier la catégorie' : 'Crée la catégorie' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useCategories, useCreateCategory, useUpdateCategory } from '@/composables/useCategories'
import type { CreateCategoryDto, UpdateCategoryDto, Category } from '@/types'

// Props
const props = defineProps<{
  category?: Category // Catégorie à modifier (optionnelle)
}>()

const emit = defineEmits<{ 
  (e: 'close'): void
  (e: 'created'): void
  (e: 'updated'): void
}>()

// Queries
const { data: categories } = useCategories()

// Mutations
const createCategoryMutation = useCreateCategory()
const updateCategoryMutation = useUpdateCategory()

// État du formulaire
const isSubmitting = ref(false)

// Mode édition
const isEditMode = computed(() => !!props.category)

// Données du formulaire
const form = reactive<CreateCategoryDto>({
  name: '',
  description: '',
  parentId: ''
})

// Pré-remplir le formulaire en mode édition
const initializeForm = () => {
  if (props.category) {
    form.name = props.category.name
    form.description = props.category.description || ''
    // Résoudre le parentId soit via parent.id direct, soit via la liste complète
    const resolvedParentId =
      props.category.parent?.id ||
      (categories.value?.find((c) => c.id === props.category!.id)?.parent?.id ?? '')
    form.parentId = resolvedParentId || ''
  } else {
    form.name = ''
    form.description = ''
    form.parentId = ''
  }
}

// Initialiser le formulaire au montage et quand la catégorie change
onMounted(() => {
  initializeForm()
})

watch(() => props.category, () => {
  initializeForm()
}, { immediate: true })

// Réinitialiser le formulaire quand les catégories sont chargées (pour s'assurer que parentId est correctement sélectionné)
watch(() => categories.value, () => {
  if (categories.value && props.category) {
    // Réinitialiser seulement le parentId pour s'assurer qu'il est correctement sélectionné
    // L'API renvoie parent.id au lieu de parentId; résoudre via la liste si nécessaire
    const resolvedParentId =
      props.category.parent?.id ||
      (categories.value.find((c) => c.id === props.category!.id)?.parent?.id ?? '')
    form.parentId = resolvedParentId || ''
    console.log('Catégorie parente sélectionnée:', form.parentId || '<empty string>', 'pour la catégorie:', props.category.name)
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

// Catégories disponibles comme parents (exclut les catégories qui auraient déjà 2 niveaux de profondeur)
const availableParentCategories = computed(() => {
  if (!categories.value) return []
  
  // Fonction pour calculer la profondeur d'une catégorie
  const getCategoryDepth = (category: Category, allCategories: Category[]): number => {
    if (!category.parentId) return 0
    const parent = allCategories.find(c => c.id === category.parentId)
    return parent ? 1 + getCategoryDepth(parent, allCategories) : 0
  }
  
  return categories.value.filter(category => {
    const depth = getCategoryDepth(category, categories.value!)
    return depth < 2 // Limite à 2 niveaux de profondeur maximum
  })
})

// Fonction pour obtenir le nom d'affichage d'une catégorie avec sa hiérarchie
const getCategoryDisplayName = (category: Category): string => {
  if (!category.parentId) return category.name
  
  const parent = categories.value?.find(c => c.id === category.parentId)
  if (parent) {
    return `${parent.name} → ${category.name}`
  }
  
  return category.name
}

// Fonction pour obtenir la hiérarchie complète d'une catégorie
const getCategoryHierarchy = (categoryId: string): Category[] => {
  if (!categories.value) return []
  
  const hierarchy: Category[] = []
  let currentId = categoryId
  
  while (currentId) {
    const category = categories.value.find(c => c.id === currentId)
    if (!category) break
    
    hierarchy.unshift(category)
    currentId = category.parentId || ''
  }
  
  return hierarchy
}

// Validation en temps réel
const validateForm = () => {
  errors.name = ''
  
  if (!form.name.trim()) {
    errors.name = 'Le nom de la catégorie est obligatoire'
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
    if (isEditMode.value && props.category) {
      // Mode édition
      const updateData: UpdateCategoryDto = {
        name: form.name.trim(),
        description: form.description.trim(),
        parentId: form.parentId || null
      }
      
      // Debug: Afficher les données envoyées
      console.log('Données de mise à jour envoyées:', updateData)
      
      await updateCategoryMutation.mutateAsync({
        id: props.category.id,
        data: updateData
      })
      
      emit('updated')
    } else {
      // Mode création
      const categoryData: CreateCategoryDto = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        parentId: form.parentId || undefined
      }
      
      await createCategoryMutation.mutateAsync(categoryData)
      
      emit('created')
    }
    
    handleClose()
    
  } catch (error) {
    console.error(`Erreur lors de la ${isEditMode.value ? 'modification' : 'création'} de la catégorie:`, error)
    alert(`Erreur lors de la ${isEditMode.value ? 'modification' : 'création'} de la catégorie. Veuillez réessayer.`)
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
