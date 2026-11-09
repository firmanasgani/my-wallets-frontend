import { describe, expect, it } from 'vitest'
import { CHAT_MESSAGE_LIMIT, chatAttachmentUrl, chatDayGroups, chatMessageProblem, mergeChatMessages, shouldSendOnEnter } from '../chat'
import type { ChatMessage } from '@/types/chat'

const message = (id: string, createdAt: string, read = false) => ({ id, conversationId: 'c', senderType: 'USER', senderUserId: 'u', senderAdminId: null, content: 'Pesan', attachmentUrl: null, isRead: read, createdAt } as ChatMessage)

describe('support chat', () => {
  it('validates trimmed messages against the API character limit', () => {
    expect(chatMessageProblem(' \n ')).toBe('Tulis pesan terlebih dahulu.')
    expect(chatMessageProblem('x'.repeat(CHAT_MESSAGE_LIMIT))).toBe('')
    expect(chatMessageProblem('x'.repeat(CHAT_MESSAGE_LIMIT + 1))).toBe('Pesan maksimal 4.000 karakter.')
    expect(chatMessageProblem('  Halo  ')).toBe('')
  })
  it('merges history and live echoes once while preserving read receipts', () => {
    const older = message('a', '2026-11-09T12:00:00'), newer = message('b', '2026-11-10T12:00:00', true)
    const result = mergeChatMessages([newer], [older, { ...newer, isRead: false }, { ...older, id: 'other', conversationId: 'private-other' }], 'c')
    expect(result.map((item) => item.id)).toEqual(['a', 'b'])
    expect(result[1]?.isRead).toBe(true)
  })
  it('groups ordered messages by local calendar dates', () => {
    const groups = chatDayGroups([message('a', '2026-11-09T12:00:00'), message('b', '2026-11-09T13:00:00'), message('c', '2026-11-10T12:00:00')])
    expect(groups.map((group) => group.messages.length)).toEqual([2, 1])
    expect(groups[0]?.key).toBe('2026-11-09')
    expect(chatDayGroups([message('invalid', 'invalid')])[0]?.key).toBe('unknown')
  })
  it('allows safe attachment links and rejects executable or malformed URLs', () => {
    expect(chatAttachmentUrl('/file.pdf', 'https://moneytory.test')).toBe('https://moneytory.test/file.pdf')
    expect(chatAttachmentUrl('javascript:alert(1)', 'https://moneytory.test')).toBe('')
    expect(chatAttachmentUrl('data:text/html,<script>alert(1)</script>', 'https://moneytory.test')).toBe('')
    expect(chatAttachmentUrl(null, 'https://moneytory.test')).toBe('')
  })
  it('sends on Enter while preserving Shift+Enter, IME composition and repeat guards', () => {
    const event = { key: 'Enter', shiftKey: false, isComposing: false, repeat: false }
    expect(shouldSendOnEnter(event)).toBe(true)
    expect(shouldSendOnEnter({ ...event, shiftKey: true })).toBe(false)
    expect(shouldSendOnEnter({ ...event, isComposing: true })).toBe(false)
    expect(shouldSendOnEnter({ ...event, repeat: true })).toBe(false)
  })
})
