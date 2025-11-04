import { apiGet, apiPost, apiPatch, apiDelete } from '@/api/client'
import type { Item, CreateItemDto, UpdateItemDto, MoveItemDto, ItemHistoryEntry } from '@/types'

export const itemsApi = {
  // Liste des items
  list: (): Promise<Item[]> => {
    return apiGet<Item[]>('/api/items')
  },

  // Détail d'un item
  get: (id: string): Promise<Item> => {
    return apiGet<Item>(`/api/items/${id}`)
  },

  // Créer un item
  create: (data: CreateItemDto): Promise<Item> => {
    return apiPost<Item>('/api/items', data)
  },

  // Modifier un item
  update: (id: string, data: UpdateItemDto): Promise<Item> => {
    console.log('🟡 [API] updateItem appelé avec:', { id, data })
    return apiPatch<Item>(`/api/items/${id}`, data).then(result => {
      console.log('🟡 [API] updateItem réponse:', result)
      return result
    }).catch(error => {
      console.error('🟡 [API] updateItem erreur:', error)
      throw error
    })
  },

  // Supprimer un item
  delete: (id: string): Promise<void> => {
    return apiDelete<void>(`/api/items/${id}`)
  },

  // Déplacer un item
  move: (id: string, data: MoveItemDto): Promise<Item> => {
    return apiPatch<Item>(`/api/items/${id}/move`, data)
  },

  // Historique d'un item
  getHistory: (id: string): Promise<ItemHistoryEntry[]> => {
    return apiGet<ItemHistoryEntry[]>(`/api/items/${id}/history`)
  },
}
