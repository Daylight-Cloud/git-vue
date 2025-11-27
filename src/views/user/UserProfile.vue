<template>
  <div class="profile">
    <section class="profile-card">
      <div class="avatar-wrap">
        <el-avatar :size="100" :src="form.avatar" />
        <div class="avatar-actions">
          <el-upload
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*"
            @change="onAvatarChange"
          >
            <el-button>本地上传</el-button>
          </el-upload>
          <el-button text type="primary" @click="randomAvatar">使用系统头像</el-button>
        </div>
      </div>
      <div class="info">
        <h2>{{ form.nickname || form.username }}</h2>
        <p>@{{ form.username }}</p>
        <el-tag type="info">普通用户</el-tag>
      </div>
    </section>

    <section class="profile-form">
      <h3>基本资料</h3>
      <el-form :model="form" label-width="90px">
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="name@example.com" />
        </el-form-item>
        <el-form-item label="手机">
          <el-input v-model="form.phone" placeholder="137****" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="onSave">保存</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </section>

    <section class="profile-form">
      <h3>密码管理</h3>
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordRef" label-width="90px">
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input v-model="passwordForm.currentPassword" type="password" autocomplete="off" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" autocomplete="off" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" autocomplete="off" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="changePassword">修改密码</el-button>
        </el-form-item>
      </el-form>
    </section>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../stores/user'
import service from '../../utils/request'

const userStore = useUserStore()
const form = reactive({
  username: '',
  nickname: '',
  avatar: '',
  avatar_data: '',
  email: '',
  phone: ''
})
const saving = ref(false)
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordRef = ref(null)

// 生成本地头像（不依赖外部 API）
const generateLocalAvatar = (seed) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2']
  const colorIndex = (seed || '').charCodeAt(0) % colors.length
  const color = colors[colorIndex]
  const initial = (seed || 'U').charAt(0).toUpperCase()
  const svg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="${color}"/><text x="50" y="50" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dominant-baseline="central" font-weight="bold">${initial}</text></svg>`
  return 'data:image/svg+xml;base64,' + btoa(svg)
}

const fillForm = (profile) => {
  if (!profile) return
  form.username = profile.username
  form.nickname = profile.nickname
  form.avatar = profile.avatar || generateLocalAvatar(profile.username)
  form.avatar_data = ''
  form.email = profile.email
  form.phone = profile.phone
}

const loadProfile = async () => {
  const data = await userStore.fetchProfile()
  fillForm(data)
}

const randomAvatar = () => {
  const avatar = generateLocalAvatar(Date.now().toString())
  form.avatar = avatar
}

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const onAvatarChange = async (uploadFile) => {
  if (!uploadFile || !uploadFile.raw) return
  const dataUrl = await readFile(uploadFile.raw)
  form.avatar = dataUrl
}

const onSave = async () => {
  saving.value = true
  try {
    await service.put('/me', {
      avatar: form.avatar,
      nickname: form.nickname,
      email: form.email,
      phone: form.phone
    })
    await userStore.fetchProfile()
    ElMessage.success('资料已更新')
  } finally {
    saving.value = false
  }
}

const reset = () => {
  if (userStore.profile) {
    fillForm(userStore.profile)
  }
}

const passwordRules = {
  currentPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const changePassword = () => {
  passwordRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      await service.put('/me/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      ElMessage.success('密码已更新')
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    } catch (error) {
      ElMessage.error(error || '修改密码失败')
    }
  })
}

onMounted(async () => {
  if (!userStore.profile) {
    await loadProfile()
  } else {
    fillForm(userStore.profile)
  }
})
</script>

<style scoped>
.profile {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) 2fr;
  gap: 24px;
}
.profile-card,
.profile-form {
  background: #fff;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
}
.avatar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.info {
  text-align: center;
}
.info h2 {
  margin: 12px 0 4px;
}
.profile-form h3 {
  margin: 0 0 16px;
  color: #1f2937;
}
@media (max-width: 900px) {
  .profile {
    grid-template-columns: 1fr;
  }
}
</style>

