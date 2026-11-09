import type { PaymentHistory, PaymentStatus, SubscriptionPlan } from '@/types/subscriptions'
import type { RecurringTransaction, Transaction } from '@/types/transaction'
import { dateKey, type DateRange } from './dateRange'

export type SettingsSection = 'main' | 'recurring' | 'payment-history'
export const settingsSection = (value: unknown): SettingsSection => value === 'recurring' || value === 'payment-history' ? value : 'main'
export function settingsPlanName(code?: string | null, plans: Pick<SubscriptionPlan, 'code' | 'name'>[] = [], activeName?: string | null) {
  if (activeName?.trim()) return activeName
  const plan = plans.find((item) => item.code === code)
  if (plan) return plan.name
  if (code?.startsWith('BUSINESS')) return 'Bisnis'
  if (code?.startsWith('FAMILY')) return 'Pro/Keluarga'
  if (code?.startsWith('PREMIUM')) return 'Premium'
  return code === 'FREE' ? 'Dasar' : code || 'Belum tersedia'
}
export const paymentStatusOptions: { value: PaymentStatus; label: string; tone: string }[] = [
  { value: 'PENDING', label: 'Menunggu pembayaran', tone: 'warning' }, { value: 'PENDING_REVIEW', label: 'Menunggu verifikasi', tone: 'neutral' }, { value: 'SUCCESS', label: 'Berhasil', tone: 'good' }, { value: 'FAILED', label: 'Gagal', tone: 'danger' }, { value: 'EXPIRED', label: 'Kedaluwarsa', tone: 'muted' }, { value: 'CANCELLED', label: 'Dibatalkan', tone: 'muted' },
]
export const paymentStatusInfo = (status: string) => paymentStatusOptions.find((option) => option.value === status) || { value: status, label: status, tone: 'muted' }
export const canResumePayment = (payment: PaymentHistory) => payment.status === 'PENDING' && payment.method !== 'MANUAL_TRANSFER'
export function filterPayments(rows: PaymentHistory[], search: string, status: string, range: DateRange | null) {
  const query = search.trim().toLocaleLowerCase('id-ID')
  return rows.filter((row) => {
    const created = new Date(row.createdAt), validDate = Number.isFinite(created.getTime())
    const date = validDate ? dateKey(created) : ''
    return (!status || row.status === status) && (!query || `${row.orderId} ${row.plan?.name || row.planCode}`.toLocaleLowerCase('id-ID').includes(query)) && (!range || (validDate && date >= range.startDate && date <= range.endDate))
  }).sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0))
}
export const recurringIntervalLabel = (interval: string) => ({ DAILY: 'Setiap hari', WEEKLY: 'Setiap minggu', MONTHLY: 'Setiap bulan', YEARLY: 'Setiap tahun' } as Record<string, string>)[interval] || interval
export const recurringTypeLabel = (type: string) => ({ INCOME: 'Pemasukan', EXPENSE: 'Pengeluaran', TRANSFER: 'Transfer' } as Record<string, string>)[type] || type
export function filterRecurring(rows: RecurringTransaction[], search: string, type: string) {
  const query = search.trim().toLocaleLowerCase('id-ID')
  return rows.filter((row) => (!type || row.transactionType === type) && (!query || `${row.description || ''} ${row.category?.categoryName || ''} ${row.sourceAccount?.accountName || ''} ${row.destinationAccount?.accountName || ''}`.toLocaleLowerCase('id-ID').includes(query)))
}
function csvText(value: unknown) {
  let text = String(value ?? '')
  if (/^[=+\-@\t\r]/.test(text)) text = "'" + text
  return `"${text.replace(/"/g, '""')}"`
}
export function transactionsCsv(rows: Transaction[]) {
  const header = ['ID', 'Tanggal transaksi', 'Jenis', 'Nominal', 'Kategori', 'Akun sumber', 'Akun tujuan', 'Catatan', 'Dibuat pada', 'Diperbarui pada']
  const body = rows.map((row) => [row.id, row.transactionDate, recurringTypeLabel(row.transactionType), Number.isFinite(Number(row.amount)) ? String(Number(row.amount)) : '', row.category?.categoryName || '', row.sourceAccount?.accountName || '', row.destinationAccount?.accountName || '', row.description || '', row.createdAt, row.updatedAt].map(csvText).join(','))
  return '\uFEFF' + [header.map(csvText).join(','), ...body].join('\r\n')
}
export interface TransactionArchivePage { data: Transaction[]; meta: { page: number; lastPage: number; total: number } }
export async function collectTransactionArchive(fetchPage: (page: number) => Promise<TransactionArchivePage>, onProgress: (count: number) => void = () => {}) {
  const rows = new Map<string, Transaction>()
  let page = 1, lastPage = 1, expectedTotal = 0
  do {
    const result = await fetchPage(page)
    if (!Array.isArray(result.data) || result.meta.page !== page || !Number.isInteger(result.meta.lastPage) || result.meta.lastPage < 0) throw new Error('Data ekspor tidak lengkap. Silakan coba lagi.')
    if (page === 1) { lastPage = Math.max(1, result.meta.lastPage); expectedTotal = result.meta.total }
    if (page < lastPage && !result.data.length) throw new Error('Data ekspor tidak lengkap. Silakan coba lagi.')
    for (const row of result.data) rows.set(row.id, row)
    onProgress(rows.size)
    page++
  } while (page <= lastPage)
  if (rows.size !== expectedTotal) throw new Error('Data transaksi berubah saat ekspor. Silakan coba lagi.')
  return [...rows.values()]
}
