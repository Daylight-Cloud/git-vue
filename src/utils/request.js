import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'

// 创建一个 Axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3000/api',
  timeout: 10000
})

// 请求拦截器：自动带 token
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')  // 从 localStorage 获取 token
    if (token) {
      // 如果 token 存在，自动添加 Authorization 头部
      config.headers.Authorization = `Bearer ${token}`
    }
    return config  // 返回请求配置
  },
  (error) => {
    return Promise.reject(error)  // 请求错误时直接返回错误
  }
)

// 响应拦截器：统一错误提示 & 401 跳登录
service.interceptors.response.use(
  (response) => {
    // 只返回数据部分，去掉其他不需要的响应内容
    return response.data
  },
  (error) => {
    // 获取错误信息
    const msg = error.response?.data?.error || '网络错误'

    if (error.response?.status === 401) {
      // 如果是 401 错误，表示 token 失效，清除 token 并跳转到登录页面
      try {
        const store = useUserStore()
        store.logout()
      } catch (_) {
        localStorage.removeItem('token')
      }
      window.location.replace('/login')  // 跳转到登录页
    } else {
      // 其他错误弹出提示
      ElMessage.error(msg)
    }

    return Promise.reject(msg)  // 返回错误信息
  }
)

export default service
