import type { RouteLocationNormalized } from 'vue-router'
import type { User } from '@/types'

export type UserRole = 'USER' | 'MANAGER' | 'ADMIN'

export const canAccessRoute = (
  route: RouteLocationNormalized,
  user: User | null
): boolean => {
  if (!user) {
    return !route.meta.requiresAuth
  }

  const userRole = user.role.toUpperCase() as UserRole

  // Admin : accès à tout
  if (userRole === 'ADMIN') {
    return true
  }

  // Manager : accès à tout sauf Settings
  if (userRole === 'MANAGER') {
    if (route.meta.requiresAdmin) {
      return false
    }
    return !route.meta.requiresAuth || route.meta.requiresManager !== false
  }

  // User : accès limité
  if (userRole === 'USER') {
    // Routes autorisées pour les users
    const allowedPaths = ['/catalogue', '/notifications']
    const path = route.path.split('?')[0]
    
    if (allowedPaths.includes(path)) {
      return true
    }
    
    // Routes qui commencent par /catalogue/ ou /notifications/
    if (path.startsWith('/catalogue/') || path.startsWith('/notifications/')) {
      return true
    }
    
    
    return false
  }

  return false
}

export const hasPermission = (
  user: User | null,
  permission: 'read' | 'write' | 'admin' | 'manager'
): boolean => {
  if (!user) return false

  const role = user.role.toUpperCase() as UserRole

  switch (permission) {
    case 'admin':
      return role === 'ADMIN'
    case 'manager':
      return role === 'MANAGER' || role === 'ADMIN'
    case 'write':
      return role === 'MANAGER' || role === 'ADMIN'
    case 'read':
      return true // Tous les utilisateurs authentifiés peuvent lire
    default:
      return false
  }
}
