/**
 * uni_modules 链到 dist 的 .js，且 tsconfig exclude 了 uni_modules，
 * 为 use-theme 提供声明（与 packages/composables/use-theme.ts 一致）。
 */
declare module '@/uni_modules/tt-shaduni/composables/use-theme' {
  import type { Ref, ComputedRef } from 'vue'

  export type ThemeMode = 'light' | 'dark' | 'system'

  export function useTheme(): {
    themeMode: Ref<ThemeMode>
    resolvedTheme: ComputedRef<'light' | 'dark'>
    isDark: ComputedRef<boolean>
    setTheme: (mode: ThemeMode) => void
    toggleTheme: () => void
    initTheme: () => void
  }
}
