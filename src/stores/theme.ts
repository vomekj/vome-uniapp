import { defineStore } from 'pinia'
import { computed } from 'vue'
import { watch } from 'vue'
import { useTheme } from '@/uni_modules/tt-shaduni/composables/use-theme'

export type ThemeMode = 'light' | 'dark' | 'system'

const {
  themeMode,
  resolvedTheme,
  isDark,
  setTheme: setTtTheme,
  initTheme,
} = useTheme()

let watching = false

/** 弧形扫瞄过渡中，避免连点叠两次 View Transition（仅 H5） */
let themeTransitioning = false

type ViewTransitionDoc = Document & {
  startViewTransition?: (update: () => void) => {
    finished: Promise<void>
  }
}

const PAGE_BG = { light: '#f4f6fc', dark: '#141625' } as const

function syncDomAttr(el: Element | null | undefined, dark: boolean) {
  if (!el) return
  const theme = dark ? 'dark' : 'light'
  el.setAttribute('data-theme', theme)
  el.classList.toggle('theme-dark', dark)
  el.classList.toggle('theme-light', !dark)
}

/** 同步 DOM / 小程序 page 主题标记 + 导航栏 / tabBar / 页底 */
export function applyThemeDom(dark: boolean) {
  const pageBg = dark ? PAGE_BG.dark : PAGE_BG.light

  // #ifdef H5
  if (typeof document !== 'undefined') {
    syncDomAttr(document.documentElement, dark)
    syncDomAttr(document.body, dark)
    document
      .querySelectorAll('uni-page-body, .uni-page-body, uni-page-head')
      .forEach((el) => syncDomAttr(el, dark))
  }
  // #endif

  // #ifdef MP
  try {
    const pages = getCurrentPages()
    const cur = pages[pages.length - 1] as any
    const el = cur?.$vm?.$?.vnode?.el as Element | undefined
    if (el && typeof el.setAttribute === 'function') {
      syncDomAttr(el, dark)
    }
  } catch {
    // ignore
  }
  // #endif

  try {
    uni.setNavigationBarColor({
      frontColor: dark ? '#ffffff' : '#000000',
      backgroundColor: dark ? PAGE_BG.dark : '#ffffff',
    })
  } catch {
    // ignore
  }

  try {
    uni.setTabBarStyle({
      color: dark ? '#a1a1aa' : '#999999',
      selectedColor: '#4E5DFF',
      backgroundColor: dark ? PAGE_BG.dark : '#ffffff',
      borderStyle: dark ? 'white' : 'black',
    })
  } catch {
    // ignore
  }

  try {
    uni.setBackgroundColor?.({
      backgroundColor: pageBg,
      backgroundColorTop: pageBg,
      backgroundColorBottom: pageBg,
    })
  } catch {
    // ignore
  }
}

function prefersReducedMotion() {
  // #ifdef H5
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // #endif
  // #ifndef H5
  return true
  // #endif
}

function runThemeUpdate(apply: () => void, animate: boolean) {
  // #ifdef H5
  const doc =
    typeof document !== 'undefined'
      ? (document as ViewTransitionDoc)
      : null
  if (
    animate &&
    doc?.startViewTransition &&
    !prefersReducedMotion() &&
    !themeTransitioning
  ) {
    themeTransitioning = true
    const transition = doc.startViewTransition(apply)
    void transition.finished.finally(() => {
      themeTransitioning = false
    })
    return
  }
  // #endif
  apply()
}

/**
 * 包装 tt-shaduni setTheme：H5 亮暗切换走圆弧 View Transition；小程序即时切换。
 * 不改主题变量定义。
 */
export function setTheme(
  mode: ThemeMode | boolean,
  options?: { animate?: boolean },
) {
  const next: ThemeMode =
    typeof mode === 'boolean' ? (mode ? 'dark' : 'light') : mode
  const nextDark =
    next === 'dark' ? true : next === 'light' ? false : isDark.value
  const visualChange =
    next === 'system' ? false : nextDark !== isDark.value
  const animate = options?.animate !== false && visualChange

  runThemeUpdate(() => {
    setTtTheme(next)
    applyThemeDom(isDark.value)
  }, animate)
}

function toggleTheme() {
  setTheme(isDark.value ? 'light' : 'dark')
}

/** App 启动：读 storage + 首次应用 + 持续 watch */
export function bootTheme() {
  initTheme()
  applyThemeDom(isDark.value)
  if (!watching) {
    watching = true
    watch(isDark, (dark) => applyThemeDom(dark))
  }
}

/**
 * Pinia 包装（对齐 vome-ai useThemeStore；底层仍是 tt-shaduni 单例）
 */
export const useThemeStore = defineStore('theme', () => {
  const themeClass = computed<'dark' | 'light'>(() =>
    isDark.value ? 'dark' : 'light',
  )

  return {
    themeMode,
    resolvedTheme,
    isDark,
    themeClass,
    setTheme,
    toggleTheme,
    initTheme,
    boot: bootTheme,
    applyThemeDom,
  }
})

export {
  themeMode,
  resolvedTheme,
  isDark,
  toggleTheme,
  initTheme,
}
