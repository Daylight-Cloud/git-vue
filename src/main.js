import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from './stores/user'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('./views/Login.vue'), meta: { layout: 'blank' } },
  { path: '/register', component: () => import('./views/Register.vue'), meta: { layout: 'blank' } },
  { path: '/admin', redirect: '/admin/dashboard' },
  { path: '/admin/dashboard', component: () => import('./views/Dashboard.vue'), meta: { layout: 'admin', requiresAdmin: true } },
  { path: '/admin/books', component: () => import('./views/Books.vue'), meta: { layout: 'admin', requiresAdmin: true } },
  { path: '/admin/borrow', component: () => import('./views/Borrow.vue'), meta: { layout: 'admin', requiresAdmin: true } },
  { path: '/admin/users', component: () => import('./views/Users.vue'), meta: { layout: 'admin', requiresAdmin: true } },
  { path: '/user', redirect: '/user/home' },
  { path: '/user/home', component: () => import('./views/user/UserHome.vue'), meta: { layout: 'user', requiresUser: true } },
  { path: '/user/library', component: () => import('./views/user/UserLibrary.vue'), meta: { layout: 'user', requiresUser: true } },
  { path: '/user/borrow', component: () => import('./views/user/UserBorrow.vue'), meta: { layout: 'user', requiresUser: true } },
  { path: '/user/profile', component: () => import('./views/user/UserProfile.vue'), meta: { layout: 'user', requiresUser: true } },
  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, _from, next) => {
  const whiteList = ['/login', '/register']
  const token = localStorage.getItem('token')
  const store = useUserStore()

  if (whiteList.includes(to.path)) {
    if (token) {
      // 进入登录/注册页时强制清除旧登录态，确保先登录
      store.logout()
    }
    return next()
  }

  if (!token) {
    return next('/login')
  }

  try {
    if (!store.profile) {
      await store.fetchProfile()
    }
  } catch (error) {
    console.error('获取用户信息失败', error)
    store.logout()
    ElMessage.error('登录状态已失效，请重新登录')
    return next('/login')
  }

  const role = store.role
  if (to.meta.requiresAdmin && role !== 'admin') {
    return next('/user/home')
  }
  if (to.meta.requiresUser && role === 'admin') {
    return next('/admin/dashboard')
  }
  next()
})

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

const pinia = createPinia()

app.use(pinia)
app.use(ElementPlus)
app.use(router)

app.mount('#app')