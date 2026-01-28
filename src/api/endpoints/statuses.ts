import { apiGet, apiPost, apiPatch, apiDelete } from '@/api/client'
import type { Status, CreateStatusDto, UpdateStatusDto, ModelStatus, SetModelStatusDto } from '@/types'

export const statusesApi = {
  // Liste des statuts
  list: (): Promise<Status[]> => {
    return apiGet<Status[]>('/api/statuses')
  },

  // Détail d'un statut
  get: (id: string): Promise<Status> => {
    return apiGet<Status>(`/api/statuses/${id}`)
  },

  // Créer un statut
  create: (data: CreateStatusDto): Promise<Status> => {
    return apiPost<Status>('/api/statuses', data)
  },

  // Modifier un statut
  update: (id: string, data: UpdateStatusDto): Promise<Status> => {
    return apiPatch<Status>(`/api/statuses/${id}`, data)
  },

  // Supprimer un statut
  delete: (id: string): Promise<void> => {
    return apiDelete<void>(`/api/statuses/${id}`)
  },

  // Définir le statut d'un modèle
  setModelStatus: (data: SetModelStatusDto): Promise<ModelStatus> => {
    return apiPost<ModelStatus>('/api/model-statuses', data)
  },

  // Statuts actifs d'un modèle (tableau, un par groupe)
  getModelActiveStatus: (modelId: string): Promise<ModelStatus[]> => {
    return apiGet<ModelStatus[]>(`/api/model-statuses/model/${modelId}/active`)
  },

  // Historique des statuts d'un modèle
  getModelStatusHistory: (modelId: string): Promise<ModelStatus[]> => {
    return apiGet<ModelStatus[]>(`/api/model-statuses/model/${modelId}/history`)
  },

  // Fermer les statuts actifs d'un modèle pour un groupe spécifique
  closeActiveByGroup: (modelId: string, group: string): Promise<void> => {
    return apiDelete<void>(`/api/model-statuses/model/${modelId}/group/${group}`)
  },
}
