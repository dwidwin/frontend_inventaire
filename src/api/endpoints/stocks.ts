import { apiGet, apiPost, apiPatch, apiDelete } from '@/api/client'
import type { Stock, CreateStockDto, UpdateStockDto, AdjustStockDto } from '@/types'

export const stocksApi = {
  list: (): Promise<Stock[]> => {
    return apiGet<Stock[]>('/api/buvette/stock')
  },

  get: (id: string): Promise<Stock> => {
    return apiGet<Stock>(`/api/buvette/stock/${id}`)
  },

  getLowStock: (): Promise<Stock[]> => {
    return apiGet<Stock[]>('/api/buvette/stock/low')
  },

  getByProduct: (productId: string): Promise<Stock[]> => {
    return apiGet<Stock[]>(`/api/buvette/stock/product/${productId}`)
  },

  create: (data: CreateStockDto): Promise<Stock> => {
    return apiPost<Stock>('/api/buvette/stock', data)
  },

  update: (id: string, data: UpdateStockDto): Promise<Stock> => {
    return apiPatch<Stock>(`/api/buvette/stock/${id}`, data)
  },

  adjust: (id: string, data: AdjustStockDto): Promise<Stock> => {
    return apiPost<Stock>(`/api/buvette/stock/${id}/adjust`, data)
  },

  delete: (id: string): Promise<void> => {
    return apiDelete<void>(`/api/buvette/stock/${id}`)
  },
}

