import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { apiPost, apiGet } from '@/api/client'
import { logger } from '@/utils/logger'
import { storage } from '@/utils/storage'
import { canAccessRoute } from '@/utils/permissions'
import type { User, LoginDto, AuthResponse } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // État
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(storage.getItem('accessToken'))
  const refreshToken = ref<string | null>(storage.getItem('refreshToken'))
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
  
  // Vérifier l'accès à une page selon le rôle (délègue à canAccessRoute pour une seule source de vérité)
  const canAccessPage = (path: string): boolean => {
    if (!isAuthenticated.value || !user.value) return false
    try {
      const router = useRouter()
      const resolved = router.resolve(path)
      return canAccessRoute(resolved, user.value)
    } catch {
      return false
    }
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
      logger.debug('Rôle utilisateur:', { original: response.role, normalized: normalizedRole, isAdmin: normalizedRole === 'ADMIN', isManager: normalizedRole === 'MANAGER' || normalizedRole === 'ADMIN' })
    } catch (error) {
      logger.error('Erreur lors de la récupération du profil:', error)
      // Si erreur, déconnecter l'utilisateur
      logout()
    }
  }

  const refreshTokenAction = async (): Promise<void> => {
    if (!refreshToken.value) {
      // Si pas de refresh token, déconnecter silencieusement
      logger.warn('Aucun refresh token disponible, déconnexion...')
      logout()
      // Lancer une erreur avec un statusCode 401 pour être cohérent avec les autres erreurs d'auth
      const error: any = new Error('Aucun refresh token disponible')
      error.statusCode = 401
      throw error
    }

    try {
      const response = await apiPost<{ accessToken: string }>('/api/auth/refresh', {
        refreshToken: refreshToken.value
      })
      
      accessToken.value = response.accessToken
      storage.setItem('accessToken', response.accessToken)
    } catch (error: any) {
      logger.error('Erreur lors du refresh token:', error)
      // Si l'erreur indique que le refresh token est invalide ou expiré, nettoyer
      if (error?.statusCode === 401 || error?.statusCode === 403 || error?.statusCode === 400) {
        logout()
      }
      throw error
    }
  }

  const logout = (): void => {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    
    storage.removeItem('accessToken')
    storage.removeItem('refreshToken')
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
        logger.error('Erreur lors de l\'initialisation:', error)
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
