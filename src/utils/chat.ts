import type { ChatConnectionState, ChatMessage } from '@/types/chat'
import { dateKey } from './dateRange'
export const CHAT_MESSAGE_LIMIT = 4000
export function chatMessageProblem(content: string) {
  if (!content.trim()) return 'Tulis pesan terlebih dahulu.'
  if (content.trim().length > CHAT_MESSAGE_LIMIT) return 'Pesan maksimal 4.000 karakter.'
  return ''
}
export function mergeChatMessages(existing: ChatMessage[], incoming: ChatMessage[], conversationId: string) {
  const map = new Map<string, ChatMessage>()
  for (const message of [...existing, ...incoming]) {
    if (message.conversationId !== conversationId) continue
    const previous = map.get(message.id)
    map.set(message.id, { ...message, isRead: !!previous?.isRead || message.isRead })
  }
  return [...map.values()].sort((a, b) => (Date.parse(a.createdAt) || 0) - (Date.parse(b.createdAt) || 0) || a.id.localeCompare(b.id))
}
export function chatDayGroups(messages: ChatMessage[]) {
  const groups: { key: string; label: string; messages: ChatMessage[] }[] = []
  for (const message of messages) {
    const date = new Date(message.createdAt), valid = Number.isFinite(date.getTime())
    const key = valid ? dateKey(date) : 'unknown'
    let group = groups[groups.length - 1]
    if (!group || group.key !== key) { group = { key, label: valid ? date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Tanggal tidak tersedia', messages: [] }; groups.push(group) }
    group.messages.push(message)
  }
  return groups
}
export function chatTime(value: string) {
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '—'
}
export function chatAttachmentUrl(value: string | null, origin: string) {
  if (!value) return ''
  try { const url = new URL(value, origin); return ['http:', 'https:'].includes(url.protocol) ? url.href : '' } catch { return '' }
}
export const chatConnectionLabel = (state: ChatConnectionState) => ({ idle: 'Belum terhubung', connecting: 'Menyambungkan...', connected: 'Koneksi terhubung', disconnected: 'Koneksi terputus', error: 'Koneksi bermasalah' })[state]
export const shouldSendOnEnter = (event: Pick<KeyboardEvent, 'key' | 'shiftKey' | 'isComposing' | 'repeat'>) => event.key === 'Enter' && !event.shiftKey && !event.isComposing && !event.repeat
