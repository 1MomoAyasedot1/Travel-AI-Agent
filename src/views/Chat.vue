<script setup>
import { ref } from 'vue'
import { showToast } from 'vant'
// 1. 引入刚刚写好的流式请求方法
import { fetchStream } from '@/utils/request.js'

// 2. 输入框绑定的值
const inputValue = ref('')

// 3. 聊天记录数组（初始放一段AI问候语）
const messages = ref([
  {
    role: 'ai',
    content: '你好！我是智能旅游助手，有什么可以帮你的吗？\n我可以帮你推荐景点、规划行程、介绍美食等。'
  }
])

// 用于暂存当前正在生成的那一句话
const currentAiMessage = ref('')

// 4. 发送消息的方法
const handleSend = async () => {
  const text = inputValue.value.trim()
  if (!text) {
    showToast('请输入内容')
    return
  }

  // 4.1 把用户发的消息加入列表
  messages.value.push({ role: 'user', content: text })
  inputValue.value = '' // 清空输入框

  // 4.2 预先在列表中加入一条空白的 AI 消息（占位），后面流式填充它
  messages.value.push({ role: 'ai', content: '' })
  // 获取这条空消息的引用索引，方便后续修改它
  const lastAiMsgIndex = messages.value.length - 1
  currentAiMessage.value = ''

  // 4.3 调用后端流式接口
  try {
    await fetchStream(
      'chat', // 对应后端接口路径 /api/travel/chat
      { message: text }, // 传给后端的参数
      
      // 【onChunk 回调】：收到一个字/词就触发
      (chunk) => {
        // 假设后端返回的 JSON 格式中包含 content 字段
        // 这里根据你 TravelService 里的 emitter.send 实际封装的字段来
        const content = chunk.content || '' 
        currentAiMessage.value += content
        
        // 实时更新列表里最后一条 AI 消息的内容（实现打字机效果）
        messages.value[lastAiMsgIndex].content = currentAiMessage.value
      },

      // 【onComplete 回调】：流结束
      () => {
        console.log('对话结束')
      },

      // 【onError 回调】：出错了
      (error) => {
        console.error('流式请求失败:', error)
        showToast('回答生成失败，请重试')
        // 如果出错了，把占位的空白消息删掉，或者改个提示
        messages.value[lastAiMsgIndex].content = '【生成失败，请重试】'
      }
    )
  } catch (e) {
    console.error(e)
  }
}
</script>

<template>
  <div class='page-container'>
    <van-nav-bar title="AI对话" />

    <!-- 消息列表区域 -->
    <div class="chat-content">
      <div 
        v-for="(msg, index) in messages" 
        :key="index" 
        class="message-item"
        :class="msg.role"
      >
        <!-- 左侧 AI 头像 -->
        <van-icon v-if="msg.role === 'ai'" name="bot" size="40" color="#1890ff" />
        
        <!-- 气泡 -->
        <div class="message-bubble">
          <!-- 使用 v-html 或者直接插值，这里用插值，因为后端返回可能带有换行符 \n -->
          <p style="white-space: pre-wrap;">{{ msg.content }}</p>
        </div>

        <!-- 右侧用户头像 -->
        <van-icon v-if="msg.role === 'user'" name="user-o" size="40" color="#999" />
      </div>
    </div>

    <!-- 底部输入框区域 -->
    <div class="chat-input">
      <van-field 
        v-model="inputValue" 
        placeholder="输入你想咨询的问题" 
        @keyup.enter="handleSend"
      />
      <van-button 
        type="primary" 
        round 
        size="small" 
        style="margin-left: 10px;" 
        @click="handleSend"
      >
        发送
      </van-button>
    </div>
    <div class="bottom-spacer"></div>
  </div>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}
.chat-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  /* 让聊天区域自动滚动到最底部 */
  display: flex;
  flex-direction: column;
}
.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
.message-item.ai {
  flex-direction: row;
}
.message-item.user {
  flex-direction: row-reverse;
}
.message-bubble {
  max-width: 75%;
  background-color: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.message-item.user .message-bubble {
  background-color: #1890ff;
  color: #fff;
}
.message-bubble p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  /* 保留换行符 */
  white-space: pre-wrap; 
}
.chat-input {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background-color: #fff;
  border-top: 1px solid #eee;
}
.bottom-spacer {
  height: 50px;
}
</style>