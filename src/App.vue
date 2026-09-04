<script setup lang="ts">
import { ensureFreshToken, getAccessToken } from '@/api/client'
import { config } from '@/config'
import logoDark from '@/static/image/logo-dark.png'
import { lockDocumentTitle, setSquareFavicon } from '@/utils/favicon'
import {
  subscribeLocaleChange,
} from 'vome-core/client'
import { useLocaleStore } from '@/stores/locale'

onLaunch(() => {
  // #ifdef H5
  setSquareFavicon(logoDark)
  lockDocumentTitle(config.app.name)
  // #endif
  bootTheme()
  appStore.initSystemInfo()
  hideNativeTabBarIfNeeded()
  void (async () => {
    await ensureFreshToken()
    if (getAccessToken()) await userStore.get()
  })()

  // 切语种：core 已 notify（订阅 + CustomEvent + uni.$emit）；调用当前页 onLocaleReload
  subscribeLocaleChange(() => {
    try {
      const pages = getCurrentPages()
      const cur = pages[pages.length - 1] as {
        $vm?: { onLocaleReload?: () => void }
      }
      cur?.$vm?.onLocaleReload?.()
    } catch {
      /* ignore */
    }
  })
  void useLocaleStore()
})
onShow(() => {
  hideNativeTabBarIfNeeded()
})
onHide(() => {
  console.log('App Hide')
})
</script>

<style>
@import '@/styles/theme.css';
@import '@/styles/project-theme.css';
@import '@/styles/tabbar.css';
@import 'remixicon/fonts/remixicon.css';
</style>
