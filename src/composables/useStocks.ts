import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { stocksApi } from '@/api/endpoints'
import type { Stock, CreateStockDto, UpdateStockDto, AdjustStockDto } from '@/types'

export const useStocks = () => {
  return useQuery({
    queryKey: ['stocks'],
    queryFn: () => stocksApi.list(),
  })
}

export const useStock = (id: string) => {
  return useQuery({
    queryKey: ['stocks', id],
    queryFn: () => stocksApi.get(id),
    enabled: !!id,
  })
}

export const useLowStock = () => {
  return useQuery({
    queryKey: ['stocks', 'low'],
    queryFn: () => stocksApi.getLowStock(),
  })
}

export const useStocksByProduct = (productId: string) => {
  return useQuery({
    queryKey: ['stocks', 'product', productId],
    queryFn: () => stocksApi.getByProduct(productId),
    enabled: !!productId,
  })
}

export const useCreateStock = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStockDto) => stocksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] })
    },
  })
}

export const useUpdateStock = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStockDto }) =>
      stocksApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] })
      queryClient.invalidateQueries({ queryKey: ['stocks', id] })
      queryClient.invalidateQueries({ queryKey: ['stocks', 'low'] })
    },
  })
}

export const useAdjustStock = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdjustStockDto }) =>
      stocksApi.adjust(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] })
      queryClient.invalidateQueries({ queryKey: ['stocks', id] })
      queryClient.invalidateQueries({ queryKey: ['stocks', 'low'] })
    },
  })
}

export const useDeleteStock = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => stocksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] })
    },
  })
}







