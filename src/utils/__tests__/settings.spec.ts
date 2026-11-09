import { describe, expect, it } from 'vitest'
import { canResumePayment, collectTransactionArchive, filterPayments, filterRecurring, paymentStatusInfo, settingsPlanName, settingsSection, transactionsCsv } from '../settings'
import type { PaymentHistory } from '@/types/subscriptions'
import type { RecurringTransaction, Transaction } from '@/types/transaction'

const payment = (id: string, status = 'PENDING', method = 'MIDTRANS') => ({ id, orderId: `ORDER-${id}`, status, method, amount: 1000, planCode: 'PREMIUM_1M', plan: { name: 'Premium' }, createdAt: '2026-11-09T23:59:59' } as PaymentHistory)
const transaction = (id: string) => ({ id, transactionDate: '2026-11-09', transactionType: 'EXPENSE', amount: 1000, description: 'Belanja, "rumah"\nCatatan', createdAt: '2026-11-09', updatedAt: '2026-11-09' } as Transaction)

describe('settings behavior', () => {
  it('validates URL sections and preserves real plan names including family plans', () => {
    expect(settingsSection(['recurring'])).toBe('main')
    expect(settingsSection('payment-history')).toBe('payment-history')
    expect(settingsPlanName('FAMILY')).toBe('Pro/Keluarga')
    expect(settingsPlanName('BUSINESS_6M')).toBe('Bisnis')
    expect(settingsPlanName('PREMIUM_1M', [{ code: 'PREMIUM_1M', name: 'Premium Bulanan' }])).toBe('Premium Bulanan')
    expect(settingsPlanName('FREE', [], 'Paket aktif')).toBe('Paket aktif')
  })
  it('allows payment continuation only for pending online payments', () => {
    expect(canResumePayment(payment('a'))).toBe(true)
    expect(canResumePayment(payment('a', 'SUCCESS'))).toBe(false)
    expect(canResumePayment(payment('a', 'PENDING', 'MANUAL_TRANSFER'))).toBe(false)
    expect(canResumePayment(payment('a', 'PENDING_REVIEW', 'MANUAL_TRANSFER'))).toBe(false)
    expect(paymentStatusInfo('PENDING_REVIEW').label).toBe('Menunggu verifikasi')
    expect(paymentStatusInfo('CANCELLED').label).toBe('Dibatalkan')
  })
  it('combines payment search, status and inclusive local calendar dates', () => {
    const rows = [payment('a'), payment('b', 'SUCCESS')]
    expect(filterPayments(rows, ' premium ', 'SUCCESS', { startDate: '2026-11-09', endDate: '2026-11-09' }).map((item) => item.id)).toEqual(['b'])
    expect(filterPayments(rows, 'order-a', '', null).map((item) => item.id)).toEqual(['a'])
    expect(filterPayments(rows, '', '', { startDate: '2026-11-10', endDate: '2026-11-11' })).toEqual([])
  })
  it('searches schedules by account and category while combining transaction type', () => {
    const rows = [{ id: 'a', transactionType: 'EXPENSE', sourceAccount: { accountName: 'Tunai' }, category: { categoryName: 'Belanja' } }, { id: 'b', transactionType: 'INCOME', description: 'Gaji' }] as RecurringTransaction[]
    expect(filterRecurring(rows, ' TUNAI ', 'EXPENSE').map((item) => item.id)).toEqual(['a'])
    expect(filterRecurring(rows, 'belanja', 'INCOME')).toEqual([])
  })
  it('escapes CSV separators and neutralizes spreadsheet formulas in text fields', () => {
    const csv = transactionsCsv([transaction('a')])
    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv.includes('"Belanja, ""rumah""\nCatatan"')).toBe(true)
    expect(transactionsCsv([{ ...transaction('a'), description: '=1+1' }]).includes('"\'=1+1"')).toBe(true)
  })
  it('collects every page before export and reports progress without changing history filters', async () => {
    const pages: number[] = [], progress: number[] = []
    const result = await collectTransactionArchive(async (page) => { pages.push(page); return { data: [transaction(String(page))], meta: { page, lastPage: 2, total: 2 } } }, (count) => progress.push(count))
    expect(pages).toEqual([1, 2])
    expect(progress).toEqual([1, 2])
    expect(result.map((item) => item.id)).toEqual(['1', '2'])
  })
  it('rejects incomplete exports instead of returning a partial download', async () => {
    let error = ''
    try { await collectTransactionArchive(async (page) => ({ data: [transaction('same')], meta: { page, lastPage: 2, total: 2 } })) } catch (failure) { error = (failure as Error).message }
    expect(error.includes('berubah')).toBe(true)
    let failed = false
    try { await collectTransactionArchive(async () => { throw new Error('Network failure') }) } catch { failed = true }
    expect(failed).toBe(true)
  })
})
