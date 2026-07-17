<template>
  <scroll-view class="sidebar" scroll-y>
    <view class="project-block">
      <text class="label">当前应用</text>
      <text class="name">VOME</text>
    </view>

    <view class="menu">
      <view
        v-for="item in menus"
        :key="item.name"
        class="menu-item"
        :class="{ active: appStore.active === item.name }"
        @click="goTab(item)"
      >
        <text class="menu-item__text">{{ item.title }}</text>
      </view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
const menus: Array<{ name: TabName; title: string; url: string }> = [
  { name: 'home', title: '首页', url: '/pages/tabBar/home/home' },
  { name: 'discover', title: '发现', url: '/pages/tabBar/discover/discover' },
  { name: 'message', title: '消息', url: '/pages/tabBar/message/message' },
  { name: 'mine', title: '我的', url: '/pages/tabBar/mine/mine' },
]

function goTab(item: (typeof menus)[number]) {
  appStore.setActive(item.name)
  uni.switchTab({ url: item.url })
}
</script>

<style lang="scss" scoped>
.sidebar {
  position: fixed;
  width: 240px;
  height: calc(100vh - 60px);
  background: #f7f8fc;
  border-right: 1px solid #eef0f5;
  box-sizing: border-box;
}

.project-block {
  padding: 20px 18px 16px;
  border-bottom: 1px solid #eef0f5;

  .label {
    display: block;
    margin-bottom: 6px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.04em;
    color: #9aa0b0;
  }

  .name {
    display: block;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: #4e5dff;
  }
}

.menu {
  padding: 8px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  margin: 0 10px;
  padding: 12px 14px;
  border-radius: 10px;
  box-sizing: border-box;
  transition:
    background 0.15s ease,
    color 0.15s ease;

  &__text {
    font-size: 14px;
    font-weight: 500;
    color: #50566b;
  }

  &.active {
    background: #eef0ff;

    .menu-item__text {
      color: #4e5dff;
      font-weight: 650;
    }
  }
}
</style>
