<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { House, Reading, Collection, User } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 生成本地头像（不依赖外部 API）
const generateLocalAvatar = (seed) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2']
  const colorIndex = (seed || '').charCodeAt(0) % colors.length
  const color = colors[colorIndex]
  const initial = (seed || 'U').charAt(0).toUpperCase()
  const svg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="${color}"/><text x="50" y="50" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dominant-baseline="central" font-weight="bold">${initial}</text></svg>`
  return 'data:image/svg+xml;base64,' + btoa(svg)
}

const profile = computed(() => ({
  username: userStore.profile?.nickname || userStore.profile?.username || '读者',
  avatar: userStore.profile?.avatar || generateLocalAvatar(userStore.profile?.username || 'reader'),
  role: userStore.profile?.role || 'user'
}))

const tabs = [
  { path: '/user/home', label: '首页', icon: House },
  { path: '/user/library', label: '图书馆', icon: Reading },
  { path: '/user/borrow', label: '借阅记录', icon: Collection },
  { path: '/user/profile', label: '个人中心', icon: User }
]

const activeTab = computed(() => route.path)

const go = (path) => {
  if (route.path !== path) router.push(path)
}

const logout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="user-shell">
    <header class="user-header">
      <div class="logo">
        <h1>📚 Library Hub</h1>
        <p>让每一本书都被看见</p>
      </div>
      <div class="user-info">
        <el-avatar :size="42" :src="profile.avatar" />
        <div class="meta">
          <strong>{{ profile.username }}</strong>
          <small>普通用户</small>
        </div>
        <el-button text type="danger" size="small" @click="logout">退出</el-button>
      </div>
    </header>

    <nav class="user-nav">
      <el-menu
        mode="horizontal"
        :default-active="activeTab"
        background-color="transparent"
        class="nav-menu"
        text-color="#6c7a89"
        active-text-color="#2f3b4c"
        @select="go"
      >
        <el-menu-item v-for="tab in tabs" :index="tab.path" :key="tab.path">
          <el-icon><component :is="tab.icon" /></el-icon>
          <span>{{ tab.label }}</span>
        </el-menu-item>
      </el-menu>
    </nav>

    <main class="user-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.user-shell {
  min-height: 100vh;
  background: linear-gradient(180deg, #eff3ff 0%, #fefefe 80%);
  display: flex;
  flex-direction: column;
}
.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 40px 12px;
}
.logo h1 {
  margin: 0;
  font-size: 24px;
  color: #2f3b4c;
}
.logo p {
  margin: 0;
  color: #8b9ab2;
  font-size: 13px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-info .meta {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}
.user-nav {
  padding: 0 32px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.nav-menu {
  border-bottom: none !important;
}
.user-main {
  flex: 1;
  padding: 32px 40px 48px;
}
@media (max-width: 768px) {
  .user-header {
    flex-direction: column;
    gap: 16px;
  }
  .user-nav {
    padding: 0 16px;
  }
  .user-main {
    padding: 24px 16px 48px;
  }
}
</style>

