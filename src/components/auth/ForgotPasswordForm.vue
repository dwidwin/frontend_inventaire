<template>
  <div class="mt-8 space-y-6">
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="email" class="sr-only">Adresse email</label>
        <input
          id="email"
          v-model="email"
          name="email"
          type="email"
          required
          class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
          placeholder="Adresse email"
          :class="{ 'border-danger-500': errorMessage }"
        />
        <p v-if="errorMessage" class="mt-1 text-sm text-danger-600">
          {{ errorMessage }}
        </p>
      </div>

      <div v-if="successMessage" class="mt-4 rounded-md bg-success-50 p-4">
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
          {{ isLoading ? 'Envoi...' : 'Envoyer le lien de réinitialisation' }}
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
import { ref } from 'vue'
import { authApi } from '@/api/endpoints/auth'

defineEmits<{
  back: []
}>()

const email = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleSubmit = async () => {
  if (!email.value) {
    errorMessage.value = 'L\'adresse email est requise'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await authApi.forgotPassword({ email: email.value })
    successMessage.value = 'Si cet email existe, un lien de réinitialisation a été envoyé à votre adresse email.'
  } catch (error: any) {
    console.error('Erreur:', error)
    errorMessage.value = error.message || 'Une erreur est survenue. Veuillez réessayer.'
  } finally {
    isLoading.value = false
  }
}
</script>

