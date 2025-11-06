<template>
  <div class="mt-8 space-y-6">
    <form @submit.prevent="handleSubmit">
      <div class="rounded-md shadow-sm space-y-4">
        <div>
          <label for="username" class="sr-only">Nom d'utilisateur</label>
          <input
            id="username"
            v-model="form.username"
            name="username"
            type="text"
            required
            class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
            placeholder="Nom d'utilisateur"
            :class="{ 'border-danger-500': errors.username }"
          />
          <p v-if="errors.username" class="mt-1 text-sm text-danger-600">
            {{ errors.username }}
          </p>
        </div>

        <div>
          <label for="email" class="sr-only">Adresse email</label>
          <input
            id="email"
            v-model="form.email"
            name="email"
            type="email"
            required
            class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
            placeholder="Adresse email"
            :class="{ 'border-danger-500': errors.email }"
          />
          <p v-if="errors.email" class="mt-1 text-sm text-danger-600">
            {{ errors.email }}
          </p>
        </div>

        <div>
          <label for="password" class="sr-only">Mot de passe</label>
          <input
            id="password"
            v-model="form.password"
            name="password"
            type="password"
            required
            class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
            placeholder="Mot de passe"
            :class="{ 'border-danger-500': errors.password }"
          />
          <p v-if="errors.password" class="mt-1 text-sm text-danger-600">
            {{ errors.password }}
          </p>
          <p class="mt-1 text-xs text-gray-500">
            Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.
          </p>
        </div>

        <div>
          <label for="confirmPassword" class="sr-only">Confirmer le mot de passe</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            name="confirmPassword"
            type="password"
            required
            class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
            placeholder="Confirmer le mot de passe"
            :class="{ 'border-danger-500': errors.confirmPassword }"
          />
          <p v-if="errors.confirmPassword" class="mt-1 text-sm text-danger-600">
            {{ errors.confirmPassword }}
          </p>
        </div>
      </div>

      <div v-if="errorMessage" class="rounded-md bg-danger-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-danger-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-danger-800">
              Erreur
            </h3>
            <div class="mt-2 text-sm text-danger-700">
              {{ errorMessage }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="successMessage" class="rounded-md bg-success-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-success-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-success-800">
              {{ successMessage }}
            </p>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <button
          type="submit"
          :disabled="isLoading || successMessage"
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          {{ isLoading ? 'Création...' : 'Créer mon compte' }}
        </button>
      </div>

      <div class="mt-4 text-center">
        <button
          type="button"
          @click="$emit('back')"
          class="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          Retour à la connexion
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { authApi } from '@/api/endpoints/auth'
import type { RegisterDto } from '@/types'

defineEmits<{
  back: []
}>()

const form = reactive<RegisterDto & { confirmPassword: string }>({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const validateForm = (): boolean => {
  let isValid = true
  
  // Reset des erreurs
  errors.username = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  
  if (!form.username.trim()) {
    errors.username = 'Le nom d\'utilisateur est requis'
    isValid = false
  } else if (form.username.length < 3) {
    errors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères'
    isValid = false
  }
  
  if (!form.email.trim()) {
    errors.email = 'L\'adresse email est requise'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'L\'adresse email n\'est pas valide'
    isValid = false
  }
  
  if (!form.password) {
    errors.password = 'Le mot de passe est requis'
    isValid = false
  } else if (form.password.length < 8) {
    errors.password = 'Le mot de passe doit contenir au moins 8 caractères'
    isValid = false
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(form.password)) {
    errors.password = 'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'
    isValid = false
  }
  
  if (!form.confirmPassword) {
    errors.confirmPassword = 'La confirmation du mot de passe est requise'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas'
    isValid = false
  }
  
  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    await authApi.register({
      username: form.username,
      email: form.email,
      password: form.password,
    })
    successMessage.value = 'Votre compte a été créé avec succès. Il est en attente de validation par un administrateur. Vous recevrez un email de confirmation une fois votre compte validé.'
  } catch (error: any) {
    console.error('Erreur:', error)
    errorMessage.value = error.message || 'Une erreur est survenue lors de la création du compte. Veuillez réessayer.'
  } finally {
    isLoading.value = false
  }
}
</script>

