import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Chat from '../views/Chat.vue'
import Profile from '../views/Profile.vue'
import Detail from '../views/Detail.vue'

const routes = [
  // 1. 【关键】根路径重定向到 /home，保证一打开就是主页
  {
    path: '/',
    redirect: '/home' 
  },
  // 2. 带底部导航的页面
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  // 3. 详情页（不带底部导航，独立显示）
  {
    path: '/detail',
    name: 'Detail',
    component: Detail
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router