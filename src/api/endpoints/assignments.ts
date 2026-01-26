import { apiGet, apiPost, apiPatch } from '@/api/client'
import type { Assignment, CreateAssignmentDto, CloseAssignmentDto } from '@/types'

export const assignmentsApi = {
  // Liste des affectations
  list: (): Promise<Assignment[]> => {
    return apiGet<Assignment[]>('/api/assignments')
  },

  // Affectations actives
  getActive: (): Promise<Assignment[]> => {
    return apiGet<Assignment[]>('/api/assignments/active')
  },

  // Détail d'une affectation
  get: (id: string): Promise<Assignment> => {
    return apiGet<Assignment>(`/api/assignments/${id}`)
  },

  // Affectations par modèle
  getByModel: (modelId: string): Promise<Assignment[]> => {
    return apiGet<Assignment[]>(`/api/assignments/model/${modelId}`)
  },

  // Affectations par équipe
  getByTeam: (teamId: string): Promise<Assignment[]> => {
    return apiGet<Assignment[]>(`/api/assignments/team/${teamId}`)
  },

  // Créer une affectation
  create: (data: CreateAssignmentDto): Promise<Assignment> => {
    return apiPost<Assignment>('/api/assignments', data)
  },

  // Clôturer une affectation
  close: (id: string, data: CloseAssignmentDto): Promise<Assignment> => {
    return apiPatch<Assignment>(`/api/assignments/${id}/close`, data)
  },
}
