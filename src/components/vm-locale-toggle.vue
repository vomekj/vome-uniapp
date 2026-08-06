<template>
  <view class="vm-locale-toggle">
    <view
      id="vm-locale-toggle-btn"
      class="vm-locale-toggle__btn"
      :class="{ 'is-disabled': switching }"
      @click.stop="toggleMenu"
    >
      <text class="vm-locale-toggle__flag">{{
        locale.currentLang?.flag || '🏳️'
      }}</text>
    </view>
    <view
      v-if="open"
      class="vm-locale-toggle__mask"
      @click="closeMenu"
    />
    <view
      v-if="open"
      class="vm-locale-toggle__menu"
      :style="menuStyle"
      @click.stop
    >
      <view
        v-for="lang in locale.langs"
        :key="lang.code"
        class="vm-locale-toggle__item"
        :class="{ 'is-active': locale.locale === lang.code }"
        @click="switchLocale(lang.code)"
      >
        <text class="vm-locale-toggle__flag">{{ lang.flag || '🏳️' }}</text>
        <text class="vm-locale-toggle__label">{{ lang.name }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 语言切换（与 vome-code locale-toggle / vm-locale-toggle.vue 同名同职责）
 */
import { useLocaleStore } from '@/stores/locale'

defineOptions({ name: 'VmLocaleToggle' })

const locale = useLocaleStore()
const open = ref(false)
const switching = ref(false)
const menuStyle = ref<Record<string, string>>({})

function closeMenu() {
  open.value = false
}

function placeMenu() {
  // 顶栏等矮容器须 fixed，避免被裁切
  uni
    .createSelectorQuery()
    .select('#vm-locale-toggle-btn')
    .boundingClientRect((rect) => {
      const r = rect as UniApp.NodeInfo | null
      if (!r || r.right == null || r.bottom == null) return
      const gap = 6
      menuStyle.value = {
        top: `${Number(r.bottom) + gap}px`,
        right: `${Math.max(8, window.innerWidth - Number(r.right))}px`,
      }
    })
    .exec()
}

function toggleMenu() {
  if (switching.value) return
  if (open.value) {
    closeMenu()
    return
  }
  placeMenu()
  open.value = true
}

async function switchLocale(code: string) {
  if (switching.value) return
  switching.value = true
  closeMenu()
  try {
    await locale.setLocale(code)
  } finally {
    switching.value = false
  }
}

onMounted(() => {
  if (!locale.langs.length) void locale.loadLangs()
})
</script>

<style lang="scss" scoped>
.vm-locale-toggle {
  position: relative;
  z-index: 30;
  display: flex;
  flex-shrink: 0;
}

.vm-locale-toggle__btn {
  display: flex;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--vm-card-border, #e8ebf5);
  border-radius: 8px;
  background: var(--vm-card, #fff);
  box-sizing: border-box;

  &.is-disabled {
    opacity: 0.6;
  }

  &:active {
    opacity: 0.85;
  }
}

.vm-locale-toggle__flag {
  font-size: 16px;
  line-height: 1;
}

.vm-locale-toggle__mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: transparent;
}

.vm-locale-toggle__menu {
  position: fixed;
  z-index: 1001;
  min-width: 120px;
  max-width: 160px;
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--vm-card-border, #e8ebf5);
  background: var(--vm-card, #fff);
  box-shadow: 0 8px 24px rgba(20, 22, 37, 0.12);
  box-sizing: border-box;
}

.vm-locale-toggle__item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  box-sizing: border-box;

  &:active {
    background: var(--vm-soft-bg, #f4f6fc);
  }

  &.is-active {
    background: var(--vm-soft-active, rgba(78, 93, 255, 0.12));
  }
}

.vm-locale-toggle__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: var(--vm-brand-text, #2c3142);
}
</style>
