export enum FrontendAccountType {
  BANK = 'BANK',
  E_WALLET = 'E_WALLET',
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
}

export enum FrontendCategoryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum FrontendTransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
}

export interface Category {
  id: string
  categoryName: string
  categoryType: FrontendCategoryType
  parentCategoryId?: string | null
  userId?: string | null
  icon?: string | null
  color?: string | null
  subCategories?: Category[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateCategoryPayload {
  name: string
  type: FrontendCategoryType
  parentId?: string | null
  icon?: string | null
  color?: string | null
}

export interface UpdateCategoryPayload {
  name: string
  type: FrontendCategoryType
  parentId?: string | null
  icon?: string | null
  color?: string | null
}
export interface QueryCategoryParams {
  type?: FrontendCategoryType
  includeGlobal?: boolean | string
  hierarchical?: boolean | string
  parentOnly?: string
}
