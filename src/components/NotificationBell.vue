<template>
  <div class="relative">
    <button
      @click="dropdownOpen = !dropdownOpen"
      class="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      <BellIcon class="h-6 w-6" />
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 h-5 w-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown -->
    <div
      v-if="dropdownOpen"
      @click="dropdownOpen = false"
      class="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
    >
      <div class="p-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Notifications</h3>
      </div>
      
      <div class="max-h-96 overflow-y-auto">
        <div v-if="isLoading" class="p-4 text-center text-gray-500">
          Chargement...
        </div>
        
        <div v-else-if="!notifications?.length" class="p-4 text-center text-gray-500">
          Aucune notification
        </div>
        
        <div v-else class="divide-y divide-gray-200">
          <button
            v-for="notification in notifications"
            :key="notification.id"
            @click="markAsRead(notification.id)"
            :class="[
              'w-full text-left p-4 hover:bg-gray-50 transition-colors',
              notification.readAt ? 'bg-white' : 'bg-blue-50'
            ]"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">
                  {{ notification.title }}
                </p>
                <p v-if="notification.message" class="mt-1 text-sm text-gray-600">
                  {{ notification.message }}
                </p>
                <p class="mt-1 text-xs text-gray-500">
                  <span v-if="notification.createdByUser" class="text-gray-600">
                    Par {{ notification.createdByUser.username || notification.createdByUser.email || '—' }}
                    · 
                  </span>
                  {{ formatDateTime(notification.createdAt) }}
                </p>
              </div>
              <div v-if="!notification.readAt" class="ml-2">
                <div class="h-2 w-2 bg-primary-500 rounded-full"></div>
              </div>
            </div>
          </button>
        </div>
      </div>
      
      <div v-if="notifications?.length" class="p-4 border-t border-gray-200">
        <RouterLink
          to="/notifications"
          class="text-sm text-primary-600 hover:text-primary-500 font-medium"
        >
          Voir toutes les notifications
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { BellIcon } from '@heroicons/vue/24/outline'
import { useNotifications, useUnreadNotificationsCount, useMarkNotificationAsRead } from '@/composables/useNotifications'
import { formatDateTime } from '@/utils/formatDate'
import { logger } from '@/utils/logger'

// État local
const dropdownOpen = ref(false)

// Queries
const { data: notifications, isLoading } = useNotifications()
const unreadCount = useUnreadNotificationsCount()
const markAsReadMutation = useMarkNotificationAsRead()

// Marquer comme lu
const markAsRead = async (id: string) => {
  try {
    await markAsReadMutation.mutateAsync(id)
  } catch (error) {
    logger.error('Erreur lors du marquage de la notification:', error)
  }
}

// Le formatage de date est maintenant importé depuis @/utils/formatDate

// Fermer le dropdown au clic extérieur
const handleClickOutside = (event: Event) => {
  if (!(event.target as Element).closest('.relative')) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
