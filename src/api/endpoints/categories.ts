import { apiGet, apiPost, apiPatch, apiDelete } from '@/api/client'
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types'

export const categoriesApi = {
  // Liste des catégories
  list: (): Promise<Category[]> => {
    return apiGet<Category[]>('/api/categories')
  },

  // Détail d'une catégorie
  get: (id: string): Promise<Category> => {
    return apiGet<Category>(`/api/categories/${id}`)
  },

  // Créer une catégorie
  create: (data: CreateCategoryDto): Promise<Category> => {
    return apiPost<Category>('/api/categories', data)
  },

  // Modifier une catégorie
  update: (id: string, data: UpdateCategoryDto): Promise<Category> => {
    return apiPatch<Category>(`/api/categories/${id}`, data)
  },

  // Supprimer une catégorie
  delete: (id: string): Promise<void> => {
    return apiDelete<void>(`/api/categories/${id}`)
  },
}
