<template>
  <div>
    <div class="flex items-start justify-between py-2">
      <div class="flex-1">
        <div class="text-gray-900 font-medium">{{ node.name }}</div>
        <div v-if="node.description" class="text-sm text-gray-600">{{ node.description }}</div>
      </div>
      <div class="flex items-center space-x-2">
        <button @click="$emit('edit', node)" class="text-primary-600 hover:text-primary-900 text-sm">Modifier</button>
        <button @click="$emit('delete', node)" class="text-danger-600 hover:text-danger-900 text-sm">Supprimer</button>
      </div>
    </div>

    <div v-if="sortedChildren.length" class="pl-4 border-l border-gray-200">
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


