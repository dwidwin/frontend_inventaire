<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connexion à Inventaire Club
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Gérez votre matériel sportif en toute simplicité
        </p>
      </div>
      
      <!-- Formulaire de connexion -->
      <form v-if="view === 'login'" class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="username" class="sr-only">Nom d'utilisateur</label>
            <input
              id="username"
              v-model="form.username"
              name="username"
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Nom d'utilisateur"
              :class="{ 'border-danger-500': errors.username }"
            />
            <p v-if="errors.username" class="mt-1 text-sm text-danger-600">
              {{ errors.username }}
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
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Mot de passe"
              :class="{ 'border-danger-500': errors.password }"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-danger-600">
              {{ errors.password }}
            </p>
          </div>
        </div>

        <div v-if="errorMessage" class="rounded-md bg-danger-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <ExclamationTriangleIcon class="h-5 w-5 text-danger-400" />
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-danger-800">
                Erreur de connexion
              </h3>
              <div class="mt-2 text-sm text-danger-700">
                {{ errorMessage }}
              </div>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isLoading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </div>

        <div class="flex items-center justify-between">
          <div class="text-sm">
            <button
              type="button"
              @click="view = 'forgot-password'"
              class="font-medium text-primary-600 hover:text-primary-500"
            >
              J'ai oublié mon mot de passe
            </button>
          </div>
        </div>

        <div class="text-center">
          <button
            type="button"
            @click="view = 'register'"
            class="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Je crée mon compte
          </button>
        </div>
      </form>

      <!-- Formulaire mot de passe oublié -->
      <ForgotPasswordForm v-else-if="view === 'forgot-password'" @back="view = 'login'" />

      <!-- Formulaire d'inscription -->
      <RegisterForm v-else-if="view === 'register'" @back="view = 'login'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import type { LoginDto } from '@/types'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'

const router = useRouter()
const authStore = useAuthStore()

// Vue actuelle : 'login', 'forgot-password', 'register'
const view = ref<'login' | 'forgot-password' | 'register'>('login')

// État du formulaire
const form = reactive<LoginDto>({
  username: '',
  password: '',
})

const errors = reactive({
  username: '',
  password: '',
})

const isLoading = ref(false)
const errorMessage = ref('')

// Validation du formulaire
const validateForm = (): boolean => {
  let isValid = true
  
  // Reset des erreurs
  errors.username = ''
  errors.password = ''
  
  if (!form.username.trim()) {
    errors.username = 'Le nom d\'utilisateur est requis'
    isValid = false
  }
  
  if (!form.password) {
    errors.password = 'Le mot de passe est requis'
    isValid = false
  }
  
  return isValid
}

// Soumission du formulaire
const handleSubmit = async () => {
  if (!validateForm()) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    await authStore.login(form)
    router.push('/')
  } catch (error: any) {
    console.error('Erreur de connexion:', error)
    errorMessage.value = error.message || 'Erreur de connexion. Vérifiez vos identifiants.'
  } finally {
    isLoading.value = false
  }
}
</script>
