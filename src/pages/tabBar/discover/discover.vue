<template>
  <tt-config-provider :theme="resolvedTheme" :theme-vars="{ primary: '#4E5DFF' }">
    <view class="page"><text class="title">发现</text></view>
  </tt-config-provider>
</template>

<script setup lang="ts">
useH5MobileTabShell('discover')
onShow(() => appStore.setActive('discover'))
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
</style>
