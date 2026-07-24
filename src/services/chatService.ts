import apiClient from './apiService'

export type ConversationStatus = 'OPEN' | 'CLOSED'
export type MessageSenderType = 'USER' | 'ADMIN'

export interface Conversation {
  id: string
  userId: string
  assignedAdminId: string | null
  status: ConversationStatus
  lastMessageAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderType: MessageSenderType
  senderUserId: string | null
  senderAdminId: string | null
  content: string
  attachmentUrl: string | null
  isRead: boolean
  createdAt: string
}

export interface MyConversationResponse {
  conversation: Conversation
  data: ChatMessage[]
  meta: { total: number; page: number; limit: number; lastPage: number }
}

class ChatService {
  async getMyConversation(): Promise<MyConversationResponse> {
    const response = await apiClient.get<MyConversationResponse>('/chat/my-conversation')
    return response.data
  }
}

export default new ChatService()
