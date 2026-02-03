import { apiGet, apiPost, apiPatch } from '@/api/client'
import type { Transaction, CreateRentalDto, CreateSaleDto, ReturnRentalDto } from '@/types'

export const transactionsApi = {
  // Liste des transactions (réponse paginée ou tableau)
  list: (): Promise<Transaction[]> => {
    return apiGet<{ data?: Transaction[] } | Transaction[]>('/api/transactions').then((r) =>
      Array.isArray(r) ? r : (r?.data ?? [])
    )
  },

  // Locations / affectations de l'utilisateur connecté (Mon inventaire)
  getMyRentals: (): Promise<Transaction[]> => {
    return apiGet<Transaction[]>('/api/transactions/rentals/me')
  },

  // Lignes de transaction pour un modèle (historique locations/affectations/ventes)
  getItemsByModel: (modelId: string): Promise<import('@/types').TransactionItem[]> => {
    return apiGet<import('@/types').TransactionItem[]>(`/api/transactions/model/${modelId}`)
  },

  // Détail d'une transaction
  get: (id: string): Promise<Transaction> => {
    return apiGet<Transaction>(`/api/transactions/${id}`)
  },

  // Créer une location
  createRental: (data: CreateRentalDto): Promise<Transaction> => {
    return apiPost<Transaction>('/api/transactions/rent', data)
  },

  // Retourner des items d'une location
  returnRental: (id: string, data: ReturnRentalDto): Promise<Transaction> => {
    return apiPatch<Transaction>(`/api/transactions/rent/${id}/return`, data)
  },

  // Créer une vente
  createSale: (data: CreateSaleDto): Promise<Transaction> => {
    return apiPost<Transaction>('/api/transactions/sale', data)
  },
}
