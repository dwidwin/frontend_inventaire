import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { locationsApi } from '@/api/endpoints'
import type { Location, CreateLocationDto, UpdateLocationDto } from '@/types'

export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: () => locationsApi.list(),
  })
}

export const useLocation = (id: string) => {
  return useQuery({
    queryKey: ['locations', id],
    queryFn: () => locationsApi.get(id),
    enabled: !!id,
  })
}

export const useCreateLocation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLocationDto) => locationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    },
  })
}

export const useUpdateLocation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLocationDto }) =>
      locationsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      queryClient.invalidateQueries({ queryKey: ['locations', id] })
    },
  })
}

export const useDeleteLocation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => locationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    },
  })
}
