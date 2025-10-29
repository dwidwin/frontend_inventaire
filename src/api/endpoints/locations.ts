import { apiGet, apiPost, apiPatch, apiDelete } from '@/api/client'
import type { Location, CreateLocationDto, UpdateLocationDto } from '@/types'

export const locationsApi = {
  // Liste des localisations
  list: (): Promise<Location[]> => {
    return apiGet<Location[]>('/api/locations')
  },

  // Détail d'une localisation
  get: (id: string): Promise<Location> => {
    return apiGet<Location>(`/api/locations/${id}`)
  },

  // Créer une localisation
  create: (data: CreateLocationDto): Promise<Location> => {
    return apiPost<Location>('/api/locations', data)
  },

  // Modifier une localisation
  update: (id: string, data: UpdateLocationDto): Promise<Location> => {
    return apiPatch<Location>(`/api/locations/${id}`, data)
  },

  // Supprimer une localisation
  delete: (id: string): Promise<void> => {
    return apiDelete<void>(`/api/locations/${id}`)
  },
}
