import type { FrontendAccountType, FrontendTransactionType } from '@/types/enums'

interface BasicAccountInfo {
  id: string
  accountName: string
  accountType?: FrontendAccountType // Opsional jika hanya perlu nama
}

interface BasicCategoryInfo {
  id: string
  categoryName: string
  color?: string | null
  icon?: string | null
}

export interface Transaction {
  id: string
  userId: string
  transactionType: FrontendTransactionType
  amount: number
  transactionDate: string
  description?: string | null
  categoryId?: string | null
  category?: BasicCategoryInfo | null
  sourceAccountId?: string | null
  sourceAccount?: BasicAccountInfo | null
  destinationAccountId?: string | null
  destinationAccount?: BasicAccountInfo | null
  createdAt: string
  updatedAt: string
}

export interface QueryTransactionDto {
  page?: number
  limit?: number
  accountId?: string | null
  categoryId?: string | null
  type?: FrontendTransactionType | null
  sortBy?: string | null
  sortOrder?: 'asc' | 'desc'
  startDate?: string | null
  endDate?: string | null
}

export interface CreateTransactionCommonPayload {
  amount: number
  transactionDate?: string | null // YYYY-MM-DD
  description?: string | null
}

export interface CreateIncomePayload extends CreateTransactionCommonPayload {
  destinationAccountId: string
  categoryId: string // Kategori tipe INCOME
}

export interface CreateExpensePayload extends CreateTransactionCommonPayload {
  sourceAccountId: string
  categoryId: string // Kategori tipe EXPENSE
}

export interface CreateTransferPayload extends CreateTransactionCommonPayload {
  sourceAccountId: string
  destinationAccountId: string
  // categoryId biasanya null atau tidak dipakai untuk transfer
}
