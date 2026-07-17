<script setup lang="ts">
import { ensureFreshToken, getAccessToken } from '@/api/client'
import { config } from '@/config'
import logoDark from '@/static/image/logo-dark.png'
import { lockDocumentTitle, setSquareFavicon } from '@/utils/favicon'

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
@import '@/styles/tabbar.css';
@import 'remixicon/fonts/remixicon.css';
</style>
