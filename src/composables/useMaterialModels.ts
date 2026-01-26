import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { materialModelsApi } from '@/api/endpoints'
import type { MaterialModel, CreateMaterialModelDto, UpdateMaterialModelDto, MoveModelDto, UpdateModelCategoriesDto, ModelHistoryEntry } from '@/types'
import { computed, type Ref, type ComputedRef } from 'vue'

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

export const useSearchMaterialModels = (query: Ref<string> | ComputedRef<string> | string) => {
  const searchQuery = typeof query === 'string' 
    ? computed(() => query?.trim() || '')
    : computed(() => (query.value as string)?.trim() || '')
  
  return useQuery({
    queryKey: computed(() => ['material-models', 'search', searchQuery.value]),
    queryFn: () => materialModelsApi.search(searchQuery.value),
    enabled: computed(() => searchQuery.value.length > 0),
  })
}

export const useModelHistory = (modelId: string) => {
  return useQuery({
    queryKey: ['material-models', modelId, 'history'],
    queryFn: async () => {
      try {
        return await materialModelsApi.getHistory(modelId)
      } catch (error: any) {
        if (error?.response?.status === 404) {
          console.warn(`Historique introuvable pour le modèle ${modelId}`)
          return []
        }
        throw error
      }
    },
    enabled: !!modelId,
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

export const useMoveModel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MoveModelDto }) =>
      materialModelsApi.move(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['material-models'] })
      queryClient.invalidateQueries({ queryKey: ['material-models', id] })
    },
  })
}

export const useUpdateModelCategories = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateModelCategoriesDto }) =>
      materialModelsApi.updateCategories(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['material-models'] })
      queryClient.invalidateQueries({ queryKey: ['material-models', id] })
    },
  })
}
