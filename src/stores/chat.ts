import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { Socket } from 'socket.io-client'
import chatService from '@/services/chatService'
import { getChatSocket, disconnectChatSocket } from '@/services/socket'
import { useAuthStore } from '@/stores/auth'
import { playChatNotificationSound } from '@/utils/notificationSound'
import { chatMessageProblem, mergeChatMessages } from '@/utils/chat'
import type { ChatConnectionState, ChatMessage, Conversation } from '@/types/chat'

export const useChatStore = defineStore('chat', () => {
  const conversation = ref<Conversation | null>(null), messages = ref<ChatMessage[]>([]), draft = ref('')
  const connectionState = ref<ChatConnectionState>('idle'), connected = computed(() => connectionState.value === 'connected')
  const isLoading = ref(false), isLoadingOlder = ref(false), historyError = ref(''), olderError = ref(''), connectionError = ref(''), sendError = ref('')
  const isSending = ref(false), sendUnconfirmed = ref(false), soundEnabled = ref(true), reading = ref(false)
  const total = ref(0), loadedPage = ref(1), lastPage = ref(1)
  const hasOlder = computed(() => messages.value.length < total.value && loadedPage.value < lastPage.value)
  let owner: string | null = null, session = 0, historyVersion = 0
  let socket: Socket | null = null, detach: (() => void) | null = null
  let pending: { content: string; knownIds: Set<string>; resolve: (value: boolean) => void; timer: ReturnType<typeof setTimeout> | null } | null = null

  function uncertain(message = 'Belum ada konfirmasi pengiriman. Periksa riwayat percakapan sebelum mengirim ulang.') {
    if (!pending) return
    if (pending.timer) clearTimeout(pending.timer)
    pending.timer = null; pending.resolve(false)
    isSending.value = false; sendUnconfirmed.value = true; sendError.value = message
  }
  function confirmEcho(message: ChatMessage) {
    if (!pending || message.senderType !== 'USER' || message.senderUserId !== owner || message.content !== pending.content || pending.knownIds.has(message.id)) return
    const sent = pending
    if (sent.timer) clearTimeout(sent.timer)
    pending = null; isSending.value = false; sendUnconfirmed.value = false; sendError.value = ''
    if (draft.value.trim() === sent.content) draft.value = ''
    sent.resolve(true)
  }
  function disconnect() {
    session++; historyVersion++
    detach?.(); detach = null; socket = null
    disconnectChatSocket()
    if (pending) uncertain()
    connectionState.value = 'idle'; reading.value = false; isLoading.value = false; isLoadingOlder.value = false
  }
  function ensureOwner() {
    const auth = useAuthStore(), userId = auth.currentUser?.id || null
    if (owner !== userId) {
      disconnect(); owner = userId
      conversation.value = null; messages.value = []; draft.value = ''; total.value = 0; loadedPage.value = 1; lastPage.value = 1
      pending = null; isSending.value = false; sendUnconfirmed.value = false
      historyError.value = ''; olderError.value = ''; sendError.value = ''; connectionError.value = ''
    }
    return !!userId && !!auth.token
  }
  function markRead() {
    if (reading.value && socket?.connected && conversation.value) socket.emit('markRead', { conversationId: conversation.value.id })
  }
  function setReading(value: boolean) { reading.value = value; if (value) markRead() }

  async function loadHistory(clearUnconfirmed = true) {
    if (!ensureOwner()) { historyError.value = 'Silakan masuk kembali untuk membuka percakapan.'; return false }
    const currentSession = session, version = ++historyVersion, userId = owner
    isLoading.value = true; isLoadingOlder.value = false; historyError.value = ''; olderError.value = ''
    try {
      const response = await chatService.getMyConversation(1, 30)
      if (currentSession !== session || version !== historyVersion || useAuthStore().currentUser?.id !== userId) return false
      if (response.conversation.userId !== userId) throw new Error('Percakapan tidak sesuai dengan akun.')
      const same = conversation.value?.id === response.conversation.id
      conversation.value = response.conversation
      messages.value = mergeChatMessages(same ? messages.value : [], response.data, response.conversation.id)
      loadedPage.value = 1; total.value = Math.max(response.meta.total, messages.value.length); lastPage.value = Math.max(1, response.meta.lastPage, Math.ceil(total.value / 30))
      response.data.forEach(confirmEcho)
      if (clearUnconfirmed && pending && !isSending.value) { pending = null; sendUnconfirmed.value = false; sendError.value = '' }
      markRead()
      return true
    } catch { if (currentSession === session && version === historyVersion) historyError.value = 'Riwayat percakapan belum berhasil dimuat. Silakan coba lagi.'; return false }
    finally { if (currentSession === session && version === historyVersion) isLoading.value = false }
  }
  async function loadOlder() {
    if (!ensureOwner() || !conversation.value || isLoading.value || isLoadingOlder.value || !hasOlder.value) return false
    const currentSession = session, version = historyVersion, id = conversation.value.id, page = loadedPage.value + 1
    isLoadingOlder.value = true; olderError.value = ''
    try {
      const response = await chatService.getMyConversation(page, 30)
      if (currentSession !== session || version !== historyVersion || conversation.value?.id !== id) return false
      if (response.conversation.id !== id || response.conversation.userId !== owner) throw new Error('Percakapan tidak sesuai.')
      messages.value = mergeChatMessages(messages.value, response.data, id)
      loadedPage.value = page; total.value = Math.max(response.meta.total, messages.value.length); lastPage.value = Math.max(page, response.meta.lastPage)
      return true
    } catch { if (currentSession === session && version === historyVersion) olderError.value = 'Pesan sebelumnya belum berhasil dimuat.'; return false }
    finally { if (currentSession === session && version === historyVersion) isLoadingOlder.value = false }
  }
  function connect() {
    if (!ensureOwner()) { connectionState.value = 'error'; connectionError.value = 'Silakan masuk kembali untuk terhubung ke chat.'; return }
    if (socket?.connected) { connectionState.value = 'connected'; markRead(); return }
    detach?.()
    const currentSession = session, nextSocket = getChatSocket(useAuthStore().token!)
    socket = nextSocket; connectionState.value = 'connecting'; connectionError.value = ''
    const current = () => session === currentSession && socket === nextSocket && useAuthStore().currentUser?.id === owner
    const onConnect = () => { if (!current()) return; connectionState.value = 'connected'; connectionError.value = ''; markRead(); void loadHistory(false) }
    const onDisconnect = () => { if (!current()) return; connectionState.value = 'disconnected'; if (pending) uncertain('Koneksi terputus saat mengirim. Draf tetap tersimpan; periksa riwayat setelah terhubung kembali.') }
    const onError = () => { if (current()) { connectionState.value = 'error'; connectionError.value = 'Koneksi percakapan belum berhasil tersambung.' } }
    const onAttempt = () => { if (current()) connectionState.value = 'connecting' }
    const onMessage = (message: ChatMessage) => {
      if (!current() || !conversation.value || message.conversationId !== conversation.value.id) return
      const exists = messages.value.some((item) => item.id === message.id)
      messages.value = mergeChatMessages(messages.value, [message], conversation.value.id)
      conversation.value = { ...conversation.value, lastMessageAt: message.createdAt, ...(message.senderType === 'USER' ? { status: 'OPEN' as const } : {}) }
      if (!exists) { total.value++; lastPage.value = Math.max(lastPage.value, Math.ceil(total.value / 30)); if (message.senderType === 'ADMIN' && soundEnabled.value) playChatNotificationSound() }
      confirmEcho(message)
      if (message.senderType === 'ADMIN') markRead()
    }
    const onRead = (event: { conversationId: string; readerType: 'USER' | 'ADMIN' }) => {
      if (!current() || event.conversationId !== conversation.value?.id) return
      const sender = event.readerType === 'ADMIN' ? 'USER' : 'ADMIN'
      messages.value = messages.value.map((message) => message.senderType === sender ? { ...message, isRead: true } : message)
    }
    const onSendError = () => { if (current() && pending) uncertain('Pesan belum mendapat konfirmasi. Periksa percakapan sebelum mencoba mengirim ulang.') }
    nextSocket.on('connect', onConnect); nextSocket.on('disconnect', onDisconnect); nextSocket.on('connect_error', onError)
    nextSocket.on('newMessage', onMessage); nextSocket.on('messagesRead', onRead); nextSocket.on('error', onSendError); nextSocket.on('exception', onSendError)
    nextSocket.io.on('reconnect_attempt', onAttempt)
    detach = () => { nextSocket.off('connect', onConnect); nextSocket.off('disconnect', onDisconnect); nextSocket.off('connect_error', onError); nextSocket.off('newMessage', onMessage); nextSocket.off('messagesRead', onRead); nextSocket.off('error', onSendError); nextSocket.off('exception', onSendError); nextSocket.io.off('reconnect_attempt', onAttempt) }
    if (nextSocket.connected) onConnect()
    else nextSocket.connect()
  }
  async function sendMessage(content: string) {
    if (!ensureOwner()) { sendError.value = 'Silakan masuk kembali untuk mengirim pesan.'; return false }
    if (isSending.value || sendUnconfirmed.value) return false
    const problem = chatMessageProblem(content)
    if (problem) { sendError.value = problem; return false }
    if (!connected.value || !socket?.connected || !conversation.value || isLoading.value) { sendError.value = 'Chat belum terhubung. Draf tetap tersimpan.'; return false }
    sendError.value = ''; isSending.value = true
    const currentSocket = socket
    return new Promise<boolean>((resolve) => {
      pending = { content: content.trim(), knownIds: new Set(messages.value.map((message) => message.id)), resolve, timer: null }
      pending.timer = setTimeout(() => uncertain(), 15000)
      try { currentSocket.volatile.emit('sendMessage', { content: pending.content }) }
      catch { uncertain() }
    })
  }
  watch(() => useAuthStore().currentUser?.id, ensureOwner, { flush: 'sync' })
  return { conversation, messages, draft, connected, connectionState, connectionError, isLoading, isLoadingOlder, historyError, olderError, isSending, sendError, sendUnconfirmed, soundEnabled, hasOlder, total, loadHistory, loadOlder, connect, sendMessage, disconnect, setReading, prepareSession: ensureOwner }
})
