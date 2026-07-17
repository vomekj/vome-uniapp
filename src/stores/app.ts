import { defineStore } from 'pinia'

export type TabName = 'home' | 'discover' | 'message' | 'mine' | 'tabbar'

const MOBILE_MAX = 767

let navTimer: ReturnType<typeof setTimeout> | null = null

function resolveLayoutWidth(fallback: number) {
  // #ifdef H5
  if (typeof document !== 'undefined') {
    return document.documentElement.clientWidth || fallback
  }
  // #endif
  return fallback
}

export const TAB_LIST: Array<{
  name: Exclude<TabName, 'tabbar'>
  text: string
  icon: string
  url: string
}> = [
  {
    name: 'home',
    text: '首页',
    icon: 'ri-home-5-line',
    url: '/pages/tabBar/home/home',
  },
  {
    name: 'discover',
    text: '发现',
    icon: 'ri-compass-3-line',
    url: '/pages/tabBar/discover/discover',
  },
  {
    name: 'message',
    text: '消息',
    icon: 'ri-notification-3-line',
    url: '/pages/tabBar/message/message',
  },
  {
    name: 'mine',
    text: '我的',
    icon: 'ri-user-3-line',
    url: '/pages/tabBar/mine/mine',
  },
]

/** 应用壳：断点 / Tab 激活（对齐 vome-ai useAppStore） */
export const useAppStore = defineStore('app', {
  state: () => ({
    active: 'home' as TabName,
    windowWidth: 0,
    safeAreaInsets: {} as UniApp.SafeAreaInsets,
  }),
  getters: {
    isMobile(state): boolean {
      return state.windowWidth > 0
        ? state.windowWidth <= MOBILE_MAX
        : true
    },
  },
  actions: {
    setActive(name: TabName) {
      this.active = name
      try {
        uni.setStorageSync('active', name)
      } catch {
        // ignore
      }
    },
    goHome() {
      this.setActive('home')
      if (this.isMobile) {
        uni.switchTab({ url: '/pages/tabBar/tabbar' })
      } else {
        uni.switchTab({ url: '/pages/tabBar/home/home' })
      }
    },
    initSystemInfo() {
      try {
        const { windowWidth, safeAreaInsets, uniPlatform } =
          uni.getSystemInfoSync()
        const width =
          uniPlatform === 'h5'
            ? resolveLayoutWidth(windowWidth)
            : windowWidth
        this.windowWidth = width
        this.safeAreaInsets = (safeAreaInsets ||
          {}) as UniApp.SafeAreaInsets
        uni.onWindowResize((res) => {
          const nextWidth =
            uniPlatform === 'h5'
              ? resolveLayoutWidth(res.size.windowWidth)
              : res.size.windowWidth
          this.windowWidth = nextWidth
        })
      } catch {
        this.windowWidth = 375
      }
    },
    debouncedSwitchTab(url: string) {
      if (navTimer) clearTimeout(navTimer)
      navTimer = setTimeout(() => {
        uni.switchTab({ url })
      }, 300)
    },
  },
})

/**
 * 兼容旧 `appStore.xxx` 写法（Pinia 安装后可用）
 * 组件 setup 内优先 `const app = useAppStore()`
 */
export const appStore = new Proxy({} as ReturnType<typeof useAppStore>, {
  get(_t, prop, receiver) {
    const store = useAppStore()
    const value = Reflect.get(store, prop, store)
    return typeof value === 'function' ? value.bind(store) : value
  },
  set(_t, prop, value) {
    const store = useAppStore() as unknown as Record<string | symbol, unknown>
    store[prop] = value
    return true
  },
})
