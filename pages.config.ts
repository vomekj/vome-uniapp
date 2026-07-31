import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

/**
 * 静态 pages 元信息（easycom / tabBar / 窗体）。
 * 页面列表由 @uni-helper/vite-plugin-uni-pages 扫 src/pages/** 自动生成。
 */
export default defineUniPages({
  easycom: {
    autoscan: true,
    custom: {
      '^tt-(.*)': '@/uni_modules/tt-shaduni/components/tt-$1/tt-$1.vue',
      '^vm-(.*)': '@/components/vm-$1.vue',
    },
  },
  topWindow: {
    path: 'windows/header.vue',
    style: {
      height: '60px',
    },
    matchMedia: {
      minWidth: 768,
    },
  },
  // leftWindow 预留：windows/sides.vue
  tabBar: {
    list: [
      { pagePath: 'pages/tabbar/index' },
      { pagePath: 'pages/home/index' },
      { pagePath: 'pages/discover/index' },
      { pagePath: 'pages/message/index' },
      { pagePath: 'pages/mine/index' },
    ],
  },
  globalStyle: {
    navigationStyle: 'custom',
    navigationBarTitleText: '威迈科技',
  },
})
