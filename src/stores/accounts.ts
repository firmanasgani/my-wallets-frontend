import { defineStore } from 'pinia'
import apiClient from '@/services/apiService'
import type { Account, CreateAccountPayload, UpdateAccountPayload } from '@/types/accounts'
import { useAuthStore } from './auth'
import { FrontendAccountType } from '@/types/enums'

interface AccountsState {
  accounts: Account[]
  isSubmitting: boolean
  isLoading: boolean
  isFetchingDetails: boolean
  error: string | null
}

export const useAccountStore = defineStore('accounts', {
  state: (): AccountsState => ({
    accounts: [],
    isLoading: false,
    isSubmitting: false,
    isFetchingDetails: false,
    error: null,
  }),
  getters: {
    allAccounts: (state) => state.accounts,

    getAccountById: (state) => (id: string) => {
      return state.accounts.find((acc: Account) => acc.id === id)
    },
    totalBanks: (state) =>
      state.accounts.filter((acc) => acc.accountType === FrontendAccountType.BANK).length,
    totalWallets: (state) =>
      state.accounts.filter((acc) => acc.accountType === FrontendAccountType.E_WALLET).length,
    totalCards: (state) =>
      state.accounts.filter((acc) => acc.accountType === FrontendAccountType.CREDIT_CARD).length,
  },
  actions: {
    async fetchAccounts() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated || !authStore.currentUser?.id) {
        this.error = 'User not authenticated to fetch accounts.'
        console.error(this.error)
        return
      }

      this.isLoading = true
      this.error = null
      try {
        const response = await apiClient.get<Account[]>('/accounts')
        this.accounts = response.data
      } catch (err: any) {
        console.error('Failed to fetch accounts:', err.response?.data || err.message)
        const errorMessage = err.response?.data?.message || 'Gagal memuat daftar akun.'
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
      } finally {
        this.isLoading = false
      }
    },
    async fetchAccountByIdForEdit(accountId: string): Promise<Account | null> {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        this.error = 'User not authenticated.'
        throw new Error(this.error)
      }
      this.isFetchingDetails = true
      this.error = null
      try {
        const response = await apiClient.get<Account>(`/accounts/${accountId}`)
        // this.currentEditingAccount = response.data; // Simpan ke state jika perlu
        return response.data // Langsung kembalikan untuk diisi ke form
      } catch (err: any) {
        console.error(`Failed to fetch account ${accountId}:`, err.response?.data || err.message)
        const errorMessage = err.response?.data?.message || `Gagal memuat detail akun ${accountId}.`
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
        // this.currentEditingAccount = null;
        throw new Error(this.error ?? 'Unknown error')
      } finally {
        this.isFetchingDetails = false
      }
    },
    async createAccount(payload: CreateAccountPayload) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        this.error = 'User not authenticated to create an account.'
        throw new Error(this.error ?? 'Unknown error')
      }

      const isFree = authStore.currentUser?.subscriptionPlan === 'FREE'
      if (isFree && this.accounts.length >= 4) {
        const limitError =
          'Batas akun untuk paket FREE adalah 4. Upgrade ke Premium untuk unlimited akun.'
        this.error = limitError
        throw new Error(limitError)
      }

      this.isLoading = true
      this.error = null

      const dataToSubmit: any = { ...payload }
      if (dataToSubmit.accountType !== FrontendAccountType.BANK) {
        delete dataToSubmit.bankId
      }
      dataToSubmit.initialBalance = dataToSubmit.initialBalance ?? 0
      dataToSubmit.currency = dataToSubmit.currency?.trim() || 'IDR'
      if (dataToSubmit.accountNumber === null || dataToSubmit.accountNumber?.trim() === '') {
        delete dataToSubmit.accountNumber
      }
      try {
        const response = await apiClient.post<Account>('/accounts', dataToSubmit)
        this.accounts.push(response.data)
        return response.data
      } catch (err: any) {
        console.error('Failed to create account:', err.response?.data || err.message)
        const errorMessage = err.response?.data?.message || 'Gagal membuat akun.'
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
        throw new Error(this.error ?? 'Unknown error')
      } finally {
        this.isLoading = false
      }
    },

    async updateAccount(accountId: string, payload: UpdateAccountPayload) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        this.error = 'User not authenticated to update an account.'
        throw new Error(this.error)
      }
      this.isLoading = true
      this.error = null
      try {
        const response = await apiClient.patch<Account>(`/accounts/${accountId}`, payload)
        const index = this.accounts.findIndex((acc: Account) => acc.id === accountId)
        if (index !== -1) {
          this.accounts[index] = response.data
        } else {
          this.accounts.push(response.data)
        }
        return response.data
      } catch (err: any) {
        console.error('Failed to update account:', err.response?.data || err.message)
        const errorMessage = err.response?.data?.message || 'Gagal memperbarui akun.'
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
        throw new Error(this.error || '')
      } finally {
        this.isLoading = false
      }
    },

    async deleteAccount(accountId: string) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        this.error = 'User not authenticated to delete an account.'
        throw new Error(this.error)
      }
      this.isLoading = true
      this.error = null
      try {
        await apiClient.delete(`/accounts/${accountId}`)
        this.accounts = this.accounts.filter((acc: Account) => acc.id !== accountId)
      } catch (err: any) {
        console.error('Failed to delete account:', err.response?.data || err.message)
        const errorMessage = err.response?.data?.message || 'Gagal menghapus akun.'
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
        throw new Error(this.error || '')
      } finally {
        this.isLoading = false
      }
    },
  },
})
