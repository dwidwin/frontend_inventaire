import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { assignmentsApi } from '@/api/endpoints'
import type { Assignment, CreateAssignmentDto, CloseAssignmentDto } from '@/types'

export const useAssignments = () => {
  return useQuery({
    queryKey: ['assignments'],
    queryFn: () => assignmentsApi.list(),
  })
}

export const useActiveAssignments = () => {
  return useQuery({
    queryKey: ['assignments', 'active'],
    queryFn: () => assignmentsApi.getActive(),
  })
}

export const useAssignment = (id: string) => {
  return useQuery({
    queryKey: ['assignments', id],
    queryFn: () => assignmentsApi.get(id),
    enabled: !!id,
  })
}

export const useAssignmentsByItem = (itemId: string) => {
  return useQuery({
    queryKey: ['assignments', 'item', itemId],
    queryFn: () => assignmentsApi.getByItem(itemId),
    enabled: !!itemId,
  })
}

export const useAssignmentsByTeam = (teamId: string) => {
  return useQuery({
    queryKey: ['assignments', 'team', teamId],
    queryFn: () => assignmentsApi.getByTeam(teamId),
    enabled: !!teamId,
  })
}

export const useCreateAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAssignmentDto) => assignmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}

export const useCloseAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CloseAssignmentDto }) =>
      assignmentsApi.close(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}
