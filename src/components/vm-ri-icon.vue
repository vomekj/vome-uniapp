<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'vm-ri-icon' })

const props = defineProps<{
  /** remixicon 名，如 ri-home-line；可省略 ri- 前缀 */
  name: string
  class?: string
}>()

const cls = computed(() => {
  const n = props.name.startsWith('ri-') ? props.name : `ri-${props.name}`
  return [n, props.class].filter(Boolean).join(' ')
})
</script>

<template>
  <!-- uni 跨端用 text 承载 remixicon 字体 class -->
  <text :class="cls" aria-hidden="true" />
</template>
