import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' // 1. 导入 path 模块

export default defineConfig({
  plugins: [vue()],
  // 2. 这里新增 resolve 配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src') // 定义 @ 代表 src 目录
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3200', // 你的AI接口地址
        changeOrigin: true, // 允许跨域
        rewrite: (path) => path.replace(/^\/api/, '') // 把 /api 去掉，换成空
      }
    }
  }
})