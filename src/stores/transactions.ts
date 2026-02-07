import { defineStore } from 'pinia'
import apiClient from '@/services/apiService'
import type {
  Transaction,
  QueryTransactionDto,
  CreateIncomePayload,
  CreateExpensePayload,
  CreateTransferPayload,
  RecurringTransaction,
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
  recurringTransactions: RecurringTransaction[]
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
    recurringTransactions: [],
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
    recurringTransactionList: (state) => state.recurringTransactions,
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

      const queryParams: QueryTransactionDto = {
        ...this.currentFilters,
        ...filters,
        page: filters?.page || this.currentFilters.page || 1,
        limit: filters?.limit || this.currentFilters.limit || 10,
      }
      this.currentFilters = queryParams

      try {
        const response = await apiClient.get<PaginatedTransactionsResponse>('/transactions', {
          params: queryParams,
        })
        this.transactions = response.data.data
        this.meta = response.data.meta
      } catch (err: any) {
        console.error('Failed to fetch transactions:', err.response?.data || err.message)
        const errorMessage = err.response?.data?.message || 'Gagal memuat daftar transaksi.'
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
        this.transactions = []
        this.meta = { total: 0, page: 1, limit: queryParams.limit || 10, lastPage: 1 }
      } finally {
        this.isLoading = false
      }
    },

    async fetchTransactionsByAccount(accountId: string, filters?: QueryTransactionDto) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        this.error = 'User not authenticated.'
        return
      }

      this.isLoading = true
      this.error = null

      // Set filter accountId secara eksplisit
      const queryParams: QueryTransactionDto = {
        ...this.currentFilters,
        ...filters,
        accountId: accountId, // Pastikan accountId tersimpan di filter
        page: filters?.page || 1, // Reset ke page 1 jika filter baru, atau gunakan yang diminta
        limit: filters?.limit || this.currentFilters.limit || 10,
      }
      this.currentFilters = queryParams

      try {
        const response = await apiClient.get<PaginatedTransactionsResponse>(
          `/transactions/account/${accountId}`,
          {
            params: queryParams,
          },
        )
        this.transactions = response.data.data
        this.meta = response.data.meta
      } catch (err: any) {
        console.error(
          `Failed to fetch transactions for account ${accountId}:`,
          err.response?.data || err.message,
        )
        const errorMessage = err.response?.data?.message || 'Gagal memuat transaksi akun.'
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
        this.transactions = []
        this.meta = { total: 0, page: 1, limit: queryParams.limit || 10, lastPage: 1 }
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

      let finalEndpoint = endpoint
      // Check if it's a recurring transaction payload
      if ('isRecurring' in payload && payload.isRecurring) {
        // Use the recurring transaction endpoint
        finalEndpoint = '/recurring-transactions'

        // 1. Map 'startDate' or 'transactionDate'
        // The API says 'transactionDate' OR 'startDate' is required.
        // Frontend 'CreateTransactionCommonPayload' has 'transactionDate'.
        // It also has 'recurringStartDate'. We need to prioritize what to send.
        // If user set a specific recurring start date, use that.
        // Otherwise use the transactionDate.
        // The API response shows 'startDate', so we'll likely want to send 'startDate' or 'transactionDate'.
        // Let's send 'transactionDate' as per Example Request in docs.

        if ('recurringStartDate' in payload && payload.recurringStartDate) {
          ;(payload as any).transactionDate = payload.recurringStartDate
          delete (payload as any).recurringStartDate
        }

        // 2. Map 'endDate'
        if ('recurringEndDate' in payload && payload.recurringEndDate) {
          ;(payload as any).endDate = payload.recurringEndDate
          delete (payload as any).recurringEndDate
        }

        // 3. Ensure 'amount' is number if API expects number, but payload type says number.
        // (No change needed if payload.amount is already number)

        // 4. Set transactionType
        let type = 'EXPENSE'
        if (endpoint.includes('income')) type = 'INCOME'
        else if (endpoint.includes('transfer')) type = 'TRANSFER'
        ;(payload as any).transactionType = type
      } else {
        // Remove recurring fields from payload if not recurring
        // as the standard transaction endpoints may not accept them
        delete (payload as any).isRecurring
        delete (payload as any).interval
        delete (payload as any).recurringStartDate
        delete (payload as any).recurringEndDate
      }

      try {
        await apiClient.post<Transaction>(finalEndpoint, payload)

        // If it was a recurring transaction, we might want to refresh the recurring list too
        if ('isRecurring' in payload && payload.isRecurring) {
          await this.fetchRecurringTransactions()
        } else {
          await this.fetchTransactions(this.currentFilters)
        }

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

    async fetchRecurringTransactions() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return

      this.isLoading = true
      this.error = null
      try {
        const response = await apiClient.get<RecurringTransaction[]>('/recurring-transactions')
        this.recurringTransactions = response.data
      } catch (err: any) {
        console.error('Failed to fetch recurring transactions:', err)
        const errorMessage =
          err.response?.data?.message || 'Gagal memuat daftar transaksi berulang.'
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
      } finally {
        this.isLoading = false
      }
    },

    async deleteRecurringTransaction(id: string) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return

      this.isSubmitting = true
      this.error = null
      try {
        await apiClient.delete(`/recurring-transactions/${id}`)
        // Remove from local state
        this.recurringTransactions = this.recurringTransactions.filter((rt) => rt.id !== id)
      } catch (err: any) {
        console.error('Failed to delete recurring transaction:', err)
        const errorMessage = err.response?.data?.message || 'Gagal menghapus transaksi berulang.'
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
        throw new Error(this.error ?? 'Unknown error')
      } finally {
        this.isSubmitting = false
      }
    },
  },
})
