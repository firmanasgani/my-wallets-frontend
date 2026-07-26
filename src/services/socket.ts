import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null
let notificationSocket: Socket | null = null

/** Lazily creates (or returns) the singleton /chat namespace socket, authenticated with the given user token. */
export function getChatSocket(token: string): Socket {
  if (socket && socket.connected) return socket

  if (socket) {
    socket.disconnect()
  }

  socket = io(`${import.meta.env.VITE_API_BASE_URL}/chat`, {
    auth: { token },
    autoConnect: true,
    transports: ['websocket'],
  })

  return socket
}

export function disconnectChatSocket() {
  socket?.disconnect()
  socket = null
}

/** Lazily creates (or returns) the singleton /notifications namespace socket, authenticated with the given user token. */
export function getNotificationSocket(token: string): Socket {
  if (notificationSocket && notificationSocket.connected) return notificationSocket

  if (notificationSocket) {
    notificationSocket.disconnect()
  }

  notificationSocket = io(`${import.meta.env.VITE_API_BASE_URL}/notifications`, {
    auth: { token },
    autoConnect: true,
    transports: ['websocket'],
  })

  return notificationSocket
}

export function disconnectNotificationSocket() {
  notificationSocket?.disconnect()
  notificationSocket = null
}
