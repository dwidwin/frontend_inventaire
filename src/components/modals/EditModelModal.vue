<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[95vh] overflow-hidden">
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

          <!-- Catégorie -->
          <div class="mb-4">
            <label for="categoryId" class="form-label">
              Catégorie <span class="text-red-500">*</span>
            </label>
            <select
              id="categoryId"
              v-model="form.categoryId"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.categoryId }"
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
            <p v-if="errors.categoryId" class="mt-1 text-sm text-red-600">{{ errors.categoryId }}</p>
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
import { useUpdateMaterialModel } from '@/composables/useMaterialModels'
import { useCategories } from '@/composables/useCategories'
import { getCategoriesWithIndent } from '@/utils/categoryUtils'
import EntityHistory from '@/components/EntityHistory.vue'
import type { MaterialModel, UpdateMaterialModelDto } from '@/types'

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

const updateModelMutation = useUpdateMaterialModel()

const form = ref<UpdateMaterialModelDto>({
  name: props.model.name,
  categoryId: props.model.categoryId,
  referenceFournisseur: props.model.referenceFournisseur || '',
  description: props.model.description || '',
})

const errors = ref<Record<string, string>>({})
const error = ref('')
const isSubmitting = ref(false)

// Mettre à jour le formulaire si le modèle change
watch(() => props.model, (newModel) => {
  if (newModel) {
    form.value = {
      name: newModel.name,
      categoryId: newModel.categoryId,
      referenceFournisseur: newModel.referenceFournisseur || '',
      description: newModel.description || '',
    }
  }
}, { immediate: true })

const handleClose = () => {
  emit('close')
}

const handleSubmit = async () => {
  errors.value = {}
  error.value = ''
  
  // Validation
  if (!form.value.name || !form.value.name.trim()) {
    errors.value.name = 'Le nom est requis'
    return
  }
  
  if (!form.value.categoryId) {
    errors.value.categoryId = 'La catégorie est requise'
    return
  }

  isSubmitting.value = true

  try {
    await updateModelMutation.mutateAsync({
      id: props.model.id,
      data: {
        name: form.value.name.trim(),
        categoryId: form.value.categoryId,
        referenceFournisseur: form.value.referenceFournisseur?.trim() || undefined,
        description: form.value.description?.trim() || undefined,
      },
    })
    emit('updated')
    handleClose()
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || 'Une erreur est survenue lors de la modification'
  } finally {
    isSubmitting.value = false
  }
}
</script>
