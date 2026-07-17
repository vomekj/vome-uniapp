import { createAuthClient } from 'better-auth/vue'
import { genericOAuthClient, jwtClient } from 'better-auth/client/plugins'
import { config } from '@/config'

/**
 * Better Auth 要求绝对 baseURL。
 * H5：origin + baseUrl（/dev|/prod）；非 H5 回退 host。
 */
function resolveAuthBaseURL() {
  const prefix = config.baseUrl.replace(/\/$/, '') || ''
  if (/^https?:\/\//.test(prefix)) return prefix
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${prefix}`
  }
  return config.host.replace(/\/$/, '')
}

const authBaseURL = resolveAuthBaseURL()

/** H5 下 Better Auth；小程序勿依赖 Cookie 跳转 */
export const authClient = createAuthClient({
  baseURL: authBaseURL,
  plugins: [jwtClient(), genericOAuthClient()],
})

export async function syncBetterAuthJwt(): Promise<string | null> {
  if (typeof window === 'undefined' || typeof fetch !== 'function') return null
  try {
    const session = await authClient.getSession()
    if (!session.data) return null
    const res = await fetch(`${authBaseURL}/api/auth/token`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!res.ok) return null
    const json = (await res.json()) as { token?: string }
    return json.token || null
  } catch {
    return null
  }
}

export const SOCIAL_LABELS: Record<string, string> = {
  github: 'GitHub',
  google: 'Google',
  wechat: '微信',
  gitee: 'Gitee',
  steam: 'Steam',
}

export const SOCIAL_ICONS: Record<string, string> = {
  github: 'ri-github-fill',
  google: 'ri-google-fill',
  wechat: 'ri-wechat-fill',
  gitee: 'ri-git-repository-fill',
  steam: 'ri-steam-fill',
}

export const SOCIAL_COLORS: Record<string, string> = {
  github: '#24292f',
  google: '#ea4335',
  wechat: '#07c160',
  gitee: '#c71d23',
  steam: '#171a21',
}
