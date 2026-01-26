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
      queryClient.invalidateQueries({ queryKey: ['item-statuses', 'active', variables.modelId] })
      queryClient.invalidateQueries({ queryKey: ['item-statuses', 'history', variables.modelId] })
      queryClient.invalidateQueries({ queryKey: ['item-statuses'] })
      queryClient.invalidateQueries({ queryKey: ['material-models'] })
    },
  })
}

export const useModelActiveStatus = (modelId: string) => {
  return useQuery({
    queryKey: ['item-statuses', 'active', modelId],
    queryFn: () => statusesApi.getModelActiveStatus(modelId),
    enabled: !!modelId,
  })
}

export const useModelStatusHistory = (modelId: string) => {
  return useQuery({
    queryKey: ['item-statuses', 'history', modelId],
    queryFn: () => statusesApi.getModelStatusHistory(modelId),
    enabled: !!modelId,
  })
}

/**
 * Grouper les statuts actifs par groupe
 */
export const useModelActiveStatusByGroup = (modelId: string) => {
  const { data: activeStatuses } = useModelActiveStatus(modelId)
  
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
export const useModelActiveStatusForGroup = (modelId: string, group: StatusGroup) => {
  const grouped = useModelActiveStatusByGroup(modelId)
  
  return computed(() => grouped.value[group] || null)
}

// Aliases pour compatibilité
export const useItemActiveStatus = useModelActiveStatus
export const useItemStatusHistory = useModelStatusHistory
export const useItemActiveStatusByGroup = useModelActiveStatusByGroup
export const useItemActiveStatusForGroup = useModelActiveStatusForGroup
