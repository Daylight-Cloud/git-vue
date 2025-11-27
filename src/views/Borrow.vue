<template>
  <div class="borrow-root">
    <div class="borrow-head">
      <div>
        <h1>借阅管理</h1>
        <p>可视化掌握借阅情况，快速审批借还</p>
      </div>
      <el-button type="primary" @click="openDialog">
        <el-icon><Plus /></el-icon> 发起借阅
      </el-button>
    </div>

    <el-table :data="paginatedRecords" class="borrow-table" stripe>
      <el-table-column type="index" :index="indexMethod" label="序号" width="60" />
      <el-table-column label="书籍" min-width="180">
        <template #default="{ row }">
          <div class="book-cell">
            <el-image :src="getCover(row.cover_url)" fit="cover" class="cover-mini">
              <template #error>
                <div class="cover-mini empty">No Cover</div>
              </template>
            </el-image>
            <div class="book-info">
              <div class="book-name">{{ row.book_title }}</div>
              <el-tag 
                size="small" 
                :type="row.status === 'borrowed' ? 'warning' : 'success'"
                class="status-tag"
              >
                {{ row.status === 'borrowed' ? '借出中' : '已归还' }}
              </el-tag>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="借阅人" min-width="140">
        <template #default="{ row }">
          <div class="user-cell">
            <el-avatar :src="getAvatar(row.avatar, row.username)" size="small" />
            <div class="user-info">
              <div class="username">{{ row.username }}</div>
              <small class="user-email">{{ row.email || '—' }}</small>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="借出时间" width="160">
        <template #default="{ row }">
          <div class="time-cell">{{ formatDateTime(row.borrow_date) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="归还时间" width="160">
        <template #default="{ row }">
          <div class="time-cell">{{ row.return_date ? formatDateTime(row.return_date) : '未归还' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <div class="action-cell">
            <el-button
              size="small"
              type="success"
              v-if="row.status === 'borrowed'"
              @click="returnBook(row.id)"
            >
              设为已还
            </el-button>
            <el-popconfirm title="确认删除该记录？" @confirm="deleteRecord(row.id)">
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        layout="prev, pager, next"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="records.length"
        @current-change="handlePageChange"
      />
    </div>

    <el-dialog v-model="dialogVisible" title="借出图书" width="420px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="选择图书">
          <el-select v-model="form.book_id" placeholder="请选择图书" filterable>
            <el-option
              v-for="book in availableBooks"
              :key="book.id"
              :label="book.title"
              :value="book.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="借阅用户">
          <el-select v-model="form.user_id" placeholder="请选择用户" filterable>
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="user.username"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!form.book_id || !form.user_id" @click="onSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import service from '../utils/request'

const records = ref([])
const books = ref([])
const users = ref([])
const dialogVisible = ref(false)
const form = ref({ book_id: '', user_id: '' })
const pageSize = 8
const currentPage = ref(1)

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return records.value.slice(start, start + pageSize)
})

const fetchRecords = async () => {
  const res = await service.get('/borrow')
  records.value = Array.isArray(res) ? res : []
}
const fetchBooks = async () => {
  const res = await service.get('/books')
  books.value = Array.isArray(res) ? res : []
}
const fetchUsers = async () => {
  const res = await service.get('/users')
  users.value = Array.isArray(res) ? res : []
}

const DEFAULT_COVER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGc+PHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjY0IiByeD0iOCIgc3R5bGU9ImZpbGw6I0VFRjJGRiIgLz48cGF0aCBkPSJNMCAyMCBMIDQ4IDIwIEwgNDggNDQiIHN0eWxlPSJmaWxsOiNDREU0RkYiIC8+PHRleHQgeD0iMjQiIHk9IjM3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBzdHlsZT0iZmlsbDojOTRBO0ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1mYW1pbHk6QXJpYWw7Zm9udC1zaXplOjEycHgiPk5PIENPVkVSPC90ZXh0PjwvZz48L3N2Zz4='

const availableBooks = computed(() =>
  books.value.filter(book => Number(book.stock_available ?? book.available ?? 0) > 0)
)

const openDialog = () => {
  form.value = { book_id: '', user_id: '' }
  dialogVisible.value = true
}

const onSubmit = async () => {
  await service.post('/borrow', form.value)
  ElMessage.success('借阅记录已创建')
  dialogVisible.value = false
  fetchRecords()
  fetchBooks()
}

const returnBook = async (id) => {
  await service.put(`/borrow/${id}/return`)
  ElMessage.success('归还成功')
  fetchRecords()
  fetchBooks()
}

const deleteRecord = async (id) => {
  await service.delete(`/borrow/${id}`)
  ElMessage.success('记录已删除')
  fetchRecords()
}

onMounted(() => {
  fetchRecords()
  fetchBooks()
  fetchUsers()
})

const getCover = (url) => url || DEFAULT_COVER

const getAvatar = (avatar, username = '') => {
  if (avatar) return avatar
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2']
  const colorIndex = (username || 'U').charCodeAt(0) % colors.length
  const color = colors[colorIndex]
  const initial = (username || 'U').charAt(0).toUpperCase()
  const svg = `<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="20" fill="${color}"/><text x="20" y="23" font-size="18" fill="white" font-family="Arial" font-weight="bold" text-anchor="middle">${initial}</text></svg>`
  return 'data:image/svg+xml;base64,' + btoa(svg)
}

const formatDateTime = (value) => {
  if (!value || value === 'null' || value === 'NULL' || value === null) return '—'
  // 处理数据库返回的字符串格式 'YYYY-MM-DD HH:mm:ss'
  let date
  if (typeof value === 'string' && value.includes(' ')) {
    // 如果是字符串格式，直接解析
    date = new Date(value.replace(/-/g, '/'))
  } else {
    date = new Date(value)
  }
  if (Number.isNaN(date.getTime())) {
    console.warn('无效的日期值:', value)
    return '—'
  }
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  const hh = `${date.getHours()}`.padStart(2, '0')
  const mm = `${date.getMinutes()}`.padStart(2, '0')
  const ss = `${date.getSeconds()}`.padStart(2, '0')
  return `${y}年${m}月${d}日 ${hh}:${mm}:${ss}`
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const indexMethod = (index) => (currentPage.value - 1) * pageSize + index + 1
</script>

<style scoped>
.borrow-root {
  background: #fff;
  border-radius: 24px;
  padding: 24px 28px 32px;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
}
.borrow-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}
.borrow-head h1 {
  margin: 0;
  font-size: 24px;
  color: #1f2a37;
}
.borrow-head p {
  margin: 6px 0 0;
  color: #8c9baa;
  font-size: 14px;
}
.borrow-table {
  border-radius: 18px;
  overflow: hidden;
}
.book-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.cover-mini {
  width: 40px;
  height: 54px;
  border-radius: 6px;
  background: #f4f6fb;
  flex-shrink: 0;
}
.cover-mini.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 10px;
  color: #94a3b8;
}
.book-info {
  flex: 1;
  min-width: 0;
}
.book-name {
  font-weight: 600;
  color: #2f3b4c;
  font-size: 14px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.status-tag {
  margin-top: 4px;
}
.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.user-info {
  flex: 1;
  min-width: 0;
}
.username {
  font-weight: 500;
  color: #2f3b4c;
  font-size: 14px;
  margin-bottom: 2px;
}
.user-email {
  color: #94a3b8;
  font-size: 12px;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.time-cell {
  font-size: 13px;
  color: #2f3b4c;
  line-height: 1.5;
}
.action-cell {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>