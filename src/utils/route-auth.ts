import { ensureFreshToken } from '@/api/client'

const NAV_METHODS = [
  'navigateTo',
  'redirectTo',
  'reLaunch',
  'switchTab',
] as const

/**
 * 路由导航前自动确保 access token 有效（过期则用 refreshToken 换新）
 * 会话刷新对业务透明
 */
export function setupRouteAuthGuard() {
  for (const method of NAV_METHODS) {
    uni.addInterceptor(method, {
      async invoke(args: UniApp.NavigateToOptions) {
        try {
          await ensureFreshToken()
        } catch {
          // ensureFreshToken 内部已处理跳转登录
        }
        return args
      },
    })
  }
}
