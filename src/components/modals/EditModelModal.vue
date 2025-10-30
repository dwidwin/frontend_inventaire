<template>
  <div></div>
</template>
<script setup lang="ts">
import type { MaterialModel } from '@/types'
defineProps<{ model: MaterialModel }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'updated'): void }>()
</script>


