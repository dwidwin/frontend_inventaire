import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { transactionsApi } from '@/api/endpoints'
import type { Transaction, CreateRentalDto, CreateSaleDto, ReturnRentalDto } from '@/types'

export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionsApi.list(),
  })
}

export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => transactionsApi.get(id),
    enabled: !!id,
  })
}

export const useCreateRental = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRentalDto) => transactionsApi.createRental(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export const useCreateSale = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSaleDto) => transactionsApi.createSale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export const useReturnRental = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReturnRentalDto }) =>
      transactionsApi.returnRental(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
