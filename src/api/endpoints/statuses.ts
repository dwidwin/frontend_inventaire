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

  // Définir le statut d'un item
  setItemStatus: (data: SetItemStatusDto): Promise<ItemStatus> => {
    console.log('🟡 [API] setItemStatus appelé avec:', data)
    return apiPost<ItemStatus>('/api/item-statuses', data).then(result => {
      console.log('🟡 [API] setItemStatus réponse:', result)
      return result
    }).catch(error => {
      console.error('🟡 [API] setItemStatus erreur:', error)
      throw error
    })
  },

  // Statuts actifs d'un item (tableau, un par groupe)
  getItemActiveStatus: (itemId: string): Promise<ItemStatus[]> => {
    return apiGet<ItemStatus[]>(`/api/item-statuses/item/${itemId}/active`)
  },

  // Historique des statuts d'un item
  getItemStatusHistory: (itemId: string): Promise<ItemStatus[]> => {
    return apiGet<ItemStatus[]>(`/api/item-statuses/item/${itemId}/history`)
  },

  // Fermer les statuts actifs d'un item pour un groupe spécifique
  closeActiveByGroup: (itemId: string, group: string): Promise<void> => {
    console.log('🟡 [API] closeActiveByGroup appelé avec:', { itemId, group })
    return apiDelete<void>(`/api/item-statuses/item/${itemId}/group/${group}`).then(() => {
      console.log('🟡 [API] closeActiveByGroup succès')
    }).catch(error => {
      console.error('🟡 [API] closeActiveByGroup erreur:', error)
      throw error
    })
  },
}
