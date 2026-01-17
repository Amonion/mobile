import { io, Socket } from 'socket.io-client'

// const SOCKET_URL = 'http://192.168.1.44:8080'
const SOCKET_URL = 'https://server1.kencoins.com'
// const SOCKET_URL = 'https://schoolingsocial-api-v1.onrender.com'
// const SOCKET_URL = process.env.EXPO_PUBLIC_API_BASE_URL

class SocketService {
  private socket: Socket | null = null

  connect(token: string): void {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        auth: { token },
      })

      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket?.id)
      })

      this.socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected')
      })
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }
}

export default new SocketService()
