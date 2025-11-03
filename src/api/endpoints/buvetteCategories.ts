import { apiGet, apiPost, apiPatch, apiDelete } from '@/api/client'
import type { BuvetteCategory, CreateBuvetteCategoryDto, UpdateBuvetteCategoryDto } from '@/types'

export const buvetteCategoriesApi = {
  list: (): Promise<BuvetteCategory[]> => {
    return apiGet<BuvetteCategory[]>('/buvette/categories')
  },

  get: (id: string): Promise<BuvetteCategory> => {
    return apiGet<BuvetteCategory>(`/buvette/categories/${id}`)
  },

  create: (data: CreateBuvetteCategoryDto): Promise<BuvetteCategory> => {
    return apiPost<BuvetteCategory>('/buvette/categories', data)
  },

  update: (id: string, data: UpdateBuvetteCategoryDto): Promise<BuvetteCategory> => {
    return apiPatch<BuvetteCategory>(`/buvette/categories/${id}`, data)
  },

  delete: (id: string): Promise<void> => {
    return apiDelete<void>(`/buvette/categories/${id}`)
  },
}

