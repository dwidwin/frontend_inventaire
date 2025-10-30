import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'
import type { ApiError } from '@/types'

// Configuration de base
const API_URL = import.meta.env.VITE_API_URL || 'https://api-inventory.edwinbouchenna.fr'

// Instance Axios principale
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
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
        window.location.href = '/login'
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
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

// Fonction utilitaire pour extraire les erreurs API
export const extractApiError = (error: AxiosError): ApiError => {
  const response = error.response?.data as any
  
  return {
    message: response?.message || error.message || 'Une erreur est survenue',
    statusCode: error.response?.status || 500,
    error: response?.error,
    details: response?.details,
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
