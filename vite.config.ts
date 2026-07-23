import { copyFileSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'node:path'
import { proxy } from './src/config/proxy'

const root = __dirname
const coreClient = path.resolve(root, 'node_modules/vome-core/dist/client')
const corePkg = path.resolve(root, 'node_modules/vome-core')
const localesDir = path.resolve(root, 'src/locales')

/** 单一源包 src/locales → 对外仍提供 /static/locales/*.json（供 service HTTP 同步） */
function exposeSrcLocales(): Plugin {
  let outDir = path.resolve(root, 'dist')
  return {
    name: 'expose-src-locales',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? ''
        if (!url.startsWith('/static/locales/')) return next()
        const name = path.basename(url)
        if (!name.endsWith('.json')) return next()
        const file = path.resolve(localesDir, name)
        if (!file.startsWith(localesDir + path.sep)) return next()
        try {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(readFileSync(file))
        } catch {
          next()
        }
      })
    },
    closeBundle() {
      const dest = path.join(outDir, 'static', 'locales')
      mkdirSync(dest, { recursive: true })
      for (const name of readdirSync(localesDir)) {
        if (!name.endsWith('.json')) continue
        copyFileSync(path.join(localesDir, name), path.join(dest, name))
      }
    },
  }
}

export default defineConfig(async () => {
  const [{ default: AutoImport }, { createEpsVitePlugin }] = await Promise.all([
    import('unplugin-auto-import/vite'),
    import('vome-core/client/vite-plugin-eps'),
  ])

  return {
    plugins: [
      exposeSrcLocales(),
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
