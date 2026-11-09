import type { Account } from '@/types/accounts'
import { FrontendAccountType } from '@/types/enums'

export type AccountSort = 'name' | 'newest' | 'oldest'
export const accountTypes = [
  { value: FrontendAccountType.BANK, label: 'Rekening bank', icon: 'bank' },
  { value: FrontendAccountType.E_WALLET, label: 'E-wallet', icon: 'wallet' },
  { value: FrontendAccountType.CASH, label: 'Tunai', icon: 'coins' },
  { value: FrontendAccountType.CREDIT_CARD, label: 'Kartu kredit', icon: 'credit' },
]
export const accountCurrency = (account: Account) => account.currency?.trim().toUpperCase() || 'IDR'
export function canCreateAccount(plan: string | undefined, total: number) { return plan !== 'FREE' || total < 4 }

export function filterAccountList(accounts: Account[], search: string, type: FrontendAccountType | null, currency: string, sort: AccountSort) {
  const query = search.trim().toLocaleLowerCase()
  const result = accounts.filter((account) => (!type || account.accountType === type)
    && (!currency || accountCurrency(account) === currency)
    && (!query || [account.accountName, account.bank?.name, account.accountNumber].some((value) => value?.toLocaleLowerCase().includes(query))))
  return result.sort((a, b) => {
    if (sort === 'name') return a.accountName.localeCompare(b.accountName, 'id-ID')
    const aDate = Date.parse(a.createdAt) || 0
    const bDate = Date.parse(b.createdAt) || 0
    return (sort === 'oldest' ? aDate - bDate : bDate - aDate) || a.accountName.localeCompare(b.accountName, 'id-ID')
  })
}

export function accountBalanceTotals(accounts: Account[]) {
  const groups = new Map<string, { currency: string; balance: number; count: number }>()
  for (const account of accounts) {
    const currency = accountCurrency(account)
    const group = groups.get(currency) || { currency, balance: 0, count: 0 }
    const amount = Number(account.currentBalance)
    if (Number.isFinite(amount)) group.balance += amount
    group.count++
    groups.set(currency, group)
  }
  return [...groups.values()].sort((a, b) => a.currency === b.currency ? 0 : a.currency === 'IDR' ? -1 : b.currency === 'IDR' ? 1 : a.currency.localeCompare(b.currency))
}

export function accountMoney(value: number | string | null | undefined, currency: string) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'
  try { return new Intl.NumberFormat('id-ID', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount) }
  catch { return `${currency} ${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(amount)}` }
}
