import type { Budget, BudgetReportItem, CreateBudgetPayload } from '@/types/budget'
import type { Category } from '@/types/enums'
import { flattenCategories } from './categoryTree'

export const budgetMonths = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
export const budgetYearOptions = Array.from({ length: 101 }, (_, index) => ({ value: 2000 + index, label: String(2000 + index) }))
export const budgetMonthOptions = budgetMonths.map((label, index) => ({ label, value: index + 1 }))

export function budgetPeriod(year: unknown, month: unknown, now = new Date()) {
  const y = typeof year === 'string' || typeof year === 'number' ? Number(year) : NaN
  const m = typeof month === 'string' || typeof month === 'number' ? Number(month) : NaN
  return { year: Number.isInteger(y) && y >= 2000 && y <= 2100 ? y : now.getFullYear(), month: Number.isInteger(m) && m >= 1 && m <= 12 ? m : now.getMonth() + 1 }
}
export const budgetPeriodLabel = (year: number, month: number) => `${budgetMonths[month - 1]} ${year}`
export const budgetNumber = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0
export function budgetCategoryOptions(categories: Category[]) {
  return flattenCategories(categories).filter((category) => ['INCOME', 'EXPENSE'].includes(category.categoryType)).map((category) => ({
    value: category.id, label: category.categoryName, group: category.categoryType === 'INCOME' ? 'Pemasukan' : 'Pengeluaran', description: category.parentCategoryId ? 'Subkategori' : 'Kategori utama',
  }))
}
export function buildBudgetPayload(draft: { categoryId: string; amount: number | null; year: number; month: number; description: string }, categories: Category[]): CreateBudgetPayload {
  if (!Number.isInteger(draft.year) || draft.year < 2000 || draft.year > 2100 || !Number.isInteger(draft.month) || draft.month < 1 || draft.month > 12) throw new Error('Pilih periode anggaran yang valid.')
  if (draft.amount === null || !Number.isFinite(draft.amount) || draft.amount < 0) throw new Error('Nominal anggaran harus nol atau lebih besar.')
  if (!budgetCategoryOptions(categories).some((option) => option.value === draft.categoryId)) throw new Error('Pilih kategori anggaran yang valid.')
  return { categoryId: draft.categoryId, amount: draft.amount, year: draft.year, month: draft.month, description: draft.description.trim() }
}
export function filterBudgets<T extends Budget>(items: T[], query: string, type: string) {
  const search = query.trim().toLocaleLowerCase('id-ID')
  return items.filter((item) => (!type || item.category?.categoryType === type) && (!search || `${item.category?.categoryName || ''} ${item.description || ''}`.toLocaleLowerCase('id-ID').includes(search)))
}
export function budgetProgress(item: BudgetReportItem) {
  const amount = budgetNumber(item.amount), actual = budgetNumber(item.spent)
  const income = item.category?.categoryType === 'INCOME'
  const percentage = amount > 0 ? Math.max(0, actual / amount * 100) : 0
  const status = income ? (actual >= amount ? 'Target tercapai' : 'Menuju target') : actual > amount ? 'Melebihi batas' : actual === amount ? 'Batas tercapai' : percentage >= 80 ? 'Mendekati batas' : 'Dalam batas'
  const tone = income ? (actual >= amount ? 'good' : 'neutral') : actual >= amount && (amount > 0 || actual > 0) ? 'danger' : percentage >= 80 ? 'warning' : 'good'
  return { percentage, hasRatio: amount > 0, width: amount === 0 && actual > 0 ? 100 : Math.min(100, percentage), status, tone, remaining: amount - actual, income }
}
