<template>
  <view class="page">
    <text class="title">消息</text>
  </view>
</template>

<script setup lang="ts">
useH5MobileTabShell('message')
onShow(() => appStore.setActive('message'))
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
</style>
