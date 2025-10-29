<template>
  <div
    :class="[
      'flex items-start p-3 rounded-lg transition-colors',
      notification.readAt ? 'bg-white' : 'bg-blue-50'
    ]"
  >
    <div class="flex-shrink-0">
      <div class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
        <BellIcon class="h-4 w-4 text-primary-600" />
      </div>
    </div>
    <div class="ml-3 flex-1">
      <p class="text-sm font-medium text-gray-900">
        {{ notification.title }}
      </p>
      <p v-if="notification.message" class="mt-1 text-sm text-gray-600">
        {{ notification.message }}
      </p>
      <p class="mt-1 text-xs text-gray-500">
        {{ formatDate(notification.createdAt) }}
      </p>
    </div>
    <div class="ml-3 flex-shrink-0">
      <button
        v-if="!notification.readAt"
        @click="$emit('mark-read', notification.id)"
        class="text-primary-600 hover:text-primary-500 text-sm font-medium"
      >
        Marquer comme lu
      </button>
      <div v-else class="text-xs text-gray-400">
        Lu
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BellIcon } from '@heroicons/vue/24/outline'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Notification } from '@/types'

interface Props {
  notification: Notification
}

defineProps<Props>()

defineEmits<{
  'mark-read': [id: string]
}>()

// Formater la date
const formatDate = (date: string) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: fr })
}
</script>
