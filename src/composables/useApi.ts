// Re-export des composables pour faciliter l'import
export * from './useUsers'
export * from './useCategories'
export * from './useItems'
export * from './useNotifications'

// Composables pour les autres entités
export { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

// Composable utilitaire pour les requêtes avec gestion d'erreur
export const useApiQuery = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: any
) => {
  return useQuery({
    queryKey,
    queryFn,
    ...options,
  })
}

// Composable utilitaire pour les mutations avec gestion d'erreur
export const useApiMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: any
) => {
  return useMutation({
    mutationFn,
    ...options,
  })
}
