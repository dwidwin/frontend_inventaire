<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">
            {{ isEditMode ? 'Modifier l\'équipe' : 'Créer une nouvelle équipe' }}
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
          <!-- Nom de l'équipe -->
          <div>
            <label for="name" class="form-label">
              Nom de l'équipe <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.name }"
              placeholder="Ex: Senior N2, U13..."
            />
            <p v-if="errors.name" class="form-error">{{ errors.name }}</p>
            <p class="mt-1 text-sm text-gray-500">
              Le nom de l'équipe doit être unique.
            </p>
          </div>

          <!-- Catégorie d'âge -->
          <div>
            <label for="categoryAge" class="form-label">
              Catégorie d'âge
            </label>
            <input
              id="categoryAge"
              v-model="form.categoryAge"
              type="text"
              class="form-input"
              placeholder="Ex: U13, U15, Senior..."
            />
            <p class="mt-1 text-sm text-gray-500">
              Catégorie d'âge de l'équipe (optionnel).
            </p>
          </div>

          <!-- Niveau -->
          <div>
            <label for="level" class="form-label">
              Niveau
            </label>
            <input
              id="level"
              v-model="form.level"
              type="text"
              class="form-input"
              placeholder="Ex: N2, N3, Régional..."
            />
            <p class="mt-1 text-sm text-gray-500">
              Niveau de compétition de l'équipe (optionnel).
            </p>
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
            <span v-else>{{ isEditMode ? 'Modifier l\'équipe' : 'Créer l\'équipe' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useCreateTeam, useUpdateTeam } from '@/composables/useTeams'
import type { CreateTeamDto, UpdateTeamDto, Team } from '@/types'

// Props
const props = defineProps<{
  team?: Team // Équipe à modifier (optionnel)
}>()

const emit = defineEmits<{ 
  (e: 'close'): void
  (e: 'created'): void
  (e: 'updated'): void
}>()

// Mutations
const createTeamMutation = useCreateTeam()
const updateTeamMutation = useUpdateTeam()

// État du formulaire
const isSubmitting = ref(false)

// Mode édition
const isEditMode = computed(() => !!props.team)

// Données du formulaire
const form = reactive<CreateTeamDto>({
  name: '',
  categoryAge: '',
  level: ''
})

// Pré-remplir le formulaire en mode édition
const initializeForm = () => {
  if (props.team) {
    form.name = props.team.name
    form.categoryAge = props.team.categoryAge || ''
    form.level = props.team.level || ''
  } else {
    form.name = ''
    form.categoryAge = ''
    form.level = ''
  }
}

// Initialiser le formulaire au montage et quand l'équipe change
onMounted(() => {
  initializeForm()
})

watch(() => props.team, () => {
  initializeForm()
}, { immediate: true })

// Erreurs de validation
const errors = reactive({
  name: ''
})

// Validation
const canSubmit = computed(() => {
  return form.name.trim().length > 0 && !isSubmitting.value
})

// Validation en temps réel
const validateForm = () => {
  errors.name = ''
  
  if (!form.name.trim()) {
    errors.name = 'Le nom de l\'équipe est obligatoire'
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
    if (isEditMode.value && props.team) {
      // Mode édition
      const updateData: UpdateTeamDto = {
        name: form.name.trim(),
        categoryAge: form.categoryAge?.trim() || undefined,
        level: form.level?.trim() || undefined
      }
      
      await updateTeamMutation.mutateAsync({
        id: props.team.id,
        data: updateData
      })
      
      emit('updated')
    } else {
      // Mode création
      const teamData: CreateTeamDto = {
        name: form.name.trim(),
        categoryAge: form.categoryAge?.trim() || undefined,
        level: form.level?.trim() || undefined
      }
      
      await createTeamMutation.mutateAsync(teamData)
      
      emit('created')
    }
    
    handleClose()
    
  } catch (error) {
    console.error(`Erreur lors de la ${isEditMode.value ? 'modification' : 'création'} de l'équipe:`, error)
    alert(`Erreur lors de la ${isEditMode.value ? 'modification' : 'création'} de l'équipe. Veuillez réessayer.`)
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



