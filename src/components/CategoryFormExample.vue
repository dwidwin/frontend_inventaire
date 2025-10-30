<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Formulaire de Création de Catégorie</h1>
      <p class="text-gray-600">
        Exemple d'utilisation du formulaire de création de catégorie responsive et réutilisable.
      </p>
    </div>

    <!-- Boutons de démonstration -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <button
        @click="openCreateModal"
        class="btn btn-primary flex items-center justify-center space-x-2"
      >
        <PlusIcon class="w-5 h-5" />
        <span>Créer une catégorie</span>
      </button>
      
      <button
        @click="openCreateModal"
        class="btn btn-secondary flex items-center justify-center space-x-2"
      >
        <PlusIcon class="w-5 h-5" />
        <span>Nouvelle catégorie</span>
      </button>
      
      <button
        @click="openCreateModal"
        class="btn btn-success flex items-center justify-center space-x-2"
      >
        <PlusIcon class="w-5 h-5" />
        <span>Ajouter catégorie</span>
      </button>
    </div>

    <!-- Informations sur le formulaire -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
      <h2 class="text-lg font-semibold text-blue-900 mb-3">Fonctionnalités du formulaire</h2>
      <ul class="space-y-2 text-blue-800">
        <li class="flex items-start space-x-2">
          <CheckIcon class="w-5 h-5 mt-0.5 text-blue-600" />
          <span><strong>Responsive :</strong> S'adapte parfaitement aux écrans mobiles et desktop</span>
        </li>
        <li class="flex items-start space-x-2">
          <CheckIcon class="w-5 h-5 mt-0.5 text-blue-600" />
          <span><strong>Validation :</strong> Validation en temps réel des champs obligatoires</span>
        </li>
        <li class="flex items-start space-x-2">
          <CheckIcon class="w-5 h-5 mt-0.5 text-blue-600" />
          <span><strong>Hiérarchie :</strong> Support des catégories parentes avec aperçu de la hiérarchie</span>
        </li>
        <li class="flex items-start space-x-2">
          <CheckIcon class="w-5 h-5 mt-0.5 text-blue-600" />
          <span><strong>Réutilisable :</strong> Peut être utilisé partout dans l'application</span>
        </li>
        <li class="flex items-start space-x-2">
          <CheckIcon class="w-5 h-5 mt-0.5 text-blue-600" />
          <span><strong>Accessible :</strong> Respecte les standards d'accessibilité</span>
        </li>
      </ul>
    </div>

    <!-- Liste des catégories existantes -->
    <div class="bg-white rounded-lg shadow border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Catégories existantes</h2>
      </div>
      <div class="p-6">
        <div v-if="isLoading" class="space-y-3">
          <div v-for="i in 3" :key="i" class="skeleton h-12"></div>
        </div>
        <div v-else-if="!categories?.length" class="text-center py-8 text-gray-500">
          Aucune catégorie trouvée
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="category in categories"
            :key="category.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 bg-primary-500 rounded-full"></div>
              <div>
                <h3 class="font-medium text-gray-900">{{ category.name }}</h3>
                <p v-if="category.description" class="text-sm text-gray-600">
                  {{ category.description }}
                </p>
                <p v-if="category.parent" class="text-xs text-gray-500">
                  Sous-catégorie de: {{ category.parent.name }}
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <div class="text-sm text-gray-500">
                {{ formatDate(category.createdAt) }}
              </div>
              <button
                @click="openEditModal(category)"
                class="text-primary-600 hover:text-primary-900 text-sm font-medium"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de création -->
    <CreateCategoryModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handleCategoryCreated"
    />
    
    <!-- Modal d'édition -->
    <CreateCategoryModal
      v-if="showEditModal && selectedCategory"
      :category="selectedCategory"
      @close="showEditModal = false"
      @updated="handleCategoryUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PlusIcon, CheckIcon } from '@heroicons/vue/24/outline'
import { useCategories } from '@/composables/useCategories'
import CreateCategoryModal from '@/components/modals/CreateCategoryModal.vue'
import { formatDate } from '@/utils/formatDate'
import type { Category } from '@/types'

// Queries
const { data: categories, isLoading } = useCategories()

// État local
const showCreateModal = ref(false)
const showEditModal = ref(false)
const selectedCategory = ref<Category | null>(null)

// Actions
const openCreateModal = () => {
  selectedCategory.value = null
  showCreateModal.value = true
}

const openEditModal = (category: Category) => {
  selectedCategory.value = category
  showEditModal.value = true
}

const handleCategoryCreated = () => {
  showCreateModal.value = false
  console.log('Catégorie créée avec succès!')
}

const handleCategoryUpdated = () => {
  showEditModal.value = false
  selectedCategory.value = null
  console.log('Catégorie modifiée avec succès!')
}
</script>
