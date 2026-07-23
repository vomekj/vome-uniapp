import { service } from '@/api/client'
import { storage } from '@/utils/storage'
import { createLocaleStore } from 'vome-core/client'
import zhCN from '@/locales/zh-CN.json'

export type { I18nLangItem } from 'vome-core/client'

/** uniapp 宿主语言包 store（逻辑在 vome-core） */
export const useLocaleStore = createLocaleStore({
  storageKey: 'locale',
  scopeKey: 'uniapp',
  langMode: 'app',
  cachePacks: true,
  defaultPack: zhCN as Record<string, unknown>,
  persist: {
    get: (k) => storage.get<string>(k),
    set: (k, v) => storage.set(k, v),
  },
  getPackApi: () =>
    (service as { i18n?: { pack?: any } }).i18n?.pack as
      | undefined,
})
