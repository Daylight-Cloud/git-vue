<template>
  <div class="books-root">
    <div class="books-head">
      <div>
        <h1>图书管理</h1>
        <p>维护图书信息、封面与库存状态</p>
      </div>
      <div class="books-actions">
        <el-input
          v-model="search"
          placeholder="搜索书名 / 作者"
          class="search-input"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <div class="price-filter">
          <el-input
            v-model="priceMin"
            type="number"
            min="0"
            placeholder="最低价"
            clearable
            class="price-input"
          />
          <span class="price-divider">-</span>
          <el-input
            v-model="priceMax"
            type="number"
            min="0"
            placeholder="最高价"
            clearable
            class="price-input"
          />
        </div>
        <el-button type="primary" @click="openAddDialog">
          <el-icon><Plus /></el-icon>新增图书
        </el-button>
      </div>
    </div>

    <el-table :data="paginatedBooks" class="books-table" stripe>
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column label="封面" width="80">
        <template #default="{ row }">
          <el-image
            :src="getCover(row.cover_url)"
            fit="cover"
            class="book-cover"
            :preview-src-list="[getCover(row.cover_url)]"
          >
            <template #error>
              <div class="cover-fallback">No Cover</div>
            </template>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="书名" min-width="160">
        <template #default="{ row }">
          <div class="book-title">{{ row.title }}</div>
          <p class="book-desc">{{ row.description || '暂无简介' }}</p>
        </template>
      </el-table-column>
      <el-table-column prop="author" label="作者" width="120" />
      <el-table-column label="出版日期" width="130">
        <template #default="{ row }">
          {{ formatDateCN(row.publish_date) }}
        </template>
      </el-table-column>
      <el-table-column label="价格" width="100">
        <template #default="{ row }">
          ¥{{ formatPrice(row.price) }}
        </template>
      </el-table-column>
      <el-table-column label="库存/状态" width="180">
        <template #default="{ row }">
          <div class="stock-status-cell">
            <div class="stock-info">{{ renderStock(row) }}</div>
            <el-tag 
              size="small" 
              :type="renderStatusType(row)"
              class="status-tag-inline"
            >
              {{ renderStatusText(row) }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <div class="action-cell">
            <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-popconfirm title="确认删除该图书？" @confirm="deleteBook(row.id)">
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <book-dialog
      v-model="dialogVisible"
      :isEdit="isEdit"
      :formData="currentBook"
      @submit="handleDialogSubmit"
    />

    <div class="pagination">
      <el-pagination
        layout="prev, pager, next"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="filteredBooks.length"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import service from '../utils/request'
import BookDialog from '../components/BookDialog.vue'

const books = ref([])
const search = ref('')
const priceMin = ref('')
const priceMax = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentBook = ref(null)

const DEFAULT_COVER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZyBmaWxsPSJub25lIiBzdHJva2U9Im5vbmUiPgogICAgPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxNjAiIGZpbGw9IiNGNUY3RkIiLz4KICAgIDxyZWN0IHg9IjAiIHk9IjQwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI0Q2RTdGRSIvPgogICAgPHBhdGggZD0iTTIwIDQwIEw2MCAyMCBMIDEwMCA0MCIgZmlsbD0iI0Y1QjQ4QyIgZmlsbC1vcGFjaXR5PSIwLjgiLz4KICAgIDx0ZXh0IHg9IjYwIiB5PSIxMTEiIGZpbGw9IiM0QjNCNEMiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5PIENPVkVSPC90ZXh0PgogIDwvZz4KPC9zdmc+'

const fetchBooks = async () => {
  const res = await service.get('/books')
  books.value = Array.isArray(res)
    ? res.map(item => ({
        ...item,
        price: Number(item.price ?? 0),
        stock_total: Number(item.stock_total ?? 0),
        stock_available: Number(item.stock_available ?? 0)
      }))
    : []
}

const parsePrice = (value) => {
  if (value === '' || value === null || value === undefined) return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

const filteredBooks = computed(() => {
  const min = parsePrice(priceMin.value)
  const max = parsePrice(priceMax.value)
  const keyword = search.value.trim().toLowerCase()
  return books.value.filter(b => {
    const title = (b.title || '').toLowerCase()
    const author = (b.author || '').toLowerCase()
    const price = Number(b.price ?? 0)
    const matchKeyword = keyword
      ? title.includes(keyword) || author.includes(keyword)
      : true
    const matchMin = min === null || price >= min
    const matchMax = max === null || price <= max
    return matchKeyword && matchMin && matchMax
  })
})

const openAddDialog = () => {
  isEdit.value = false
  currentBook.value = null
  dialogVisible.value = true
}

const openEditDialog = (book) => {
  isEdit.value = true
  currentBook.value = { ...book }
  dialogVisible.value = true
}

const normalizeDate = (value) => {
  if (!value) return null
  if (typeof value === 'string') return value.slice(0, 10)
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return value
}

const handleDialogSubmit = async (book) => {
  try {
    const payload = {
      title: book.title,
      author: book.author,
      publish_date: normalizeDate(book.publish_date),
      description: book.description?.trim() || '',
      price: Number(book.price ?? 0),
      stock_total: Number(book.stock_total ?? 0),
      stock_available: Math.min(
        Number(book.stock_available ?? book.stock_total ?? 0),
        Number(book.stock_total ?? 0)
      ),
      cover_data: book.cover_data || book.cover_preview || null
    }
    const targetId = book.id || currentBook.value?.id
    if (isEdit.value && targetId) {
      await service.put(`/books/${targetId}`, payload)
      ElMessage.success('图书信息已更新')
    } else {
      await service.post('/books', payload)
      ElMessage.success('新增图书成功')
    }
    dialogVisible.value = false
    fetchBooks()
  } catch (e) {
    ElMessage.error(e || '操作失败')
  }
}

const deleteBook = async (id) => {
  await service.delete(`/books/${id}`)
  ElMessage.success('删除成功')
  fetchBooks()
}

const getCover = (url) => url || DEFAULT_COVER

const formatDateCN = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}年${m}月${d}日`
}

const formatPrice = (value) => (Number(value || 0)).toFixed(2)

const renderStock = (row) => {
  const total = Number(row.stock_total ?? 0)
  const available = Number(row.stock_available ?? 0)
  return `总数：${total} | 可借：${available}`
}

const renderStatusText = (row) => {
  const total = Number(row.stock_total ?? 0)
  const available = Number(row.stock_available ?? 0)
  if (total <= 0 || available >= total) return '全部在馆'
  if (available <= 0) return '全部借出'
  return '部分借出'
}

const renderStatusType = (row) => {
  const text = renderStatusText(row)
  if (text === '全部在馆') return 'success'
  if (text === '全部借出') return 'danger'
  return 'warning'
}

const pageSize = 8
const currentPage = ref(1)

const paginatedBooks = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredBooks.value.slice(start, start + pageSize)
})

const handlePageChange = (page) => {
  currentPage.value = page
}

onMounted(fetchBooks)
</script>

<style scoped>
.books-root {
  background: #fff;
  border-radius: 24px;
  padding: 24px 28px 32px;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
}
.books-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
}
.books-head h1 {
  margin: 0;
  font-size: 24px;
  color: #1f2a37;
}
.books-head p {
  margin: 6px 0 0;
  color: #8c9baa;
  font-size: 14px;
}
.books-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.search-input {
  width: 220px;
}
.price-filter {
  display: flex;
  align-items: center;
  gap: 6px;
}
.price-input {
  width: 110px;
}
.price-divider {
  color: #9aa5b5;
}
.books-table {
  margin-top: 24px;
  border-radius: 18px;
  overflow: hidden;
}
.book-cover {
  width: 56px;
  height: 74px;
  border-radius: 6px;
  overflow: hidden;
  background: #f4f6fb;
}
.cover-fallback {
  width: 56px;
  height: 74px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef2ff;
  color: #7886d7;
  font-size: 11px;
  border-radius: 6px;
}
.book-title {
  font-weight: 600;
  color: #2f3b4c;
  font-size: 14px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.book-desc {
  margin: 0;
  color: #93a1b5;
  font-size: 12px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.stock-status-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.stock-info {
  font-size: 13px;
  color: #2f3b4c;
  line-height: 1.4;
}
.status-tag-inline {
  width: fit-content;
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