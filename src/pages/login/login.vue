<template>
  <view class="vm-login">
    <!-- 始终渲染：与 admin 同色呼吸水珠（canvas 失败时仍可见） -->
    <view
      class="vm-login__bubble-css"
      :class="{ 'is-hidden': canvasReady }"
      aria-hidden="true"
    >
      <view class="vm-login__bubble-blob" />
    </view>

    <view class="vm-login__panel">
      <view class="vm-login__box">
        <view class="vm-login__brand">
          <view class="vm-login__logo">
            <image
              class="vm-login__logo-img"
              src="/static/image/logo-dark.png"
              mode="aspectFit"
            />
          </view>
          <text class="vm-login__name">{{ config.app.name }}</text>
        </view>
        <text class="vm-login__desc">{{ config.app.desc }}</text>

        <view class="vm-login__tabs">
          <view
            class="vm-login__tab"
            :class="{ 'is-active': authMode === 'login', 'is-disabled': busy }"
            @click="switchMode('login')"
          >
            <text>登录</text>
          </view>
          <view
            class="vm-login__tab"
            :class="{
              'is-active': authMode === 'register',
              'is-disabled': busy,
            }"
            @click="switchMode('register')"
          >
            <text>注册</text>
          </view>
        </view>

        <view class="vm-login__field">
          <text class="vm-login__label">账号</text>
          <input
            v-model="account"
            class="vm-login__input"
            maxlength="64"
            placeholder="手机号或邮箱"
            placeholder-class="vm-login__placeholder"
            :disabled="busy"
          />
        </view>

        <template v-if="authMode === 'register' || authMethod === 'password'">
          <view class="vm-login__field">
            <text class="vm-login__label">密码</text>
            <view class="vm-login__password-wrap">
              <input
                v-model="password"
                class="vm-login__input vm-login__input--password"
                :password="!showPassword"
                maxlength="32"
                :placeholder="
                  authMode === 'register' ? '至少 6 位密码' : '请输入密码'
                "
                placeholder-class="vm-login__placeholder"
                :disabled="busy"
              />
              <view
                class="vm-login__password-toggle"
                :class="{ 'is-disabled': busy }"
                @click="!busy && (showPassword = !showPassword)"
              >
                <text
                  class="vm-login__password-icon"
                  :class="showPassword ? 'ri-eye-line' : 'ri-eye-off-line'"
                />
              </view>
            </view>
          </view>
          <view v-if="authMode === 'register'" class="vm-login__field">
            <text class="vm-login__label">确认密码</text>
            <view class="vm-login__password-wrap">
              <input
                v-model="password2"
                class="vm-login__input vm-login__input--password"
                :password="!showPassword2"
                maxlength="32"
                placeholder="再次输入密码"
                placeholder-class="vm-login__placeholder"
                :disabled="busy"
              />
              <view
                class="vm-login__password-toggle"
                :class="{ 'is-disabled': busy }"
                @click="!busy && (showPassword2 = !showPassword2)"
              >
                <text
                  class="vm-login__password-icon"
                  :class="showPassword2 ? 'ri-eye-line' : 'ri-eye-off-line'"
                />
              </view>
            </view>
          </view>
        </template>

        <template v-else>
          <view class="vm-login__field">
            <text class="vm-login__label">图片验证码</text>
            <view class="vm-login__captcha-row">
              <input
                v-model="captchaInput"
                class="vm-login__input vm-login__input--flex"
                maxlength="4"
                placeholder="计算结果"
                placeholder-class="vm-login__placeholder"
                :disabled="busy"
              />
              <view
                class="vm-login__captcha"
                :class="{ 'is-disabled': captchaLoading || busy }"
                @click="refreshCaptcha"
              >
                <image
                  v-if="captchaSrc"
                  class="vm-login__captcha-img"
                  :src="captchaSrc"
                  mode="aspectFill"
                />
                <text v-else class="vm-login__captcha-loading">…</text>
              </view>
            </view>
          </view>

          <view class="vm-login__field">
            <text class="vm-login__label">验证码</text>
            <view class="vm-login__code-row">
              <input
                v-model="otpCode"
                class="vm-login__input vm-login__input--flex"
                maxlength="6"
                placeholder="短信/邮箱验证码"
                placeholder-class="vm-login__placeholder"
                :disabled="busy"
              />
              <view
                class="vm-login__code-btn"
                :class="{
                  'is-disabled':
                    codeSending || codeCountdown > 0 || busy || captchaLoading,
                }"
                @click="sendOtp"
              >
                <text>{{
                  codeSending
                    ? '发送中…'
                    : codeCountdown > 0
                      ? `${codeCountdown}s`
                      : '获取验证码'
                }}</text>
              </view>
            </view>
          </view>
        </template>

        <text v-if="error" class="vm-login__error">{{ error }}</text>

        <view
          v-if="authMode === 'login'"
          class="vm-login__method-switch"
          @click="
            !busy &&
              switchMethod(authMethod === 'password' ? 'code' : 'password')
          "
        >
          <text class="vm-login__method-link">{{
            authMethod === 'password' ? '使用验证码登录' : '使用密码登录'
          }}</text>
        </view>

        <view
          class="vm-login__submit"
          :class="{ 'is-disabled': busy }"
          @click="submit"
        >
          <text class="vm-login__submit-text">{{
            loading
              ? authMode === 'register'
                ? '注册中…'
                : '登录中…'
              : authMode === 'register'
                ? '注册'
                : '登录'
          }}</text>
        </view>

        <!-- #ifdef H5 -->
        <view
          v-if="providers.length && authMode === 'login'"
          class="vm-login__sso"
        >
          <view class="vm-login__sso-row">
            <view
              v-for="p in primaryProviders"
              :key="p"
              class="vm-login__sso-chip"
              :class="[`is-${p}`, { 'is-disabled': busy }]"
              @click="socialLogin(p)"
            >
              <text
                class="vm-login__sso-icon"
                :class="SOCIAL_ICONS[p] || 'ri-login-circle-line'"
                :style="{ color: SOCIAL_COLORS[p] || '#4e5dff' }"
              />
              <text class="vm-login__sso-text">{{
                ssoLoading === p ? '…' : SOCIAL_LABELS[p] || p
              }}</text>
            </view>
            <view
              v-if="moreProviders.length"
              class="vm-login__sso-chip is-more"
              :class="{ 'is-disabled': busy }"
              @click="ssoMoreOpen = true"
            >
              <text class="vm-login__sso-icon ri-more-fill" />
              <text class="vm-login__sso-text">更多</text>
            </view>
          </view>
        </view>

        <view
          v-if="ssoMoreOpen"
          class="vm-login__sso-mask"
          @click="ssoMoreOpen = false"
        >
          <view class="vm-login__sso-sheet" @click.stop>
            <view class="vm-login__sso-sheet-head">
              <text class="vm-login__sso-sheet-title">更多登录方式</text>
              <view
                class="vm-login__sso-sheet-close"
                @click="ssoMoreOpen = false"
              >
                <text class="ri-close-line" />
              </view>
            </view>
            <view class="vm-login__sso-sheet-list">
              <view
                v-for="p in moreProviders"
                :key="p"
                class="vm-login__sso-chip"
                :class="[`is-${p}`, { 'is-disabled': busy }]"
                @click="socialLogin(p)"
              >
                <text
                  class="vm-login__sso-icon"
                  :class="SOCIAL_ICONS[p] || 'ri-login-circle-line'"
                  :style="{ color: SOCIAL_COLORS[p] || '#4e5dff' }"
                />
                <text class="vm-login__sso-text">{{
                  ssoLoading === p ? '跳转中…' : SOCIAL_LABELS[p] || p
                }}</text>
              </view>
            </view>
          </view>
        </view>
        <!-- #endif -->

        <!-- #ifdef MP-WEIXIN -->
        <view class="vm-login__sso">
          <view class="vm-login__sso-row">
            <view
              class="vm-login__sso-chip is-wechat"
              :class="{ 'is-disabled': busy }"
              @click="wxMiniLogin"
            >
              <text
                class="vm-login__sso-icon ri-wechat-fill"
                style="color: #07c160"
              />
              <text class="vm-login__sso-text">{{
                ssoLoading === 'weixin' ? '…' : '微信'
              }}</text>
            </view>
          </view>
        </view>
        <!-- #endif -->
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { config } from '@/config'
import { getAccessToken, request } from '@/api/client'
import {
  authClient,
  syncBetterAuthJwt,
  SOCIAL_LABELS,
  SOCIAL_ICONS,
  SOCIAL_COLORS,
} from '@/lib/auth-client'

const PRIMARY_SSO = ['github', 'wechat'] as const

type AuthMode = 'login' | 'register'
type AuthMethod = 'password' | 'code'

const authMode = ref<AuthMode>('login')
const authMethod = ref<AuthMethod>('password')
const account = ref('')
const password = ref('')
const password2 = ref('')
const showPassword = ref(false)
const showPassword2 = ref(false)
const otpCode = ref('')
const captchaId = ref('')
const captchaSrc = ref('')
const captchaInput = ref('')
const captchaLoading = ref(false)
const codeSending = ref(false)
const codeCountdown = ref(0)
const error = ref('')
const loading = ref(false)
const ssoLoading = ref('')
const providers = ref<string[]>([])
const ssoMoreOpen = ref(false)
const canvasReady = ref(false)
let redirectUrl = '/pages/tabBar/home/home'
let bubbleCanvasEl: HTMLCanvasElement | null = null
let mountTimer = 0
let mountTries = 0
let countdownTimer = 0

const busy = computed(() => loading.value || !!ssoLoading.value)

const primaryProviders = computed(() =>
  PRIMARY_SSO.filter((p) => providers.value.includes(p)),
)
const moreProviders = computed(() =>
  providers.value.filter(
    (p) => !(PRIMARY_SSO as readonly string[]).includes(p),
  ),
)

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

function isPhone(v: string) {
  return /^1\d{10}$/.test(v.trim())
}

function switchMode(mode: AuthMode) {
  if (busy.value) return
  authMode.value = mode
  error.value = ''
  if (mode === 'register') authMethod.value = 'password'
}

function switchMethod(method: AuthMethod) {
  if (busy.value || authMode.value === 'register') return
  authMethod.value = method
  error.value = ''
  if (method === 'code' && !captchaId.value) void refreshCaptcha()
}

onLoad((query) => {
  if (query?.redirect && typeof query.redirect === 'string') {
    redirectUrl = decodeURIComponent(query.redirect)
  }
})

async function loadProviders() {
  try {
    providers.value = await request<string[]>('/app/user/login/socialProviders', {
      toast: false,
    })
  } catch {
    providers.value = []
  }
}

async function refreshCaptcha() {
  if (captchaLoading.value) return
  captchaLoading.value = true
  captchaSrc.value = ''
  captchaInput.value = ''
  try {
    const data = await request<{ captchaId: string; data: string }>(
      '/app/user/login/captcha?width=150&height=45&color=%232c3142',
      { toast: false },
    )
    captchaId.value = data.captchaId
    captchaSrc.value = data.data
  } catch (e) {
    error.value = e instanceof Error ? e.message : '验证码获取失败'
  } finally {
    captchaLoading.value = false
  }
}

function startCountdown() {
  codeCountdown.value = 60
  if (countdownTimer) clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    codeCountdown.value -= 1
    if (codeCountdown.value <= 0) {
      clearInterval(countdownTimer)
      countdownTimer = 0
    }
  }, 1000) as unknown as number
}

async function sendOtp() {
  if (codeSending.value || codeCountdown.value > 0 || busy.value) return
  error.value = ''
  const acc = account.value.trim()
  if (!acc) {
    error.value = '请输入手机号或邮箱'
    return
  }
  if (!isPhone(acc) && !isEmail(acc)) {
    error.value = '请输入正确的手机号或邮箱'
    return
  }
  if (!captchaInput.value) {
    error.value = '请输入图片验证码'
    return
  }
  if (!captchaId.value) {
    error.value = '请先刷新图片验证码'
    return
  }
  codeSending.value = true
  try {
    await request('/app/user/login/otpCode', {
      method: 'POST',
      body: JSON.stringify({
        account: acc,
        captchaId: captchaId.value,
        code: captchaInput.value,
      }),
    })
    startCountdown()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '验证码发送失败'
    await refreshCaptcha()
  } finally {
    codeSending.value = false
  }
}

async function finishLogin(payload: {
  token: string
  refreshToken: string
  expire?: number
  refreshExpire?: number
}) {
  userStore.setToken({
    token: payload.token,
    refreshToken: payload.refreshToken || '',
    expire: payload.expire ?? 2 * 60 * 60,
    refreshExpire: payload.refreshExpire ?? 7 * 24 * 60 * 60,
  })
  void import('@/utils/socket').then(({ reconnectWs }) => reconnectWs())
  await userStore.get()
  uni.showToast({ title: '登录成功', icon: 'success' })
  await new Promise((r) => setTimeout(r, 600))
  if (appStore.isMobile) {
    const path = redirectUrl.split('?')[0] || ''
    if (path.includes('/mine')) appStore.setActive('mine')
    else if (path.includes('/discover')) appStore.setActive('discover')
    else if (path.includes('/message')) appStore.setActive('message')
    else appStore.setActive('home')
    uni.switchTab({ url: '/pages/tabBar/tabbar' })
    return
  }
  uni.switchTab({
    url: redirectUrl.startsWith('/pages/tabBar')
      ? redirectUrl
      : '/pages/tabBar/home/home',
  })
}

async function trySsoSession() {
  if (getAccessToken()) return
  const token = await syncBetterAuthJwt()
  if (token) {
    await finishLogin({
      token,
      refreshToken: '',
      expire: 2 * 60 * 60,
      refreshExpire: 7 * 24 * 60 * 60,
    })
  }
}

async function submit() {
  if (busy.value) return
  error.value = ''
  const acc = account.value.trim()
  if (!acc) {
    error.value = '请输入手机号或邮箱'
    return
  }
  if (!isPhone(acc) && !isEmail(acc)) {
    error.value = '请输入正确的手机号或邮箱'
    return
  }

  loading.value = true
  try {
    if (authMode.value === 'register' || authMethod.value === 'password') {
      if (!password.value) {
        error.value = '请输入密码'
        return
      }
      if (authMode.value === 'register') {
        if (password.value.length < 6) {
          error.value = '密码至少 6 位'
          return
        }
        if (password.value !== password2.value) {
          error.value = '两次密码不一致'
          return
        }
        const data = await request<{
          token: string
          refreshToken: string
          expire: number
          refreshExpire: number
        }>('/app/user/login/register', {
          method: 'POST',
          body: JSON.stringify({ account: acc, password: password.value }),
        })
        await finishLogin(data)
        return
      }
      const data = await request<{
        token: string
        refreshToken: string
        expire: number
        refreshExpire: number
      }>('/app/user/login/password', {
        method: 'POST',
        body: JSON.stringify({ account: acc, password: password.value }),
      })
      await finishLogin(data)
      return
    }

    if (!otpCode.value) {
      error.value = '请输入验证码'
      return
    }
    const data = await request<{
      token: string
      refreshToken: string
      expire: number
      refreshExpire: number
    }>('/app/user/login/otp', {
      method: 'POST',
      body: JSON.stringify({ account: acc, code: otpCode.value }),
    })
    await finishLogin(data)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '操作失败'
    if (authMethod.value === 'code') await refreshCaptcha()
  } finally {
    loading.value = false
  }
}

async function socialLogin(provider: string) {
  if (busy.value) return
  ssoMoreOpen.value = false
  ssoLoading.value = provider
  error.value = ''
  try {
    // #ifdef H5
    const origin = window.location.origin
    const callbackURL = `${origin}/#/pages/login/login?sso=1`
    await authClient.signIn.social({
      provider: provider as never,
      callbackURL,
    })
    // #endif
  } catch (e) {
    error.value = e instanceof Error ? e.message : '单点登录失败'
    ssoLoading.value = ''
  }
}

async function wxMiniLogin() {
  if (busy.value) return
  ssoLoading.value = 'weixin'
  error.value = ''
  try {
    const loginRes = await new Promise<UniApp.LoginRes>((resolve, reject) => {
      uni.login({ provider: 'weixin', success: resolve, fail: reject })
    })
    const profile = await new Promise<UniApp.GetUserProfileRes>((resolve, reject) => {
      uni.getUserProfile({
        desc: '用于完善会员资料',
        success: resolve,
        fail: reject,
      })
    })
    const data = await request<{
      token: string
      refreshToken: string
      expire: number
      refreshExpire: number
    }>('/app/user/login/mini', {
      method: 'POST',
      body: JSON.stringify({
        code: loginRes.code,
        encryptedData: profile.encryptedData,
        iv: profile.iv,
      }),
    })
    await finishLogin(data)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '微信登录失败'
  } finally {
    ssoLoading.value = ''
  }
}

/** H5：往 .vm-login 挂原生 canvas（与 admin/web 同源动效） */
function mountBubble() {
  if (typeof document === 'undefined') return
  const root = document.querySelector('.vm-login') as HTMLElement | null
  if (!root) {
    if (mountTries++ < 60) {
      mountTimer = window.setTimeout(mountBubble, 50) as unknown as number
    }
    return
  }
  if (root.querySelector('canvas.vm-login__bubble-canvas')) return

  const canvas = document.createElement('canvas')
  canvas.className = 'vm-login__bubble-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText =
    'position:absolute;inset:0;z-index:1;width:100%;height:100%;pointer-events:auto;cursor:pointer;'
  root.insertBefore(canvas, root.firstChild)
  bubbleCanvasEl = canvas
  bubbleRef.value = canvas

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      startBubble()
      canvasReady.value = true
    })
  })
}

function unmountBubble() {
  if (mountTimer) {
    clearTimeout(mountTimer)
    mountTimer = 0
  }
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = 0
  }
  stopBubble()
  bubbleCanvasEl?.remove()
  bubbleCanvasEl = null
  bubbleRef.value = null
  canvasReady.value = false
}

onMounted(() => {
  void loadProviders()
  void trySsoSession()
  void nextTick(() => {
    mountTries = 0
    mountBubble()
  })
})

onUnmounted(unmountBubble)
onUnload(unmountBubble)
</script>

<style lang="scss" scoped>
.vm-login {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: #ffffff !important;
  color: #2c3142;
  box-sizing: border-box;
}

/* CSS 呼吸水珠：色值/位置对齐 admin canvas 静态帧 */
.vm-login__bubble-css {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
  transition: opacity 0.25s ease;

  &.is-hidden {
    opacity: 0;
  }
}

.vm-login__bubble-blob {
  position: absolute;
  left: -18%;
  top: 6%;
  width: 105%;
  height: 105%;
  border-radius: 50%;
  background: radial-gradient(
    ellipse 55% 50% at 32% 38%,
    rgba(255, 255, 255, 0.85) 0%,
    rgba(186, 196, 255, 0.55) 22%,
    rgba(140, 155, 255, 0.35) 45%,
    rgba(155, 168, 255, 0.16) 68%,
    rgba(155, 168, 255, 0) 100%
  );
  filter: blur(2px);
  box-shadow: 0 0 80px rgba(78, 93, 255, 0.22);
  animation: vm-bubble-breathe 5.2s ease-in-out infinite;
}

@keyframes vm-bubble-breathe {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(2.2%, -1.8%) scale(1.045);
  }
  50% {
    transform: translate(1%, 1.5%) scale(1.02);
  }
  75% {
    transform: translate(-1.8%, 1.2%) scale(0.985);
  }
}

.vm-login__panel {
  position: relative;
  z-index: 2;
  display: flex;
  width: 50%;
  margin-left: auto;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    width: 100%;
  }
}

.vm-login__box {
  display: flex;
  width: 100%;
  max-width: 320px;
  flex-direction: column;
  align-items: center;
}

.vm-login__brand {
  --login-brand: #3b4456;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.vm-login__logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  padding: 5px;
  border-radius: 9px;
  background: #3b4456;
}

.vm-login__logo-img {
  width: 38px;
  height: 38px;
}

.vm-login__name {
  font-size: 38px;
  font-weight: 700;
  letter-spacing: 0.06em;
  line-height: 1;
  color: #3b4456;

  @media (max-width: 480px) {
    font-size: 30px;
  }
}

.vm-login__desc {
  margin: 0 0 28px;
  font-size: 15px;
  letter-spacing: 0.06em;
  color: #8a90a0;
  text-align: center;
  max-width: 90%;

  @media (max-width: 480px) {
    margin-bottom: 20px;
  }
}

.vm-login__tabs {
  display: flex;
  width: 100%;
  margin-bottom: 18px;
  border-radius: 8px;
  background: #f4f5f8;
  padding: 3px;
  box-sizing: border-box;
}

.vm-login__tab {
  flex: 1;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: #8a90a0;
  font-size: 14px;

  &.is-active {
    background: #fff;
    color: #2c3142;
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(40, 50, 80, 0.08);
  }

  &.is-disabled {
    opacity: 0.7;
  }
}

.vm-login__method-switch {
  display: flex;
  width: 100%;
  justify-content: flex-end;
  margin: 4px 0 10px;
}

.vm-login__method-link {
  color: #4e5dff;
  font-size: 13px;
  letter-spacing: 0.02em;
}

.vm-login__field {
  width: 100%;
  margin-bottom: 18px;
}

.vm-login__label {
  display: block;
  margin-bottom: 8px;
  padding-left: 4px;
  font-size: 13px;
  color: #8a90a0;
}

.vm-login__input {
  box-sizing: border-box;
  width: 100%;
  height: 45px;
  padding: 0 14px;
  border: 0 !important;
  border-radius: 8px;
  background: #f8f8f8 !important;
  color: #333 !important;
  font-size: 15px;
}

.vm-login__input--password {
  padding-right: 44px;
}

.vm-login__password-wrap {
  position: relative;
  width: 100%;
}

.vm-login__password-toggle {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 45px;
}

.vm-login__password-toggle.is-disabled {
  opacity: 0.5;
}

.vm-login__password-icon {
  font-size: 18px;
  line-height: 1;
  color: #8a90a0;
}

.vm-login__input--flex {
  flex: 1;
  min-width: 0;
}

.vm-login__placeholder {
  color: #b0b4bf;
}

.vm-login__captcha-row,
.vm-login__code-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.vm-login__captcha {
  display: flex;
  flex-shrink: 0;
  width: 120px;
  height: 45px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f8f8f8;
  overflow: hidden;

  &.is-disabled {
    opacity: 0.7;
  }
}

.vm-login__captcha-img {
  width: 100%;
  height: 100%;
}

.vm-login__captcha-loading {
  color: #8a90a0;
  font-size: 18px;
}

.vm-login__code-btn {
  flex-shrink: 0;
  height: 45px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #eef0ff;
  color: #4e5dff;
  font-size: 13px;
  white-space: nowrap;

  &.is-disabled {
    opacity: 0.65;
  }
}

.vm-login__error {
  width: 100%;
  margin: 0 0 12px;
  font-size: 13px;
  color: #e11d48;
}

.vm-login__submit {
  display: flex;
  width: 100%;
  height: 45px;
  margin-top: 0;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #4e5dff !important;
  box-sizing: border-box;

  &.is-disabled {
    opacity: 0.7;
  }
}

.vm-login__submit-text {
  color: #ffffff !important;
  font-size: 16px;
  letter-spacing: 0.08em;
  font-weight: 500;
}

.vm-login__sso {
  width: 100%;
  margin-top: 20px;
}

.vm-login__sso-row {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  gap: 8px;
}

.vm-login__sso-chip {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 92px;
  height: 36px;
  padding: 0 8px;
  border-radius: 999px;
  background: #f4f5f8;
  box-sizing: border-box;

  &.is-disabled {
    opacity: 0.7;
  }

  &.is-more {
    background: #fff;
    box-shadow: inset 0 0 0 1px #e6e8ef;
  }
}

.vm-login__sso-icon {
  font-size: 15px;
  line-height: 1;
  flex-shrink: 0;
}

.vm-login__sso-text {
  font-size: 12px;
  font-weight: 550;
  color: #2c3142;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.is-more .vm-login__sso-icon,
.is-more .vm-login__sso-text {
  color: #8a90a0;
  font-weight: 500;
}

.vm-login__sso-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px;
  background: rgba(20, 24, 40, 0.36);
  box-sizing: border-box;
}

.vm-login__sso-sheet {
  width: 100%;
  max-width: 360px;
  padding: 18px 18px 20px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 18px 48px rgba(40, 50, 120, 0.18);
  box-sizing: border-box;
}

.vm-login__sso-sheet-head {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.vm-login__sso-sheet-title {
  font-size: 15px;
  font-weight: 650;
  color: #2c3142;
}

.vm-login__sso-sheet-close {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f4f5f8;
  color: #8a90a0;
  font-size: 18px;
}

.vm-login__sso-sheet-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}
</style>

<!-- 非 scoped：动态插入的 canvas 必须吃到样式 -->
<style lang="scss">
.vm-login > canvas.vm-login__bubble-canvas {
  position: absolute !important;
  inset: 0 !important;
  z-index: 1 !important;
  width: 100% !important;
  height: 100% !important;
  display: block !important;
  pointer-events: auto;
  cursor: pointer;
}
</style>
