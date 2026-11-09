import { FrontendAccountType } from '@/types/enums'
import type { CreateAccountPayload, UpdateAccountPayload } from '@/types/accounts'

export interface AccountDraft {
  accountName: string
  accountType: FrontendAccountType
  bankId: string | null
  initialBalance: number | null
  currency: string
  accountNumber: string
}
export function buildAccountUpdate(draft: Pick<AccountDraft, 'accountName' | 'accountNumber'>): UpdateAccountPayload {
  if (!draft.accountName.trim()) throw new Error('Nama akun wajib diisi.')
  return { accountName: draft.accountName.trim(), accountNumber: draft.accountNumber.trim() || null }
}
export function buildAccountCreate(draft: AccountDraft): CreateAccountPayload {
  const identity = buildAccountUpdate(draft)
  if (!Object.values(FrontendAccountType).includes(draft.accountType)) throw new Error('Pilih jenis akun yang valid.')
  if (draft.accountType === FrontendAccountType.BANK && !draft.bankId) throw new Error('Pilih bank untuk rekening ini.')
  const balance = draft.initialBalance ?? 0
  if (!Number.isFinite(balance) || balance < 0) throw new Error('Saldo awal harus berupa angka nol atau lebih.')
  return {
    accountName: identity.accountName!, accountNumber: identity.accountNumber,
    accountType: draft.accountType, initialBalance: balance, currency: draft.currency.trim() || 'IDR',
    ...(draft.accountType === FrontendAccountType.BANK ? { bankId: draft.bankId } : {}),
  }
}
