import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'node:path'
import { proxy } from './src/config/proxy'

const coreClient = path.resolve(__dirname, 'node_modules/vome-core/dist/client')
const corePkg = path.resolve(__dirname, 'node_modules/vome-core')

export default defineConfig(async () => {
  const [{ default: AutoImport }, { createEpsVitePlugin }] = await Promise.all([
    import('unplugin-auto-import/vite'),
    import('vome-core/client/vite-plugin-eps'),
  ])

  return {
    plugins: [
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
        { find: '@', replacement: path.resolve(__dirname, 'src') },
        // /@ → vome-core/client；/# → vome-core
        { find: /^\/@\/(.*)$/, replacement: `${coreClient}/$1` },
        { find: '/@', replacement: coreClient },
        { find: /^\/#\/typings\/(.*)$/, replacement: `${corePkg}/typings/admin/$1` },
        { find: /^\/#\/(.*)$/, replacement: `${corePkg}/dist/$1` },
        { find: '/#', replacement: path.join(corePkg, 'dist/index.js') },
      ],
    },
    server: {
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
