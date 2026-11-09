import apiClient from './apiService'
import type { MyConversationResponse } from '@/types/chat'
export type { ChatMessage, Conversation, ConversationStatus, MessageSenderType, MyConversationResponse } from '@/types/chat'

class ChatService {
  async getMyConversation(page = 1, limit = 30): Promise<MyConversationResponse> {
    const response = await apiClient.get<MyConversationResponse>('/chat/my-conversation', { params: { page, limit } })
    return response.data
  }
}

export default new ChatService()
