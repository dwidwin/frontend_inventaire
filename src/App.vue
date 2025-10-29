<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(async () => {
  // Initialiser l'authentification au démarrage
  await authStore.initialize()
})
</script>
