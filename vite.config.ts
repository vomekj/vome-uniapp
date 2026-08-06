import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'node:path'
import { proxy } from './src/config/proxy'
import { exposeSrcLocales } from './lib/expose-src-locales'

const root = __dirname

export default defineConfig(async () => {
  const [
    { default: AutoImport },
    { default: UniPages },
    { createEpsVitePlugin },
    { coreAlias, ensureMicroAppProxy },
  ] = await Promise.all([
    import('unplugin-auto-import/vite'),
    import('@uni-helper/vite-plugin-uni-pages'),
    import('vome-core/client/vite-plugin-eps'),
    import('vome-core/client/vite-micro-proxy'),
  ])

  return {
    plugins: [
      exposeSrcLocales(),
      UniPages({
        dts: 'src/uni-pages.d.ts',
        homePage: 'pages/tabbar/index',
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
        ...coreAlias(root),
      ],
    },
    server: {
      host: '127.0.0.1',
      port: 6600,
      strictPort: true,
      proxy: ensureMicroAppProxy(proxy),
    },
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['legacy-js-api'],
        },
      },
    },
  }
})
