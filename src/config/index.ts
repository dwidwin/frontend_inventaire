// Configuration de l'application
export const config = {
  // URL de l'API
  apiUrl: import.meta.env.VITE_API_URL || 'https://api-inventory.edwinbouchenna.fr',
  
  // Nom de l'application
  appName: import.meta.env.VITE_APP_NAME || 'Inventaire Club',
  
  // Configuration des paginations
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },
  
  // Configuration des uploads
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  
  // Configuration des notifications
  notifications: {
    refreshInterval: 30000, // 30 secondes
    maxDisplay: 5,
  },
  
  // Configuration des requêtes
  query: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    retryAttempts: 3,
  },
  
  // Configuration API
  api: {
    timeout: 10000, // 10 secondes
    uploadTimeout: 30000, // 30 secondes pour les uploads
  },
  
  // Configuration des toasts
  toast: {
    defaultDuration: 5000, // 5 secondes
    errorDuration: 7000, // 7 secondes pour les erreurs
  },
}
