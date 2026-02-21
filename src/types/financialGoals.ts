import { GoalStatus, GoalLedgerType, GoalLedgerDirection } from './enums'
import type { Account } from './accounts'
import type { Transaction } from './transaction'

export interface FinancialGoal {
  id: string
  userId: string
  name: string
  description?: string | null
  targetAmount: number
  startDate: string
  targetDate?: string | null
  status: GoalStatus
  priority?: number | null
  createdAt: string
  updatedAt: string
  // Virtual fields calculation by backend
  currentSaved: number
  progressPercentage: number
  remainingAmount: number
  ledgers?: GoalLedger[]
}

export interface GoalLedger {
  id: string
  goalId: string
  direction: GoalLedgerDirection
  type: GoalLedgerType
  amount: number
  note?: string | null
  accountId?: string | null
  account?: Partial<Account> | null
  referenceTransactionId?: string | null
  referenceTransaction?: Partial<Transaction> | null
  createdAt: string
}

export interface CreateGoalPayload {
  name: string
  targetAmount: string | number
  targetDate?: string // ISO 8601
  description?: string
}

export interface UpdateGoalPayload {
  name?: string
  targetAmount?: string | number
  targetDate?: string
  description?: string
  status?: GoalStatus
  priority?: number
}

export interface AllocateGoalPayload {
  accountId: string
  amount: string | number
  note?: string
}

export interface SpendGoalPayload {
  accountId: string
  amount: string | number
  categoryId: string
  note?: string
  transactionDate?: string
}

export interface ReleaseGoalPayload {
  accountId: string
  amount: string | number
  note?: string
}

export interface AdjustGoalPayload {
  accountId: string
  amount: string | number
  direction: GoalLedgerDirection
  note?: string
}
