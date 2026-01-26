<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">
            Nouvelle affectation
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
      <div class="px-6 py-4 overflow-y-auto max-h-[calc(95vh-200px)]">
        <form @submit.prevent="handleSubmit">
          <!-- Sélection du modèle -->
          <div class="mb-6">
            <label for="modelId" class="form-label">
              Modèle <span class="text-red-500">*</span>
            </label>
            <div v-if="isLoadingModels" class="text-sm text-gray-500">
              Chargement des modèles...
            </div>
            <select
              v-else
              id="modelId"
              v-model="form.modelId"
              required
              class="form-input"
              @change="handleModelChange"
            >
              <option value="">Sélectionner un modèle</option>
              <option
                v-for="model in models"
                :key="model.id"
                :value="model.id"
              >
                {{ model.name || 'Sans nom' }} 
                <span v-if="model.codeBarre">({{ model.codeBarre }})</span>
              </option>
            </select>
          </div>

          <!-- Avertissement si affectation active -->
          <div v-if="hasActiveAssignment && form.modelId" class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 class="text-sm font-medium text-yellow-900 mb-2">Affectation active existante</h4>
            <div class="text-sm text-yellow-800">
              <div class="font-medium">
                Ce modèle a déjà une affectation active :
                {{ currentActiveAssignment?.user?.username || currentActiveAssignment?.team?.name }}
              </div>
              <div class="text-xs text-yellow-600 mt-1">
                Depuis le {{ formatDate(currentActiveAssignment?.startAt || '') }}
              </div>
              <p class="text-xs text-yellow-700 mt-2">
                Vous devez clôturer l'affectation active avant d'en créer une nouvelle.
              </p>
            </div>
          </div>

          <!-- Type d'affectation -->
          <div class="mb-6">
            <label class="form-label">
              Type d'affectation <span class="text-red-500">*</span>
            </label>
            <div class="flex space-x-4">
              <label class="flex items-center">
                <input
                  type="radio"
                  v-model="assignmentType"
                  value="user"
                  class="mr-2"
                  :disabled="hasActiveAssignment"
                />
                <span>Utilisateur</span>
              </label>
              <label class="flex items-center">
                <input
                  type="radio"
                  v-model="assignmentType"
                  value="team"
                  class="mr-2"
                  :disabled="hasActiveAssignment"
                />
                <span>Équipe</span>
              </label>
            </div>
          </div>

          <!-- Sélection utilisateur -->
          <div v-if="assignmentType === 'user'" class="mb-6">
            <label for="userId" class="form-label">
              Utilisateur <span class="text-red-500">*</span>
            </label>
            <div v-if="isLoadingUsers" class="text-sm text-gray-500">
              Chargement des utilisateurs...
            </div>
            <select
              v-else
              id="userId"
              v-model="form.userId"
              required
              class="form-input"
              :disabled="hasActiveAssignment"
            >
              <option value="">Sélectionner un utilisateur</option>
              <option
                v-for="user in users"
                :key="user.id"
                :value="user.id"
              >
                {{ user.username }} {{ user.email ? `(${user.email})` : '' }}
              </option>
            </select>
          </div>

          <!-- Sélection équipe -->
          <div v-if="assignmentType === 'team'" class="mb-6">
            <label for="teamId" class="form-label">
              Équipe <span class="text-red-500">*</span>
            </label>
            <div v-if="isLoadingTeams" class="text-sm text-gray-500">
              Chargement des équipes...
            </div>
            <select
              v-else
              id="teamId"
              v-model="form.teamId"
              required
              class="form-input"
              :disabled="hasActiveAssignment"
            >
              <option value="">Sélectionner une équipe</option>
              <option
                v-for="team in teams"
                :key="team.id"
                :value="team.id"
              >
                {{ team.name }}
              </option>
            </select>
          </div>

          <!-- Notes -->
          <div class="mb-6">
            <label for="notes" class="form-label">
              Notes (optionnel)
            </label>
            <textarea
              id="notes"
              v-model="form.notes"
              rows="3"
              class="form-input"
              placeholder="Ajoutez des notes sur cette affectation..."
              :disabled="hasActiveAssignment"
            />
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
              :disabled="!form.modelId || hasActiveAssignment || !assignmentType || (assignmentType === 'user' && !form.userId) || (assignmentType === 'team' && !form.teamId) || isSubmitting"
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
import { ref, computed } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useMaterialModels } from '@/composables/useMaterialModels'
import { useUsers } from '@/composables/useUsers'
import { useTeams } from '@/composables/useTeams'
import { useCreateAssignment } from '@/composables/useAssignments'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { assignmentsApi } from '@/api/endpoints/assignments'
import { formatDate } from '@/utils/formatDate'
import type { Assignment } from '@/types'

const emit = defineEmits<{
  close: []
  created: []
}>()

const queryClient = useQueryClient()

// État local - doit être défini avant les queries qui l'utilisent
const assignmentType = ref<'user' | 'team' | ''>('')
const form = ref({
  modelId: '',
  userId: '',
  teamId: '',
  notes: '',
})

// Queries
const { data: models, isLoading: isLoadingModels } = useMaterialModels()
const { data: usersResponse, isLoading: isLoadingUsers } = useUsers()
const { data: teams, isLoading: isLoadingTeams } = useTeams()

// Extraire le tableau d'utilisateurs de la réponse paginée
const users = computed(() => usersResponse.value?.data || [])

// Vérifier les affectations actives pour le modèle sélectionné
const modelId = computed(() => form.value.modelId)
const { data: modelAssignments } = useQuery({
  queryKey: ['assignments', 'model', modelId],
  queryFn: () => assignmentsApi.getByModel(modelId.value),
  enabled: computed(() => !!modelId.value),
})

const currentActiveAssignment = computed<Assignment | undefined>(() => {
  return modelAssignments.value?.find(a => !a.endAt)
})

const hasActiveAssignment = computed(() => {
  return !!currentActiveAssignment.value
})

const createAssignmentMutation = useCreateAssignment()

const error = ref('')
const isSubmitting = ref(false)

const handleModelChange = () => {
  // Réinitialiser les autres champs quand le modèle change
  assignmentType.value = ''
  form.value.userId = ''
  form.value.teamId = ''
  form.value.notes = ''
  error.value = ''
}

const handleClose = () => {
  // Réinitialiser le formulaire
  form.value = {
    modelId: '',
    userId: '',
    teamId: '',
    notes: '',
  }
  assignmentType.value = ''
  error.value = ''
  emit('close')
}

const handleSubmit = async () => {
  if (!form.value.modelId) {
    error.value = 'Veuillez sélectionner un modèle'
    return
  }

  if (hasActiveAssignment.value) {
    error.value = 'Ce modèle a déjà une affectation active. Veuillez la clôturer d\'abord.'
    return
  }

  if (!assignmentType.value) {
    error.value = 'Veuillez sélectionner un type d\'affectation'
    return
  }

  if (assignmentType.value === 'user' && !form.value.userId) {
    error.value = 'Veuillez sélectionner un utilisateur'
    return
  }

  if (assignmentType.value === 'team' && !form.value.teamId) {
    error.value = 'Veuillez sélectionner une équipe'
    return
  }

  error.value = ''
  isSubmitting.value = true

  try {
    await createAssignmentMutation.mutateAsync({
      modelId: form.value.modelId,
      userId: assignmentType.value === 'user' ? form.value.userId : undefined,
      teamId: assignmentType.value === 'team' ? form.value.teamId : undefined,
      notes: form.value.notes || undefined,
    })

    // Invalider les queries pour rafraîchir les données
    queryClient.invalidateQueries({ queryKey: ['assignments'] })
    queryClient.invalidateQueries({ queryKey: ['assignments', 'model', form.value.modelId] })
    queryClient.invalidateQueries({ queryKey: ['material-models', form.value.modelId] })

    emit('created')
    handleClose()
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || 'Une erreur est survenue'
  } finally {
    isSubmitting.value = false
  }
}
</script>

