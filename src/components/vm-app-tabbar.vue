<template>
  <view class="vm-app-tabbar">
    <tt-tabbar
      :model-value="inner"
      :items="[]"
      :fixed="true"
      :placeholder="true"
      :border="false"
      :safe-area-inset-bottom="true"
      active-color="#4E5DFF"
      inactive-color="#9aa0b0"
    >
      <view
        v-for="item in TAB_LIST"
        :key="item.name"
        class="vm-app-tabbar__item"
        :class="{ 'is-active': inner === item.name }"
        @click="onSelect(item.name)"
      >
        <vm-ri-icon class="vm-app-tabbar__icon" :name="item.icon" />
        <text class="vm-app-tabbar__label">{{ item.text }}</text>
      </view>
    </tt-tabbar>
  </view>
</template>

<script setup lang="ts">
/**
 * 业务底栏：tt-tabbar 壳 + remix 图标（builtin 图标集不全，用全局 remixicon）
 * 壳内切换只改 active，不 switchTab（对齐 vome-ai）。
 */
import VmRiIcon from '@/components/vm-ri-icon.vue'

type ShellTab = Exclude<TabName, 'tabbar'>

const props = withDefaults(
  defineProps<{ modelValue?: ShellTab }>(),
  { modelValue: 'home' },
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
.vm-app-tabbar {
  :deep(.tt-tabbar) {
    background: var(--vm-card, #ffffff) !important;
    border-top: 1px solid var(--vm-card-border, #e8ebf5) !important;
    box-shadow: none !important;
    height: auto !important;
    min-height: 54px;
    padding-top: 6px !important;
  }
}

.vm-app-tabbar__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 4px 0 6px;
  cursor: pointer;
  color: var(--vm-muted-text, #9aa0b0);
  transition: color 0.15s ease;
}

.vm-app-tabbar__item.is-active {
  color: #4e5dff;
}

.vm-app-tabbar__icon {
  font-size: 22px;
  line-height: 1;
}

.vm-app-tabbar__label {
  font-size: 11px;
  font-weight: 500;
  line-height: 15px;
}

.vm-app-tabbar__item.is-active .vm-app-tabbar__label {
  font-weight: 650;
}
</style>
