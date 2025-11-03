import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { buvetteCategoriesApi } from '@/api/endpoints'
import type { BuvetteCategory, CreateBuvetteCategoryDto, UpdateBuvetteCategoryDto } from '@/types'

export const useBuvetteCategories = () => {
  return useQuery({
    queryKey: ['buvetteCategories'],
    queryFn: () => buvetteCategoriesApi.list(),
  })
}

export const useBuvetteCategory = (id: string) => {
  return useQuery({
    queryKey: ['buvetteCategories', id],
    queryFn: () => buvetteCategoriesApi.get(id),
    enabled: !!id,
  })
}

export const useCreateBuvetteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBuvetteCategoryDto) => buvetteCategoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buvetteCategories'] })
    },
  })
}

export const useUpdateBuvetteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBuvetteCategoryDto }) =>
      buvetteCategoriesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['buvetteCategories'] })
      queryClient.invalidateQueries({ queryKey: ['buvetteCategories', id] })
    },
  })
}

export const useDeleteBuvetteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => buvetteCategoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buvetteCategories'] })
    },
  })
}

