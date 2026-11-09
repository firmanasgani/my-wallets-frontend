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
export type ChatConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'
