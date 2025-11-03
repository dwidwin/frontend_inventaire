import { apiGet, apiPost, apiPatch, apiDelete } from '@/api/client'
import type { Stock, CreateStockDto, UpdateStockDto, AdjustStockDto } from '@/types'

export const stocksApi = {
  list: (): Promise<Stock[]> => {
    return apiGet<Stock[]>('/buvette/stock')
  },

  get: (id: string): Promise<Stock> => {
    return apiGet<Stock>(`/buvette/stock/${id}`)
  },

  getLowStock: (): Promise<Stock[]> => {
    return apiGet<Stock[]>('/buvette/stock/low')
  },

  getByProduct: (productId: string): Promise<Stock[]> => {
    return apiGet<Stock[]>(`/buvette/stock/product/${productId}`)
  },

  create: (data: CreateStockDto): Promise<Stock> => {
    return apiPost<Stock>('/buvette/stock', data)
  },

  update: (id: string, data: UpdateStockDto): Promise<Stock> => {
    return apiPatch<Stock>(`/buvette/stock/${id}`, data)
  },

  adjust: (id: string, data: AdjustStockDto): Promise<Stock> => {
    return apiPost<Stock>(`/buvette/stock/${id}/adjust`, data)
  },

  delete: (id: string): Promise<void> => {
    return apiDelete<void>(`/buvette/stock/${id}`)
  },
}

