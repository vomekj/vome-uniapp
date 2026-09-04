/**
 * 切语种后重拉本页数据（H5 WebView / 小程序通用）。
 * 依赖 core：subscribeLocaleChange + localeEpoch，不依赖 window。
 *
 * @example
 * const { reload } = useLocaleDataReload(async () => { await fetchList() })
 */
import { getCurrentInstance, onUnmounted, watch } from 'vue'
import { useOnLocaleChange } from 'vome-core/client'
import { useLocaleStore } from '@/stores/locale'

export function useLocaleDataReload(load: () => void | Promise<void>) {
  const locale = useLocaleStore()
  const reload = () => {
    void load()
  }

  useOnLocaleChange(() => reload())

  watch(
    () => locale.localeEpoch,
    (n, o) => {
      if (o != null && n !== o) reload()
    },
  )

  // App.vue subscribeLocaleChange → 当前页 $vm.onLocaleReload（小程序栈页）
  const proxy = getCurrentInstance()?.proxy as
    | { onLocaleReload?: () => void }
    | null
    | undefined
  if (proxy) proxy.onLocaleReload = reload
  onUnmounted(() => {
    if (proxy?.onLocaleReload === reload) delete proxy.onLocaleReload
  })

  return { reload, localeEpoch: () => locale.localeEpoch }
}
