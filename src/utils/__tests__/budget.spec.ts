import { describe, expect, it } from 'vitest'
import { FrontendCategoryType, type Category } from '@/types/enums'
import type { Budget, BudgetReportItem } from '@/types/budget'
import { budgetCategoryOptions, budgetPeriod, budgetProgress, buildBudgetPayload, filterBudgets } from '../budget'

const expense: Category = { id: 'expense', categoryName: 'Belanja', categoryType: FrontendCategoryType.EXPENSE }
const income: Category = { id: 'income', categoryName: 'Gaji', categoryType: FrontendCategoryType.INCOME }
const draft = { categoryId: 'expense', amount: 1000, year: 2026, month: 11, description: '  Rumah  ' }
const report = (amount: number, spent: number, category = expense) => ({ amount, spent, category } as BudgetReportItem)

describe('budget planning', () => {
  it('accepts valid periods and falls back for invalid URL values', () => {
    expect(budgetPeriod('2000', '1')).toEqual({ year: 2000, month: 1 })
    expect(budgetPeriod(['2026'], '13', new Date(2025, 4, 1))).toEqual({ year: 2025, month: 5 })
    expect(budgetPeriod('2101', '1.5', new Date(2025, 4, 1))).toEqual({ year: 2025, month: 5 })
  })
  it('includes nested categories once and groups income separately', () => {
    const child = { ...expense, id: 'child', parentCategoryId: expense.id }
    const options = budgetCategoryOptions([{ ...expense, subCategories: [child] }, child, income])
    expect(options.map((option) => option.value)).toEqual(['expense', 'child', 'income'])
    expect(options[2]?.group).toBe('Pemasukan')
  })
  it('validates the API period and amount rules, including zero-value budgets', () => {
    expect(buildBudgetPayload({ ...draft, amount: 0 }, [expense])).toEqual({ ...draft, amount: 0, description: 'Rumah' })
    expect(() => buildBudgetPayload({ ...draft, amount: -1 }, [expense])).toThrow('Nominal')
    expect(() => buildBudgetPayload({ ...draft, amount: NaN }, [expense])).toThrow('Nominal')
    expect(() => buildBudgetPayload({ ...draft, amount: null }, [expense])).toThrow('Nominal')
    expect(() => buildBudgetPayload({ ...draft, month: 13 }, [expense])).toThrow('periode')
    expect(() => buildBudgetPayload({ ...draft, categoryId: 'missing' }, [expense])).toThrow('kategori')
  })
  it('distinguishes exceeded expense limits from achieved income targets', () => {
    expect(budgetProgress(report(100, 120)).status).toBe('Melebihi batas')
    expect(budgetProgress(report(100, 120)).tone).toBe('danger')
    expect(budgetProgress(report(100, 120, income)).status).toBe('Target tercapai')
    expect(budgetProgress(report(100, 120, income)).tone).toBe('good')
    expect(budgetProgress(report(100, 80)).status).toBe('Mendekati batas')
    expect(budgetProgress(report(100, 80, income)).status).toBe('Menuju target')
  })
  it('handles zero limits and caps progress while retaining the full percentage', () => {
    expect(budgetProgress(report(0, 10)).tone).toBe('danger')
    expect(budgetProgress(report(0, 10)).hasRatio).toBe(false)
    expect(budgetProgress(report(0, 0)).width).toBe(0)
    expect(budgetProgress(report(100, 150)).width).toBe(100)
    expect(budgetProgress(report(100, 150)).percentage).toBe(150)
    expect(budgetProgress(report(100, 150)).remaining).toBe(-50)
  })
  it('combines category type and case-insensitive category or note search', () => {
    const items = [{ id: 'a', category: expense, description: 'Kebutuhan rumah' }, { id: 'b', category: income }] as Budget[]
    expect(filterBudgets(items, ' RUMAH ', 'EXPENSE').map((item) => item.id)).toEqual(['a'])
    expect(filterBudgets(items, 'gaji', 'EXPENSE')).toEqual([])
    expect(filterBudgets(items, 'GAJI', '').map((item) => item.id)).toEqual(['b'])
  })
})
