<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">
            Nouvelle vente
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
          <!-- Contrepartie -->
          <div class="mb-6">
            <label class="form-label">
              Contrepartie <span class="text-red-500">*</span>
            </label>
            <div class="flex space-x-4 mb-4">
              <label class="flex items-center">
                <input
                  v-model="counterpartyType"
                  type="radio"
                  value="user"
                  class="mr-2"
                />
                <span>Utilisateur</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="counterpartyType"
                  type="radio"
                  value="team"
                  class="mr-2"
                />
                <span>Équipe</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="counterpartyType"
                  type="radio"
                  value="external"
                  class="mr-2"
                />
                <span>Externe</span>
              </label>
            </div>

            <div v-if="counterpartyType === 'user'" class="mt-2">
              <div v-if="isLoadingUsers" class="text-sm text-gray-500">
                Chargement des utilisateurs...
              </div>
              <select
                v-else
                v-model="form.userId"
                class="form-input"
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
            <div v-else-if="counterpartyType === 'team'" class="mt-2">
              <div v-if="isLoadingTeams" class="text-sm text-gray-500">
                Chargement des équipes...
              </div>
              <select
                v-else
                v-model="form.teamId"
                class="form-input"
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
            <div v-else-if="counterpartyType === 'external'" class="mt-2">
              <input
                v-model="form.externalName"
                type="text"
                class="form-input"
                placeholder="Nom du client externe"
              />
            </div>
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
              placeholder="Notes sur cette vente..."
            />
          </div>

          <!-- Lignes modèles -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <label class="form-label mb-0">
                Modèles <span class="text-red-500">*</span>
              </label>
              <button
                type="button"
                @click="addModelLine"
                class="btn btn-secondary text-sm"
              >
                Ajouter une ligne
              </button>
            </div>
            <div
              v-for="(line, index) in modelLines"
              :key="index"
              class="flex flex-wrap items-end gap-3 mb-3 p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex-1 min-w-[140px]">
                <select
                  v-model="line.modelId"
                  class="form-input"
                  required
                >
                  <option value="">Modèle</option>
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
              <div class="w-24">
                <input
                  v-model.number="line.unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-input"
                  placeholder="Prix"
                />
              </div>
              <button
                type="button"
                @click="removeModelLine(index)"
                class="btn btn-secondary p-2"
                :disabled="modelLines.length <= 1"
                title="Supprimer la ligne"
              >
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
            <div v-if="isLoadingModels" class="text-sm text-gray-500">
              Chargement des modèles...
            </div>
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
              :disabled="!canSubmit || isSubmitting"
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
import { XMarkIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { useMaterialModels } from '@/composables/useMaterialModels'
import { useUsers } from '@/composables/useUsers'
import { useTeams } from '@/composables/useTeams'
import { useCreateSale } from '@/composables/useTransactions'
import { useQueryClient } from '@tanstack/vue-query'
import type { CreateSaleDto } from '@/types'

const emit = defineEmits<{
  close: []
  created: []
}>()

const queryClient = useQueryClient()

const counterpartyType = ref<'user' | 'team' | 'external'>('user')
const form = ref({
  userId: '',
  teamId: '',
  externalName: '',
  notes: '',
})

const modelLines = ref<{ modelId: string; unitPrice?: number }[]>([
  { modelId: '', unitPrice: undefined },
])

// Queries
const { data: modelsResponse, isLoading: isLoadingModels } = useMaterialModels()
const { data: usersResponse, isLoading: isLoadingUsers } = useUsers()
const { data: teams, isLoading: isLoadingTeams } = useTeams()

const models = computed(() => modelsResponse.value?.data || [])
const users = computed(() => usersResponse.value?.data || [])

const createSaleMutation = useCreateSale()
const error = ref('')
const isSubmitting = ref(false)

const hasCounterparty = computed(() => {
  if (counterpartyType.value === 'user') return !!form.value.userId
  if (counterpartyType.value === 'team') return !!form.value.teamId
  if (counterpartyType.value === 'external') return !!form.value.externalName?.trim()
  return false
})

const hasValidModels = computed(() => {
  return modelLines.value.some((line) => !!line.modelId?.trim())
})

const canSubmit = computed(() => {
  return hasCounterparty.value && hasValidModels.value
})

function addModelLine() {
  modelLines.value.push({ modelId: '', unitPrice: undefined })
}

function removeModelLine(index: number) {
  if (modelLines.value.length <= 1) return
  modelLines.value.splice(index, 1)
}

const handleClose = () => {
  counterpartyType.value = 'user'
  form.value = {
    userId: '',
    teamId: '',
    externalName: '',
    notes: '',
  }
  modelLines.value = [{ modelId: '', unitPrice: undefined }]
  error.value = ''
  emit('close')
}

const handleSubmit = async () => {
  if (!hasCounterparty.value) {
    error.value = 'Veuillez renseigner la contrepartie (utilisateur, équipe ou nom externe).'
    return
  }
  if (!hasValidModels.value) {
    error.value = 'Veuillez ajouter au moins un modèle.'
    return
  }

  const payload: CreateSaleDto = {
    userId: counterpartyType.value === 'user' ? form.value.userId || undefined : undefined,
    teamId: counterpartyType.value === 'team' ? form.value.teamId || undefined : undefined,
    externalName: counterpartyType.value === 'external' ? form.value.externalName?.trim() || undefined : undefined,
    notes: form.value.notes?.trim() || undefined,
    models: modelLines.value
      .filter((line) => line.modelId?.trim())
      .map((line) => ({
        modelId: line.modelId,
        unitPrice: line.unitPrice != null && !Number.isNaN(line.unitPrice) ? line.unitPrice : undefined,
      })),
  }

  if (payload.models.length === 0) {
    error.value = 'Veuillez sélectionner au moins un modèle.'
    return
  }

  error.value = ''
  isSubmitting.value = true

  try {
    const transaction = await createSaleMutation.mutateAsync(payload)

    // Invalider l'historique des modèles concernés
    const lines = transaction?.lines || []
    for (const line of lines) {
      const modelId = (line as { modelId?: string; model?: { id: string } }).modelId ?? (line as { model?: { id: string } }).model?.id
      if (modelId) {
        queryClient.invalidateQueries({ queryKey: ['material-models', modelId, 'history'] })
      }
    }

    emit('created')
    handleClose()
  } catch (err: unknown) {
    const message = err && typeof err === 'object' && 'response' in err
      ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
      : err instanceof Error
        ? err.message
        : 'Une erreur est survenue'
    error.value = message || 'Une erreur est survenue'
  } finally {
    isSubmitting.value = false
  }
}
</script>
