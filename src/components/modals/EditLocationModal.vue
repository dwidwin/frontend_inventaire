<template>
  <CreateLocationModal
    :location="location"
    @close="$emit('close')"
    @updated="$emit('updated')"
  />
</template>

<script setup lang="ts">
import type { Location } from '@/types'
import CreateLocationModal from './CreateLocationModal.vue'

defineProps<{ location: Location }>()
defineEmits<{ (e: 'close'): void; (e: 'updated'): void }>()
</script>


