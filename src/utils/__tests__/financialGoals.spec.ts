import { describe, expect, it } from 'vitest'
import { GoalLedgerDirection, GoalLedgerType, GoalStatus, FrontendCategoryType } from '@/types/enums'
import type { FinancialGoal, GoalLedger } from '@/types/financialGoals'
import type { Account } from '@/types/accounts'
import { buildGoalPayload, filterGoals, goalProgress, releasableFromAccount, validateGoalFunds, type GoalDraft } from '../financialGoals'

const ledger = (accountId: string, type: GoalLedgerType, direction: GoalLedgerDirection, amount: number) => ({ accountId, type, direction, amount } as GoalLedger)
const ledgers = [ledger('a', GoalLedgerType.ALLOCATE, GoalLedgerDirection.INCOMING, 100), ledger('a', GoalLedgerType.SPEND, GoalLedgerDirection.OUTGOING, 20), ledger('a', GoalLedgerType.RELEASE, GoalLedgerDirection.OUTGOING, 10), ledger('b', GoalLedgerType.ALLOCATE, GoalLedgerDirection.INCOMING, 50)]
const goal = { id: 'g', name: 'Rumah', status: GoalStatus.ACTIVE, targetAmount: 200, currentSaved: 120, createdAt: '2026-11-09', ledgers } as FinancialGoal
const draft: GoalDraft = { name: '  Rumah baru ', targetAmount: 200, targetDate: '2027-11-09', description: '  Catatan ', status: GoalStatus.ACTIVE }
const accounts = [{ id: 'a', currentBalance: 1000 }, { id: 'b', currentBalance: 10 }] as Account[]
const categories = [{ id: 'expense', categoryName: 'Belanja', categoryType: FrontendCategoryType.EXPENSE }, { id: 'income', categoryName: 'Gaji', categoryType: FrontendCategoryType.INCOME }]
const funds = { accountId: 'a', amount: 50, categoryId: 'expense', note: '', date: '2026-11-09' }

describe('financial goal workflows', () => {
  it('normalizes decimal API values and distinguishes funded targets from status', () => {
    expect(goalProgress({ ...goal, currentSaved: '250' as unknown as number })).toEqual({ saved: 250, target: 200, percentage: 125, width: 100, remaining: 0, reached: true })
    expect(goalProgress({ ...goal, targetAmount: 0 }).percentage).toBe(0)
  })
  it('builds trimmed create fields and adds status only for updates', () => {
    expect(buildGoalPayload(draft)).toEqual({ name: 'Rumah baru', description: 'Catatan', targetAmount: 200, targetDate: '2027-11-09' })
    expect(buildGoalPayload(draft, goal).status).toBe(GoalStatus.ACTIVE)
  })
  it('rejects invalid names, amounts, dates and unsupported deadline removal', () => {
    expect(() => buildGoalPayload({ ...draft, name: ' ' })).toThrow('Nama')
    expect(() => buildGoalPayload({ ...draft, targetAmount: 0 })).toThrow('nominal')
    expect(() => buildGoalPayload({ ...draft, targetAmount: null })).toThrow('nominal')
    expect(() => buildGoalPayload({ ...draft, targetDate: '2026-02-30' })).toThrow('tanggal')
    expect(() => buildGoalPayload({ ...draft, targetDate: '' }, { ...goal, targetDate: '2027-11-09' })).toThrow('diganti')
  })
  it('blocks cancellation until allocations have been released', () => {
    expect(() => buildGoalPayload({ ...draft, status: GoalStatus.CANCELLED }, goal)).toThrow('Lepaskan')
    expect(buildGoalPayload({ ...draft, status: GoalStatus.CANCELLED }, { ...goal, currentSaved: 0 }).status).toBe(GoalStatus.CANCELLED)
  })
  it('calculates release limits per account using the API ledger rules', () => {
    expect(releasableFromAccount(ledgers, 'a')).toBe(70)
    expect(releasableFromAccount(ledgers, 'b')).toBe(50)
    expect(releasableFromAccount(ledgers, 'missing')).toBe(0)
    expect(() => validateGoalFunds('release', goal, { ...funds, amount: 80 }, accounts, categories)).toThrow('alokasi')
  })
  it('validates active allocations and actual expense requirements', () => {
    expect(() => validateGoalFunds('allocate', { ...goal, status: GoalStatus.COMPLETED }, funds, accounts, categories)).toThrow('aktif')
    expect(() => validateGoalFunds('spend', goal, { ...funds, amount: 130 }, accounts, categories)).toThrow('terkumpul')
    expect(() => validateGoalFunds('spend', goal, { ...funds, accountId: 'b' }, accounts, categories)).toThrow('Saldo')
    expect(() => validateGoalFunds('spend', goal, { ...funds, categoryId: 'income' }, accounts, categories)).toThrow('kategori')
    expect(() => validateGoalFunds('spend', goal, { ...funds, date: '' }, accounts, categories)).toThrow('tanggal')
    validateGoalFunds('spend', goal, funds, accounts, categories)
  })
  it('combines status and note search with stable deadline sorting', () => {
    const rows = [{ ...goal, id: 'a', description: 'Keluarga', targetDate: null }, { ...goal, id: 'b', targetDate: '2027-01-01', status: GoalStatus.COMPLETED }, { ...goal, id: 'c', targetDate: '2026-12-01' }]
    expect(filterGoals(rows, ' keluarga ', 'ACTIVE', 'newest').map((item) => item.id)).toEqual(['a'])
    expect(filterGoals(rows, '', '', 'deadline').map((item) => item.id)).toEqual(['c', 'b', 'a'])
  })
})
