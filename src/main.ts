import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { bootEps } from './api/client'
import { setupRouteAuthGuard } from './utils/route-auth'
import { ensureFreshToken } from './api/client'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)

  // 路由切换时自动 refreshToken
  setupRouteAuthGuard()

  void bootEps()
    .then(async () => {
      await ensureFreshToken()
      const { connectWs } = await import('@/utils/socket')
      connectWs()
    })
    .catch((e) => {
      console.warn('[boot] createEps failed', e)
    })

  return { app }
}
