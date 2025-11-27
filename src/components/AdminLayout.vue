<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Menu, HomeFilled, Notebook, Tickets, User } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)
const userStore = useUserStore()

// 生成本地头像（不依赖外部 API）
const generateLocalAvatar = (seed) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2']
  const colorIndex = (seed || '').charCodeAt(0) % colors.length
  const color = colors[colorIndex]
  const initial = (seed || 'A').charAt(0).toUpperCase()
  const svg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="${color}"/><text x="50" y="50" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dominant-baseline="central" font-weight="bold">${initial}</text></svg>`
  return 'data:image/svg+xml;base64,' + btoa(svg)
}

const profile = computed(() => ({
  username: userStore.profile?.nickname || userStore.profile?.username || '管理员',
  avatar: userStore.profile?.avatar || generateLocalAvatar('Admin'),
  role: userStore.profile?.role || 'admin'
}))

const menus = [
  { path: '/admin/dashboard', label: '仪表盘', icon: HomeFilled },
  { path: '/admin/books', label: '图书管理', icon: Notebook },
  { path: '/admin/borrow', label: '借阅管理', icon: Tickets },
  { path: '/admin/users', label: '用户管理', icon: User }
]

const activePath = computed(() => route.path)

const handleSelect = (key) => {
  if (key !== route.path) router.push(key)
}

const logout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <el-container class="layout-root">
    <el-aside :width="isCollapse ? '72px' : '240px'" class="layout-aside">
      <div class="aside-head" :class="{ center: isCollapse }">
        <el-icon v-if="isCollapse" size="24"><Menu /></el-icon>
        <div v-else class="brand">
          <span class="brand-cn">图书管理系统</span>
          <span class="brand-en">Knowledge Changes Destiny</span>
        </div>
      </div>
      <div class="aside-user" v-if="!isCollapse">
        <el-avatar :size="54" :src="profile.avatar">{{ profile.username?.slice(0,1) }}</el-avatar>
        <div class="meta">
          <p class="name">{{ profile.username }}</p>
          <span class="role">管理员</span>
        </div>
      </div>
      <el-menu
        :default-active="activePath"
        :collapse="isCollapse"
        background-color="#e6ecef"
        text-color="#3a3a3a"
        active-text-color="#5470c6"
        class="aside-menu"
        @select="handleSelect"
      >
        <el-menu-item v-for="item in menus" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </el-menu-item>
      </el-menu>
      <div class="collapse-switch" @click="isCollapse = !isCollapse">
        <el-icon><Menu /></el-icon>
        <span v-if="!isCollapse">收起</span>
      </div>
    </el-aside>

    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <h1>{{ menus.find(m => m.path === activePath)?.label || '仪表盘' }}</h1>
        </div>
        <div class="header-right">
          <el-avatar :size="40" :src="profile.avatar" class="header-avatar" />
          <div class="header-meta">
            <div class="header-name">{{ profile.username }}</div>
            <small>{{ profile.role === 'admin' ? '超级管理员' : '用户' }}</small>
          </div>
          <el-button size="small" type="danger" text @click="logout">退出</el-button>
        </div>
      </el-header>
      <el-main class="layout-main">
        <slot />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-root {
  min-height: 100vh;
  background: #f5f7fb;
}
.layout-aside {
  background: #e6ecef;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 12px rgba(0,0,0,0.04);
}
.aside-head {
  height: 88px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.aside-head.center {
  justify-content: center;
}
.brand {
  display: flex;
  flex-direction: column;
}
.brand-cn {
  font-weight: 700;
  color: #4a5c6b;
  font-size: 18px;
}
.brand-en {
  font-size: 12px;
  color: #7c8a96;
}
.aside-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px 8px;
}
.aside-user .meta .name {
  margin: 0;
  color: #2f3b4c;
  font-weight: 600;
}
.aside-user .meta .role {
  font-size: 12px;
  color: #7a8a9a;
}
.aside-menu {
  flex: 1;
  border-right: none;
}
.collapse-switch {
  height: 48px;
  border-top: 1px solid rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  color: #5c6c7a;
}
.layout-header {
  background: linear-gradient(135deg, #b4c8ff 0%, #f3f6ff 100%);
  box-shadow: 0 2px 12px rgba(84,112,198,0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
}
.layout-header h1 {
  margin: 0;
  font-size: 20px;
  color: #304159;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-avatar {
  border: 2px solid rgba(255,255,255,0.7);
}
.header-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.header-name {
  font-weight: 600;
  color: #2f3b4c;
}
.layout-main {
  padding: 24px;
  min-height: calc(100vh - 80px);
  background: #f5f7fb;
}
</style>

