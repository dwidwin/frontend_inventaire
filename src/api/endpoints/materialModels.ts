import { apiGet, apiPost, apiPatch, apiDelete } from '@/api/client'
import type { MaterialModel, CreateMaterialModelDto, UpdateMaterialModelDto, MoveModelDto, UpdateModelCategoriesDto, ModelHistoryEntry, PaginatedResponse } from '@/types'

export const materialModelsApi = {
  // Liste des modèles
  list: (): Promise<PaginatedResponse<MaterialModel>> => {
    return apiGet<PaginatedResponse<MaterialModel>>('/api/material-models')
  },

  // Recherche de modèles
  search: (query: string): Promise<MaterialModel[]> => {
    return apiGet<MaterialModel[]>(`/api/material-models/search?q=${encodeURIComponent(query)}`)
  },

  // Détail d'un modèle
  get: (id: string): Promise<MaterialModel> => {
    return apiGet<MaterialModel>(`/api/material-models/${id}`)
  },

  // Créer un modèle
  create: (data: CreateMaterialModelDto): Promise<MaterialModel> => {
    return apiPost<MaterialModel>('/api/material-models', data)
  },

  // Modifier un modèle
  update: (id: string, data: UpdateMaterialModelDto): Promise<MaterialModel> => {
    return apiPatch<MaterialModel>(`/api/material-models/${id}`, data)
  },

  // Déplacer un modèle
  move: (id: string, data: MoveModelDto): Promise<MaterialModel> => {
    return apiPatch<MaterialModel>(`/api/material-models/${id}/move`, data)
  },

  // Mettre à jour les catégories d'un modèle
  updateCategories: (id: string, data: UpdateModelCategoriesDto): Promise<MaterialModel> => {
    return apiPatch<MaterialModel>(`/api/material-models/${id}/categories`, data)
  },

  // Historique d'un modèle
  getHistory: (id: string): Promise<ModelHistoryEntry[]> => {
    return apiGet<ModelHistoryEntry[]>(`/api/material-models/${id}/history`)
  },

  // Supprimer un modèle
  delete: (id: string): Promise<void> => {
    return apiDelete<void>(`/api/material-models/${id}`)
  },
}
