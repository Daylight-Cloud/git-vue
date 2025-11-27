<template>
  <div class="login-root">
    <!-- 静态图片背景 -->
    <img class="bg-img" src="/login-bg.jpg" alt="bg" />

    <div class="glass-card">
      <div class="brand">
        <h1>图书管理系统</h1>
        <p>Knowledge Changes Destiny</p>
      </div>

      <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="onLogin">
        <el-form-item prop="username">
          <el-input v-model="form.username" size="large" placeholder="用户名" clearable>
            <template #prefix><el-icon class="input-icon"><User /></el-icon></template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="form.password" size="large" type="password" placeholder="密码" show-password clearable>
            <template #prefix><el-icon class="input-icon"><Lock /></el-icon></template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button native-type="submit" class="submit-btn" :loading="loading">
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="foot">
        <el-checkbox v-model="remember">记住我</el-checkbox>
        <el-button type="text" @click="goRegister">立即注册</el-button>
      </div>
    </div>

    <!-- 暗黑切换 -->
    <el-switch
      v-model="isDark"
      class="dark-switch"
      inline-prompt
      active-icon="Moon"
      inactive-icon="Sunny"
      @change="toggleDark"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import axios from 'axios'
import { useUserStore } from '../stores/user'

const router = useRouter()
const form = ref({ username: '', password: '' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}
const formRef = ref(null)
const loading = ref(false)
const remember = ref(false)

/* 暗黑状态：localStorage > 系统偏好 */
const isDark = ref(localStorage.getItem('dark') === '1' ? true : window.matchMedia('(prefers-color-scheme: dark)').matches)

const toggleDark = () => {
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('dark', isDark.value ? '1' : '0')
}

const userStore = useUserStore() // 初始化 userStore

const onLogin = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    const { data } = await axios.post('http://localhost:3000/login', form.value)
    const { token, user } = data || {}
    if (!token) {
      ElMessage.error('Token 获取失败')
      return
    }
    userStore.setAuth(token, user)
    ElMessage.success('登录成功')
    const target = user.role === 'admin' ? '/admin/dashboard' : '/user/home'
    router.push(target)
  } catch (e) {
    console.error('Login Error:', e)
    ElMessage.error(e.response?.data?.error || '登录失败')
  } finally {
    loading.value = false
  }
}


const goRegister = () => router.push('/register')

/* 回车登录（防抖） */
const onKeydown = e => {
  if (e.key === 'Enter') {
    e.stopPropagation()
    onLogin()
  }
}
onMounted(() => {
  toggleDark()
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.login-root {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  overflow: hidden;
}
/* 静态背景图 */
.bg-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}
.glass-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  padding: 40px 30px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.80);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
.brand {
  text-align: center;
  margin-bottom: 32px;
}
.brand h1 {
  font-size: 26px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}
.brand p {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}
/* 输入框呼吸灯 */
:deep(.el-input__wrapper) {
  border-radius: 20px;
  transition: box-shadow 0.3s;
}
:deep(.el-input__wrapper:focus-within) {
  box-shadow: 0 0 0 2px #667eea;
}
.input-icon {
  color: #a3a3a3;
}
.submit-btn {
  width: 100%;
  border-radius: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 0;
  transition: all 0.3s;
}
.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.35);
}
.foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -8px;
}
.dark-switch {
  position: absolute;
  top: 20px;
  right: 20px;
}
/* 暗黑变量 */
html.dark {
  background: #121212;
}
html.dark .glass-card {
  background: rgba(30, 30, 30, 0.70);
}
/* 小屏适配 */
@media (max-width: 480px) {
  .glass-card {
    margin: 16px;
  }
}
</style>