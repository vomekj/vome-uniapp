import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

/**
 * 静态 pages 元信息（easycom / tabBar / 窗体）。
 * 页面列表由 @uni-helper/vite-plugin-uni-pages 扫 src/pages/** 自动生成。
 * 宽屏壳直挂 components/vm-header|vm-aside（与 web 同路径，无 windows 薄包装）。
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
    path: 'components/vm-header.vue',
    style: {
      height: '60px',
    },
    matchMedia: {
      minWidth: 768,
    },
  },
  // 侧栏占位：与 web `vm-aside` 对齐，默认关闭
  // leftWindow: {
  //   path: 'components/vm-aside.vue',
  //   style: {
  //     width: '240px',
  //   },
  //   matchMedia: {
  //     minWidth: 768,
  //   },
  // },
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
