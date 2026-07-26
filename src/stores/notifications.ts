import { defineStore } from 'pinia'
import { ref } from 'vue'
import notificationService, { type AppNotification } from '@/services/notificationService'
import { getNotificationSocket, disconnectNotificationSocket } from '@/services/socket'
import { useAuthStore } from '@/stores/auth'
import { playChatNotificationSound } from '@/utils/notificationSound'

const DROPDOWN_LIMIT = 5

export const useNotificationsStore = defineStore('notifications', () => {
  const latest = ref<AppNotification[]>([])
  const unreadCount = ref(0)
  const connected = ref(false)
  const isLoading = ref(false)

  const fetchUnreadCount = async () => {
    const { count } = await notificationService.unreadCount()
    unreadCount.value = count
  }

  /** Loads the newest notifications for the bell dropdown (fixed page size, not paginated). */
  const fetchLatest = async () => {
    isLoading.value = true
    try {
      const response = await notificationService.list({ page: 1, limit: DROPDOWN_LIMIT })
      latest.value = response.data
    } finally {
      isLoading.value = false
    }
  }

  const connect = () => {
    const authStore = useAuthStore()
    if (!authStore.token) return

    const socket = getNotificationSocket(authStore.token)

    socket.off('connect')
    socket.off('disconnect')
    socket.off('notification:new')

    socket.on('connect', () => {
      connected.value = true
    })
    socket.on('disconnect', () => {
      connected.value = false
    })
    socket.on('notification:new', (notification: AppNotification) => {
      latest.value = [notification, ...latest.value].slice(0, DROPDOWN_LIMIT)
      unreadCount.value += 1
      playChatNotificationSound()
    })

    if (socket.connected) {
      connected.value = true
    }
  }

  const disconnect = () => {
    disconnectNotificationSocket()
    connected.value = false
  }

  const markRead = async (id: string) => {
    await notificationService.markRead(id)
    const item = latest.value.find((n) => n.id === id)
    if (item && !item.isRead) {
      item.isRead = true
      item.readAt = new Date().toISOString()
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  const markAllRead = async () => {
    await notificationService.markAllRead()
    latest.value = latest.value.map((n) => ({ ...n, isRead: true, readAt: n.readAt ?? new Date().toISOString() }))
    unreadCount.value = 0
  }

  return {
    latest,
    unreadCount,
    connected,
    isLoading,
    fetchUnreadCount,
    fetchLatest,
    connect,
    disconnect,
    markRead,
    markAllRead,
  }
})
