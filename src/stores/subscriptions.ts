import { defineStore } from 'pinia'
import apiClient from '@/services/apiService'
import type { SubscriptionPlan, PaymentHistory } from '@/types/subscriptions'
export type { SubscriptionPlan, PaymentHistory, PaymentStatus } from '@/types/subscriptions'

// A channel from Payfest's catalog (GET /subscriptions/payment-methods) —
// the user picks one of these before checkout; see api-contract-consumer.md
// in dashboard-financial-api for what each code actually means.
export interface PaymentMethodOption {
  code: string
  name: string
  sort_order: number
}

// What POST /subscriptions/checkout and /subscriptions/resume-payment
// return for a Payfest-method payment — the checkout instructions to show
// the user (never persisted by Payfest itself, so this is the only time
// they're available, except resume-payment re-serving what my-wallets-api
// saved at creation).
export interface PayfestCheckout {
  va_number?: string
  bank?: string
  qr_string?: string
  deeplink_url?: string
  payment_code?: string
  expiry_time?: string
}

export interface PayfestCheckoutResult {
  provider: 'payfest'
  order_id: string
  status: string
  checkout: PayfestCheckout
}

export const useSubscriptionStore = defineStore('subscriptions', {
  state: () => ({
    plans: [] as SubscriptionPlan[],
    isLoading: false,
    error: null as string | null,
    paymentHistory: [] as PaymentHistory[],
    isLoadingHistory: false,
    historyError: null as string | null,
    paymentMethods: [] as PaymentMethodOption[],
    paymentMethodsAvailable: false,
    paymentMethodsError: null as string | null,
    isLoadingPaymentMethods: false,
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
    async fetchPaymentMethods() {
      this.isLoadingPaymentMethods = true
      this.paymentMethodsError = null
      try {
        const response = await apiClient.get<{
          provider: 'payfest'
          available: boolean
          methods: PaymentMethodOption[]
        }>('/subscriptions/payment-methods')
        this.paymentMethodsAvailable = response.data.available
        this.paymentMethods = response.data.methods
      } catch (err) {
        this.paymentMethodsAvailable = false
        this.paymentMethods = []
        const response = (err as { response?: { data?: { message?: string } } }).response
        this.paymentMethodsError = response?.data?.message || 'Gagal memuat metode pembayaran.'
      } finally {
        this.isLoadingPaymentMethods = false
      }
    },
    async initiateCheckout(planCode: string, paymentMethodCode: string): Promise<PayfestCheckoutResult> {
      try {
        const response = await apiClient.post<PayfestCheckoutResult>('/subscriptions/checkout', {
          planCode,
          paymentMethodCode,
        })
        return response.data
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
        return response.data
      } catch (err: any) {
        this.historyError = err.response?.data?.message || 'Gagal memuat histori pembayaran.'
        return null
      } finally {
        this.isLoadingHistory = false
      }
    },
    // A pending payment predating the Payfest cutover still resumes as a
    // Midtrans Snap token; anything created since resumes as Payfest
    // checkout instructions — callers branch on "snap_token" in result.
    async resumePayment(orderId: string): Promise<PayfestCheckoutResult | { snap_token: string; order_id: string }> {
      try {
        const response = await apiClient.post<PayfestCheckoutResult | { snap_token: string; order_id: string }>(
          '/subscriptions/resume-payment',
          { orderId },
        )
        return response.data
      } catch (err: any) {
        throw new Error(err.response?.data?.message || 'Gagal melanjutkan pembayaran.')
      }
    },
    async scheduleDowngrade(planCode: string) {
      try {
        const response = await apiClient.post<{
          currentPlan: string
          scheduledPlan: string | null
          effectiveDate: string | null
        }>('/subscriptions/downgrade', { planCode })
        return response.data
      } catch (err: any) {
        throw new Error(err.response?.data?.message || 'Gagal menjadwalkan perubahan paket.')
      }
    },
    async cancelScheduledDowngrade() {
      try {
        const response = await apiClient.post<{ message: string }>('/subscriptions/downgrade/cancel')
        return response.data
      } catch (err: any) {
        throw new Error(err.response?.data?.message || 'Gagal membatalkan perubahan paket.')
      }
    },
  },
})
