import { apiPost, apiGet } from '@/api/client'
import type { User, LoginDto, AuthResponse, RegisterDto, ForgotPasswordDto, ResetPasswordDto } from '@/types'

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
    return apiGet<User>('/api/auth/me')
  },

  // Mot de passe oublié
  forgotPassword: (data: ForgotPasswordDto): Promise<{ message: string }> => {
    return apiPost<{ message: string }>('/api/auth/forgot-password', data)
  },

  // Réinitialiser le mot de passe
  resetPassword: (data: ResetPasswordDto): Promise<{ message: string }> => {
    return apiPost<{ message: string }>('/api/auth/reset-password', data)
  },

  // Inscription
  register: (data: RegisterDto): Promise<User> => {
    return apiPost<User>('/api/users/register', data)
  },
}
