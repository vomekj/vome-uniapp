import { createAuthClient } from 'better-auth/vue'
import { genericOAuthClient, jwtClient } from 'better-auth/client/plugins'
import { config } from '@/config'

/**
 * Better Auth 要求绝对 baseURL。
 * H5：origin + baseUrl（/dev|/api）；非 H5 回退 host。
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

/** 与 `GET /app/user/login/socialProviders` 一致；展示字段以后端为准，勿本地对照表 */
export type SocialProviderPublic = {
  key: string
  label: string
  icon: string
  color: string
}
