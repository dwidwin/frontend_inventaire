<template>
  <div>
    <!-- Card pour la catégorie actuelle -->
    <div class="card">
      <div class="card-body">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h3 class="text-lg font-medium text-gray-900">{{ node.name }}</h3>
            <p v-if="node.description" class="mt-1 text-sm text-gray-600">
              {{ node.description }}
            </p>
            <div v-if="sortedChildren.length" class="mt-2">
              <span class="text-xs text-gray-500">
                {{ sortedChildren.length }} sous-catégorie(s)
              </span>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="$emit('edit', node)"
              class="text-primary-600 hover:text-primary-900 text-sm"
            >
              Modifier
            </button>
            <button
              @click="$emit('delete', node)"
              class="text-danger-600 hover:text-danger-900 text-sm"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sous-catégories avec indentation -->
    <div v-if="sortedChildren.length" class="ml-6 mt-3 space-y-3">
      <CategoryTree
        v-for="child in sortedChildren"
        :key="child.id"
        :node="child"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Category } from '@/types'

interface Props {
  node: Category
}

const props = defineProps<Props>()

defineEmits<{
  edit: [category: Category]
  delete: [category: Category]
}>()

const sortedChildren = computed(() => {
  const children = props.node.children || []
  return [...children].sort((a, b) => a.name.localeCompare(b.name))
})
</script>


