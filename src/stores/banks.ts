import { defineStore } from 'pinia'
import apiClient from '@/services/apiService'

export interface Bank {
  id: string
  name: string
  code?: string | null
}

interface BanksState {
  banks: Bank[]
  isLoading: boolean
  error: string | null
}

export const useBankStore = defineStore('banks', {
  state: (): BanksState => ({
    banks: [],
    isLoading: false,
    error: null,
  }),
  getters: {
    // Getter untuk mendapatkan semua bank
    allBanks: (state): Bank[] => state.banks,
    // Getter untuk status loading
    isLoadingBanks: (state): boolean => state.isLoading,
    bankError: (state): string | null => state.error,
    hasBanksData: (state): boolean => state.banks.length > 0,
  },
  actions: {
    async fetchBanks() {
      console.log('Fetching banks from API...')
      this.isLoading = true
      this.error = null
      try {
        const response = await apiClient.get<Bank[]>('/banks')
        this.banks = response.data

        console.log('Banks fetched successfully:', this.banks.length, 'banks loaded.')
      } catch (err: any) {
        console.error('Failed to fetch banks:', err.response?.data || err.message)
        const errorMessage = err.response?.data?.message || 'Gagal memuat daftar bank.'
        // Pastikan errorMessage adalah string tunggal
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
        this.banks = [] // Kosongkan bank jika fetch gagal
      } finally {
        this.isLoading = false
      }
    },
  },
})
