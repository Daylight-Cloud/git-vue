<template>
  <div class="user-borrow">
    <div class="borrow-head">
      <div>
        <h1>我的借阅</h1>
        <p>跟踪借阅进度，记录每一次相遇</p>
      </div>
      <el-button type="primary" @click="$router.push('/user/library')">去借书</el-button>
    </div>

    <el-table :data="records" class="borrow-table" stripe>
      <el-table-column label="图书" min-width="220">
        <template #default="{ row }">
          <div class="book-cell">
            <el-image :src="getCover(row.cover_url)" fit="cover" class="cover-mini">
              <template #error>
                <div class="cover-mini empty">No Cover</div>
              </template>
            </el-image>
            <div>
              <div class="book-name">{{ row.book_title }}</div>
              <small class="book-date">借出时间：{{ formatDateTime(row.borrow_date) }}</small>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="归还时间" min-width="200">
        <template #default="{ row }">
          {{ row.return_date ? formatDateTime(row.return_date) : '—' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="row.status === 'borrowed' ? 'warning' : 'success'">
            {{ row.status === 'borrowed' ? '借出中' : '已归还' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'borrowed'"
            size="small"
            type="success"
            :loading="loadingId === row.id"
            @click="returnBook(row.id)"
          >
            归还
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import service from '../../utils/request'

const records = ref([])
const loadingId = ref(null)

const DEFAULT_COVER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGc+PHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjY0IiByeD0iOCIgc3R5bGU9ImZpbGw6I0VFRjJGRiIgLz48cGF0aCBkPSJNMCAyMCBMIDQ4IDIwIEwgNDggNDQiIHN0eWxlPSJmaWxsOiNDREU0RkYiIC8+PHRleHQgeD0iMjQiIHk9IjM3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBzdHlsZT0iZmlsbDojOTRBO0ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1mYW1pbHk6QXJpYWw7Zm9udC1zaXplOjEycHgiPk5PIENPVkVSPC90ZXh0PjwvZz48L3N2Zz4='

const fetchRecords = async () => {
  try {
    const data = await service.get('/my/borrow')
    records.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('获取借阅记录失败:', error)
    records.value = []
  }
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

const returnBook = async (id) => {
  loadingId.value = id
  try {
    await service.put(`/my/borrow/${id}/return`)
    ElMessage.success('已归还')
    fetchRecords()
  } finally {
    loadingId.value = null
  }
}

onMounted(fetchRecords)

const getCover = (url) => url || DEFAULT_COVER
</script>

<style scoped>
.user-borrow {
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
.borrow-table {
  border-radius: 18px;
  overflow: hidden;
}
.book-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cover-mini {
  width: 48px;
  height: 64px;
  border-radius: 8px;
  background: #f4f6fb;
}
.cover-mini.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #94a3b8;
  font-size: 12px;
}
.book-name {
  font-weight: 600;
  color: #2f3b4c;
}
.book-date {
  color: #94a3b8;
}
</style>

