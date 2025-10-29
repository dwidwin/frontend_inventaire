<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-gray-900">404</h1>
      <h2 class="mt-4 text-2xl font-semibold text-gray-700">Page non trouvée</h2>
      <p class="mt-2 text-gray-600">
        La page que vous recherchez n'existe pas.
      </p>
      <div class="mt-6">
        <RouterLink
          to="/"
          class="btn btn-primary"
        >
          Retour à l'accueil
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Vue simple pour les pages non trouvées
</script>
