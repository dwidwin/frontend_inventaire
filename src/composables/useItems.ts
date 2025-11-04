import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { itemsApi } from '@/api/endpoints'
import type { Item, CreateItemDto, UpdateItemDto, MoveItemDto, ItemHistoryEntry } from '@/types'

export const useItems = () => {
  return useQuery({
    queryKey: ['items'],
    queryFn: async () => (await itemsApi.list()).filter((i: any) => i && i.id),
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
    queryFn: async () => {
      try {
        return await itemsApi.getHistory(id)
      } catch (error: any) {
        // Si 404, retourner un tableau vide au lieu de faire échouer la query
        if (error?.response?.status === 404) {
          console.warn(`Historique introuvable pour l'item ${id}`)
          return []
        }
        // Pour les autres erreurs, les laisser remonter
        throw error
      }
    },
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
    mutationFn: ({ id, data }: { id: string; data: MoveItemDto }) => {
      console.log('useMoveItem - mutationFn appelé:', { id, data })
      return itemsApi.move(id, data)
    },
    onSuccess: (result, variables) => {
      console.log('useMoveItem - onSuccess:', {
        result,
        variables,
        resultLocation: result?.location
      })
      queryClient.invalidateQueries({ queryKey: ['items'] })
      queryClient.invalidateQueries({ queryKey: ['items', variables.id] })
    },
    onError: (error) => {
      console.error('useMoveItem - onError:', error)
    },
  })
}
