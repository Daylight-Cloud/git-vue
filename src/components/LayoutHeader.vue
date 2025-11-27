<template>
  <el-header class="header">
    <div class="left">图书管理系统</div>

    <div class="right">
      <span class="nick">Hi，{{ username }}</span>
      <el-button type="danger" size="small" link @click="onLogout">退出</el-button>
    </div>
  </el-header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

/* 从 token 里解析用户名（可选） */
const username = computed(() =>
  userStore.token
    ? JSON.parse(atob(userStore.token.split('.')[1]))?.username || 'User'
    : 'Guest'
)

/* 一键退出 */
const onLogout = () => {
  userStore.logout()          // 清空 token & role
  ElMessage.success('已退出')
  router.push('/login')       // 回到登录页
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #409eff;
  color: #fff;
}
.nick {
  margin-right: 12px;
}
</style>