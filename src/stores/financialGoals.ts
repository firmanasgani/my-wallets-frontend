import { defineStore } from 'pinia'
import apiClient from '@/services/apiService'
import type {
  FinancialGoal,
  CreateGoalPayload,
  UpdateGoalPayload,
  AllocateGoalPayload,
  SpendGoalPayload,
  ReleaseGoalPayload,
  AdjustGoalPayload,
  GoalLedger,
} from '@/types/financialGoals'
import { useAuthStore } from './auth'

interface FinancialGoalsState {
  goals: FinancialGoal[]
  currentGoal: FinancialGoal | null
  ledgers: GoalLedger[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
}

export const useFinancialGoalStore = defineStore('financialGoals', {
  state: (): FinancialGoalsState => ({
    goals: [],
    currentGoal: null,
    ledgers: [],
    isLoading: false,
    isSubmitting: false,
    error: null,
  }),

  getters: {
    allGoals: (state) => state.goals,
    goalDetails: (state) => state.currentGoal,
    goalLedgers: (state) => state.ledgers,
    loading: (state) => state.isLoading,
    submitting: (state) => state.isSubmitting,
    errorMessage: (state) => state.error,
  },

  actions: {
    async fetchGoals() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return

      this.isLoading = true
      this.error = null
      try {
        const response = await apiClient.get<FinancialGoal[]>('/financial-goals')
        this.goals = response.data
      } catch (err: any) {
        console.error('Failed to fetch financial goals:', err)
        const errorMessage = err.response?.data?.message || 'Gagal memuat daftar goal keuangan.'
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
      } finally {
        this.isLoading = false
      }
    },

    async fetchGoalById(id: string) {
      this.isLoading = true
      this.error = null
      try {
        const response = await apiClient.get<FinancialGoal>(`/financial-goals/${id}`)
        this.currentGoal = response.data
        if (response.data.ledgers) {
          this.ledgers = response.data.ledgers
        }
      } catch (err: any) {
        console.error(`Failed to fetch goal ${id}:`, err)
        const errorMessage = err.response?.data?.message || 'Gagal memuat detail goal.'
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
      } finally {
        this.isLoading = false
      }
    },

    async createGoal(payload: CreateGoalPayload) {
      this.isSubmitting = true
      this.error = null
      try {
        // Ensure targetAmount is a string for backend
        const formattedPayload = {
          ...payload,
          targetAmount: payload.targetAmount.toString(),
        }
        const response = await apiClient.post<FinancialGoal>('/financial-goals', formattedPayload)
        this.goals.unshift(response.data)
        return response.data
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Gagal membuat goal baru.'
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
        throw new Error(this.error ?? 'Unknown error')
      } finally {
        this.isSubmitting = false
      }
    },

    async updateGoal(id: string, payload: UpdateGoalPayload) {
      this.isSubmitting = true
      this.error = null
      try {
        const formattedPayload = { ...payload }
        if (payload.targetAmount !== undefined) {
          formattedPayload.targetAmount = payload.targetAmount.toString()
        }
        const response = await apiClient.patch<FinancialGoal>(
          `/financial-goals/${id}`,
          formattedPayload,
        )
        const index = this.goals.findIndex((g) => g.id === id)
        if (index !== -1) {
          this.goals[index] = { ...this.goals[index], ...response.data }
        }
        if (this.currentGoal?.id === id) {
          this.currentGoal = { ...this.currentGoal, ...response.data }
        }
        return response.data
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Gagal memperbarui goal.'
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
        throw new Error(this.error ?? 'Unknown error')
      } finally {
        this.isSubmitting = false
      }
    },

    async deleteGoal(id: string) {
      this.isSubmitting = true
      this.error = null
      try {
        await apiClient.delete(`/financial-goals/${id}`)
        this.goals = this.goals.filter((g) => g.id !== id)
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Gagal menghapus goal.'
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
        throw new Error(this.error ?? 'Unknown error')
      } finally {
        this.isSubmitting = false
      }
    },

    async allocateFunds(goalId: string, payload: AllocateGoalPayload) {
      this.isSubmitting = true
      this.error = null
      try {
        const formattedPayload = {
          ...payload,
          amount: payload.amount.toString(),
        }
        const response = await apiClient.post<GoalLedger>(
          `/financial-goals/${goalId}/allocate`,
          formattedPayload,
        )
        await this.fetchGoalById(goalId) // Refresh to get updated virtual fields
        await this.fetchGoals() // Refresh list too
        return response.data
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Gagal melakukan alokasi dana.'
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
        throw new Error(this.error ?? 'Unknown error')
      } finally {
        this.isSubmitting = false
      }
    },

    async spendFunds(goalId: string, payload: SpendGoalPayload) {
      this.isSubmitting = true
      this.error = null
      try {
        const formattedPayload = {
          ...payload,
          amount: payload.amount.toString(),
        }
        const response = await apiClient.post<any>(
          `/financial-goals/${goalId}/spend`,
          formattedPayload,
        )
        await this.fetchGoalById(goalId)
        await this.fetchGoals()
        return response.data
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Gagal menggunakan dana goal.'
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
        throw new Error(this.error ?? 'Unknown error')
      } finally {
        this.isSubmitting = false
      }
    },

    async releaseFunds(goalId: string, payload: ReleaseGoalPayload) {
      this.isSubmitting = true
      this.error = null
      try {
        const formattedPayload = {
          ...payload,
          amount: payload.amount.toString(),
        }
        const response = await apiClient.post<GoalLedger>(
          `/financial-goals/${goalId}/release`,
          formattedPayload,
        )
        await this.fetchGoalById(goalId)
        await this.fetchGoals()
        return response.data
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Gagal melepas alokasi dana.'
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
        throw new Error(this.error ?? 'Unknown error')
      } finally {
        this.isSubmitting = false
      }
    },

    async adjustFunds(goalId: string, payload: AdjustGoalPayload) {
      this.isSubmitting = true
      this.error = null
      try {
        const formattedPayload = {
          ...payload,
          amount: payload.amount.toString(),
        }
        const response = await apiClient.post<GoalLedger>(
          `/financial-goals/${goalId}/adjust`,
          formattedPayload,
        )
        await this.fetchGoalById(goalId)
        await this.fetchGoals()
        return response.data
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Gagal melakukan koreksi manual.'
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
        throw new Error(this.error ?? 'Unknown error')
      } finally {
        this.isSubmitting = false
      }
    },

    async fetchLedgers(goalId: string) {
      this.isLoading = true
      this.error = null
      try {
        const response = await apiClient.get<GoalLedger[]>(`/financial-goals/${goalId}/ledgers`)
        this.ledgers = response.data
      } catch (err: any) {
        console.error(`Failed to fetch ledgers for goal ${goalId}:`, err)
        const errorMessage = err.response?.data?.message || 'Gagal memuat riwayat dana goal.'
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
      } finally {
        this.isLoading = false
      }
    },
  },
})
