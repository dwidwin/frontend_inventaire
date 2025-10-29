import { apiGet } from '@/api/client'
import type { AuditLog, SearchParams } from '@/types'

export const auditApi = {
  // Liste des logs d'audit
  list: (params?: SearchParams): Promise<AuditLog[]> => {
    return apiGet<AuditLog[]>('/api/audit-logs', params)
  },
}
