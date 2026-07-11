<script setup>
</script>

<template>
  <div class='page-container'>
    <van-nav-bar title="我的" />
    <div class="user-card">
      <van-icon name="user-o" size="80" color="#999" />
      <div class="user-info">
        <div class="user-name">用户昵称</div>
        <div class="user-desc">点击登录</div>
      </div>
      <van-icon name="arrow" size="20" color="#ccc" />
    </div>
    <div class='page-card'>
      <van-cell-group inset>
        <van-cell title="我的收藏" icon="star-o" is-link />
        <van-cell title="我的足迹" icon="location-o" is-link />
        <van-cell title="浏览历史" icon="history" is-link />
        <van-cell title="行程订单" icon="ticket" is-link />
      </van-cell-group>
    </div>
    <div class='page-card'>
      <van-cell-group inset>
        <van-cell title="设置" icon="setting-o" is-link />
        <van-cell title="帮助中心" icon="help-o" is-link />
        <van-cell title="关于我们" icon="info-o" is-link />
      </van-cell-group>
    </div>
    <div class="bottom-spacer"></div>
  </div>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}
.user-card {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  margin: 0 16px 12px;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.user-info {
  flex: 1;
}
.user-name {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}
.user-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}
.page-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin: 0 16px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.bottom-spacer {
  height: 50px;
}
</style>
