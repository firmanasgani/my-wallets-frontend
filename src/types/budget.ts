import type { Category } from './enums'

export interface Budget {
  id: string
  userId: string
  categoryId: string
  category?: Category
  amount: number // serialized as decimal string usually from backend, but TS treats as number often if handled, or string. Prisma Decimal -> string in JSON usually? Let's assume number or string. Let's start with number.
  year: number
  month: number
  description?: string
  createdAt: string
  updatedAt: string
}

export interface CreateBudgetPayload {
  categoryId: string
  amount: number
  year: number
  month: number
  description?: string
}

export interface UpdateBudgetPayload {
  categoryId?: string
  amount?: number
  year?: number
  month?: number
  description?: string
}

export interface BudgetFilter {
  year?: number
  month?: number
  categoryId?: string
}

export interface BudgetReportItem extends Budget {
  spent: number
  remaining: number
  percentage: number
}
