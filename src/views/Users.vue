<template>
  <div class="users-root">
    <h1 class="users-title">用户管理</h1>
    <el-button type="primary" @click="openAddDialog" style="margin-bottom: 16px;">新增用户</el-button>
    <el-table :data="paginatedUsers" style="width: 100%; border-radius: 12px;">
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column label="用户" min-width="240">
        <template #default="{ row }">
          <div class="user-cell">
            <el-avatar :size="38" :src="row.avatar || generateLocalAvatar(row.username)" />
            <div>
              <div class="name">{{ row.nickname || row.username }}</div>
              <small class="account">@{{ row.username }}</small>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="email" label="邮箱" min-width="220">
        <template #default="{ row }">
          {{ row.email || '—' }}
        </template>
      </el-table-column>
      <el-table-column prop="role" label="角色" width="120" />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteUser(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination
        layout="prev, pager, next"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="users.length"
        @current-change="handlePageChange"
      />
    </div>
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑用户' : '新增用户'" width="460px">
      <el-form :model="form" ref="formRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" autocomplete="off" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="user@example.com" />
        </el-form-item>
        <el-form-item label="头像">
          <div class="avatar-field">
            <el-upload
              :auto-upload="false"
              :show-file-list="false"
              accept="image/*"
              @change="onAvatarChange"
            >
              <el-button type="primary">选择头像</el-button>
            </el-upload>
            <div class="avatar-preview">
              <el-avatar :size="60" :src="form.avatar_preview || generateLocalAvatar(form.username)" />
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import service from '../utils/request'

const users = ref([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const currentId = ref(null);
const formRef = ref(null);
const form = ref({ username: '', role: 'user', email: '', avatar_data: '', avatar_preview: '' });
const pageSize = 8
const currentPage = ref(1)

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return users.value.slice(start, start + pageSize)
})

const generateLocalAvatar = (seed = 'user') => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2']
  const colorIndex = (seed || 'u').charCodeAt(0) % colors.length
  const color = colors[colorIndex]
  const initial = (seed || 'U').charAt(0).toUpperCase()
  const svg = `<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="30" fill="${color}"/><text x="30" y="35" font-size="24" fill="white" font-family="Arial" font-weight="bold" text-anchor="middle">${initial}</text></svg>`
  return 'data:image/svg+xml;base64,' + btoa(svg)
}

const fetchUsers = async () => {
  const res = await service.get('/users');
  users.value = Array.isArray(res) ? res : [];
};

const resetForm = () => {
  form.value = { username: '', role: 'user', email: '', avatar_data: '', avatar_preview: '' };
};

const openAddDialog = () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

const openEditDialog = (user) => {
  isEdit.value = true;
  currentId.value = user.id;
  form.value = {
    username: user.username,
    role: user.role,
    email: user.email || '',
    avatar_data: '',
    avatar_preview: user.avatar || ''
  };
  dialogVisible.value = true;
};

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const onAvatarChange = async (uploadFile) => {
  if (!uploadFile || !uploadFile.raw) return;
  const dataUrl = await readFile(uploadFile.raw);
  form.value.avatar_preview = dataUrl;
  form.value.avatar_data = dataUrl;
};

const onSubmit = async () => {
  const payload = {
    username: form.value.username,
    role: form.value.role,
    email: form.value.email,
    avatar: form.value.avatar_data || form.value.avatar_preview
  };
  if (isEdit.value) {
    await service.put(`/users/${currentId.value}`, payload);
  } else {
    await service.post('/users', payload);
  }
  dialogVisible.value = false;
  fetchUsers();
};

const deleteUser = async (id) => {
  await service.delete(`/users/${id}`);
  fetchUsers();
};

onMounted(fetchUsers);

const handlePageChange = (page) => {
  currentPage.value = page
}
</script>

<style scoped>
.users-root {
  width: 100%;
  min-height: 100%;
  margin: 0;
  padding: 0;
}
.users-title {
  color: #7a9eb1;
  margin-bottom: 24px;
  margin-top: 0;
}
.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-cell .name {
  font-weight: 600;
  color: #2f3b4c;
}
.user-cell .account {
  color: #93a1b5;
}
.avatar-field {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar-preview {
  display: flex;
  align-items: center;
  justify-content: center;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style> 