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

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED'

export interface PaymentHistory {
  id: string
  orderId: string
  plan: SubscriptionPlan | null
  midtransResponse: any
  planCode: string
  amount: number
  status: PaymentStatus
  createdAt: string
  paidAt: string | null
}


export const useSubscriptionStore = defineStore('subscriptions', {
  state: () => ({
    plans: [] as SubscriptionPlan[],
    isLoading: false,
    error: null as string | null,
    paymentHistory: [] as PaymentHistory[],
    isLoadingHistory: false,
    historyError: null as string | null,
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
    async fetchPaymentHistory() {
      this.isLoadingHistory = true
      this.historyError = null
      try {
        const response = await apiClient.get<PaymentHistory[]>('/subscriptions/payment-history')
        this.paymentHistory = response.data
      } catch (err: any) {
        this.historyError = err.response?.data?.message || 'Gagal memuat histori pembayaran.'
      } finally {
        this.isLoadingHistory = false
      }
    },
    async resumePayment(orderId: string) {
      try {
        const response = await apiClient.post<{ snap_token: string }>(
          '/subscriptions/resume-payment',
          { orderId },
        )
        return response.data.snap_token
      } catch (err: any) {
        throw new Error(err.response?.data?.message || 'Gagal melanjutkan pembayaran.')
      }
    },
  },
})
