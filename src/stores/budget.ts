import { defineStore } from 'pinia'
import apiClient from '@/services/apiService'
import type {
  Budget,
  CreateBudgetPayload,
  UpdateBudgetPayload,
  BudgetFilter,
  BudgetReportItem,
} from '@/types/budget'
import { useAuthStore } from './auth'

interface BudgetState {
  budgets: Budget[]
  report: BudgetReportItem[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  totalBudgetsCount: number
}

export const useBudgetStore = defineStore('budgets', {
  state: (): BudgetState => ({
    budgets: [],
    report: [],
    isLoading: false,
    isSubmitting: false,
    error: null,
    totalBudgetsCount: 0,
  }),
  getters: {
    allBudgets: (state) => state.budgets,
    budgetReport: (state) => state.report,
    isLoadingBudgets: (state) => state.isLoading,
    isSubmittingBudget: (state) => state.isSubmitting,
    budgetError: (state) => state.error,
    globalBudgetCount: (state) => state.totalBudgetsCount,
  },
  actions: {
    async fetchTotalBudgetCount() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return

      try {
        // Fetch all budgets without filters to get the total count
        const response = await apiClient.get<Budget[]>('/budgets')
        this.totalBudgetsCount = response.data.length
      } catch (err) {
        console.error('Failed to fetch total budget count:', err)
      }
    },

    async fetchBudgets(filter?: BudgetFilter) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return

      this.isLoading = true
      this.error = null
      try {
        const response = await apiClient.get<Budget[]>('/budgets', { params: filter })
        this.budgets = response.data
        // Also update global count if we happen to fetch all, but usually we filter.
        // Better to separate concerns or update it lazily.
        // Let's ensure we have the global count separate.
        this.fetchTotalBudgetCount()
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Gagal memuat daftar anggaran.'
        console.error('Fetch budgets error:', err)
      } finally {
        this.isLoading = false
      }
    },

    async fetchBudgetReport(year: number, month: number) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return

      this.isLoading = true
      this.error = null
      try {
        const response = await apiClient.get<BudgetReportItem[]>('/budgets/report', {
          params: { year, month },
        })
        this.report = response.data
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Gagal memuat laporan anggaran.'
        console.error('Fetch budget report error:', err)
      } finally {
        this.isLoading = false
      }
    },

    async createBudget(payload: CreateBudgetPayload) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) throw new Error('User not authenticated.')

      // Check subscription limit for FREE users
      // Check subscription access (Premium/Family Only)
      const isFreePlan = authStore.currentUser?.subscriptionPlan === 'FREE'
      if (isFreePlan) {
        const accessError =
          'Fitur Anggaran hanya tersedia untuk pengguna Premium dan Family. Silakan upgrade paket Anda.'
        this.error = accessError
        throw new Error(accessError)
      }

      this.isSubmitting = true
      this.error = null
      try {
        await apiClient.post('/budgets', payload)
        // Refresh budgets if needed, usually list is updated or user navigates
        this.fetchTotalBudgetCount() // Update count after creation
        return true
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Gagal membuat anggaran.'
        throw err
      } finally {
        this.isSubmitting = false
      }
    },

    async updateBudget(id: string, payload: UpdateBudgetPayload) {
      this.isSubmitting = true
      this.error = null
      try {
        await apiClient.patch(`/budgets/${id}`, payload)
        return true
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Gagal memperbarui anggaran.'
        throw err
      } finally {
        this.isSubmitting = false
      }
    },

    async deleteBudget(id: string) {
      this.isSubmitting = true
      this.error = null
      try {
        await apiClient.delete(`/budgets/${id}`)
        this.fetchTotalBudgetCount() // Update count after deletion
        return true
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Gagal menghapus anggaran.'
        throw err
      } finally {
        this.isSubmitting = false
      }
    },
  },
})
