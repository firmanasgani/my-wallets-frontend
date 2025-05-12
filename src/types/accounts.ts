import { FrontendAccountType } from './enums'

export interface Bank {
  id: string
  name: string
  code?: string | null
}

export interface Account {
  id: string
  userId: string
  accountName: string
  accountType: FrontendAccountType
  bankId?: string | null
  bank?: Bank | null
  initialBalance: number
  currentBalance: number
  currency: string
  accountNumber?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateAccountPayload {
  accountName: string
  accountType: FrontendAccountType
  bankId?: string | null
  initialBalance?: number
  currency?: string
  accountNumber?: string | null
}

export interface UpdateAccountPayload {
  accountName?: string
  accountNumber?: string | null
}

export interface Bank {
  id: string
  name: string
  code?: string | null
}
