import { defineStore } from 'pinia'
import apiClient from '@/services/apiService'
import type {
  Transaction,
  QueryTransactionDto,
  CreateIncomePayload,
  CreateExpensePayload,
  CreateTransferPayload,
} from '@/types/transaction'
import { useAuthStore } from './auth'

interface TransactionMeta {
  total: number
  page: number
  limit: number
  lastPage: number
  hasNextPage?: boolean
  hasPreviousPage?: boolean
}

interface TransactionsState {
  transactions: Transaction[]
  meta: TransactionMeta
  isLoading: boolean
  isSubmitting: boolean // Untuk create/update/delete
  error: string | null
  // Menyimpan filter saat ini agar bisa digunakan untuk refresh atau paginasi
  currentFilters: QueryTransactionDto
}

// Tipe untuk respons paginasi dari backend (sesuaikan jika berbeda)
interface PaginatedTransactionsResponse {
  data: Transaction[]
  meta: TransactionMeta
}

export const useTransactionStore = defineStore('transactions', {
  state: (): TransactionsState => ({
    transactions: [],
    meta: {
      total: 0,
      page: 1,
      limit: 10, // Default limit
      lastPage: 1,
    },
    isLoading: false,
    isSubmitting: false,
    error: null,
    currentFilters: {
      // Filter default
      page: 1,
      limit: 10,
      sortBy: 'transactionDate',
      sortOrder: 'desc',
    },
  }),
  getters: {
    transactionList: (state) => state.transactions,
    transactionMeta: (state) => state.meta,
    isLoadingTransactions: (state) => state.isLoading,
    isSubmittingTransaction: (state) => state.isSubmitting,
    transactionError: (state) => state.error,
    activeFilters: (state) => state.currentFilters,
  },
  actions: {
    // Action untuk mengambil transaksi dengan filter dan paginasi
    async fetchTransactions(filters?: QueryTransactionDto) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        this.error = 'User not authenticated.'
        console.error(this.error)
        return
      }

      this.isLoading = true
      this.error = null

      // Gabungkan filter baru dengan filter yang sudah ada atau default
      // Pastikan page dan limit selalu ada
      const queryParams: QueryTransactionDto = {
        ...this.currentFilters, // Ambil filter terakhir yg dipakai
        ...filters, // Timpa dengan filter baru jika ada
        page: filters?.page || this.currentFilters.page || 1,
        limit: filters?.limit || this.currentFilters.limit || 10,
      }
      this.currentFilters = queryParams // Simpan filter yang sedang aktif

      try {
        // Pastikan endpoint '/transactions' sesuai dengan API backend Anda
        const response = await apiClient.get<PaginatedTransactionsResponse>('/transactions', {
          params: queryParams,
        })
        this.transactions = response.data.data
        this.meta = response.data.meta
        console.log('Transactions fetched:', this.transactions.length)
      } catch (err: any) {
        console.error('Failed to fetch transactions:', err.response?.data || err.message)
        const errorMessage = err.response?.data?.message || 'Gagal memuat daftar transaksi.'
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
        this.transactions = [] // Kosongkan jika error
        this.meta = { total: 0, page: 1, limit: queryParams.limit || 10, lastPage: 1 } // Reset meta
      } finally {
        this.isLoading = false
      }
    },

    // Action untuk mengubah filter dan otomatis fetch ulang
    async applyFilters(newFilters: Partial<QueryTransactionDto>) {
      // Gabungkan filter baru, reset halaman ke 1 jika filter utama berubah (bukan hanya page/limit)
      const significantFilterChanged =
        (newFilters.accountId && newFilters.accountId !== this.currentFilters.accountId) ||
        (newFilters.categoryId && newFilters.categoryId !== this.currentFilters.categoryId) ||
        (newFilters.type && newFilters.type !== this.currentFilters.type) ||
        (newFilters.startDate && newFilters.startDate !== this.currentFilters.startDate) ||
        (newFilters.endDate && newFilters.endDate !== this.currentFilters.endDate)

      const pageToFetch = significantFilterChanged ? 1 : newFilters.page || this.currentFilters.page

      this.currentFilters = {
        ...this.currentFilters,
        ...newFilters,
        page: pageToFetch,
      }
      await this.fetchTransactions(this.currentFilters)
    },
    async _createTransaction(
      endpoint: string,
      payload: CreateIncomePayload | CreateExpensePayload | CreateTransferPayload,
      successMessage: string,
    ) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) throw new Error('User not authenticated.')
      this.isSubmitting = true
      this.error = null
      try {
        await apiClient.post<Transaction>(endpoint, payload)
        await this.fetchTransactions(this.currentFilters)
        console.log(successMessage) // Ganti dengan notifikasi yang lebih baik
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          `Gagal: ${successMessage.toLowerCase().replace('berhasil ', '')}`
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage

        throw new Error(this.error ?? 'Unknown error')
      } finally {
        this.isSubmitting = false
      }
    },

    async createIncomeTransaction(payload: CreateIncomePayload) {
      await this._createTransaction(
        '/transactions/income', // Asumsi endpoint backend
        payload,
        'Transaksi pemasukan berhasil ditambahkan.',
      )
    },

    async createExpenseTransaction(payload: CreateExpensePayload) {
      await this._createTransaction(
        '/transactions/expense', // Asumsi endpoint backend
        payload,
        'Transaksi pengeluaran berhasil ditambahkan.',
      )
    },

    async createTransferTransaction(payload: CreateTransferPayload) {
      await this._createTransaction(
        '/transactions/transfer', // Asumsi endpoint backend
        payload,
        'Transaksi transfer berhasil ditambahkan.',
      )
    },

    async deleteTransaction(transactionId: string) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) throw new Error('User not authenticated.')
      this.isSubmitting = true
      this.error = null
      try {
        await apiClient.delete(`/transactions/${transactionId}`)
        await this.fetchTransactions(this.currentFilters)
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Gagal menghapus transaksi.'
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
        console.error('Delete transaction error in store:', this.error)
        throw new Error(this.error ?? 'Unknown error')
      } finally {
        this.isSubmitting = false
      }
    },
  },
})
