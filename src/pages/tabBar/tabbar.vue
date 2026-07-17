<template>
  <view v-if="show" class="tab-shell">
    <view class="tab-shell__body">
      <Home v-if="active === 'home'" />
      <Discover v-if="active === 'discover'" />
      <Message v-if="active === 'message'" />
      <Mine v-if="active === 'mine'" />
    </view>
    <vm-app-tabbar v-model="tabName" @change="onTabChange" />
  </view>
</template>

<script setup lang="ts">
import Home from '@/pages/tabBar/home/home.vue'
import Discover from '@/pages/tabBar/discover/discover.vue'
import Message from '@/pages/tabBar/message/message.vue'
import Mine from '@/pages/tabBar/mine/mine.vue'
import VmAppTabbar from '@/components/vm-app-tabbar.vue'

/**
 * 移动端 Tab 壳：内嵌四页 + 自定义 tt-tabbar。
 * 宽屏自动 switchTab 到真实子路由（顶栏切换）。
 */
type ShellTab = Exclude<TabName, 'tabbar'>

function resolveTabName(name: string): ShellTab {
  const hit = TAB_LIST.find((item) => item.name === name)
  return hit ? hit.name : 'home'
}

function resolveTabUrl(name: ShellTab) {
  return TAB_LIST.find((item) => item.name === name)?.url ?? TAB_LIST[0].url
}

const tabName = ref<ShellTab>(
  resolveTabName(uni.getStorageSync('active') || 'home'),
)

const active = computed(() => tabName.value)
const show = computed(() => appStore.isMobile)

function syncTabFromStorage() {
  const saved = resolveTabName(uni.getStorageSync('active') || 'home')
  tabName.value = saved
  if (appStore.active !== saved) {
    appStore.setActive(saved)
  }
}

function onTabChange(name: ShellTab) {
  appStore.setActive(name)
}

onShow(() => {
  hideNativeTabBarIfNeeded()
  syncTabFromStorage()
})

watch(
  () => appStore.active,
  (name) => {
    if (!name || name === 'tabbar') return
    const next = resolveTabName(name)
    if (tabName.value !== next) tabName.value = next
  },
)

watch(
  () => appStore.isMobile,
  (isMobile) => {
    if (!isMobile) {
      appStore.debouncedSwitchTab(resolveTabUrl(tabName.value))
    }
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
.tab-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
  background: var(--vm-page-bg, #f4f6fc);
}

.tab-shell__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
</style>
