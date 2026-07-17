/**
 * 本地缓存（支持过期秒数）
 * set(key, value, expireSeconds?) — expire 为「还能活多少秒」
 */

type StorageEntry = {
  value: unknown
  /** 过期时间戳 ms；缺省表示永不过期 */
  expire?: number
}

const PREFIX = 'vome_uni_'

function fullKey(key: string) {
  return `${PREFIX}${key}`
}

function readEntry(key: string): StorageEntry | null {
  try {
    const raw = uni.getStorageSync(fullKey(key))
    if (raw == null || raw === '') return null
    if (typeof raw === 'object' && raw !== null && 'value' in (raw as object)) {
      return raw as StorageEntry
    }
    // 兼容裸值
    return { value: raw }
  } catch {
    return null
  }
}

export const storage = {
  set(key: string, value: unknown, expireSeconds?: number) {
    const entry: StorageEntry = { value }
    if (expireSeconds != null && expireSeconds > 0) {
      entry.expire = Date.now() + expireSeconds * 1000
    }
    uni.setStorageSync(fullKey(key), entry)
  },

  get<T = unknown>(key: string): T | null {
    const entry = readEntry(key)
    if (!entry) return null
    return entry.value as T
  },

  remove(key: string) {
    try {
      uni.removeStorageSync(fullKey(key))
    } catch {
      // ignore
    }
  },

  /** true = 不存在或已过期 */
  isExpired(key: string): boolean {
    const entry = readEntry(key)
    if (!entry) return true
    if (entry.expire == null) return false
    return Date.now() >= entry.expire
  },

  /** 是否仍有有效缓存（未过期） */
  has(key: string): boolean {
    return !storage.isExpired(key) && storage.get(key) != null
  },

  info(): Record<string, unknown> {
    return {
      token: storage.get('token') || '',
      refreshToken: storage.get('refreshToken') || '',
      userInfo: storage.get('userInfo') || undefined,
    }
  },
}

/** 迁移旧 token key（一次性） */
export function migrateLegacyTokens() {
  try {
    const oldAccess = uni.getStorageSync('vome_app_access')
    const oldRefresh = uni.getStorageSync('vome_app_refresh')
    if (oldAccess && !storage.get('token')) {
      storage.set('token', String(oldAccess))
    }
    if (oldRefresh && !storage.get('refreshToken')) {
      // 无过期信息时给 7 天兜底，后续 setToken 会纠正
      storage.set('refreshToken', String(oldRefresh), 7 * 24 * 60 * 60)
    }
    if (oldAccess) uni.removeStorageSync('vome_app_access')
    if (oldRefresh) uni.removeStorageSync('vome_app_refresh')
  } catch {
    // ignore
  }
}
