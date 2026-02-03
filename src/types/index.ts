// Types de base
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

// Authentification
export interface User extends BaseEntity {
  username: string
  email: string
  role: 'USER' | 'MANAGER' | 'ADMIN'
  isActive: boolean
  createdBy?: User
  updatedBy?: User
  activatedBy?: User
  activatedAt?: string
}

export interface LoginDto {
  username: string
  password: string
}

export interface RegisterDto {
  username: string
  email: string
  password: string
}

export interface ForgotPasswordDto {
  email: string
}

export interface ResetPasswordDto {
  token: string
  password: string
}

export interface RefreshTokenDto {
  refreshToken: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
}

// Catégories
export interface Category extends BaseEntity {
  name: string
  description?: string
  parentId?: string
  parent?: Category
  children?: Category[]
  createdBy?: User
  updatedBy?: User
}

export interface CreateCategoryDto {
  name: string
  description?: string
  parentId?: string
}

export interface UpdateCategoryDto {
  name?: string
  description?: string
  parentId?: string
}

// Modèles de matériel
export interface MaterialModel extends BaseEntity {
  name: string
  categoryIds: string[]
  categories?: Category[]
  locationId?: string
  location?: Location
  codeBarre?: string
  etat?: string
  taillePointure?: string
  photoUrl?: string
  referenceFournisseur?: string
  description?: string
  mainImageUrl?: string
  createdBy?: User
  updatedBy?: User
}

export interface CreateMaterialModelDto {
  name: string
  categoryIds: string[]
  referenceFournisseur?: string
  description?: string
  locationId?: string
  codeBarre?: string
  etat?: string
  taillePointure?: string
  photoUrl?: string
}

export interface UpdateMaterialModelDto {
  name?: string
  categoryIds?: string[]
  referenceFournisseur?: string
  description?: string
  locationId?: string
  codeBarre?: string
  etat?: string
  taillePointure?: string
  photoUrl?: string
}

export interface MoveModelDto {
  locationId?: string | null
}

export interface UpdateModelCategoriesDto {
  categoryIds: string[]
}

// Emplacements
export interface Location extends BaseEntity {
  name: string
  capacity?: number
  notes?: string
  parentId?: string
  parent?: Location
  children?: Location[]
}

export interface CreateLocationDto {
  name: string
  capacity?: number
  notes?: string
  parentId?: string
}

export interface UpdateLocationDto {
  name?: string
  capacity?: number
  notes?: string
  parentId?: string
}


// Équipes
export interface Team extends BaseEntity {
  name: string
  categoryAge?: string
  level?: string
}

export interface CreateTeamDto {
  name: string
  categoryAge?: string
  level?: string
}

export interface UpdateTeamDto {
  name?: string
  categoryAge?: string
  level?: string
}

// Affectations
export interface Assignment extends BaseEntity {
  modelId: string
  model?: MaterialModel
  userId?: string
  user?: User
  teamId?: string
  team?: Team
  startAt: string
  endAt?: string
  notes?: string
  createdBy?: User
  updatedBy?: User
}

export interface CreateAssignmentDto {
  modelId: string
  userId?: string
  teamId?: string
  startAt?: string
  notes?: string
}

export interface CloseAssignmentDto {
  notes?: string
}

// Statuts
export enum StatusGroup {
  COMMERCIAL = 'commercial',
  AUDIENCE = 'audience',
  CONDITION = 'condition',
  LIFECYCLE = 'lifecycle',
}

export interface Status extends BaseEntity {
  key: string
  label: string
  group: StatusGroup
  color?: string
  isActive: boolean
  sortOrder: number
  createdBy?: User
  updatedBy?: User
}

export interface CreateStatusDto {
  key: string
  label: string
  group: StatusGroup
  color?: string
  isActive?: boolean
  sortOrder?: number
}

export interface UpdateStatusDto {
  key?: string
  label?: string
  group?: StatusGroup
  color?: string
  isActive?: boolean
  sortOrder?: number
}

export interface ModelStatus extends BaseEntity {
  modelId: string
  model?: MaterialModel
  statusId?: string
  statusKey?: string
  status?: Status
  startAt: string
  endAt?: string | null
  notes?: string
  setById?: string
  setBy?: User
}

export interface SetModelStatusDto {
  modelId: string
  statusId?: string
  statusKey?: string
  notes?: string
}

// Transactions (backend uses 'rental', frontend may receive 'rent' or 'rental')
export interface Transaction extends BaseEntity {
  type: 'rent' | 'rental' | 'sale'
  isAssignment?: boolean
  counterpartyUserId?: string
  counterpartyUser?: User
  counterpartyTeamId?: string
  counterpartyTeam?: Team
  externalName?: string
  startAt: string
  dueAt?: string
  closedAt?: string
  totalAmount?: number
  depositAmount?: number
  penaltyAmount?: number
  notes?: string
  lines?: TransactionItem[]
}

export interface TransactionItem extends BaseEntity {
  transactionId: string
  transaction?: Transaction
  modelId: string
  model?: MaterialModel
  unitPrice?: number
  deposit?: number
  dueAt?: string
  returnedAt?: string
}

export interface CreateRentalDto {
  userId?: string
  teamId?: string
  externalName?: string
  dueAt?: string
  notes?: string
  isAssignment?: boolean
  models: {
    modelId: string
    unitPrice?: number
    deposit?: number
  }[]
}

export interface CreateSaleDto {
  userId?: string
  teamId?: string
  externalName?: string
  notes?: string
  models: {
    modelId: string
    unitPrice?: number
  }[]
}

export interface ReturnRentalDto {
  modelIds?: string[]
  penaltyAmount?: number
  notes?: string
}

// Notifications
export interface Notification extends BaseEntity {
  recipientUserId?: string
  recipientUser?: User
  targetRole?: 'admin' | 'manager' | 'user'
  targetTeamId?: string
  targetTeam?: Team
  createdByUserId?: string
  createdByUser?: User
  title: string
  message?: string
  data?: Record<string, any>
  readAt?: string
  scheduledAt?: string
}

export interface BroadcastDto {
  userId?: string
  targetRole?: 'admin' | 'manager' | 'user'
  targetTeamId?: string
  title: string
  message?: string
  data?: Record<string, any>
  scheduledAt?: string
}

// Audit
export interface AuditLog extends BaseEntity {
  actorUserId?: string
  actorUser?: User
  action: string
  entityName: string
  entityId?: string
  details?: {
    changes?: string[]
    changeDetails?: Record<string, { from: any; to: any }>
    before?: Record<string, any>
    after?: Record<string, any>
  }
  ip?: string
  userAgent?: string
}

// Historique de modèle (timeline agrégée)
export interface ModelHistoryEntry {
  id: string
  type: 'assignment' | 'status' | 'transaction' | 'audit'
  title: string
  description?: string
  timestamp: string
  user?: User
  data?: Record<string, any>
}

// Dashboard
export interface DashboardCategoryCount {
  categoryId: string
  categoryName: string
  count: number
}

export interface DashboardStats {
  totalModels: number
  assignedCount: number
  unassignedCount: number
  rentedCount: number
  availableForRentalCount: number
  activeRentalsCount: number
  rentedByCategory: DashboardCategoryCount[]
  availableByCategory: DashboardCategoryCount[]
  overdueRentalsCount?: number
}

// Réponses API
export interface ApiResponse<T = any> {
  data: T
  message?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Filtres et recherche
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface SearchParams extends PaginationParams {
  search?: string
  categoryId?: string
  locationId?: string
  statusKey?: string
  userId?: string
  teamId?: string
  type?: string
  startDate?: string
  endDate?: string
}

// Erreurs API
export interface ApiError {
  message: string
  statusCode: number
  error?: string
  details?: Record<string, any>
}

// Formulaires
export interface CreateUserDto {
  username: string
  email: string
  password: string
  role?: 'admin' | 'manager' | 'user'
}

export interface UpdateUserDto {
  username?: string
  email?: string
  role?: 'admin' | 'manager' | 'user'
  isActive?: boolean
}

// Buvette - Catégories
export interface BuvetteCategory extends BaseEntity {
  name: string
  description?: string
  parentId?: string
  parent?: BuvetteCategory
  children?: BuvetteCategory[]
}

export interface CreateBuvetteCategoryDto {
  name: string
  description?: string
  parentId?: string
}

export interface UpdateBuvetteCategoryDto {
  name?: string
  description?: string
  parentId?: string
}

// Buvette - Produits
export interface Product extends BaseEntity {
  name: string
  description?: string
  categoryId: string
  category?: BuvetteCategory
  price?: string
  mainImageUrl?: string
  stocks?: Stock[]
}

export interface CreateProductDto {
  name: string
  description?: string
  categoryId: string
  price?: string
  mainImageUrl?: string
}

export interface UpdateProductDto {
  name?: string
  description?: string
  categoryId?: string
  price?: string
  mainImageUrl?: string
}

// Buvette - Stock
export interface Stock extends BaseEntity {
  productId: string
  product?: Product
  locationId?: string
  location?: Location
  quantity: number
  minQuantity?: number
  saleLines?: SaleLine[]
}

export interface CreateStockDto {
  productId: string
  locationId?: string
  quantity: number
  minQuantity?: number
}

export interface UpdateStockDto {
  locationId?: string
  quantity?: number
  minQuantity?: number
}

export interface AdjustStockDto {
  quantity: number
  reason: string
}

// Buvette - Ventes
export interface Sale extends BaseEntity {
  saleDate: string
  status: 'completed' | 'cancelled'
  totalAmount?: string
  counterpartyUserId?: string
  counterpartyUser?: User
  counterpartyTeamId?: string
  counterpartyTeam?: Team
  externalName?: string
  notes?: string
  lines?: SaleLine[]
}

export interface SaleLine extends BaseEntity {
  saleId: string
  sale?: Sale
  stockId: string
  stock?: Stock
  quantity: number
  unitPrice?: string
}

export interface CreateBuvetteSaleDto {
  userId?: string
  teamId?: string
  externalName?: string
  notes?: string
  lines: {
    stockId: string
    quantity: number
    unitPrice?: string
  }[]
}