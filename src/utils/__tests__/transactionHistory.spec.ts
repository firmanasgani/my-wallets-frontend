import { describe, expect, it } from 'vitest'
import { historyQuery, historySummary, localDate, parseHistoryFilters } from '../transactionHistory'
import type { Transaction } from '@/types/transaction'

describe('transaction history', () => {
  it('uses local calendar fields when UTC falls on a different day', () => {
    const date = new Date(2026, 10, 10, 0, 15)
    expect(localDate(date)).toBe('2026-11-10')
  })

  it('restores filters and pagination from the URL', () => {
    const filters = parseHistoryFilters({
      page: '3', limit: '25', search: '  belanja  ', type: 'EXPENSE', accountId: 'account-1',
      categoryId: 'category-1', startDate: '2026-10-01', endDate: '2026-10-31', sortBy: 'amount', sortOrder: 'asc',
    }, '2026-11-10')
    expect(filters).toEqual({
      page: 3, limit: 25, search: 'belanja', type: 'EXPENSE', accountId: 'account-1', categoryId: 'category-1',
      startDate: '2026-10-01', endDate: '2026-10-31', sortBy: 'amount', sortOrder: 'asc',
    })
    expect(parseHistoryFilters(historyQuery(filters), '2026-11-10')).toEqual(filters)
  })

  it('normalizes invalid page, date, type and sorting inputs', () => {
    const filters = parseHistoryFilters({ page: '-2', limit: 'Infinity', startDate: '2026-02-30',
      endDate: 'not-a-date', type: 'UNKNOWN', sortBy: 'unknown', sortOrder: 'unknown' }, '2026-11-10')
    expect(filters.page).toBe(1)
    expect(filters.limit).toBe(10)
    expect(filters.startDate).toBe('2026-11-10')
    expect(filters.endDate).toBe('2026-11-10')
    expect(filters.type).toBeUndefined()
    expect(filters.sortBy).toBe('transactionDate')
    expect(filters.sortOrder).toBe('desc')
    expect(parseHistoryFilters({ page: '1.5', limit: '9999' }).limit).toBe(100)
    expect(parseHistoryFilters({ page: '1.5' }).page).toBe(1)
  })

  it('handles repeated query keys without passing arrays to the API', () => {
    const filters = parseHistoryFilters({ search: ['first', 'second'], page: ['2', '3'] })
    expect(filters.search).toBe('first')
    expect(filters.page).toBe(2)
    expect(historyQuery({ page: 1, search: '', type: undefined, accountId: null })).toEqual({ page: '1' })
  })

  it('summarizes the visible page while excluding transfers and invalid amounts', () => {
    const transactions = [
      { amount: '1000', transactionType: 'INCOME' },
      { amount: 300, transactionType: 'EXPENSE' },
      { amount: 10000, transactionType: 'TRANSFER' },
      { amount: 'invalid', transactionType: 'INCOME' },
    ] as unknown as Transaction[]
    expect(historySummary(transactions)).toEqual({ income: 1000, expense: 300, net: 700 })
    expect(historySummary([])).toEqual({ income: 0, expense: 0, net: 0 })
  })
})
