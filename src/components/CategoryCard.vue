<template>
  <div class="card">
    <div class="card-body">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h3 class="text-lg font-medium text-gray-900">{{ category.name }}</h3>
          <p v-if="category.description" class="mt-1 text-sm text-gray-600">
            {{ category.description }}
          </p>
          <div v-if="category.children?.length" class="mt-2">
            <span class="text-xs text-gray-500">
              {{ category.children.length }} sous-catégorie(s)
            </span>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="$emit('edit', category)"
            class="text-primary-600 hover:text-primary-900 text-sm"
          >
            Modifier
          </button>
          <button
            @click="$emit('delete', category)"
            class="text-danger-600 hover:text-danger-900 text-sm"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '@/types'

interface Props {
  category: Category
}

defineProps<Props>()

defineEmits<{
  edit: [category: Category]
  delete: [category: Category]
}>()
</script>
