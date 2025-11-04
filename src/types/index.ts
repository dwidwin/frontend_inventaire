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
}

export interface LoginDto {
  username: string
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
  categoryId: string
  category?: Category
  referenceFournisseur?: string
  description?: string
  mainImageUrl?: string
}

export interface CreateMaterialModelDto {
  name: string
  categoryId: string
  referenceFournisseur?: string
  description?: string
}

export interface UpdateMaterialModelDto {
  name?: string
  categoryId?: string
  referenceFournisseur?: string
  description?: string
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

// Items
export interface Item extends BaseEntity {
  modelId: string
  model?: MaterialModel
  locationId?: string
  location?: Location
  codeBarre?: string
  photoUrl?: string
  etat?: string
}

export interface CreateItemDto {
  modelId: string
  locationId?: string
  codeBarre?: string
  etat?: string
}

export interface UpdateItemDto {
  modelId?: string
  locationId?: string
  codeBarre?: string
  etat?: string
}

export interface MoveItemDto {
  locationId: string
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
  itemId: string
  item?: Item
  userId?: string
  user?: User
  teamId?: string
  team?: Team
  startAt: string
  endAt?: string
  notes?: string
}

export interface CreateAssignmentDto {
  itemId: string
  userId?: string
  teamId?: string
  startAt?: string
  notes?: string
}

export interface CloseAssignmentDto {
  endAt: string
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

export interface ItemStatus extends BaseEntity {
  itemId: string
  item?: Item
  statusId?: string
  statusKey?: string
  status?: Status
  startAt: string
  endAt?: string | null
  notes?: string
  setById?: string
  setBy?: User
}

export interface SetItemStatusDto {
  itemId: string
  statusId?: string
  statusKey?: string
  notes?: string
}

// Transactions
export interface Transaction extends BaseEntity {
  type: 'rent' | 'sale'
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
  items?: TransactionItem[]
}

export interface TransactionItem extends BaseEntity {
  transactionId: string
  transaction?: Transaction
  itemId: string
  item?: Item
  unitPrice?: number
  deposit?: number
  dueAt?: string
  returnedAt?: string
}

export interface CreateRentalDto {
  counterpartyUserId?: string
  counterpartyTeamId?: string
  externalName?: string
  dueAt?: string
  totalAmount?: number
  depositAmount?: number
  notes?: string
  items: {
    itemId: string
    unitPrice?: number
    deposit?: number
    dueAt?: string
  }[]
}

export interface CreateSaleDto {
  counterpartyUserId?: string
  counterpartyTeamId?: string
  externalName?: string
  totalAmount?: number
  notes?: string
  items: {
    itemId: string
    unitPrice?: number
  }[]
}

export interface ReturnRentalDto {
  items: {
    itemId: string
    returnedAt: string
  }[]
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
  title: string
  message?: string
  data?: Record<string, any>
  readAt?: string
}

export interface BroadcastDto {
  targetRole?: 'admin' | 'manager' | 'user'
  targetTeamId?: string
  title: string
  message?: string
  data?: Record<string, any>
}

// Audit
export interface AuditLog extends BaseEntity {
  actorUserId?: string
  actorUser?: User
  action: string
  entityName: string
  entityId?: string
  details?: Record<string, any>
  ip?: string
  userAgent?: string
}

// Historique d'item (timeline agrégée)
export interface ItemHistoryEntry {
  id: string
  type: 'assignment' | 'status' | 'transaction' | 'audit'
  title: string
  description?: string
  timestamp: string
  user?: User
  data?: Record<string, any>
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