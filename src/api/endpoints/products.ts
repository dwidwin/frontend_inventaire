import { apiGet, apiPost, apiPatch, apiDelete } from '@/api/client'
import type { Product, CreateProductDto, UpdateProductDto } from '@/types'

export const productsApi = {
  list: (): Promise<Product[]> => {
    return apiGet<Product[]>('/api/buvette/products')
  },

  get: (id: string): Promise<Product> => {
    return apiGet<Product>(`/api/buvette/products/${id}`)
  },

  create: (data: CreateProductDto): Promise<Product> => {
    return apiPost<Product>('/api/buvette/products', data)
  },

  update: (id: string, data: UpdateProductDto): Promise<Product> => {
    return apiPatch<Product>(`/api/buvette/products/${id}`, data)
  },

  delete: (id: string): Promise<void> => {
    return apiDelete<void>(`/api/buvette/products/${id}`)
  },
}

