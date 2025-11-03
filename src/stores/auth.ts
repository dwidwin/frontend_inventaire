import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiPost, apiGet } from '@/api/client'
import type { User, LoginDto, AuthResponse } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // État
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const isLoading = ref(false)

  // Helper pour normaliser le rôle
  const normalizeRole = (role: string | undefined): string => {
    if (!role) return ''
    return role.toUpperCase()
  }

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const isAdmin = computed(() => normalizeRole(user.value?.role) === 'ADMIN')
  const isManager = computed(() => {
    const role = normalizeRole(user.value?.role)
    return role === 'MANAGER' || role === 'ADMIN'
  })
  const isUser = computed(() => {
    const role = normalizeRole(user.value?.role)
    return role === 'USER'
  })
  const canManageUsers = computed(() => isManager.value)
  const canManageInventory = computed(() => isManager.value)
  
  // Permissions
  // Peut lire : tous les utilisateurs authentifiés peuvent lire ce à quoi ils ont accès
  const canRead = computed(() => isAuthenticated.value)
  
  // Peut écrire/modifier : admin et manager peuvent écrire, user ne peut que lire
  const canWrite = computed(() => isAdmin.value || isManager.value)
  
  // Vérifier l'accès à une page selon le rôle
  const canAccessPage = (path: string): boolean => {
    if (!isAuthenticated.value) return false
    
    // Admin : accès à tout
    if (isAdmin.value) return true
    
    // Manager : accès à tout sauf Settings
    if (isManager.value) {
      return path !== '/settings'
    }
    
    // User : accès uniquement à Catalogue et Notifications
    // Permettre aussi l'accès aux détails d'item (/items/:id) pour la lecture seule
    // Exclure Dashboard (/), Items list (/items), et toutes les autres pages
    if (isUser.value) {
      // Routes autorisées pour les users
      if (path === '/catalogue' || path === '/notifications') {
        return true
      }
      // Routes qui commencent par /catalogue/ ou /notifications/ (sous-routes)
      if (path.startsWith('/catalogue/') || path.startsWith('/notifications/')) {
        return true
      }
      // Permettre l'accès aux détails d'item pour la lecture seule
      // Format: /items/:id où :id est un UUID ou un nombre
      if (/^\/items\/[^/]+$/.test(path)) {
        return true
      }
      // Toutes les autres routes sont interdites
      return false
    }
    
    return false
  }

  // Actions
  const login = async (credentials: LoginDto): Promise<void> => {
    isLoading.value = true
    try {
      const response = await apiPost<AuthResponse>('/api/auth/login', credentials)
      
      accessToken.value = response.accessToken
      refreshToken.value = response.refreshToken
      
      // Sauvegarder les tokens
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      
      // Récupérer les infos utilisateur
      await fetchUser()
    } finally {
      isLoading.value = false
    }
  }

  const fetchUser = async (): Promise<void> => {
    if (!accessToken.value) return
    
    try {
      const response = await apiGet<User>('/api/auth/me')
      // Normaliser le rôle en majuscules pour assurer la cohérence
      const normalizedRole = normalizeRole(response.role) as 'USER' | 'MANAGER' | 'ADMIN'
      user.value = {
        ...response,
        role: normalizedRole
      }
      // Debug: afficher le rôle normalisé (à retirer en production si nécessaire)
      console.log('Rôle utilisateur:', { original: response.role, normalized: normalizedRole, isAdmin: normalizedRole === 'ADMIN', isManager: normalizedRole === 'MANAGER' || normalizedRole === 'ADMIN' })
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error)
      // Si erreur, déconnecter l'utilisateur
      logout()
    }
  }

  const refreshTokenAction = async (): Promise<void> => {
    if (!refreshToken.value) {
      throw new Error('Aucun refresh token disponible')
    }

    try {
      const response = await apiPost<{ accessToken: string }>('/api/auth/refresh', {
        refreshToken: refreshToken.value
      })
      
      accessToken.value = response.accessToken
      localStorage.setItem('accessToken', response.accessToken)
    } catch (error) {
      console.error('Erreur lors du refresh token:', error)
      logout()
      throw error
    }
  }

  const logout = (): void => {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  const updateUser = (updatedUser: User): void => {
    // Normaliser le rôle lors de la mise à jour
    user.value = {
      ...updatedUser,
      role: normalizeRole(updatedUser.role) as 'USER' | 'MANAGER' | 'ADMIN'
    }
  }

  // Initialisation au démarrage de l'app
  const initialize = async (): Promise<void> => {
    if (accessToken.value) {
      try {
        await fetchUser()
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error)
        logout()
      }
    }
  }

  return {
    // État
    user,
    accessToken,
    refreshToken,
    isLoading,
    
    // Getters
    isAuthenticated,
    isAdmin,
    isManager,
    isUser,
    canManageUsers,
    canManageInventory,
    
    // Permissions
    canRead,
    canWrite,
    canAccessPage,
    
    // Actions
    login,
    fetchUser,
    refreshAccessToken: refreshTokenAction,
    logout,
    updateUser,
    initialize,
  }
})
