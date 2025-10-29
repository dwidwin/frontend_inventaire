import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiPost } from '@/api/client'
import type { User, LoginDto, AuthResponse } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // État
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isManager = computed(() => user.value?.role === 'MANAGER' || isAdmin.value)
  const canManageUsers = computed(() => isManager.value)
  const canManageInventory = computed(() => isManager.value)

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
      const response = await apiPost<User>('/api/auth/me')
      user.value = response
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
    user.value = updatedUser
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
    canManageUsers,
    canManageInventory,
    
    // Actions
    login,
    fetchUser,
    refreshToken: refreshTokenAction,
    logout,
    updateUser,
    initialize,
  }
})
