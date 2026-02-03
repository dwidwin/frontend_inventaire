import { apiGet } from '@/api/client'
import type { DashboardStats } from '@/types'

export const dashboardApi = {
  getStats: (): Promise<DashboardStats> => {
    return apiGet<DashboardStats>('/api/dashboard/stats')
  },
}
