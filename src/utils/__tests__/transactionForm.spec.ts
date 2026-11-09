import { describe, expect, it } from 'vitest'
import { FrontendTransactionType, FrontendCategoryType, type Category } from '@/types/enums'
import type { Account } from '@/types/accounts'
import { RecurringInterval, type Transaction } from '@/types/transaction'
import { buildNewTransaction, buildTransactionUpdate, validateAttachment, type TransactionDraft } from '../transactionForm'

const accounts = [{ id: 'a' }, { id: 'b' }] as Account[]
const categories = [{ id: 'expense', categoryName: 'Belanja', categoryType: FrontendCategoryType.EXPENSE }, { id: 'income', categoryName: 'Gaji', categoryType: FrontendCategoryType.INCOME }] as Category[]
const draft: TransactionDraft = { type: FrontendTransactionType.EXPENSE, amount: 1000, date: '2026-11-10', description: '  Belanja  ', sourceAccountId: 'a', destinationAccountId: 'b', categoryId: 'expense', recurring: false, interval: null, endDate: '' }

describe('transaction workflow', () => {
  it('builds type-specific payloads without leaking accounts or categories from other types', () => {
    const expense = buildNewTransaction(draft, accounts, categories, null)
    expect(expense.type).toBe('EXPENSE')
    expect(expense.payload.description).toBe('Belanja')
    expect('destinationAccountId' in expense.payload).toBe(false)
    const transfer = buildNewTransaction({ ...draft, type: FrontendTransactionType.TRANSFER }, accounts, categories, null)
    expect('categoryId' in transfer.payload).toBe(false)
    const income = buildNewTransaction({ ...draft, type: FrontendTransactionType.INCOME, categoryId: 'income' }, accounts, categories, null)
    expect('sourceAccountId' in income.payload).toBe(false)
  })
  it('rejects invalid amounts, dates, accounts, categories and same-account transfers', () => {
    expect(() => buildNewTransaction({ ...draft, amount: 0 }, accounts, categories, null)).toThrow('Nominal')
    expect(() => buildNewTransaction({ ...draft, date: '2026-02-30' }, accounts, categories, null)).toThrow('tanggal')
    expect(() => buildNewTransaction({ ...draft, sourceAccountId: 'missing' }, accounts, categories, null)).toThrow('akun sumber')
    expect(() => buildNewTransaction({ ...draft, categoryId: 'income' }, accounts, categories, null)).toThrow('kategori')
    expect(() => buildNewTransaction({ ...draft, type: FrontendTransactionType.TRANSFER, destinationAccountId: 'a' }, accounts, categories, null)).toThrow('berbeda')
  })
  it('validates schedule intervals, end dates and unsupported scheduled attachments', () => {
    expect(() => buildNewTransaction({ ...draft, recurring: true }, accounts, categories, null)).toThrow('interval')
    expect(() => buildNewTransaction({ ...draft, recurring: true, interval: RecurringInterval.MONTHLY, endDate: '2026-01-01' }, accounts, categories, null)).toThrow('Tanggal akhir')
    const recurring = buildNewTransaction({ ...draft, recurring: true, interval: RecurringInterval.MONTHLY }, accounts, categories, null)
    expect(recurring.payload.recurringStartDate).toBe(draft.date)
    expect(() => buildNewTransaction({ ...draft, recurring: true, interval: RecurringInterval.MONTHLY }, accounts, categories, { type: 'image/png', size: 100 } as File)).toThrow('lampiran')
  })
  it('accepts supported attachments and rejects oversized or unsupported files', () => {
    expect(validateAttachment({ type: 'application/pdf', size: 5 * 1024 * 1024 })).toBe('')
    expect(validateAttachment({ type: 'image/webp', size: 1 })).not.toBe('')
    expect(validateAttachment({ type: 'image/png', size: 5 * 1024 * 1024 + 1 })).not.toBe('')
  })
  it('edits only supported changed fields and leaves transfer categories untouched', () => {
    const transaction = { ...draft, transactionType: FrontendTransactionType.EXPENSE, transactionDate: draft.date + 'T00:00:00.000Z', description: 'Belanja', categoryId: 'expense' } as unknown as Transaction
    expect(buildTransactionUpdate(transaction, { date: draft.date, description: 'Belanja', categoryId: 'expense' }, categories)).toEqual({})
    expect(buildTransactionUpdate(transaction, { date: '2026-11-11', description: '  Diperbarui ', categoryId: 'expense' }, categories)).toEqual({ transactionDate: '2026-11-11', description: 'Diperbarui' })
    expect(() => buildTransactionUpdate(transaction, { date: draft.date, description: '', categoryId: 'income' }, categories)).toThrow('kategori')
    expect(buildTransactionUpdate({ ...transaction, transactionType: FrontendTransactionType.TRANSFER }, { date: draft.date, description: 'Belanja', categoryId: '' }, categories)).toEqual({})
  })
})
