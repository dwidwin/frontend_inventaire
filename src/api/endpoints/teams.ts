import { apiGet, apiPost, apiPatch, apiDelete } from '@/api/client'
import type { Team, CreateTeamDto, UpdateTeamDto } from '@/types'

export const teamsApi = {
  // Liste des équipes
  list: (): Promise<Team[]> => {
    return apiGet<Team[]>('/api/teams')
  },

  // Détail d'une équipe
  get: (id: string): Promise<Team> => {
    return apiGet<Team>(`/api/teams/${id}`)
  },

  // Créer une équipe
  create: (data: CreateTeamDto): Promise<Team> => {
    return apiPost<Team>('/api/teams', data)
  },

  // Modifier une équipe
  update: (id: string, data: UpdateTeamDto): Promise<Team> => {
    return apiPatch<Team>(`/api/teams/${id}`, data)
  },

  // Supprimer une équipe
  delete: (id: string): Promise<void> => {
    return apiDelete<void>(`/api/teams/${id}`)
  },
}
