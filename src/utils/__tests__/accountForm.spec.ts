import { describe, expect, it } from 'vitest'
import { buildAccountCreate, buildAccountUpdate, type AccountDraft } from '../accountForm'
import { FrontendAccountType } from '@/types/enums'

const draft: AccountDraft = { accountName: '  Tabungan utama  ', accountType: FrontendAccountType.BANK, bankId: 'bank-1', initialBalance: 1000, currency: 'IDR', accountNumber: ' 001234 ' }

describe('account form payloads', () => {
  it('trims identity fields and includes the bank only for bank accounts', () => {
    expect(buildAccountCreate(draft)).toEqual({ accountName: 'Tabungan utama', accountType: 'BANK', bankId: 'bank-1', initialBalance: 1000, currency: 'IDR', accountNumber: '001234' })
    const cash = buildAccountCreate({ ...draft, accountType: FrontendAccountType.CASH })
    expect(cash.bankId).toBeUndefined()
  })
  it('rejects missing names, bank selections and invalid balances', () => {
    expect(() => buildAccountCreate({ ...draft, accountName: ' ' })).toThrow('Nama akun wajib diisi.')
    expect(() => buildAccountCreate({ ...draft, bankId: null })).toThrow('Pilih bank')
    expect(() => buildAccountCreate({ ...draft, initialBalance: -1 })).toThrow('Saldo awal')
    expect(() => buildAccountCreate({ ...draft, initialBalance: Number.NaN })).toThrow('Saldo awal')
  })
  it('defaults optional balance, currency and account number', () => {
    expect(buildAccountCreate({ ...draft, initialBalance: null, currency: ' ', accountNumber: ' ' })).toEqual({
      accountName: 'Tabungan utama', accountType: 'BANK', bankId: 'bank-1', initialBalance: 0, currency: 'IDR', accountNumber: null,
    })
  })
  it('updates only name and number, preserving all immutable account fields', () => {
    expect(buildAccountUpdate(draft)).toEqual({ accountName: 'Tabungan utama', accountNumber: '001234' })
    expect(buildAccountUpdate({ ...draft, accountNumber: '' })).toEqual({ accountName: 'Tabungan utama', accountNumber: null })
  })
})
