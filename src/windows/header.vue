<template>
  <view class="header" :class="{ 'is-dark': isDark }">
    <view
      class="logo"
      style="display: flex; flex-direction: row; flex-wrap: nowrap; align-items: center"
      @click="goHome"
    >
      <image
        class="logo__img"
        :src="logoSrc"
        mode="heightFix"
        style="height: 24px; width: auto; flex-shrink: 0"
      />
      <text class="logo__title">{{ config.app.name }}</text>
    </view>

    <view class="nav">
      <view
        v-for="(item, index) in tabList"
        :key="item.name"
        class="nav-item"
        :class="{ active: current === index }"
        @click="switchTab(index)"
      >
        <vm-ri-icon class="nav-item__icon" :name="item.icon" />
        <text class="nav-item__text">{{
          locale.t(`header.${item.name}`, item.text)
        }}</text>
      </view>
    </view>

    <view class="actions">
      <view
        class="actions__icon"
        :title="
          isDark
            ? locale.t('header.themeLight', '浅色')
            : locale.t('header.themeDark', '深色')
        "
        @click="onToggleTheme"
      >
        <vm-ri-icon :name="isDark ? 'ri-sun-line' : 'ri-moon-line'" />
      </view>

      <view class="actions__locale">
        <view
          id="vm-locale-btn"
          class="actions__icon actions__locale-btn"
          :class="{ 'is-disabled': localeSwitching }"
          @click.stop="toggleLocaleMenu"
        >
          <text class="actions__flag">{{
            locale.currentLang?.flag || '🏳️'
          }}</text>
        </view>
        <view
          v-if="localeOpen"
          class="actions__locale-mask"
          @click="closeLocaleMenu"
        />
        <view
          v-if="localeOpen"
          class="actions__locale-menu"
          :style="localeMenuStyle"
          @click.stop
        >
          <view
            v-for="lang in locale.langs"
            :key="lang.code"
            class="actions__locale-item"
            :class="{ 'is-active': locale.locale === lang.code }"
            @click="switchLocale(lang.code)"
          >
            <text class="actions__flag">{{ lang.flag || '🏳️' }}</text>
            <text class="actions__locale-label">{{ lang.name }}</text>
          </view>
        </view>
      </view>

      <view class="actions__user" @click="onUserClick">
        <view class="actions__avatar">
          <text>{{ avatarLetter }}</text>
        </view>
        <text class="actions__name">{{ displayName }}</text>
        <vm-ri-icon name="ri-arrow-down-s-line" class="actions__chevron" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import VmRiIcon from '@/components/vm-ri-icon.vue'
import { config } from '@/config'
import { useLocaleStore } from '@/stores/locale'
import { useUserStore } from '@/stores/user'

/**
 * topWindow 常驻；布局参考 admin 顶栏：左品牌 / 中导航 / 右主题+语言+头像。
 * 深色跟随 isDark（topWindow 与主区同源 store）。
 */
const locale = useLocaleStore()
const user = useUserStore()
const tabList = TAB_LIST
const localeOpen = ref(false)
const localeSwitching = ref(false)
const localeMenuStyle = ref<Record<string, string>>({})

const current = computed(() =>
  tabList.findIndex((item) => item.name === appStore.active),
)

/** 须读 pinia token，storage 非响应式 */
const authed = computed(() => Boolean(user.token))

const displayName = computed(() =>
  authed.value
    ? user.displayName
    : locale.t('header.login', '登录'),
)

const avatarLetter = computed(() =>
  String(displayName.value || 'V').slice(0, 1).toUpperCase(),
)

/** 深色顶栏用浅色 logo，浅色顶栏用深色 logo */
const logoSrc = computed(() =>
  isDark.value
    ? '/static/image/logo-light.png'
    : '/static/image/logo-dark.png',
)

function closeLocaleMenu() {
  localeOpen.value = false
}

function goHome() {
  appStore.goHome()
  closeLocaleMenu()
}

function switchTab(index: number) {
  const item = tabList[index]
  if (!item) return
  closeLocaleMenu()
  appStore.setActive(item.name as TabName)
  uni.switchTab({ url: item.url })
}

function onToggleTheme() {
  closeLocaleMenu()
  toggleTheme()
}

function placeLocaleMenu() {
  // topWindow 仅 60px，须 fixed 锚定按钮，避免被裁切
  uni
    .createSelectorQuery()
    .select('#vm-locale-btn')
    .boundingClientRect((rect) => {
      const r = rect as UniApp.NodeInfo | null
      if (!r || r.right == null || r.bottom == null) return
      const gap = 6
      localeMenuStyle.value = {
        top: `${Number(r.bottom) + gap}px`,
        right: `${Math.max(8, window.innerWidth - Number(r.right))}px`,
      }
    })
    .exec()
}

function toggleLocaleMenu() {
  if (localeSwitching.value) return
  if (localeOpen.value) {
    closeLocaleMenu()
    return
  }
  placeLocaleMenu()
  localeOpen.value = true
}

async function switchLocale(code: string) {
  if (localeSwitching.value) return
  localeSwitching.value = true
  closeLocaleMenu()
  try {
    await locale.setLocale(code)
  } finally {
    localeSwitching.value = false
  }
}

function onUserClick() {
  closeLocaleMenu()
  if (!authed.value) {
    uni.navigateTo({ url: '/pages/login/login' })
    return
  }
  appStore.setActive('mine')
  if (appStore.isMobile) {
    uni.switchTab({ url: '/pages/tabBar/tabbar' })
    return
  }
  uni.switchTab({ url: '/pages/tabBar/mine/mine' })
}

onMounted(() => {
  void user.get()
  if (!locale.langs.length) void locale.loadLangs()
})
</script>

<style lang="scss" scoped>
.header {
  position: relative;
  height: 60px;
  padding: 0 28px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  border-bottom: 1px solid var(--vm-header-border, #eef0f5);
  background: var(--vm-header-bg, #ffffff);
  box-shadow: 0 1px 0 rgba(78, 93, 255, 0.04);
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.logo {
  z-index: 1;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  flex-shrink: 0;
  height: 60px;
}

.logo__img {
  height: 24px;
  width: auto;
  flex-shrink: 0;
}

.logo__title {
  margin-left: 10px;
  font-size: 26px;
  font-weight: 1000;
  letter-spacing: 0.06em;
  line-height: 1;
  white-space: nowrap;
  color: var(--vm-brand-text, #3b4456);
}

.nav {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  transform: translateX(-50%);
}

.nav-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  cursor: pointer;
  box-sizing: border-box;
  transition:
    background 0.15s ease,
    color 0.15s ease;

  &__icon {
    font-size: 18px;
    line-height: 1;
    color: var(--vm-muted-text, #9aa0b0);
    transition: color 0.15s ease;
  }

  &__text {
    font-size: 15px;
    font-weight: 500;
    line-height: 1;
    color: var(--vm-muted-text, #9aa0b0);
    transition: color 0.15s ease;
  }

  &:active {
    background: var(--vm-soft-bg, #f4f6fc);
  }

  &.active {
    background: var(--vm-soft-active, rgba(78, 93, 255, 0.12));

    .nav-item__icon,
    .nav-item__text {
      color: #4e5dff;
    }

    .nav-item__text {
      font-weight: 650;
    }
  }
}

.actions {
  z-index: 1;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
}

.actions__locale {
  position: relative;
  z-index: 30;
}

.actions__locale-btn {
  &.is-disabled {
    opacity: 0.6;
  }
}

.actions__flag {
  font-size: 16px;
  line-height: 1;
}

.actions__locale-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: transparent;
}

.actions__locale-menu {
  position: fixed;
  z-index: 1001;
  width: max-content;
  min-width: 108px;
  max-width: 140px;
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--vm-header-border, #eef0f5);
  background: var(--vm-header-bg, #ffffff);
  box-shadow: 0 8px 20px rgba(20, 22, 37, 0.12);
  box-sizing: border-box;
}

.actions__locale-item {
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
  gap: 6px;
  padding: 7px 8px;
  border-radius: 8px;
  box-sizing: border-box;

  &:active {
    background: var(--vm-soft-bg, #f4f6fc);
  }

  &.is-active {
    background: var(--vm-soft-active, rgba(78, 93, 255, 0.12));
  }
}

.actions__locale-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  line-height: 1.2;
  color: var(--vm-brand-text, #3b4456);
  text-align: left;
}

.actions__locale-item.is-active .actions__locale-label {
  color: #4e5dff;
  font-weight: 600;
}

.actions__icon {
  display: flex;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--vm-soft-bg, #f4f6fc);
  color: var(--vm-brand-text, #3b4456);
  font-size: 18px;
  cursor: pointer;
  box-sizing: border-box;

  &:active {
    opacity: 0.85;
  }
}

.actions__user {
  display: flex;
  flex-direction: row;
  height: 36px;
  align-items: center;
  gap: 8px;
  padding: 0 6px 0 0;
  border-radius: 999px;
  cursor: pointer;
  box-sizing: border-box;

  &:active {
    background: var(--vm-soft-bg, #f4f6fc);
  }
}

.actions__avatar {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--vm-soft-active, rgba(78, 93, 255, 0.12));
  color: #4e5dff;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.actions__name {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: var(--vm-brand-text, #3b4456);
}

.actions__chevron {
  font-size: 14px;
  color: var(--vm-muted-text, #9aa0b0);
  opacity: 0.7;
}

/* topWindow 若未吃到 html[data-theme]，用 is-dark 兜底 */
.header.is-dark {
  --vm-header-bg: #141625;
  --vm-header-border: #252836;
  --vm-brand-text: #f0f2fa;
  --vm-muted-text: #9aa0b0;
  --vm-soft-bg: #1c1f33;
  --vm-soft-active: rgba(78, 93, 255, 0.22);
}
</style>
