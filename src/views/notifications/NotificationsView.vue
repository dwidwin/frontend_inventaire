<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Notifications</h1>
      <p class="mt-1 text-sm text-gray-600">
        Gestion des notifications et communications
      </p>
    </div>

    <!-- Actions -->
    <div v-if="authStore.canWrite" class="mb-6 flex justify-between items-center">
      <div class="flex items-center space-x-3">
        <button
          @click="showBroadcastModal = true"
          class="btn btn-primary"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Diffuser une notification
        </button>
      </div>
    </div>

    <!-- Liste des notifications -->
    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="skeleton h-16"></div>
    </div>
    
    <div v-else-if="!notifications?.length" class="text-center py-8 text-gray-500">
      Aucune notification trouvée
    </div>
    
    <div v-else class="space-y-3">
      <NotificationItem
        v-for="notification in notifications"
        :key="notification.id"
        :notification="notification"
        @mark-read="handleMarkAsRead"
      />
    </div>

    <BroadcastNotificationModal
      :open="showBroadcastModal"
      @close="showBroadcastModal = false"
      @success="showBroadcastModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useNotifications, useMarkNotificationAsRead } from '@/composables/useNotifications'
import { logger } from '@/utils/logger'
import NotificationItem from '@/components/NotificationItem.vue'
import BroadcastNotificationModal from '@/components/modals/BroadcastNotificationModal.vue'

const authStore = useAuthStore()

// Queries
const { data: notifications, isLoading } = useNotifications()
const markAsReadMutation = useMarkNotificationAsRead()

// État local
const showBroadcastModal = ref(false)

// Actions
const handleMarkAsRead = async (id: string) => {
  try {
    await markAsReadMutation.mutateAsync(id)
  } catch (error) {
    logger.error('Erreur lors du marquage de la notification:', error)
  }
}
</script>
