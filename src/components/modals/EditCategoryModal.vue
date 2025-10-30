<template>
  <div></div>
</template>
<script setup lang="ts">
import type { Category } from '@/types'
defineProps<{ category: Category }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'updated'): void }>()
</script>


