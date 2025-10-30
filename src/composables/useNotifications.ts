import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import { notificationsApi } from '@/api/endpoints'
import type { Notification, BroadcastDto } from '@/types'

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getMine(),
    refetchInterval: 30000, // Refetch toutes les 30 secondes
  })
}

export const useUnreadNotificationsCount = () => {
  const { data: notifications } = useNotifications()
  
  return computed(() => {
    if (!notifications.value) return 0
    return notifications.value.filter(n => !n.readAt).length
  })
}

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export const useBroadcastNotification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BroadcastDto) => notificationsApi.broadcast(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
