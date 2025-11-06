import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { salesApi } from '@/api/endpoints'
import type { Sale, CreateBuvetteSaleDto } from '@/types'

export const useSales = () => {
  return useQuery({
    queryKey: ['sales'],
    queryFn: () => salesApi.list(),
  })
}

export const useSale = (id: string) => {
  return useQuery({
    queryKey: ['sales', id],
    queryFn: () => salesApi.get(id),
    enabled: !!id,
  })
}

export const useCreateSale = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBuvetteSaleDto) => salesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['stocks'] })
      queryClient.invalidateQueries({ queryKey: ['stocks', 'low'] })
    },
  })
}

export const useCancelSale = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => salesApi.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['sales', id] })
      queryClient.invalidateQueries({ queryKey: ['stocks'] })
      queryClient.invalidateQueries({ queryKey: ['stocks', 'low'] })
    },
  })
}





