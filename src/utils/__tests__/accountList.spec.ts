import { describe, expect, it } from 'vitest'
import { accountBalanceTotals, accountMoney, canCreateAccount, filterAccountList } from '../accountList'
import type { Account } from '@/types/accounts'
import { FrontendAccountType } from '@/types/enums'

const accounts = [
  { id: 'b', accountName: 'Bank utama', accountType: 'BANK', currency: 'IDR', currentBalance: '1000', bank: { name: 'Bank Contoh' }, accountNumber: '12345678', createdAt: '2026-01-02' },
  { id: 'c', accountName: 'Dompet tunai', accountType: 'CASH', currency: 'IDR', currentBalance: 200, createdAt: '2026-01-01' },
  { id: 'w', accountName: 'Wallet digital', accountType: 'E_WALLET', currency: 'USD', currentBalance: 30, createdAt: '2026-01-03' },
  { id: 'k', accountName: 'Kartu kredit', accountType: 'CREDIT_CARD', currency: 'IDR', currentBalance: -100, createdAt: '2026-01-04' },
] as unknown as Account[]

describe('account list', () => {
  it('keeps the Free limit based on every account even when the view is filtered', () => {
    expect(filterAccountList(accounts, '', FrontendAccountType.CASH, '', 'name')).toHaveLength(1)
    expect(canCreateAccount('FREE', accounts.length)).toBe(false)
    expect(canCreateAccount('FREE', 3)).toBe(true)
    expect(canCreateAccount('PREMIUM', accounts.length)).toBe(true)
  })
  it('combines name, bank, type, currency and account-number filters', () => {
    expect(filterAccountList(accounts, '  contoh  ', FrontendAccountType.BANK, 'IDR', 'name').map((account) => account.id)).toEqual(['b'])
    expect(filterAccountList(accounts, '5678', null, '', 'name').map((account) => account.id)).toEqual(['b'])
    expect(filterAccountList(accounts, '', null, 'USD', 'name').map((account) => account.id)).toEqual(['w'])
    expect(filterAccountList(accounts, 'tidak ada', null, '', 'name')).toEqual([])
  })
  it('sorts without mutating the store array', () => {
    expect(filterAccountList(accounts, '', null, '', 'newest').map((account) => account.id)).toEqual(['k', 'w', 'b', 'c'])
    expect(filterAccountList(accounts, '', null, '', 'oldest').map((account) => account.id)).toEqual(['c', 'b', 'w', 'k'])
    expect(accounts.map((account) => account.id)).toEqual(['b', 'c', 'w', 'k'])
  })
  it('keeps balances in different currencies separate and includes signed amounts', () => {
    expect(accountBalanceTotals(accounts)).toEqual([
      { currency: 'IDR', balance: 1100, count: 3 }, { currency: 'USD', balance: 30, count: 1 },
    ])
    expect(accountBalanceTotals([])).toEqual([])
  })
  it('formats invalid or unknown monetary values without breaking the page', () => {
    expect(accountMoney('invalid', 'IDR')).toBe('—')
    expect(accountMoney(12, 'invalid-code')).toBe('invalid-code 12')
    expect(accountMoney(null, 'IDR')).toBe(accountMoney(0, 'IDR'))
  })
})
