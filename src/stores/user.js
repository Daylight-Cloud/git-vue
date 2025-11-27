import { defineStore } from 'pinia'
import { ref } from 'vue'
import service from '../utils/request'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const role  = ref(localStorage.getItem('role') || 'user')
  const profile = ref(localStorage.getItem('profile') ? JSON.parse(localStorage.getItem('profile')) : null)

  const persist = () => {
    token.value ? localStorage.setItem('token', token.value) : localStorage.removeItem('token')
    role.value ? localStorage.setItem('role', role.value) : localStorage.removeItem('role')
    profile.value
      ? localStorage.setItem('profile', JSON.stringify(profile.value))
      : localStorage.removeItem('profile')
  }

  const setAuth = (t, userInfo = {}) => {
    token.value = t
    role.value  = userInfo.role || role.value || 'user'
    profile.value = { ...profile.value, ...userInfo }
    persist()
  }

  const setProfile = (info) => {
    profile.value = { ...profile.value, ...info }
    if (info?.role) role.value = info.role
    persist()
  }

  const fetchProfile = async () => {
    if (!token.value) return null
    const data = await service.get('/me')
    setProfile(data)
    return data
  }

  const logout = () => {
    token.value = ''
    role.value  = 'user'
    profile.value = null
    persist()
  }

  return { token, role, profile, setAuth, setProfile, fetchProfile, logout }
})