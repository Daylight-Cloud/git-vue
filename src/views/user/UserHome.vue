<template>
  <div class="user-home">
    <section class="hero-card">
      <div>
        <p class="subtitle">嗨，{{ profile?.nickname || profile?.username || '书友' }}</p>
        <h1>欢迎来到你的知识宇宙</h1>
        <p class="desc">查看借阅进度、发现好书，开启今天的阅读旅程。</p>
      </div>
      <div class="hero-illustration">📚</div>
    </section>

    <section class="stat-grid">
      <div class="stat-card" v-for="item in statCards" :key="item.label">
        <p>{{ item.label }}</p>
        <h2>{{ item.value }}</h2>
        <small>{{ item.tip }}</small>
      </div>
    </section>

    <section class="recent-section">
      <div class="sec-head">
        <h2>最近借阅</h2>
        <el-button link type="primary" @click="$router.push('/user/borrow')">查看全部</el-button>
      </div>
      <el-empty v-if="!recentBorrow.length" description="暂无借阅记录" />
      <el-timeline v-else>
        <el-timeline-item
          v-for="item in recentBorrow"
          :key="item.id"
          :timestamp="formatDate(item.borrow_date)"
          :type="item.status === 'borrowed' ? 'warning' : 'success'"
        >
          <div class="timeline-row">
            <div>
              <strong>{{ item.book_title }}</strong>
              <p>{{ item.status === 'borrowed' ? '借阅中' : '已归还' }}</p>
            </div>
            <el-image :src="item.cover_url" fit="cover" class="timeline-cover">
              <template #error>
                <div class="timeline-cover empty">No Cover</div>
              </template>
            </el-image>
          </div>
        </el-timeline-item>
      </el-timeline>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import service from '../../utils/request'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()
const stats = ref({ borrowing: 0, returned: 0, totalBooks: 0 })
const recentBorrow = ref([])

const profile = computed(() => userStore.profile)

const statCards = computed(() => [
  { label: '在借图书', value: stats.value.borrowing, tip: '还书别忘记哦～' },
  { label: '已读完', value: stats.value.returned, tip: '阅读路上的脚印' },
  { label: '馆藏总量', value: stats.value.totalBooks, tip: '探索新的书籍' }
])

const formatDate = (date) => date ? new Date(date).toLocaleDateString() : '--'

const fetchStats = async () => {
  try {
    stats.value = await service.get('/my/stats')
  } catch (error) {
    console.error('获取统计数据失败:', error)
    stats.value = { borrowing: 0, returned: 0, totalBooks: 0 }
  }
}

const fetchRecent = async () => {
  try {
    const data = await service.get('/my/borrow')
    recentBorrow.value = Array.isArray(data) ? data.slice(0, 4) : []
  } catch (error) {
    console.error('获取借阅记录失败:', error)
    recentBorrow.value = []
  }
}

onMounted(async () => {
  try {
    if (!userStore.profile) {
      await userStore.fetchProfile()
    }
    await Promise.all([fetchStats(), fetchRecent()])
  } catch (error) {
    console.error('初始化失败:', error)
  }
})
</script>

<style scoped>
.user-home {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.hero-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 28px;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.15);
  overflow: hidden;
}
.hero-card h1 {
  margin: 8px 0;
  font-size: 28px;
  color: #1e293b;
}
.hero-card .desc {
  color: #76839b;
  margin: 0;
}
.hero-illustration {
  font-size: 120px;
  line-height: 1;
  opacity: 0.8;
}
.subtitle {
  color: #94a3b8;
  margin: 0;
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}
.stat-card {
  background: #fff;
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
}
.stat-card p {
  margin: 0;
  color: #94a3b8;
}
.stat-card h2 {
  margin: 6px 0;
  font-size: 32px;
  color: #0f172a;
}
.stat-card small {
  color: #7c8a9a;
}
.recent-section {
  background: #fff;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
}
.sec-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.timeline-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.timeline-row p {
  margin: 4px 0 0;
  color: #94a3b8;
}
.timeline-cover {
  width: 52px;
  height: 70px;
  border-radius: 8px;
  background: #f1f5f9;
}
.timeline-cover.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  color: #94a3b8;
}
@media (max-width: 768px) {
  .hero-card {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  .hero-card img {
    max-width: 80%;
  }
}
</style>

