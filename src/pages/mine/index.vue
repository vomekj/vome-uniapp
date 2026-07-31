<template>
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
      <view class="cell">
        <text class="cell__label">深色模式</text>
        <switch
          :checked="isDark"
          color="#4E5DFF"
          @change="onDarkChange"
        />
      </view>
      <view
        v-for="lang in locale.langs"
        :key="lang.code"
        class="cell cell--link"
        @click="onPickLocale(lang.code)"
      >
        <text class="cell__label">{{ localeLabel(lang) }}</text>
        <text class="cell__value">{{
          locale.locale === lang.code ? '✓' : ''
        }}</text>
      </view>
    </view>
  </view>
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
})

function localeLabel(lang: I18nLangItem) {
  return `${lang.flag || ''} ${lang.name}`.trim()
}

function onDarkChange(e: { detail?: { value?: boolean } }) {
  setTheme(e?.detail?.value ? 'dark' : 'light')
}

function onPickLocale(code: string) {
  void locale.setLocale(code)
}

function goLogin() {
  openPage('/pages/login/index')
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
  color: var(--vm-brand-text, #2c3142);
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
  color: var(--vm-brand-text, #2c3142);
}
.meta {
  display: block;
  margin-top: 4px;
  font-size: 13px;
  color: var(--vm-muted-text, #8a90a0);
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
.cell {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--vm-card-border, #eef0f5);
  box-sizing: border-box;
}
.cell:last-child {
  border-bottom: none;
}
.cell--link:active {
  background: var(--vm-soft-bg, #f4f6fc);
}
.cell__label {
  font-size: 14px;
  color: var(--vm-brand-text, #2c3142);
}
.cell__value {
  font-size: 14px;
  color: #4e5dff;
}
</style>
