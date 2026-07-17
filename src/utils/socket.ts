// @ts-expect-error uni-app Socket.IO v4 适配层无完整类型
import io from '@wu-xj/uni-socket.io'
import { config } from '@/config'
import { getAccessToken } from '@/api/client'

function authToken() {
  return getAccessToken() || ''
}

/**
 * UniApp Socket.IO（@wu-xj/uni-socket.io，服务端 v4）
 * Authorization 头 + 登录后 reconnectWs；仅 websocket 传输
 */
export const ws = io(config.host, {
  autoConnect: false,
  transports: ['websocket'],
  auth: {
    token: authToken(),
  },
  transportOptions: {
    polling: {
      extraHeaders: {
        Authorization: authToken(),
      },
    },
  },
})

ws.on('data', (msg: unknown) => {
  console.info('[Socket]', msg)
})

ws.on('connect_error', (err: { message?: string }) => {
  console.warn('[Socket] connect_error', err?.message || err)
})

/** 重新连接 WebSocket（登录后更新 token） */
export const reconnectWs = async () => {
  try {
    const token = authToken()
    if (!token) {
      if (ws.connected) ws.disconnect()
      return
    }
    if (ws.connected) {
      ws.disconnect()
    }
    ws.auth = { token }
    ws.io.opts.transportOptions = {
      polling: {
        extraHeaders: {
          Authorization: token,
        },
      },
    }
    await ws.connect()
  } catch (error) {
    console.error('WebSocket 重连失败:', error)
  }
}

export function disconnectWs() {
  if (ws.connected) ws.disconnect()
}

export function connectWs() {
  if (!authToken()) return
  void reconnectWs()
}
