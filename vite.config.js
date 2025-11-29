import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/library/', // ⚠ 注意末尾 /
  server: {
    proxy: {
      '/api': {
        target: 'http://101.42.169.71:3000',
        changeOrigin: true
      }
    }
  }
})