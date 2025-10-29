<template>
  <div class="card">
    <div class="card-body">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h3 class="text-lg font-medium text-gray-900">{{ team.name }}</h3>
          <div v-if="team.categoryAge || team.level" class="mt-1 flex items-center space-x-4">
            <span v-if="team.categoryAge" class="text-sm text-gray-600">
              {{ team.categoryAge }}
            </span>
            <span v-if="team.level" class="text-sm text-gray-600">
              {{ team.level }}
            </span>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="$emit('edit', team)"
            class="text-primary-600 hover:text-primary-900 text-sm"
          >
            Modifier
          </button>
          <button
            @click="$emit('delete', team)"
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
import type { Team } from '@/types'

interface Props {
  team: Team
}

defineProps<Props>()

defineEmits<{
  edit: [team: Team]
  delete: [team: Team]
}>()
</script>
