<template>
  <div>
    <h4 class="text-sm font-medium text-gray-900 mb-4">Historique des modifications</h4>
    <div v-if="isLoading" class="text-sm text-gray-500 text-center py-4">
      Chargement de l'historique...
    </div>
    <div v-else-if="modificationHistory && modificationHistory.length > 0" class="space-y-2 max-h-64 overflow-y-auto pr-2">
      <div
        v-for="(event, index) in modificationHistory"
        :key="event.id || index"
        class="flex items-start space-x-3"
      >
        <div class="flex-shrink-0">
          <div class="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100">
            <PencilIcon class="w-4 h-4 text-blue-600" />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900">Modifié</p>
          <p class="text-sm text-gray-600">
            <span v-if="event.actorUser">
              par <span class="font-medium">{{ event.actorUser.username || event.actorUser.email }}</span>
            </span>
            <span v-else class="text-gray-400">par un utilisateur inconnu</span>
            <span v-if="event.createdAt" class="ml-2">
              le <span class="font-medium">{{ formatDateTimeWithDay(event.createdAt) }}</span>
            </span>
          </p>
          <div v-if="event.details?.changes && event.details.changes.length > 0" class="mt-2 pl-4 border-l-2 border-blue-200">
            <ul class="text-xs text-gray-600 space-y-1">
              <li v-for="(change, idx) in event.details.changes" :key="idx" class="flex items-start">
                <span class="mr-1 text-blue-600">•</span>
                <span>{{ change }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-sm text-gray-500 text-center py-4">
      Aucune modification enregistrée
    </div>
  </div>
</template>

<script setup lang="ts">
import { PencilIcon } from '@heroicons/vue/24/outline'
import { useModelModificationHistory } from '@/composables/useMaterialModels'
import { formatDateTimeWithDay } from '@/utils/formatDate'

const props = defineProps<{
  modelId: string
}>()

const { data: modificationHistory, isLoading } = useModelModificationHistory(props.modelId)
</script>
