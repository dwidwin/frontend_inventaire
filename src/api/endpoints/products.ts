import { apiGet, apiPost, apiPatch, apiDelete } from '@/api/client'
import type { Product, CreateProductDto, UpdateProductDto } from '@/types'

export const productsApi = {
  list: (): Promise<Product[]> => {
    return apiGet<Product[]>('/buvette/products')
  },

  get: (id: string): Promise<Product> => {
    return apiGet<Product>(`/buvette/products/${id}`)
  },

  create: (data: CreateProductDto): Promise<Product> => {
    return apiPost<Product>('/buvette/products', data)
  },

  update: (id: string, data: UpdateProductDto): Promise<Product> => {
    return apiPatch<Product>(`/buvette/products/${id}`, data)
  },

  delete: (id: string): Promise<void> => {
    return apiDelete<void>(`/buvette/products/${id}`)
  },
}

