<script setup>
// 因为使用了 route 模式，由路由自动控制高亮，无需维护 active 状态
</script>

<template>
  <div class="app-wrapper">
    <!-- 路由组件渲染出口 -->
    <router-view />
    
    <!-- 底部导航栏（使用 route 模式 + to 属性实现自动跳转） -->
    <van-tabbar route>
      <van-tabbar-item to="/home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/chat" icon="chat-o">对话</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style>
/* 全局重置，防止出现难看的默认边距 */
body, html {
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
  height: 100%;
}
.app-wrapper {
  min-height: 100vh;
  padding-bottom: 50px; /* 给底部导航栏留出空间 */
  box-sizing: border-box;
}
</style>