/** Tab 页路由（与 pages.json tabBar.list 一致） */
const TAB_ROUTES = new Set([
  'pages/tabBar/tabbar',
  'pages/tabBar/home/home',
  'pages/tabBar/discover/discover',
  'pages/tabBar/message/message',
  'pages/tabBar/mine/mine',
])

function getCurrentRoute() {
  const pages = getCurrentPages()
  return pages[pages.length - 1]?.route ?? ''
}

/** 保留 pages.json tabBar 配置，运行时隐藏原生底栏（自定义 tt-tabbar 替代） */
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
