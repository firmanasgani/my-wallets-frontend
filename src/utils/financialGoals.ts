import { GoalStatus } from '@/types/enums'
import type { CreateGoalPayload, FinancialGoal, GoalLedger, UpdateGoalPayload } from '@/types/financialGoals'
import type { Account } from '@/types/accounts'
import type { Category } from '@/types/enums'
import { flattenCategories } from './categoryTree'
import { parseDate } from './dateRange'

export const goalNumber = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0
export const goalStatusOptions = [{ value: GoalStatus.ACTIVE, label: 'Aktif' }, { value: GoalStatus.COMPLETED, label: 'Selesai' }, { value: GoalStatus.CANCELLED, label: 'Dibatalkan' }]
export const goalStatusLabel = (status: string) => goalStatusOptions.find((option) => option.value === status)?.label || status
export function goalProgress(goal: FinancialGoal) {
  const saved = Math.max(0, goalNumber(goal.currentSaved)), target = Math.max(0, goalNumber(goal.targetAmount))
  const percentage = target > 0 ? saved / target * 100 : 0
  return { saved, target, percentage, width: Math.min(100, percentage), remaining: Math.max(0, target - saved), reached: target > 0 && saved >= target }
}
export function filterGoals(goals: FinancialGoal[], search: string, status: string, sort: string) {
  const query = search.trim().toLocaleLowerCase('id-ID')
  return goals.filter((goal) => (!status || goal.status === status) && (!query || `${goal.name} ${goal.description || ''}`.toLocaleLowerCase('id-ID').includes(query))).sort((a, b) => {
    if (sort === 'deadline') return (Date.parse(a.targetDate || '') || Infinity) - (Date.parse(b.targetDate || '') || Infinity) || a.name.localeCompare(b.name, 'id-ID')
    if (sort === 'progress') return goalProgress(b).percentage - goalProgress(a).percentage || a.name.localeCompare(b.name, 'id-ID')
    return (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0) || a.name.localeCompare(b.name, 'id-ID')
  })
}
export interface GoalDraft { name: string; targetAmount: number | null; targetDate: string; description: string; status: GoalStatus }
export function buildGoalPayload(draft: GoalDraft, original?: FinancialGoal | null): CreateGoalPayload & UpdateGoalPayload {
  const name = draft.name.trim(), description = draft.description.trim()
  if (!name || name.length > 100) throw new Error('Nama goal wajib diisi, maksimal 100 karakter.')
  if (description.length > 255) throw new Error('Catatan maksimal 255 karakter.')
  if (draft.targetAmount === null || !Number.isFinite(draft.targetAmount) || draft.targetAmount <= 0) throw new Error('Target nominal harus lebih besar dari nol.')
  if (draft.targetDate && !parseDate(draft.targetDate)) throw new Error('Pilih tanggal target yang valid.')
  if (original?.targetDate && !draft.targetDate) throw new Error('Tanggal target yang sudah tersimpan perlu diganti dengan tanggal lain.')
  if (original && !Object.values(GoalStatus).includes(draft.status)) throw new Error('Pilih status goal yang valid.')
  if (original && draft.status === GoalStatus.CANCELLED && original.status !== GoalStatus.CANCELLED && goalNumber(original.currentSaved) > 0) throw new Error('Lepaskan seluruh alokasi dana sebelum membatalkan goal.')
  return { name, description, targetAmount: draft.targetAmount, ...(draft.targetDate ? { targetDate: draft.targetDate } : {}), ...(original ? { status: draft.status } : {}) }
}
export const goalLedgerLabel = (type: string) => ({ ALLOCATE: 'Alokasi tabungan', SPEND: 'Pengeluaran goal', RELEASE: 'Alokasi dilepas', ADJUST: 'Koreksi dana' } as Record<string, string>)[type] || type
export function releasableFromAccount(ledgers: GoalLedger[], accountId: string) {
  return Math.max(0, ledgers.filter((ledger) => ledger.accountId === accountId || ledger.account?.id === accountId).reduce((sum, ledger) => {
    if (ledger.type === 'ALLOCATE' && ledger.direction === 'INCOMING') return sum + goalNumber(ledger.amount)
    if (['SPEND', 'RELEASE'].includes(ledger.type) && ledger.direction === 'OUTGOING') return sum - goalNumber(ledger.amount)
    return sum
  }, 0))
}
export type GoalFundMode = 'allocate' | 'spend' | 'release'
export interface GoalFundDraft { accountId: string; amount: number | null; categoryId: string; note: string; date: string }
export function validateGoalFunds(mode: GoalFundMode, goal: FinancialGoal, draft: GoalFundDraft, accounts: Account[], categories: Category[]) {
  const account = accounts.find((item) => item.id === draft.accountId)
  if (!account) throw new Error('Pilih akun yang valid.')
  if (draft.amount === null || !Number.isFinite(draft.amount) || draft.amount <= 0) throw new Error('Nominal harus lebih besar dari nol.')
  if (draft.note.trim().length > 255) throw new Error('Catatan maksimal 255 karakter.')
  if (mode === 'allocate' && goal.status !== GoalStatus.ACTIVE) throw new Error('Alokasi baru hanya tersedia untuk goal aktif.')
  if (mode === 'allocate' && draft.amount > goalNumber(account.currentBalance)) throw new Error('Saldo akun tidak mencukupi untuk alokasi ini.')
  if (mode === 'spend' && draft.amount > goalNumber(goal.currentSaved)) throw new Error('Nominal melebihi dana goal yang terkumpul.')
  if (mode === 'spend' && draft.amount > goalNumber(account.currentBalance)) throw new Error('Saldo akun tidak mencukupi untuk pengeluaran ini.')
  if (mode === 'release' && draft.amount > releasableFromAccount(goal.ledgers || [], account.id)) throw new Error('Nominal melebihi alokasi yang dapat dilepas dari akun ini.')
  if (mode === 'spend' && !flattenCategories(categories).some((category) => category.id === draft.categoryId && category.categoryType === 'EXPENSE')) throw new Error('Pilih kategori pengeluaran yang valid.')
  if (mode === 'spend' && !parseDate(draft.date)) throw new Error('Pilih tanggal transaksi yang valid.')
}
