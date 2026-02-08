import { defineStore } from 'pinia'
import apiClient from '@/services/apiService'

export interface SubscriptionPlan {
  id: string
  name: string
  code: string
  description: string | null
  price: number
  discountPrice: number | null
  durationMonths: number | null
}

export const useSubscriptionStore = defineStore('subscriptions', {
  state: () => ({
    plans: [] as SubscriptionPlan[],
    isLoading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchPlans() {
      this.isLoading = true
      this.error = null
      try {
        const response = await apiClient.get<SubscriptionPlan[]>('/subscriptions/plans')
        this.plans = response.data
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Gagal memuat paket langganan.'
      } finally {
        this.isLoading = false
      }
    },
    async initiateCheckout(planCode: string) {
      try {
        const response = await apiClient.post<{ snap_token: string }>('/subscriptions/checkout', {
          planCode,
        })
        return response.data.snap_token
      } catch (err: any) {
        throw new Error(err.response?.data?.message || 'Gagal memulai pembayaran.')
      }
    },
  },
})
