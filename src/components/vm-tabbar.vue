<template>
  <view class="vm-tabbar" :class="{ 'is-fixed': fixed }">
    <view
      v-for="item in TAB_LIST"
      :key="item.name"
      class="vm-tabbar__item"
      :class="{ 'is-active': inner === item.name }"
      @click="onSelect(item.name)"
    >
      <vm-ri-icon class="vm-tabbar__icon" :name="item.icon" />
      <text class="vm-tabbar__label">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 移动端底栏（零代码原生，不依赖 tt-tabbar；对齐 web vm-tabbar）
 * 壳内切换只改 active，不 switchTab。
 */
import VmRiIcon from '@/components/vm-ri-icon.vue'

type ShellTab = Exclude<TabName, 'tabbar'>

const props = withDefaults(
  defineProps<{
    modelValue?: ShellTab
    /** 固定底栏（壳外独立页用）；壳内嵌设 false */
    fixed?: boolean
  }>(),
  { modelValue: 'home', fixed: true },
)

const emit = defineEmits<{
  'update:modelValue': [name: ShellTab]
  change: [name: ShellTab]
}>()

const inner = ref<ShellTab>(props.modelValue)

watch(
  () => props.modelValue,
  (v) => {
    if (v && v !== inner.value) inner.value = v
  },
)

function onSelect(name: ShellTab) {
  if (inner.value === name) return
  inner.value = name
  emit('update:modelValue', name)
  emit('change', name)
}
</script>

<style lang="scss" scoped>
.vm-tabbar {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  min-height: 54px;
  padding: 6px 0 calc(6px + env(safe-area-inset-bottom, 0px));
  background: var(--vm-card, #ffffff);
  border-top: 1px solid var(--vm-card-border, #e8ebf5);
  box-sizing: border-box;
}

.vm-tabbar.is-fixed {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
}

.vm-tabbar__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 4px 0 6px;
  color: var(--vm-muted-text, #9aa0b0);
  transition: color 0.15s ease;
}

.vm-tabbar__item.is-active {
  color: #4e5dff;
}

.vm-tabbar__icon {
  font-size: 22px;
  line-height: 1;
}

.vm-tabbar__label {
  font-size: 11px;
  font-weight: 500;
  line-height: 15px;
}

.vm-tabbar__item.is-active .vm-tabbar__label {
  font-weight: 650;
}
</style>
