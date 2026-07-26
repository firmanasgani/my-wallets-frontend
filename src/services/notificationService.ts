import apiClient from './apiService'

export type NotificationType =
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_PENDING_REVIEW'
  | 'SUBSCRIPTION_ACTIVATED'
  | 'SUBSCRIPTION_EXPIRING'
  | 'SUBSCRIPTION_EXPIRED'
  | 'SUBSCRIPTION_CANCELLED'
  | 'CHAT_MESSAGE'
  | 'ACCOUNT_STATUS'
  | 'PROMOTION'
  | 'USER_REGISTERED'
  | 'SYSTEM'

export interface AppNotification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  data: Record<string, unknown> | null
  isRead: boolean
  readAt: string | null
  createdAt: string
}

export interface PaginatedNotifications {
  data: AppNotification[]
  meta: { total: number; page: number; limit: number; lastPage: number }
}

class NotificationService {
  async list(params?: { page?: number; limit?: number; isRead?: boolean }): Promise<PaginatedNotifications> {
    const response = await apiClient.get<PaginatedNotifications>('/notifications', { params })
    return response.data
  }

  async getOne(id: string): Promise<AppNotification> {
    const response = await apiClient.get<AppNotification>(`/notifications/${id}`)
    return response.data
  }

  async unreadCount(): Promise<{ count: number }> {
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count')
    return response.data
  }

  async markRead(id: string): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(`/notifications/${id}/read`)
    return response.data
  }

  async markAllRead(): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>('/notifications/read-all')
    return response.data
  }
}

export default new NotificationService()
