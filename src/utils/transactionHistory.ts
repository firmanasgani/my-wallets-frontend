import type { LocationQuery } from 'vue-router'
import { FrontendTransactionType } from '@/types/enums'
import type { QueryTransactionDto, Transaction } from '@/types/transaction'

export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function validDate(value: string | undefined, fallback: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback
  const parsed = new Date(`${value}T00:00:00`)
  return !Number.isNaN(parsed.getTime()) && localDate(parsed) === value ? value : fallback
}

export function parseHistoryFilters(query: LocationQuery, today = localDate()): QueryTransactionDto {
  const single = (value: LocationQuery[string]) => (Array.isArray(value) ? value[0] : value) || undefined
  const positiveInteger = (value: string | undefined, fallback: number) => {
    const number = Number(value)
    return Number.isSafeInteger(number) && number > 0 ? number : fallback
  }
  const type = single(query.type)
  return {
    page: positiveInteger(single(query.page), 1),
    limit: Math.min(positiveInteger(single(query.limit), 10), 100),
    accountId: single(query.accountId),
    categoryId: single(query.categoryId),
    type: Object.values(FrontendTransactionType).includes(type as FrontendTransactionType)
      ? type as FrontendTransactionType : undefined,
    startDate: validDate(single(query.startDate), today),
    endDate: validDate(single(query.endDate), today),
    search: single(query.search)?.trim() || undefined,
    sortBy: ['transactionDate', 'amount'].includes(single(query.sortBy) || '') ? single(query.sortBy) : 'transactionDate',
    sortOrder: single(query.sortOrder) === 'asc' ? 'asc' : 'desc',
  }
}

export function historyQuery(filters: QueryTransactionDto): Record<string, string> {
  return Object.fromEntries(Object.entries(filters)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => [key, String(value)]))
}

export function historySummary(transactions: Transaction[]) {
  let income = 0
  let expense = 0
  for (const transaction of transactions) {
    const amount = Number(transaction.amount)
    if (!Number.isFinite(amount)) continue
    if (transaction.transactionType === 'INCOME') income += amount
    if (transaction.transactionType === 'EXPENSE') expense += amount
  }
  return { income, expense, net: income - expense }
}
