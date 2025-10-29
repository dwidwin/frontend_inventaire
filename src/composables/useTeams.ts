import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { teamsApi } from '@/api/endpoints'
import type { Team, CreateTeamDto, UpdateTeamDto } from '@/types'

export const useTeams = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsApi.list(),
  })
}

export const useTeam = (id: string) => {
  return useQuery({
    queryKey: ['teams', id],
    queryFn: () => teamsApi.get(id),
    enabled: !!id,
  })
}

export const useCreateTeam = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTeamDto) => teamsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })
}

export const useUpdateTeam = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamDto }) =>
      teamsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      queryClient.invalidateQueries({ queryKey: ['teams', id] })
    },
  })
}

export const useDeleteTeam = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => teamsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })
}
