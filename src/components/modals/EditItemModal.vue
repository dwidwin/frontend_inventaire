<template>
  <CreateItemModal
    :item="item"
    @close="$emit('close')"
    @updated="$emit('updated')"
  />
</template>

<script setup lang="ts">
import type { Item } from '@/types'
import CreateItemModal from './CreateItemModal.vue'

defineProps<{ item: Item }>()
defineEmits<{ (e: 'close'): void; (e: 'updated'): void }>()
</script>
