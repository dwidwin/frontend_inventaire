import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import { statusesApi } from '@/api/endpoints'
import type { Status, CreateStatusDto, UpdateStatusDto, ItemStatus, SetItemStatusDto, StatusGroup } from '@/types'
import { StatusGroup as StatusGroupEnum } from '@/types'

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['item-statuses', 'active', variables.itemId] })
      queryClient.invalidateQueries({ queryKey: ['item-statuses', 'history', variables.itemId] })
      queryClient.invalidateQueries({ queryKey: ['item-statuses'] })
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

/**
 * Grouper les statuts actifs par groupe
 */
export const useItemActiveStatusByGroup = (itemId: string) => {
  const { data: activeStatuses } = useItemActiveStatus(itemId)
  
  return computed(() => {
    const grouped: Record<StatusGroup, ItemStatus | null> = {
      [StatusGroupEnum.COMMERCIAL]: null,
      [StatusGroupEnum.AUDIENCE]: null,
      [StatusGroupEnum.CONDITION]: null,
      [StatusGroupEnum.LIFECYCLE]: null,
    }
    
    if (activeStatuses.value && activeStatuses.value.length > 0) {
      activeStatuses.value.forEach(itemStatus => {
        const group = itemStatus.status?.group
        if (group) {
          grouped[group] = itemStatus
        }
      })
    }
    
    return grouped
  })
}

/**
 * Obtenir le statut actif pour un groupe spécifique
 */
export const useItemActiveStatusForGroup = (itemId: string, group: StatusGroup) => {
  const grouped = useItemActiveStatusByGroup(itemId)
  
  return computed(() => grouped.value[group] || null)
}
