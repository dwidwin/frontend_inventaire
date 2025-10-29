import { apiGet, apiPost, apiPatch } from '@/api/client'
import type { Notification, BroadcastDto } from '@/types'

export const notificationsApi = {
  // Mes notifications
  getMine: (): Promise<Notification[]> => {
    return apiGet<Notification[]>('/api/notifications/me')
  },

  // Marquer une notification comme lue
  markAsRead: (id: string): Promise<void> => {
    return apiPatch<void>(`/api/notifications/${id}/read`)
  },

  // Diffuser une notification
  broadcast: (data: BroadcastDto): Promise<Notification> => {
    return apiPost<Notification>('/api/notifications/broadcast', data)
  },
}
