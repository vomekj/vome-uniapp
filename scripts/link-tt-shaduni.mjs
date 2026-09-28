import { existsSync, mkdirSync, rmSync, symlinkSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { platform } from 'node:os'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const target = join(
  root,
  'node_modules/tt-shaduni/dist/uni_modules/tt-shaduni',
)
const linkDir = join(root, 'src/uni_modules')
const link = join(linkDir, 'tt-shaduni')

if (!existsSync(target)) {
  console.warn('[link-tt-shaduni] package not installed, skip')
  process.exit(0)
}

mkdirSync(linkDir, { recursive: true })
if (existsSync(link)) rmSync(link, { recursive: true, force: true })

// Windows 无 Developer Mode 时 symlink 常 EPERM；目录用 junction（无需提权）
if (platform() === 'win32') {
  symlinkSync(target, link, 'junction')
} else {
  symlinkSync(relative(linkDir, target), link)
}
console.log('[link-tt-shaduni] linked', link, '→', target)
