/** H5 Tab 子页 ↔ tabbar 壳 宽度自适应（对齐 vome-ai） */
import { watch } from 'vue'
import { appStore, type TabName } from '@/stores/app'

export function useH5MobileTabShell(tabName: Exclude<TabName, 'tabbar'>) {
  appStore.setActive(tabName)

  // #ifdef H5
  if (appStore.isMobile) {
    appStore.debouncedSwitchTab('/pages/tabBar/tabbar')
  }
  watch(
    () => appStore.isMobile,
    (isMobile) => {
      if (isMobile) {
        appStore.debouncedSwitchTab('/pages/tabBar/tabbar')
      }
    },
  )
  // #endif
}
