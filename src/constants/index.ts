// Constantes de l'application

// Rôles utilisateur
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER',
} as const

// Types de transactions
export const TRANSACTION_TYPES = {
  RENT: 'rent',
  SALE: 'sale',
} as const

/** Statuts des modèles de matériel (MaterialModel.etat). À aligner avec les valeurs backend (ex. en_stock, vendu, loué). */
export const ITEM_STATUSES = {
  STOCK: 'stock',
  ASSIGNED: 'assigned',
  RENTED: 'rented',
  SOLD: 'sold',
  REPAIR: 'repair',
  LOST: 'lost',
} as const

// Couleurs pour les statuts
export const STATUS_COLORS = {
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  gray: 'gray',
} as const

// Messages d'erreur
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre connexion internet.',
  UNAUTHORIZED: 'Vous n\'êtes pas autorisé à effectuer cette action.',
  FORBIDDEN: 'Accès refusé.',
  NOT_FOUND: 'Ressource non trouvée.',
  VALIDATION_ERROR: 'Données invalides.',
  SERVER_ERROR: 'Erreur serveur. Veuillez réessayer plus tard.',
} as const

// Messages de succès
export const SUCCESS_MESSAGES = {
  CREATED: 'Élément créé avec succès.',
  UPDATED: 'Élément modifié avec succès.',
  DELETED: 'Élément supprimé avec succès.',
  SAVED: 'Modifications sauvegardées.',
} as const
