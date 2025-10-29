import { apiPost } from '@/api/client'
import type { User, LoginDto, AuthResponse } from '@/types'

export const authApi = {
  // Connexion
  login: (credentials: LoginDto): Promise<AuthResponse> => {
    return apiPost<AuthResponse>('/api/auth/login', credentials)
  },

  // Rafraîchir le token
  refresh: (refreshToken: string): Promise<{ accessToken: string }> => {
    return apiPost<{ accessToken: string }>('/api/auth/refresh', { refreshToken })
  },

  // Profil utilisateur actuel
  me: (): Promise<User> => {
    return apiPost<User>('/api/auth/me')
  },
}
