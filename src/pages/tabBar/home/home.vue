<template>
  <tt-config-provider :theme="resolvedTheme" :theme-vars="{ primary: '#4E5DFF' }">
    <view class="vm-home">
      <view class="vm-home__top">
        <view class="vm-home__hero">
          <view class="vm-home__hero-text">
            <text class="vm-home__eyebrow">Overview</text>
            <text class="vm-home__hello">你好，{{ helloName }}</text>
            <text class="vm-home__desc">
              欢迎使用 {{ config.app.name }}。账号与权限由服务端下发，支持密码登录与社交单点登录。
            </text>
          </view>
          <view class="vm-home__hero-art" />
        </view>

        <view class="vm-home__session">
          <view class="vm-home__session-head">
            <view class="vm-home__card-icon is-violet">
              <text class="ri-user-smile-line" />
            </view>
            <view>
              <text class="vm-home__session-label">会话摘要</text>
              <text class="vm-home__session-name">{{ helloName }}</text>
            </view>
          </view>
          <view class="vm-home__stats">
            <view class="vm-home__stat">
              <text>手机号</text>
              <text class="strong">{{ userStore.profile?.phone || '—' }}</text>
            </view>
            <view class="vm-home__stat">
              <text>邮箱</text>
              <text class="strong">{{ userStore.profile?.email || '—' }}</text>
            </view>
            <view class="vm-home__stat">
              <text>状态</text>
              <text class="strong">{{ userStore.profile ? '已登录' : '游客' }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="vm-home__grid">
        <view v-for="card in cards" :key="card.title" class="vm-home__card">
          <view class="vm-home__card-icon" :class="card.tone">
            <text :class="card.icon" />
          </view>
          <text class="vm-home__card-title">{{ card.title }}</text>
          <text class="vm-home__card-desc">{{ card.desc }}</text>
        </view>
      </view>

      <view class="vm-home__bottom">
        <view class="vm-home__panel">
          <view class="vm-home__panel-head">
            <view class="vm-home__card-icon is-blue">
              <text class="ri-flashlight-line" />
            </view>
            <view>
              <text class="vm-home__panel-title">快捷入口</text>
              <text class="vm-home__panel-sub">常用操作</text>
            </view>
          </view>
          <view class="vm-home__shortcuts">
            <view class="vm-home__shortcut" @click="goMine">
              <text class="vm-home__shortcut-icon ri-user-3-line" />
              <text class="vm-home__shortcut-text">我的</text>
            </view>
            <view class="vm-home__shortcut" @click="goLogin">
              <text class="vm-home__shortcut-icon ri-login-box-line" />
              <text class="vm-home__shortcut-text">登录</text>
            </view>
          </view>
        </view>

        <view class="vm-home__panel">
          <view class="vm-home__panel-head">
            <view class="vm-home__card-icon is-mint">
              <text class="ri-stack-line" />
            </view>
            <view>
              <text class="vm-home__panel-title">框架能力</text>
              <text class="vm-home__panel-sub">与本端运行时对齐</text>
            </view>
          </view>
          <view v-for="cap in capabilities" :key="cap.title" class="vm-home__cap">
            <text class="vm-home__cap-icon" :class="cap.icon" />
            <view class="vm-home__cap-body">
              <text class="vm-home__cap-title">{{ cap.title }}</text>
              <text class="vm-home__cap-desc">{{ cap.desc }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </tt-config-provider>
</template>

<script setup lang="ts">
import { getAccessToken } from '@/api/client'
import { config } from '@/config'

useH5MobileTabShell('home')

const helloName = computed(() =>
  getAccessToken() ? userStore.displayName : '访客',
)

const cards = [
  {
    title: config.app.name,
    desc: 'uniapp 工作台，接口经 EPS 生成类型化 service。',
    tone: 'is-blue',
    icon: 'ri-apps-line',
  },
  {
    title: '双端鉴权',
    desc: '密码登录与 Better Auth 社交 SSO 共用 Web JWT。',
    tone: 'is-cyan',
    icon: 'ri-shield-keyhole-line',
  },
  {
    title: '多端一致',
    desc: '与 Web / Admin 共享品牌色与视觉语言。',
    tone: 'is-peach',
    icon: 'ri-smartphone-line',
  },
]

const capabilities = [
  {
    title: 'Better Auth SSO',
    desc: 'GitHub / Google / 微信等按服务端配置动态展示',
    icon: 'ri-lock-password-line',
  },
  {
    title: 'EPS 实体描述',
    desc: '前端按侧生成 service，与接口契约同源',
    icon: 'ri-database-2-line',
  },
  {
    title: 'App JWT',
    desc: 'Bearer 访问令牌，与 Web 共用用户表',
    icon: 'ri-key-2-line',
  },
]

function goMine() {
  appStore.setActive('mine')
  if (!appStore.isMobile) {
    uni.switchTab({ url: '/pages/tabBar/mine/mine' })
  }
}

function goLogin() {
  uni.navigateTo({ url: '/pages/login/login' })
}

onShow(() => {
  appStore.setActive('home')
  void userStore.get()
})

onMounted(() => {
  void userStore.get()
})
</script>

<style lang="scss" scoped>
.vm-home {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  margin: 0;
  padding: 16px;
  box-sizing: border-box;
  min-height: 100%;
  background: var(--vm-page-bg, #f4f6fc);

  @media (min-width: 768px) {
    padding: 20px 24px;
  }
}

.vm-home__top {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;

  @media (min-width: 1100px) {
    grid-template-columns: minmax(0, 1fr) 300px;
    align-items: stretch;
  }
}

.vm-home__hero {
  position: relative;
  display: flex;
  min-height: 124px;
  align-items: center;
  overflow: hidden;
  padding: 20px 26px;
  border-radius: 26px;
  background: linear-gradient(135deg, #4e5dff 0%, #6b7bff 55%, #8b9bff 100%);
  color: #fff;
  box-shadow: 0 14px 36px rgba(78, 93, 255, 0.26);
}

.vm-home__eyebrow {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.75;
}

.vm-home__hello {
  display: block;
  margin-bottom: 6px;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;

  @media (min-width: 768px) {
    font-size: 24px;
  }
}

.vm-home__desc {
  display: block;
  max-width: 560px;
  font-size: 13px;
  line-height: 1.55;
  opacity: 0.88;
}

.vm-home__hero-art {
  position: absolute;
  right: -56px;
  top: -72px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3), transparent 68%);
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    right: 72px;
    bottom: -28px;
    width: 160px;
    height: 160px;
    border-radius: 40% 60% 55% 45%;
    background: rgba(255, 255, 255, 0.14);
  }

  &::before {
    content: '';
    position: absolute;
    right: 28px;
    top: 96px;
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
  }
}

.vm-home__session {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: 16px 18px;
  border-radius: 26px;
  background: var(--vm-card, #fff);
  border: 1px solid var(--vm-card-border, #e8ebf5);
  box-shadow: var(--vm-card-shadow, 0 10px 30px rgba(40, 50, 120, 0.06));
}

.vm-home__session-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vm-home__session-label {
  display: block;
  margin-bottom: 2px;
  font-size: 12px;
  color: var(--tt-muted-foreground, #8a90a0);
  font-weight: 500;
}

.vm-home__session-name {
  display: block;
  font-size: 15px;
  font-weight: 650;
  color: var(--tt-foreground, #2c3142);
}

.vm-home__stats {
  display: grid;
  gap: 7px;
}

.vm-home__stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 12px;
  border-radius: 14px;
  background: var(--vm-inset, #f4f6fc);
  font-size: 13px;
  color: var(--tt-muted-foreground, #8a90a0);
  font-weight: 500;

  .strong {
    font-size: 14px;
    font-weight: 700;
    color: var(--tt-foreground, #2c3142);
    max-width: 60%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.vm-home__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.vm-home__card {
  padding: 16px 18px;
  border-radius: 22px;
  background: var(--vm-card, #fff);
  border: 1px solid var(--vm-card-border, #e8ebf5);
  box-shadow: var(--vm-card-shadow, 0 10px 30px rgba(40, 50, 120, 0.06));
}

.vm-home__card-title {
  display: block;
  margin: 10px 0 5px;
  font-size: 15px;
  font-weight: 650;
  color: var(--tt-foreground, #2c3142);
}

.vm-home__card-desc {
  display: block;
  font-size: 13px;
  line-height: 1.5;
  color: var(--tt-muted-foreground, #8a90a0);
  font-weight: 500;
}

.vm-home__card-icon {
  display: flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #4e5dff;
  color: #fff;
  font-size: 18px;
  line-height: 1;

  &.is-blue {
    background: #4e5dff;
  }
  &.is-cyan {
    background: #22b8cf;
  }
  &.is-peach {
    background: #ff8a5b;
  }
  &.is-violet {
    background: #845ef7;
  }
  &.is-mint {
    background: #20c997;
  }
}

.vm-home__bottom {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;

  @media (min-width: 1100px) {
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  }
}

.vm-home__panel {
  display: flex;
  flex-direction: column;
  padding: 16px 18px;
  border-radius: 22px;
  background: var(--vm-card, #fff);
  border: 1px solid var(--vm-card-border, #e8ebf5);
  box-shadow: var(--vm-card-shadow, 0 10px 30px rgba(40, 50, 120, 0.06));
}

.vm-home__panel-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.vm-home__panel-title {
  display: block;
  margin-bottom: 2px;
  font-size: 15px;
  font-weight: 650;
  color: var(--tt-foreground, #2c3142);
}

.vm-home__panel-sub {
  display: block;
  font-size: 12px;
  color: var(--tt-muted-foreground, #8a90a0);
}

.vm-home__shortcuts {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
}

.vm-home__shortcut {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 96px;
  height: 40px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--vm-inset, #f4f6fc);
  box-sizing: border-box;
}

.vm-home__shortcut-icon {
  font-size: 15px;
  color: #4e5dff;
  line-height: 1;
}

.vm-home__shortcut-text {
  font-size: 13px;
  font-weight: 550;
  color: var(--tt-foreground, #2c3142);
}

.vm-home__cap {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  margin-bottom: 10px;
  border-radius: 14px;
  background: var(--vm-inset, #f4f6fc);

  &:last-child {
    margin-bottom: 0;
  }
}

.vm-home__cap-icon {
  margin-top: 2px;
  font-size: 18px;
  color: #4e5dff;
  line-height: 1;
  flex-shrink: 0;
}

.vm-home__cap-body {
  flex: 1;
  min-width: 0;
}

.vm-home__cap-title {
  display: block;
  font-size: 13px;
  font-weight: 650;
  color: var(--tt-foreground, #2c3142);
}

.vm-home__cap-desc {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  color: var(--tt-muted-foreground, #8a90a0);
  line-height: 1.45;
}
</style>
