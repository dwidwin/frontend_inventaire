import { apiGet, apiPost, apiPatch } from '@/api/client'
import type { Sale, CreateBuvetteSaleDto } from '@/types'

export const salesApi = {
  list: (): Promise<Sale[]> => {
    return apiGet<Sale[]>('/api/buvette/sales')
  },

  get: (id: string): Promise<Sale> => {
    return apiGet<Sale>(`/api/buvette/sales/${id}`)
  },

  create: (data: CreateBuvetteSaleDto): Promise<Sale> => {
    return apiPost<Sale>('/api/buvette/sales', data)
  },

  cancel: (id: string): Promise<Sale> => {
    return apiPatch<Sale>(`/api/buvette/sales/${id}/cancel`)
  },
}

