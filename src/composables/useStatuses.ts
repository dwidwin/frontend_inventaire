import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { statusesApi } from '@/api/endpoints'
import type { Status, CreateStatusDto, UpdateStatusDto, ItemStatus, SetItemStatusDto } from '@/types'

export const useStatuses = () => {
  return useQuery({
    queryKey: ['statuses'],
    queryFn: () => statusesApi.list(),
  })
}

export const useStatus = (id: string) => {
  return useQuery({
    queryKey: ['statuses', id],
    queryFn: () => statusesApi.get(id),
    enabled: !!id,
  })
}

export const useCreateStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStatusDto) => statusesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statuses'] })
    },
  })
}

export const useUpdateStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStatusDto }) =>
      statusesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['statuses'] })
      queryClient.invalidateQueries({ queryKey: ['statuses', id] })
    },
  })
}

export const useDeleteStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => statusesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statuses'] })
    },
  })
}

export const useSetItemStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SetItemStatusDto) => statusesApi.setItemStatus(data),
    onSuccess: (_, { itemId }) => {
      queryClient.invalidateQueries({ queryKey: ['item-statuses', 'item', itemId] })
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

export const useItemActiveStatus = (itemId: string) => {
  return useQuery({
    queryKey: ['item-statuses', 'active', itemId],
    queryFn: () => statusesApi.getItemActiveStatus(itemId),
    enabled: !!itemId,
  })
}

export const useItemStatusHistory = (itemId: string) => {
  return useQuery({
    queryKey: ['item-statuses', 'history', itemId],
    queryFn: () => statusesApi.getItemStatusHistory(itemId),
    enabled: !!itemId,
  })
}
