import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { materialModelsApi } from '@/api/endpoints'
import type { MaterialModel, CreateMaterialModelDto, UpdateMaterialModelDto } from '@/types'

export const useMaterialModels = () => {
  return useQuery({
    queryKey: ['material-models'],
    queryFn: () => materialModelsApi.list(),
  })
}

export const useMaterialModel = (id: string) => {
  return useQuery({
    queryKey: ['material-models', id],
    queryFn: () => materialModelsApi.get(id),
    enabled: !!id,
  })
}

export const useCreateMaterialModel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateMaterialModelDto) => materialModelsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-models'] })
    },
  })
}

export const useUpdateMaterialModel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMaterialModelDto }) =>
      materialModelsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['material-models'] })
      queryClient.invalidateQueries({ queryKey: ['material-models', id] })
    },
  })
}

export const useDeleteMaterialModel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => materialModelsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-models'] })
    },
  })
}
