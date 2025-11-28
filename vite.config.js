import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/library',
  server: {
    proxy: {
      '/api': {
        target: 'http://101.42.169.71:3000',
        changeOrigin: true ,
        // 保留 /api 前缀，因为后端路由都是 /api/*
      }
    }
  }
})