import { apiGet, apiPost, apiPatch, apiDelete } from '@/api/client'
import type { MaterialModel, CreateMaterialModelDto, UpdateMaterialModelDto, Item } from '@/types'

export const materialModelsApi = {
  // Liste des modèles
  list: (): Promise<MaterialModel[]> => {
    return apiGet<MaterialModel[]>('/api/material-models')
  },

  // Recherche de modèles
  search: (query: string): Promise<MaterialModel[]> => {
    return apiGet<MaterialModel[]>(`/api/material-models/search?q=${encodeURIComponent(query)}`)
  },

  // Détail d'un modèle
  get: (id: string): Promise<MaterialModel & { itemsCount?: number }> => {
    return apiGet<MaterialModel & { itemsCount?: number }>(`/api/material-models/${id}`)
  },

  // Liste des items d'un modèle
  getItems: (id: string): Promise<Item[]> => {
    return apiGet<Item[]>(`/api/material-models/${id}/items`)
  },

  // Nombre d'items d'un modèle
  getItemsCount: (id: string): Promise<number> => {
    return apiGet<number>(`/api/material-models/${id}/items-count`)
  },

  // Créer un modèle
  create: (data: CreateMaterialModelDto): Promise<MaterialModel> => {
    return apiPost<MaterialModel>('/api/material-models', data)
  },

  // Modifier un modèle
  update: (id: string, data: UpdateMaterialModelDto): Promise<MaterialModel> => {
    return apiPatch<MaterialModel>(`/api/material-models/${id}`, data)
  },

  // Supprimer un modèle
  delete: (id: string): Promise<void> => {
    return apiDelete<void>(`/api/material-models/${id}`)
  },
}
