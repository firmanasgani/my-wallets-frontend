import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { ChatMessage, MyConversationResponse } from '@/types/chat'

const fixture = vi.hoisted(() => {
  const handlers = new Map<string, ((...args: unknown[]) => void)[]>()
  const socket = {
    connected: false,
    on: vi.fn((event: string, callback: (...args: unknown[]) => void) => handlers.set(event, [...(handlers.get(event) || []), callback])),
    off: vi.fn((event: string, callback: (...args: unknown[]) => void) => handlers.set(event, (handlers.get(event) || []).filter((item) => item !== callback))),
    io: { on: vi.fn(), off: vi.fn() },
    connect: vi.fn(), emit: vi.fn(), volatile: { emit: vi.fn() },
  }
  return { handlers, socket, auth: { token: 'token', currentUser: { id: 'user' } }, history: vi.fn(), sound: vi.fn() }
})
vi.mock('@/services/chatService', () => ({ default: { getMyConversation: fixture.history } }))
vi.mock('@/services/socket', () => ({ getChatSocket: () => fixture.socket, disconnectChatSocket: () => { fixture.socket.connected = false } }))
vi.mock('@/stores/auth', () => ({ useAuthStore: () => fixture.auth }))
vi.mock('@/utils/notificationSound', () => ({ playChatNotificationSound: fixture.sound }))
import { useChatStore } from '../chat'

const message = (id: string, content: string, senderType: 'USER' | 'ADMIN' = 'USER'): ChatMessage => ({ id, content, conversationId: 'conversation', senderType, senderUserId: senderType === 'USER' ? 'user' : null, senderAdminId: null, attachmentUrl: null, isRead: false, createdAt: `2026-11-10T12:00:${id.padStart(2, '0')}Z` })
const response = (data: ChatMessage[] = [], total = data.length, page = 1): MyConversationResponse => ({ conversation: { id: 'conversation', userId: 'user', assignedAdminId: null, status: 'OPEN', lastMessageAt: null, createdAt: '', updatedAt: '' }, data, meta: { total, page, limit: 30, lastPage: Math.ceil(total / 30) } })
const deliver = (event: string, value: unknown) => fixture.handlers.get(event)?.forEach((callback) => callback(value))
let store: ReturnType<typeof useChatStore>
beforeEach(async () => {
  vi.useFakeTimers(); vi.clearAllMocks(); fixture.handlers.clear(); fixture.socket.connected = false
  fixture.auth.currentUser = { id: 'user' }; fixture.history.mockResolvedValue(response())
  setActivePinia(createPinia()); store = useChatStore(); await store.loadHistory(); store.connect(); fixture.socket.connected = true
})
afterEach(() => { store.disconnect(); vi.useRealTimers() })

describe('chat delivery and history', () => {
  it('preserves the draft until the server echo and rejects duplicate submissions', async () => {
    store.draft = 'Hello'
    // The connect handler also refreshes history, so wait for it before sending.
    deliver('connect', undefined); await Promise.resolve(); await Promise.resolve()
    const sending = store.sendMessage(store.draft)
    expect(store.draft).toBe('Hello')
    expect(await store.sendMessage('Hello')).toBe(false)
    expect(fixture.socket.volatile.emit).toHaveBeenCalledTimes(1)
    deliver('newMessage', message('1', 'Hello'))
    expect(await sending).toBe(true)
    expect(store.draft).toBe('')
    deliver('newMessage', message('1', 'Hello'))
    expect(store.messages).toHaveLength(1)
  })
  it('retains an unconfirmed draft without resending and reconciles a late persisted message', async () => {
    deliver('connect', undefined); await Promise.resolve(); await Promise.resolve()
    store.draft = 'Delayed'
    const sending = store.sendMessage(store.draft)
    vi.advanceTimersByTime(15000)
    expect(await sending).toBe(false)
    expect(store.sendUnconfirmed).toBe(true)
    expect(store.draft).toBe('Delayed')
    expect(await store.sendMessage('Delayed')).toBe(false)
    fixture.history.mockResolvedValue(response([message('2', 'Delayed')]))
    await store.loadHistory()
    expect(store.draft).toBe('')
    expect(store.sendUnconfirmed).toBe(false)
    expect(fixture.socket.volatile.emit).toHaveBeenCalledTimes(1)
  })
  it('loads older messages and preserves read receipts across overlapping history', async () => {
    fixture.history.mockResolvedValueOnce(response([{ ...message('2', 'Recent'), isRead: true }], 31))
    await store.loadHistory()
    fixture.history.mockResolvedValueOnce(response([message('1', 'Older'), message('2', 'Recent')], 2, 2))
    await store.loadOlder()
    expect(store.messages.map((item) => item.id)).toEqual(['1', '2'])
    expect(store.messages[1]?.isRead).toBe(true)
    expect(store.hasOlder).toBe(false)
  })
  it('does not repeat notification sounds for duplicate support messages', () => {
    deliver('newMessage', message('3', 'Reply', 'ADMIN'))
    deliver('newMessage', message('3', 'Reply', 'ADMIN'))
    expect(fixture.sound).toHaveBeenCalledTimes(1)
    expect(fixture.socket.emit).not.toHaveBeenCalledWith('markRead', expect.anything())
    store.setReading(true)
    expect(fixture.socket.emit).toHaveBeenCalledWith('markRead', { conversationId: 'conversation' })
  })
  it('clears private conversation state when the authenticated user changes', () => {
    store.draft = 'Private draft'; deliver('newMessage', message('4', 'Private'))
    fixture.auth.currentUser = { id: 'another-user' }; store.prepareSession()
    expect(store.draft).toBe('')
    expect(store.messages).toEqual([])
    expect(store.conversation).toBe(null)
  })
})
