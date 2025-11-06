<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[95vh] overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">
            Modifier l'utilisateur
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
          <!-- Nom d'utilisateur -->
          <div class="mb-4">
            <label for="username" class="form-label">
              Nom d'utilisateur <span class="text-red-500">*</span>
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.username }"
            />
            <p v-if="errors.username" class="mt-1 text-sm text-red-600">{{ errors.username }}</p>
          </div>

          <!-- Email -->
          <div class="mb-4">
            <label for="email" class="form-label">
              Email <span class="text-red-500">*</span>
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.email }"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>

          <!-- Rôle -->
          <div class="mb-4">
            <label for="role" class="form-label">
              Rôle <span class="text-red-500">*</span>
            </label>
            <select
              id="role"
              v-model="form.role"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.role }"
            >
              <option value="">Sélectionner un rôle</option>
              <option value="USER">Utilisateur</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Administrateur</option>
            </select>
            <p v-if="errors.role" class="mt-1 text-sm text-red-600">{{ errors.role }}</p>
          </div>

          <!-- Statut actif -->
          <div class="mb-6">
            <label class="flex items-center">
              <input
                v-model="form.isActive"
                type="checkbox"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="ml-2 text-sm text-gray-900">Utilisateur actif</span>
            </label>
            <p class="mt-1 text-xs text-gray-500">
              Les utilisateurs inactifs ne peuvent pas se connecter
            </p>
          </div>

          <!-- Historique -->
          <div v-if="user" class="mt-6 pt-6 border-t border-gray-200">
            <h4 class="text-sm font-medium text-gray-900 mb-4">Historique</h4>
            <div class="space-y-3">
              <!-- Création -->
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <PlusIcon class="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">Créé</p>
                  <p class="text-sm text-gray-600">
                    <span v-if="user.createdAt">
                      le <span class="font-medium">{{ formatDateTime(user.createdAt) }}</span>
                    </span>
                    <span v-else class="text-gray-400">Date inconnue</span>
                  </p>
                </div>
              </div>

              <!-- Modification -->
              <div v-if="user.updatedAt && user.updatedAt !== user.createdAt" class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <PencilIcon class="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">Modifié</p>
                  <p class="text-sm text-gray-600">
                    <span v-if="user.updatedAt">
                      le <span class="font-medium">{{ formatDateTime(user.updatedAt) }}</span>
                    </span>
                    <span v-else class="text-gray-400">Date inconnue</span>
                  </p>
                </div>
              </div>
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
import { ref, watch } from 'vue'
import { XMarkIcon, PlusIcon, PencilIcon } from '@heroicons/vue/24/outline'
import { useUpdateUser } from '@/composables/useUsers'
import { formatDateTime } from '@/utils/formatDate'
import type { User, UpdateUserDto } from '@/types'

interface Props {
  user: User
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  updated: []
}>()

const updateUserMutation = useUpdateUser()

const form = ref<UpdateUserDto>({
  username: props.user.username,
  email: props.user.email,
  role: props.user.role,
  isActive: props.user.isActive,
})

const errors = ref<Record<string, string>>({})
const error = ref('')
const isSubmitting = ref(false)

// Mettre à jour le formulaire si l'utilisateur change
watch(() => props.user, (newUser) => {
  if (newUser) {
    form.value = {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      isActive: newUser.isActive,
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
  if (!form.value.username || !form.value.username.trim()) {
    errors.value.username = 'Le nom d\'utilisateur est requis'
    return
  }
  
  if (!form.value.email || !form.value.email.trim()) {
    errors.value.email = 'L\'email est requis'
    return
  }
  
  if (!form.value.role) {
    errors.value.role = 'Le rôle est requis'
    return
  }

  isSubmitting.value = true

  try {
    await updateUserMutation.mutateAsync({
      id: props.user.id,
      data: {
        username: form.value.username.trim(),
        email: form.value.email.trim(),
        role: form.value.role?.toLowerCase() as 'user' | 'manager' | 'admin',
        isActive: form.value.isActive,
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

