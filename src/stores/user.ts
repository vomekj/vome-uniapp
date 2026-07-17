import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage, migrateLegacyTokens } from '@/utils/storage'
import { request, service } from '@/api/client'
import type { AppUser, UserTokenPayload } from '@/typings/user'

export type { AppUser, UserTokenPayload }

migrateLegacyTokens()

const cached = storage.info()

/**
 * 用户会话
 */
export const useUserStore = defineStore('user', () => {
  const token = ref(String(cached.token || ''))
  const info = ref<AppUser | undefined>(
    (cached.userInfo as AppUser | undefined) || undefined,
  )
  const loaded = ref(false)

  const displayName = computed(
    () =>
      info.value?.name ||
      info.value?.phone ||
      info.value?.email ||
      '用户',
  )

  /** 兼容旧字段名 profile */
  const profile = computed(() => info.value ?? null)

  function setToken(data: UserTokenPayload) {
    token.value = data.token
    storage.set('token', data.token, Math.max(1, data.expire - 5))
    storage.set(
      'refreshToken',
      data.refreshToken,
      Math.max(1, data.refreshExpire - 5),
    )
  }

  async function refreshToken(): Promise<string> {
    const rt = storage.get<string>('refreshToken')
    if (!rt) throw new Error('无 refreshToken')

    const res =
      (await service.user?.login?.refreshToken?.({ refreshToken: rt })) ??
      (await request<UserTokenPayload>('/app/user/login/refreshToken', {
        method: 'POST',
        body: { refreshToken: rt },
        skipRefresh: true,
        toast: false,
      }))

    setToken(res)
    return res.token
  }

  function set(value: AppUser) {
    info.value = value
    storage.set('userInfo', value)
  }

  async function update(data: AppUser & Record<string, unknown>) {
    const merged = { ...(info.value || {}), ...data }
    set(merged)
    return (
      (await service.user?.info?.updatePerson?.(data)) ??
      (await request('/app/user/info/updatePerson', {
        method: 'POST',
        body: data,
      }))
    )
  }

  function clear() {
    storage.remove('userInfo')
    storage.remove('token')
    storage.remove('refreshToken')
    token.value = ''
    info.value = undefined
    loaded.value = false
    void import('@/utils/socket').then(({ disconnectWs }) => disconnectWs())
  }

  function logout() {
    void (async () => {
      try {
        await service.user?.info?.logout?.({})
      } catch {
        // ignore
      } finally {
        clear()
        uni.reLaunch({ url: '/pages/login/login' })
      }
    })()
  }

  async function get() {
    if (!token.value && !storage.get('token')) {
      info.value = undefined
      loaded.value = true
      return null
    }
    try {
      const person =
        (await service.user?.info?.person?.()) ??
        (await request<AppUser>('/app/user/info/person', { toast: false }))
      if (person) set(person)
      return person
    } catch {
      clear()
      return null
    } finally {
      loaded.value = true
    }
  }

  /** @deprecated 用 get() */
  async function fetchPerson() {
    return get()
  }

  // 请求层 refresh 后同步 pinia token
  try {
    uni.$on('session:token', (data: UserTokenPayload) => {
      token.value = data.token
    })
    uni.$on('session:logout', () => {
      token.value = ''
      info.value = undefined
    })
  } catch {
    // ignore
  }

  return {
    token,
    info,
    profile,
    loaded,
    displayName,
    setToken,
    refreshToken,
    get,
    set,
    update,
    clear,
    logout,
    fetchPerson,
  }
})

/** 兼容旧 `userStore.xxx`（Pinia 安装后可用） */
export const userStore = new Proxy({} as ReturnType<typeof useUserStore>, {
  get(_t, prop) {
    const store = useUserStore()
    const value = Reflect.get(store, prop, store)
    return typeof value === 'function' ? value.bind(store) : value
  },
  set(_t, prop, value) {
    const store = useUserStore() as unknown as Record<string | symbol, unknown>
    store[prop] = value
    return true
  },
})
