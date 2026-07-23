<template>
  <tt-config-provider :theme="resolvedTheme" :theme-vars="{ primary: '#4E5DFF' }">
    <view class="page">
      <text class="title">我的</text>

      <view class="card">
        <view class="profile">
          <text class="name">{{ helloName }}</text>
          <text class="meta">{{ userStore.info?.phone || '未绑定手机号' }}</text>
        </view>
        <button
          v-if="!authed"
          class="btn"
          :disabled="loading"
          @click="goLogin"
        >
          去登录
        </button>
        <button
          v-else
          class="btn btn-ghost"
          :disabled="loading"
          @click="onLogout"
        >
          {{ loading ? '退出中…' : '退出登录' }}
        </button>
      </view>

      <view class="section">
        <tt-cell title="深色模式" border>
          <tt-switch
            :model-value="isDark"
            active-color="#4E5DFF"
            @update:model-value="onDarkChange"
          />
        </tt-cell>
        <tt-cell
          v-for="lang in locale.langs"
          :key="lang.code"
          :title="localeLabel(lang)"
          :value="locale.locale === lang.code ? '✓' : ''"
          border
          is-link
          @click="onPickLocale(lang.code)"
        />
      </view>
    </view>
  </tt-config-provider>
</template>

<script setup lang="ts">
import { useLocaleStore, type I18nLangItem } from '@/stores/locale'

useH5MobileTabShell('mine')

const locale = useLocaleStore()
const loading = ref(false)

const authed = computed(() => Boolean(userStore.token))
const helloName = computed(() =>
  authed.value ? userStore.displayName : '未登录',
)

onShow(() => {
  appStore.setActive('mine')
  void userStore.get()
})

function localeLabel(lang: I18nLangItem) {
  return `${lang.flag || ''} ${lang.name}`.trim()
}

function onDarkChange(value: boolean) {
  setTheme(value ? 'dark' : 'light')
}

function onPickLocale(code: string) {
  void locale.setLocale(code)
}

function goLogin() {
  uni.navigateTo({ url: '/pages/login/login' })
}

async function onLogout() {
  if (loading.value) return
  loading.value = true
  try {
    await userStore.logout()
    uni.showToast({ title: '已退出', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page {
  min-height: 100%;
  padding: 24px;
  box-sizing: border-box;
  background: var(--vm-page-bg, #f4f6fc);
}
.title {
  font-size: 18px;
  font-weight: 700;
  color: var(--tt-foreground, #2c3142);
}
.card {
  margin-top: 16px;
  padding: 16px;
  border-radius: 16px;
  background: var(--vm-card, #fff);
  border: 1px solid var(--vm-card-border, #e5e5e5);
  box-shadow: var(--vm-card-shadow, none);
}
.profile {
  margin-bottom: 12px;
}
.name {
  display: block;
  font-size: 16px;
  font-weight: 650;
  color: var(--tt-foreground, #2c3142);
}
.meta {
  display: block;
  margin-top: 4px;
  font-size: 13px;
  color: var(--tt-muted-foreground, #8a90a0);
}
.btn {
  width: 100%;
  height: 40px;
  border: 0;
  border-radius: 8px;
  background: #4e5dff;
  color: #fff;
  font-size: 14px;
  line-height: 40px;
}
.btn-ghost {
  background: transparent;
  color: #4e5dff;
  border: 1px solid #4e5dff;
}
.section {
  margin-top: 16px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--vm-card-border, #e5e5e5);
  background: var(--vm-card, #fff);
}
</style>
