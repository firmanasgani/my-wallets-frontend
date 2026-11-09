import type { Account } from '@/types/accounts'
import { FrontendTransactionType, type Category } from '@/types/enums'
import { RecurringInterval, type CreateIncomePayload, type CreateExpensePayload, type CreateTransferPayload, type Transaction } from '@/types/transaction'
import { flattenCategories } from './categoryTree'
import { dateKey, parseDate } from './dateRange'

export interface TransactionDraft {
  type: FrontendTransactionType
  amount: number | null
  date: string
  description: string
  sourceAccountId: string
  destinationAccountId: string
  categoryId: string
  recurring: boolean
  interval: RecurringInterval | null
  endDate: string
}
export function transactionCategoryOptions(categories: Category[], type: FrontendTransactionType) {
  return flattenCategories(categories).filter((category) => String(category.categoryType) === String(type))
    .map((category) => ({ value: category.id, label: category.categoryName, group: category.parentCategoryId ? 'Subkategori' : 'Kategori utama' }))
}
export function validateAttachment(file: Pick<File, 'type' | 'size'>) {
  if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) return 'Gunakan gambar JPG, PNG, atau dokumen PDF.'
  if (file.size > 5 * 1024 * 1024) return 'Ukuran lampiran maksimal 5 MB.'
  return ''
}
export function buildNewTransaction(draft: TransactionDraft, accounts: Account[], categories: Category[], attachment: File | null):
  | { type: FrontendTransactionType.INCOME; payload: CreateIncomePayload }
  | { type: FrontendTransactionType.EXPENSE; payload: CreateExpensePayload }
  | { type: FrontendTransactionType.TRANSFER; payload: CreateTransferPayload } {
  if (!Object.values(FrontendTransactionType).includes(draft.type)) throw new Error('Pilih jenis transaksi.')
  if (draft.amount === null || !Number.isFinite(draft.amount) || draft.amount <= 0) throw new Error('Nominal harus lebih besar dari nol.')
  if (!parseDate(draft.date)) throw new Error('Pilih tanggal transaksi yang valid.')
  const needsSource = draft.type !== FrontendTransactionType.INCOME
  const needsDestination = draft.type !== FrontendTransactionType.EXPENSE
  if (needsSource && !accounts.some((account) => account.id === draft.sourceAccountId)) throw new Error('Pilih akun sumber yang valid.')
  if (needsDestination && !accounts.some((account) => account.id === draft.destinationAccountId)) throw new Error('Pilih akun tujuan yang valid.')
  if (draft.type === FrontendTransactionType.TRANSFER && draft.sourceAccountId === draft.destinationAccountId) throw new Error('Akun sumber dan tujuan transfer harus berbeda.')
  if (draft.type !== FrontendTransactionType.TRANSFER && !transactionCategoryOptions(categories, draft.type).some((category) => category.value === draft.categoryId)) throw new Error('Pilih kategori yang sesuai dengan jenis transaksi.')
  if (draft.recurring && !Object.values(RecurringInterval).includes(draft.interval as RecurringInterval)) throw new Error('Pilih interval transaksi berulang.')
  if (draft.recurring && draft.endDate && (!parseDate(draft.endDate) || draft.endDate < draft.date)) throw new Error('Tanggal akhir jadwal harus sama atau setelah tanggal mulai.')
  if (attachment) {
    const error = validateAttachment(attachment)
    if (error) throw new Error(error)
    if (draft.recurring) throw new Error('Jadwal berulang belum mendukung lampiran. Hapus lampiran atau nonaktifkan jadwal berulang.')
  }
  const base = { amount: draft.amount, transactionDate: draft.date, description: draft.description.trim() || null,
    isRecurring: draft.recurring, interval: draft.recurring ? draft.interval : null,
    recurringStartDate: draft.recurring ? draft.date : null, recurringEndDate: draft.recurring ? draft.endDate || null : null,
    attachment,
  }
  if (draft.type === FrontendTransactionType.INCOME) return { type: draft.type, payload: { ...base, destinationAccountId: draft.destinationAccountId, categoryId: draft.categoryId } as CreateIncomePayload }
  if (draft.type === FrontendTransactionType.EXPENSE) return { type: draft.type, payload: { ...base, sourceAccountId: draft.sourceAccountId, categoryId: draft.categoryId } as CreateExpensePayload }
  return { type: FrontendTransactionType.TRANSFER, payload: { ...base, sourceAccountId: draft.sourceAccountId, destinationAccountId: draft.destinationAccountId } as CreateTransferPayload }
}
export interface TransactionUpdate { description?: string; categoryId?: string; transactionDate?: string }
export function buildTransactionUpdate(transaction: Transaction, draft: { description: string; categoryId: string; date: string }, categories: Category[]): TransactionUpdate {
  if (!parseDate(draft.date)) throw new Error('Pilih tanggal transaksi yang valid.')
  const payload: TransactionUpdate = {}
  const date = parseDate(transaction.transactionDate.slice(0, 10))
  if (draft.date !== (date ? dateKey(date) : '')) payload.transactionDate = draft.date
  if (draft.description.trim() !== (transaction.description || '').trim()) payload.description = draft.description.trim()
  const originalCategory = transaction.categoryId || transaction.category?.id || ''
  if (transaction.transactionType !== FrontendTransactionType.TRANSFER && draft.categoryId !== originalCategory) {
    if (!transactionCategoryOptions(categories, transaction.transactionType).some((category) => category.value === draft.categoryId)) throw new Error('Pilih kategori yang sesuai dengan jenis transaksi.')
    payload.categoryId = draft.categoryId
  }
  return payload
}
export function transactionDateLabel(value?: string | null, includeTime = false) {
  if (!value) return '—'
  const date = includeTime ? new Date(value) : parseDate(value.slice(0, 10))
  if (!date || Number.isNaN(date.getTime())) return '—'
  return includeTime ? date.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
