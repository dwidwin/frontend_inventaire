import { apiGet, apiPost, apiPatch, apiDelete } from '@/api/client'
import type { Status, CreateStatusDto, UpdateStatusDto, ItemStatus, SetItemStatusDto } from '@/types'

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
  setItemStatus: (data: SetItemStatusDto): Promise<ItemStatus> => {
    return apiPost<ItemStatus>('/api/item-statuses', data)
  },

  // Statuts actifs d'un modèle (tableau, un par groupe)
  getModelActiveStatus: (modelId: string): Promise<ItemStatus[]> => {
    return apiGet<ItemStatus[]>(`/api/item-statuses/model/${modelId}/active`)
  },

  // Historique des statuts d'un modèle
  getModelStatusHistory: (modelId: string): Promise<ItemStatus[]> => {
    return apiGet<ItemStatus[]>(`/api/item-statuses/model/${modelId}/history`)
  },

  // Fermer les statuts actifs d'un modèle pour un groupe spécifique
  closeActiveByGroup: (modelId: string, group: string): Promise<void> => {
    return apiDelete<void>(`/api/item-statuses/model/${modelId}/group/${group}`)
  },
}
