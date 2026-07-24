import { defineStore } from 'pinia'
import { ref } from 'vue'
import chatService, { type ChatMessage, type Conversation } from '@/services/chatService'
import { getChatSocket, disconnectChatSocket } from '@/services/socket'
import { useAuthStore } from '@/stores/auth'
import { playChatNotificationSound } from '@/utils/notificationSound'

export const useChatStore = defineStore('chat', () => {
  const conversation = ref<Conversation | null>(null)
  const messages = ref<ChatMessage[]>([])
  const connected = ref(false)
  const isLoading = ref(false)

  const loadHistory = async () => {
    isLoading.value = true
    try {
      const response = await chatService.getMyConversation()
      conversation.value = response.conversation
      messages.value = response.data
    } finally {
      isLoading.value = false
    }
  }

  const connect = () => {
    const authStore = useAuthStore()
    if (!authStore.token) return

    const socket = getChatSocket(authStore.token)

    socket.off('connect')
    socket.off('disconnect')
    socket.off('newMessage')

    socket.on('connect', () => {
      connected.value = true
      if (conversation.value) {
        socket.emit('markRead', { conversationId: conversation.value.id })
      }
    })
    socket.on('disconnect', () => {
      connected.value = false
    })
    socket.on('newMessage', (message: ChatMessage) => {
      if (conversation.value && message.conversationId === conversation.value.id) {
        messages.value.push(message)
        if (message.senderType === 'ADMIN') {
          playChatNotificationSound()
          socket.emit('markRead', { conversationId: conversation.value.id })
        }
      }
    })

    if (socket.connected) {
      connected.value = true
    }
  }

  const sendMessage = (content: string) => {
    const authStore = useAuthStore()
    if (!authStore.token || !content.trim()) return
    const socket = getChatSocket(authStore.token)
    socket.emit('sendMessage', { content })
  }

  const disconnect = () => {
    disconnectChatSocket()
    connected.value = false
  }

  return {
    conversation,
    messages,
    connected,
    isLoading,
    loadHistory,
    connect,
    sendMessage,
    disconnect,
  }
})
