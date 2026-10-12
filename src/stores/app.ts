import { defineStore } from 'pinia'

export type TabName = 'home' | 'discover' | 'message' | 'mine' | 'tabbar'

const MOBILE_MAX = 767

function resolveLayoutWidth(fallback: number) {
  // #ifdef H5
  if (typeof document !== 'undefined') {
    return document.documentElement.clientWidth || fallback
  }
  // #endif
  return fallback
}

/** 与 web 对齐：字段名 path，值为 `/pages/.../index` */
export const TAB_LIST: Array<{
  name: Exclude<TabName, 'tabbar'>
  text: string
  icon: string
  path: string
}> = [
  {
    name: 'home',
    text: '首页',
    icon: 'ri-home-5-line',
    path: '/pages/home/index',
  },
  {
    name: 'discover',
    text: '发现',
    icon: 'ri-compass-3-line',
    path: '/pages/discover/index',
  },
  {
    name: 'message',
    text: '消息',
    icon: 'ri-notification-3-line',
    path: '/pages/message/index',
  },
  {
    name: 'mine',
    text: '我的',
    icon: 'ri-user-3-line',
    path: '/pages/mine/index',
  },
]

export const TAB_SHELL_URL = '/pages/tabbar/index'

/** 应用壳：断点 / Tab 激活（对齐 vome-ai useAppStore） */
export const useAppStore = defineStore('app', {
  state: () => ({
    active: 'home' as TabName,
    windowWidth: 0,
    safeAreaInsets: {} as UniApp.SafeAreaInsets,
    /** H5；App/小程序为 false */
    isWeb: false,
  }),
  getters: {
    isMobile(state): boolean {
      return state.windowWidth > 0
        ? state.windowWidth <= MOBILE_MAX
        : true
    },
    /** 宽屏顶栏：仅 H5 且非窄屏（App/小程序始终底栏；H5 顶栏由 topWindow 承担） */
    useTopNav(): boolean {
      return this.isWeb && !this.isMobile
    },
    /** 底栏 chrome：与 useTopNav 互斥 */
    useTabbarChrome(): boolean {
      return !this.useTopNav
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
    /** Tab 一律进壳，禁止切到真实子路由（避免 H5 DOM 叠加） */
    goTabShell(name?: Exclude<TabName, 'tabbar'>) {
      if (name) this.setActive(name)
      uni.switchTab({ url: TAB_SHELL_URL })
    },
    goHome() {
      this.goTabShell('home')
    },
    initSystemInfo() {
      try {
        const { windowWidth, safeAreaInsets, uniPlatform } =
          uni.getSystemInfoSync()
        this.isWeb = uniPlatform === 'h5'
        const width = this.isWeb
          ? resolveLayoutWidth(windowWidth)
          : windowWidth
        this.windowWidth = width
        this.safeAreaInsets = (safeAreaInsets ||
          {}) as UniApp.SafeAreaInsets
        uni.onWindowResize((res) => {
          const nextWidth = this.isWeb
            ? resolveLayoutWidth(res.size.windowWidth)
            : res.size.windowWidth
          this.windowWidth = nextWidth
        })
      } catch {
        this.windowWidth = 375
        this.isWeb = false
      }
    },
  },
})

/**
 * 全局代理（auto-import）；等价 useAppStore()
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
