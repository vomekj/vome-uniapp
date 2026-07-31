import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'node:path'
import { proxy } from './src/config/proxy'
import { exposeSrcLocales } from './lib/expose-src-locales'

const root = __dirname
const coreClient = path.resolve(root, 'node_modules/vome-core/dist/client')
const corePkg = path.resolve(root, 'node_modules/vome-core')

export default defineConfig(async () => {
  const [
    { default: AutoImport },
    { default: UniPages },
    { createEpsVitePlugin },
  ] = await Promise.all([
    import('unplugin-auto-import/vite'),
    import('@uni-helper/vite-plugin-uni-pages'),
    import('vome-core/client/vite-plugin-eps'),
  ])

  return {
    plugins: [
      exposeSrcLocales(),
      // 须在 uni() 之前：扫 pages → 写 pages.json（对齐 web glob 约定式路由）
      UniPages({
        dts: 'src/uni-pages.d.ts',
        homePage: 'pages/tabbar/index',
        // 与 web 同构：分包页落在 src/pages-sub，路由 /pages-sub/.../index
        subPackages: ['src/pages-sub'],
      }),
      AutoImport({
        imports: ['vue', 'uni-app', 'pinia'],
        dts: 'src/auto-imports.d.ts',
        dirs: ['src/stores/**', 'src/utils/**', 'src/types/**'],
        vueTemplate: true,
      }),
      uni(),
      createEpsVitePlugin({
        side: 'app',
        dtsSide: 'app',
        apiBase: proxy['/dev/'].target,
      }),
    ],
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(root, 'src') },
        // /@ → vome-core/client；/# → vome-core
        { find: /^\/@\/(.*)$/, replacement: `${coreClient}/$1` },
        { find: '/@', replacement: coreClient },
        { find: /^\/#\/typings\/(.*)$/, replacement: `${corePkg}/typings/admin/$1` },
        { find: /^\/#\/(.*)$/, replacement: `${corePkg}/dist/$1` },
        { find: '/#', replacement: path.join(corePkg, 'dist/index.js') },
      ],
    },
    server: {
      host: '127.0.0.1',
      port: 6600,
      strictPort: true,
      proxy: { ...proxy },
    },
    css: {
      preprocessorOptions: {
        scss: {
          // uni / vite 仍走旧 JS API 时，压掉刷屏的 Dart Sass 弃用警告
          silenceDeprecations: ['legacy-js-api'],
        },
      },
    },
  }
})
