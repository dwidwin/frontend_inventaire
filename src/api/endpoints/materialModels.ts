import { apiGet, apiPost, apiPatch, apiDelete } from '@/api/client'
import type { MaterialModel, CreateMaterialModelDto, UpdateMaterialModelDto, MoveModelDto, UpdateModelCategoriesDto, ModelHistoryEntry, PaginatedResponse, AuditLog } from '@/types'

export interface ListMaterialModelsParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  etat?: string
  q?: string
  taillePointure?: string[]
}

export const materialModelsApi = {
  // Liste des modèles (params optionnels pour filtres dont taillePointure)
  list: (params?: ListMaterialModelsParams): Promise<PaginatedResponse<MaterialModel>> => {
    if (!params || Object.keys(params).length === 0) {
      return apiGet<PaginatedResponse<MaterialModel>>('/api/material-models')
    }
    const searchParams = new URLSearchParams()
    if (params.page != null) searchParams.set('page', String(params.page))
    if (params.limit != null) searchParams.set('limit', String(params.limit))
    if (params.sortBy) searchParams.set('sortBy', params.sortBy)
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)
    if (params.etat) searchParams.set('etat', params.etat)
    if (params.q) searchParams.set('q', params.q)
    if (params.taillePointure?.length) {
      params.taillePointure.forEach((s) => searchParams.append('taillePointure', s))
    }
    const query = searchParams.toString()
    return apiGet<PaginatedResponse<MaterialModel>>(`/api/material-models${query ? `?${query}` : ''}`)
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

  // Historique d'un modèle (timeline statuts, affectations, emplacements)
  getHistory: (id: string): Promise<ModelHistoryEntry[]> => {
    return apiGet<ModelHistoryEntry[]>(`/api/material-models/${id}/history`)
  },

  // Historique des modifications du modèle (qui a modifié quoi)
  getModificationHistory: (id: string): Promise<{ data: AuditLog[] }> => {
    return apiGet<{ data: AuditLog[] }>(`/api/material-models/${id}/modification-history`)
  },

  // Supprimer un modèle
  delete: (id: string): Promise<void> => {
    return apiDelete<void>(`/api/material-models/${id}`)
  },
}
