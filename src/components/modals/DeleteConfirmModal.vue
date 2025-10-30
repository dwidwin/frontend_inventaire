<template>
  <div></div>
</template>
<script setup lang="ts">
import type { Item } from '@/types'
defineProps<{ item: Item }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'confirmed'): void }>()
</script>


