import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { materialModelsApi } from '@/api/endpoints'
import type { MaterialModel, CreateMaterialModelDto, UpdateMaterialModelDto, Item } from '@/types'
import { computed, ref, type Ref, type ComputedRef } from 'vue'

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

export const useModelItems = (modelId: string) => {
  return useQuery({
    queryKey: ['material-models', modelId, 'items'],
    queryFn: () => materialModelsApi.getItems(modelId),
    enabled: !!modelId,
  })
}

export const useModelItemsCount = (modelId: Ref<string> | ComputedRef<string> | string) => {
  const id = typeof modelId === 'string' 
    ? computed(() => modelId)
    : computed(() => modelId.value as string)
  
  return useQuery({
    queryKey: computed(() => ['material-models', id.value, 'items-count']),
    queryFn: () => materialModelsApi.getItemsCount(id.value),
    enabled: computed(() => !!id.value),
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
