import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'
import type { ApiError } from '@/types'

// Configuration de base
const API_URL = import.meta.env.VITE_API_URL || 'https://api-inventory.edwinbouchenna.fr'
const BASE_PATH = import.meta.env.BASE_URL || '/'

// Fonction utilitaire pour construire une URL avec le base path
const buildUrl = (path: string): string => {
  // Enlever le slash initial si présent
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  // Ajouter le base path (qui se termine déjà par /)
  const base = BASE_PATH.endsWith('/') ? BASE_PATH.slice(0, -1) : BASE_PATH
  return `${base}/${cleanPath}`
}

// Instance Axios principale
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Désactivé car CORS gère les credentials
})

// Instance pour les uploads
export const uploadClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.accessToken
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer les réponses et le refresh token
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any
    
    // Si erreur 401 et pas déjà en cours de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const authStore = useAuthStore()
      
      try {
        // Tenter de rafraîchir le token
        await authStore.refreshAccessToken()
        
        // Retry la requête originale avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh échoué, rediriger vers login
        authStore.logout()
        window.location.href = buildUrl('/login')
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

// Même configuration pour uploadClient
uploadClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.accessToken
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

uploadClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const authStore = useAuthStore()
      
      try {
        await authStore.refreshAccessToken()
        originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`
        return uploadClient(originalRequest)
      } catch (refreshError) {
        authStore.logout()
        window.location.href = buildUrl('/login')
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

// Fonction utilitaire pour extraire les erreurs API
export const extractApiError = (error: AxiosError | Error): ApiError => {
  // Si c'est une erreur JavaScript standard (pas Axios), la retourner telle quelle
  if (!('isAxiosError' in error) || !(error as AxiosError).isAxiosError) {
    // Vérifier si c'est une erreur de refresh token
    if (error.message.includes('Aucun refresh token disponible')) {
      return {
        message: error.message,
        statusCode: 401,
        error: 'NoRefreshToken',
        details: error.message,
      }
    }
    // Autre erreur JavaScript
    return {
      message: error.message || 'Une erreur est survenue',
      statusCode: 500,
      error: error.name || 'Error',
      details: error.message,
    }
  }

  const axiosError = error as AxiosError

  // Gestion des erreurs réseau (CORS, timeout, etc.)
  if (!axiosError.response) {
    if (axiosError.code === 'ERR_NETWORK' || axiosError.message === 'Network Error') {
      return {
        message: 'Erreur de connexion au serveur. Vérifiez votre connexion internet et que le serveur est accessible.',
        statusCode: 0,
        error: 'Network Error',
        details: axiosError.message,
      }
    }
    if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
      return {
        message: 'La requête a expiré. Le serveur met trop de temps à répondre.',
        statusCode: 408,
        error: 'Timeout',
        details: axiosError.message,
      }
    }
  }
  
  const response = axiosError.response?.data as any
  
  return {
    message: response?.message || axiosError.message || 'Une erreur est survenue',
    statusCode: axiosError.response?.status || 500,
    error: response?.error || axiosError.code,
    details: response?.details || axiosError.message,
  }
}

// Fonction utilitaire pour les requêtes GET avec gestion d'erreur
export const apiGet = async <T>(url: string, params?: Record<string, any>): Promise<T> => {
  try {
    const response = await apiClient.get<T>(url, { params })
    return response.data
  } catch (error) {
    throw extractApiError(error as AxiosError)
  }
}

// Fonction utilitaire pour les requêtes POST avec gestion d'erreur
export const apiPost = async <T>(url: string, data?: any): Promise<T> => {
  try {
    const response = await apiClient.post<T>(url, data)
    return response.data
  } catch (error) {
    throw extractApiError(error as AxiosError)
  }
}

// Fonction utilitaire pour les requêtes PATCH avec gestion d'erreur
export const apiPatch = async <T>(url: string, data?: any): Promise<T> => {
  try {
    const response = await apiClient.patch<T>(url, data)
    return response.data
  } catch (error) {
    throw extractApiError(error as AxiosError)
  }
}

// Fonction utilitaire pour les requêtes DELETE avec gestion d'erreur
export const apiDelete = async <T>(url: string): Promise<T> => {
  try {
    const response = await apiClient.delete<T>(url)
    return response.data
  } catch (error) {
    throw extractApiError(error as AxiosError)
  }
}

// Fonction utilitaire pour les uploads
export const apiUpload = async <T>(url: string, formData: FormData): Promise<T> => {
  try {
    const response = await uploadClient.post<T>(url, formData)
    return response.data
  } catch (error) {
    throw extractApiError(error as AxiosError)
  }
}
