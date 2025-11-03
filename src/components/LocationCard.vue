<template>
  <div class="card">
    <div class="card-body">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h3 class="text-lg font-medium text-gray-900">{{ location.name }}</h3>
          <p v-if="location.notes" class="mt-1 text-sm text-gray-600">
            {{ location.notes }}
          </p>
          <div v-if="location.capacity" class="mt-2">
            <span class="text-xs text-gray-500">
              Capacité : {{ location.capacity }} items
            </span>
          </div>
        </div>
        <div v-if="canEdit || canDelete" class="flex items-center space-x-2">
          <button
            v-if="canEdit"
            @click="$emit('edit', location)"
            class="text-primary-600 hover:text-primary-900 text-sm"
          >
            Modifier
          </button>
          <button
            v-if="canDelete"
            @click="$emit('delete', location)"
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
import type { Location } from '@/types'

interface Props {
  location: Location
  canEdit?: boolean
  canDelete?: boolean
}

withDefaults(defineProps<Props>(), {
  canEdit: true,
  canDelete: true,
})

defineEmits<{
  edit: [location: Location]
  delete: [location: Location]
}>()
</script>
