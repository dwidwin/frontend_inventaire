import { apiGet, apiPost, apiPatch } from '@/api/client'
import type { Sale, CreateBuvetteSaleDto } from '@/types'

export const salesApi = {
  list: (): Promise<Sale[]> => {
    return apiGet<Sale[]>('/buvette/sales')
  },

  get: (id: string): Promise<Sale> => {
    return apiGet<Sale>(`/buvette/sales/${id}`)
  },

  create: (data: CreateBuvetteSaleDto): Promise<Sale> => {
    return apiPost<Sale>('/buvette/sales', data)
  },

  cancel: (id: string): Promise<Sale> => {
    return apiPatch<Sale>(`/buvette/sales/${id}/cancel`)
  },
}

