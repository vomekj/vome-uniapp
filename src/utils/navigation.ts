import { TAB_LIST } from '@/stores/app'

/** Tab 页 route（无前导 /，与 getCurrentPages().route 一致） */
const TAB_ROUTES = new Set([
  'pages/tabbar/index',
  ...TAB_LIST.map((t) => t.path.replace(/^\//, '')),
])

/** Tab 完整 url（含移动壳） */
const TAB_URLS = new Set([
  '/pages/tabbar/index',
  ...TAB_LIST.map((t) => t.path),
])

function getCurrentRoute() {
  const pages = getCurrentPages()
  return pages[pages.length - 1]?.route ?? ''
}

export function isTabPath(url: string): boolean {
  const path = String(url || '').split('?')[0]
  if (!path) return false
  if (TAB_URLS.has(path)) return true
  return TAB_ROUTES.has(path.replace(/^\//, ''))
}

/**
 * 统一跳转（与 web `openPage` 同签名）。
 * Tab → switchTab；其它 → navigateTo / redirectTo。
 */
export function openPage(
  url: string,
  opts?: { replace?: boolean },
): void {
  const raw = String(url || '').trim()
  if (!raw) return
  const pathOnly = raw.split('?')[0]
  if (isTabPath(pathOnly)) {
    uni.switchTab({ url: pathOnly })
    return
  }
  if (opts?.replace) {
    uni.redirectTo({ url: raw })
    return
  }
  uni.navigateTo({ url: raw })
}

export function openBack(): void {
  uni.navigateBack({
    fail: () => {
      openPage('/pages/home/index', { replace: true })
    },
  })
}

/** 保留 tabBar 配置，运行时隐藏原生底栏（自定义 tt-tabbar 替代） */
export function hideNativeTabBarIfNeeded() {
  const route = getCurrentRoute()
  if (!TAB_ROUTES.has(route)) return
  try {
    uni.hideTabBar({
      animation: false,
      fail: () => {},
    })
  } catch {
    // ignore
  }
}
