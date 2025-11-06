import { apiGet, apiPost, apiPatch, apiDelete } from '@/api/client'
import type { User, CreateUserDto, UpdateUserDto, PaginatedResponse, SearchParams } from '@/types'

export const usersApi = {
  // Liste des utilisateurs
  list: (params?: SearchParams): Promise<PaginatedResponse<User>> => {
    return apiGet<PaginatedResponse<User>>('/api/users', params)
  },

  // Détail d'un utilisateur
  get: (id: string): Promise<User> => {
    return apiGet<User>(`/api/users/${id}`)
  },

  // Créer un utilisateur
  create: (data: CreateUserDto): Promise<User> => {
    return apiPost<User>('/api/users', data)
  },

  // Modifier un utilisateur
  update: (id: string, data: UpdateUserDto): Promise<User> => {
    return apiPatch<User>(`/api/users/${id}`, data)
  },

  // Supprimer un utilisateur
  delete: (id: string): Promise<void> => {
    return apiDelete<void>(`/api/users/${id}`)
  },

  // Activer un compte utilisateur
  activateAccount: (id: string): Promise<User> => {
    return apiPatch<User>(`/api/users/${id}/activate`, {})
  },

  // Récupérer l'historique des modifications
  getHistory: (id: string): Promise<PaginatedResponse<any>> => {
    return apiGet<PaginatedResponse<any>>(`/api/users/${id}/history`)
  },
}
