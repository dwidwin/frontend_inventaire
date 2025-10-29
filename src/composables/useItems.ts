import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { itemsApi } from '@/api/endpoints'
import type { Item, CreateItemDto, UpdateItemDto, MoveItemDto, ItemHistoryEntry } from '@/types'

export const useItems = () => {
  return useQuery({
    queryKey: ['items'],
    queryFn: () => itemsApi.list(),
  })
}

export const useItem = (id: string) => {
  return useQuery({
    queryKey: ['items', id],
    queryFn: () => itemsApi.get(id),
    enabled: !!id,
  })
}

export const useItemHistory = (id: string) => {
  return useQuery({
    queryKey: ['items', id, 'history'],
    queryFn: () => itemsApi.getHistory(id),
    enabled: !!id,
  })
}

export const useCreateItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateItemDto) => itemsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

export const useUpdateItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateItemDto }) =>
      itemsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      queryClient.invalidateQueries({ queryKey: ['items', id] })
    },
  })
}

export const useDeleteItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => itemsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

export const useMoveItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MoveItemDto }) =>
      itemsApi.move(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      queryClient.invalidateQueries({ queryKey: ['items', id] })
    },
  })
}
