<template>
  <CreateCategoryModal
    :category="category"
    @close="$emit('close')"
    @updated="$emit('updated')"
  />
</template>

<script setup lang="ts">
import type { Category } from '@/types'
import CreateCategoryModal from './CreateCategoryModal.vue'

defineProps<{ category: Category }>()
defineEmits<{ (e: 'close'): void; (e: 'updated'): void }>()
</script>
