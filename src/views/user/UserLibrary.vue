<template>
  <div class="library">
    <div class="library-head">
      <div>
        <h1>馆藏书目</h1>
        <p>共 {{ books.length }} 本图书，挑一本带回家</p>
      </div>
      <div class="actions">
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
        <el-select v-model="status" class="filter" placeholder="全部状态">
          <el-option label="全部" value="all" />
          <el-option label="可借阅" value="available" />
          <el-option label="已借出" value="borrowed" />
        </el-select>
      </div>
    </div>

    <el-row :gutter="18">
      <el-col
        v-for="book in filtered"
        :key="book.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
      >
        <div class="book-card">
          <el-image :src="getCover(book.cover_url)" fit="cover" class="book-image">
            <template #error>
              <div class="book-image empty">No Cover</div>
            </template>
          </el-image>
          <div class="book-body">
            <h3>{{ book.title }}</h3>
            <p class="author">{{ book.author }}</p>
            <p class="publish">出版：{{ formatDateCN(book.publish_date) }}</p>
            <p class="price">定价：¥{{ formatPrice(book.price) }}</p>
            <p class="stock-info">{{ renderStock(book) }}</p>
            <p class="desc">{{ book.description || '这本书有点神秘，还没有简介~' }}</p>
            <div class="card-foot">
              <el-tag :type="renderStatusType(book)">
                {{ renderStatusText(book) }}
              </el-tag>
              <el-button
                size="small"
                type="primary"
                :disabled="!isBookAvailable(book) || loadingId === book.id"
                :loading="loadingId === book.id"
                @click="borrow(book.id)"
              >
                借阅
              </el-button>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import service from '../../utils/request'

const books = ref([])
const search = ref('')
const status = ref('all')
const priceMin = ref('')
const priceMax = ref('')
const loadingId = ref(null)

const fetchBooks = async () => {
  try {
    const data = await service.get('/books')
    books.value = Array.isArray(data)
      ? data.map(item => ({
          ...item,
          price: Number(item.price ?? 0),
          stock_total: Number(item.stock_total ?? 0),
          stock_available: Number(item.stock_available ?? item.available ?? 0)
        }))
      : []
  } catch (error) {
    console.error('获取图书列表失败:', error)
    books.value = []
  }
}

const DEFAULT_COVER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iMTQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxnIGZpbGw9Im5vbmUiIHN0cm9rZT0ibm9uZSI+CiAgICA8cmVjdCB3aWR0aD0iOTYiIGhlaWdodD0iMTQwIiBmaWxsPSIjZTRlN2ViIiByeD0iMTIiLz4KICAgIDxyZWN0IHg9IjAiIHk9IjMwIiB3aWR0aD0iOTYiIGhlaWdodD0iMTA5IiBmaWxsPSIjY2RmMWY2IiByeD0iMTIiLz4KICAgIDx0ZXh0IHg9IjQ4IiB5PSI3NSIgc3R5bGU9ImZvbnQtc2l6ZToxNnB4O2ZpbGw6I0E1QTVCQTtmb250LXdlaWdodDpib2xkOyIgZGV2LWNoYXJhY3Rlcj0iYmVhdCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tk8gQ09WRVI8L3RleHQ+CiAgPC9nPgo8L3N2Zz4='

const parsePrice = (value) => {
  if (value === '' || value === null || value === undefined) return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

const filtered = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  const min = parsePrice(priceMin.value)
  const max = parsePrice(priceMax.value)
  return books.value.filter(book => {
    const matchKeyword =
      !keyword ||
      (book.title || '').toLowerCase().includes(keyword) ||
      (book.author || '').toLowerCase().includes(keyword)
    const matchStatus =
      status.value === 'all' ||
      (status.value === 'available' && isBookAvailable(book)) ||
      (status.value === 'borrowed' && !isBookAvailable(book))
    const price = Number(book.price ?? 0)
    const matchMin = min === null || price >= min
    const matchMax = max === null || price <= max
    return matchKeyword && matchStatus && matchMin && matchMax
  })
})

const borrow = async (bookId) => {
  loadingId.value = bookId
  try {
    await service.post('/my/borrow', { book_id: bookId })
    ElMessage.success('借阅成功，记得按时归还哦～')
    await fetchBooks()
  } catch (error) {
    const errorMsg = error?.response?.data?.error || error?.message || error || '借阅失败，请稍后重试'
    ElMessage.error(errorMsg)
    console.error('借阅失败:', error)
  } finally {
    loadingId.value = null
  }
}

onMounted(fetchBooks)

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

const renderStock = (book) => {
  const total = Number(book.stock_total ?? 0)
  const available = Number(book.stock_available ?? 0)
  return `库存：${available}/${total}`
}

const isBookAvailable = (book) => Number(book.stock_available ?? 0) > 0

const renderStatusText = (book) => {
  const total = Number(book.stock_total ?? 0)
  const available = Number(book.stock_available ?? 0)
  if (total <= 0 || available >= total) return '全部在馆'
  if (available <= 0) return '全部借出'
  return '部分借出'
}

const renderStatusType = (book) => {
  const text = renderStatusText(book)
  if (text === '全部在馆') return 'success'
  if (text === '全部借出') return 'danger'
  return 'warning'
}
</script>

<style scoped>
.library {
  background: #fff;
  border-radius: 24px;
  padding: 24px 28px 32px;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
}
.library-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 18px;
}
.actions {
  display: flex;
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
.filter {
  width: 140px;
}
.book-card {
  background: #f9fafb;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  gap: 16px;
  height: 100%;
}
.book-image {
  width: 96px;
  height: 140px;
  border-radius: 12px;
  background: #e5e7eb;
}
.book-image.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #94a3b8;
}
.book-body h3 {
  margin: 0;
  font-size: 18px;
  color: #1f2937;
}
.author {
  margin: 6px 0;
  color: #9ca3af;
}
.price,
.stock-info {
  margin: 4px 0;
  color: #4b5563;
  font-size: 13px;
}
.desc {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 12px;
}
.card-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>

