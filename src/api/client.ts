import { config } from '@/config'
import {
  configureClient,
  createEps,
  getService,
} from '/@'
import type { RequestOptions } from '/#/typings/comm/request'
import { storage } from '@/utils/storage'
import type { UserTokenPayload } from '@/typings/user'

export function apiUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path
  const base = config.baseUrl.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  if (base.startsWith('/') && typeof window === 'undefined') {
    return `${config.host.replace(/\/$/, '')}${p}`
  }
  return `${base}${p}`
}

export function getAccessToken() {
  if (storage.isExpired('token')) return ''
  return String(storage.get('token') || '')
}

export function getRefreshToken() {
  if (storage.isExpired('refreshToken')) return ''
  return String(storage.get('refreshToken') || '')
}

export function setTokens(accessToken: string, refreshToken: string) {
  storage.set('token', accessToken)
  storage.set('refreshToken', refreshToken, 7 * 24 * 60 * 60)
}

export function clearTokens() {
  storage.remove('token')
  storage.remove('refreshToken')
  storage.remove('userInfo')
}

// ——— refresh 队列 ———
let requests: Array<(token: string) => void> = []
let isRefreshing = false

function persistTokenPayload(data: UserTokenPayload) {
  storage.set('token', data.token, Math.max(1, data.expire - 5))
  storage.set(
    'refreshToken',
    data.refreshToken,
    Math.max(1, data.refreshExpire - 5),
  )
  try {
    uni.$emit('session:token', data)
  } catch {
    // ignore
  }
}

function redirectLogin() {
  const pages = getCurrentPages()
  const route = pages[pages.length - 1]?.route || ''
  if (route.includes('pages/login/login')) return
  clearTokens()
  try {
    uni.$emit('session:logout')
  } catch {
    // ignore
  }
  uni.reLaunch({ url: '/pages/login/login' })
}

/** 用 refreshToken 换新 access（不走 request，避免递归） */
export function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    return Promise.reject(new Error('无 refreshToken'))
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: apiUrl('/app/user/login/refreshToken'),
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: { refreshToken },
      success(res) {
        const body = res.data as {
          code?: number
          message?: string
          data?: UserTokenPayload
        }
        if (
          res.statusCode === 200 &&
          body?.code === 1000 &&
          body.data?.token
        ) {
          persistTokenPayload(body.data)
          resolve(body.data.token)
          return
        }
        reject(new Error(body?.message || '刷新 token 失败'))
      },
      fail(err) {
        reject(new Error(err.errMsg || '网络错误'))
      },
    })
  })
}

/**
 * 路由 / 请求前：若 access 过期且 refresh 有效则自动刷新
 * @returns 最新 access token（可能为空）
 */
export async function ensureFreshToken(): Promise<string> {
  const access = getAccessToken()
  if (access && !storage.isExpired('token')) {
    return access
  }

  if (storage.isExpired('refreshToken') || !getRefreshToken()) {
    if (access) {
      // access 仍在但标记过期且无 refresh → 清会话
      clearTokens()
    }
    return ''
  }

  if (isRefreshing) {
    return new Promise((resolve) => {
      requests.push((token) => resolve(token))
    })
  }

  isRefreshing = true
  try {
    const token = await refreshAccessToken()
    requests.forEach((cb) => cb(token))
    requests = []
    return token
  } catch {
    requests.forEach((cb) => {
      try {
        cb('')
      } catch {
        // ignore
      }
    })
    requests = []
    redirectLogin()
    return ''
  } finally {
    isRefreshing = false
  }
}

export async function request<T>(
  path: string,
  init?: RequestOptions,
): Promise<T> {
  const { toast: showToast = true, skipRefresh, ...rest } = init || {}
  const method = String(rest.method || 'GET').toUpperCase()
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  }

  const isRefreshApi = path.includes('refreshToken')

  // 自动 refresh：发请求前若 token 过期则先刷
  const rawToken = storage.get<string>('token')
  let token = getAccessToken()
  if (
    !skipRefresh &&
    !isRefreshApi &&
    rawToken &&
    storage.isExpired('token')
  ) {
    if (storage.isExpired('refreshToken')) {
      redirectLogin()
      throw new Error('登录已失效，请重新登录')
    }
    if (!isRefreshing) {
      isRefreshing = true
      try {
        token = await refreshAccessToken()
        requests.forEach((cb) => cb(token))
        requests = []
      } catch (err) {
        requests.forEach((cb) => {
          try {
            cb('')
          } catch {
            // ignore
          }
        })
        requests = []
        redirectLogin()
        throw err instanceof Error ? err : new Error('登录已失效')
      } finally {
        isRefreshing = false
      }
    } else {
      token = await new Promise<string>((resolve) => {
        requests.push((t) => resolve(t))
      })
      if (!token) throw new Error('登录已失效，请重新登录')
    }
  }

  if (token) headers.authorization = `Bearer ${token}`

  let body: unknown = undefined
  if (rest.body != null) {
    body =
      typeof rest.body === 'string'
        ? JSON.parse(rest.body as string)
        : rest.body
  }

  const data = await new Promise<{
    statusCode: number
    data: { code?: number; message?: string; data?: T } | string
  }>((resolve, reject) => {
    uni.request({
      url: apiUrl(path),
      method: method as UniApp.RequestOptions['method'],
      header: headers,
      data: method === 'GET' ? undefined : body,
      success: (res) => resolve(res as never),
      fail: (err) => reject(err),
    })
  })

  const raw = data.data
  const json =
    typeof raw === 'string'
      ? (() => {
          try {
            return JSON.parse(raw) as {
              code?: number
              message?: string
              data?: T
            }
          } catch {
            return null
          }
        })()
      : (raw as { code?: number; message?: string; data?: T } | null)

  if (json?.code === 1000) return json.data as T

  const message =
    json?.message ||
    (typeof raw === 'string' ? raw : '') ||
    `请求失败 (${data.statusCode})`
  const needAuth =
    !skipRefresh &&
    !isRefreshApi &&
    (data.statusCode === 401 ||
      /token|登录|未授权|鉴权|Unauthorized|unauthorized|登录失效/i.test(
        message,
      ))

  if (needAuth) {
    // 尝试一次 refresh 再重试
    if (!storage.isExpired('refreshToken') && getRefreshToken()) {
      try {
        const next = await refreshAccessToken()
        headers.authorization = `Bearer ${next}`
        const retry = await new Promise<{
          statusCode: number
          data: { code?: number; message?: string; data?: T } | string
        }>((resolve, reject) => {
          uni.request({
            url: apiUrl(path),
            method: method as UniApp.RequestOptions['method'],
            header: headers,
            data: method === 'GET' ? undefined : body,
            success: (res) => resolve(res as never),
            fail: (err) => reject(err),
          })
        })
        const retryRaw = retry.data
        const retryJson =
          typeof retryRaw === 'string'
            ? null
            : (retryRaw as { code?: number; data?: T } | null)
        if (retryJson?.code === 1000) return retryJson.data as T
      } catch {
        // fall through
      }
    }
    redirectLogin()
    throw new Error('登录已失效，请重新登录')
  }

  if (showToast) {
    uni.showToast({ title: message.slice(0, 40), icon: 'none' })
  }
  throw new Error(message)
}

configureClient({ request })

export const service = getService('app')

export async function bootEps(force = false) {
  return createEps({ force, side: 'app', requireRoot: false })
}
