export interface SubscriptionPlan {
  id: string
  name: string
  code: string
  description: string | null
  price: number
  discountPrice: number | null
  durationMonths: number | null
}
export type PaymentStatus = 'PENDING' | 'PENDING_REVIEW' | 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'CANCELLED'
export interface PaymentHistory {
  id: string
  orderId: string
  plan: SubscriptionPlan | null
  planCode: string
  amount: number
  status: PaymentStatus
  method?: 'MIDTRANS' | 'MANUAL_TRANSFER'
  midtransResponse?: unknown
  createdAt: string
  updatedAt?: string
  paidAt?: string | null
  approvedAt?: string | null
}
