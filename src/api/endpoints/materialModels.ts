import { apiGet, apiPost, apiPatch, apiDelete } from '@/api/client'
import type { MaterialModel, CreateMaterialModelDto, UpdateMaterialModelDto } from '@/types'

export const materialModelsApi = {
  // Liste des modèles
  list: (): Promise<MaterialModel[]> => {
    return apiGet<MaterialModel[]>('/api/material-models')
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

  // Supprimer un modèle
  delete: (id: string): Promise<void> => {
    return apiDelete<void>(`/api/material-models/${id}`)
  },
}
