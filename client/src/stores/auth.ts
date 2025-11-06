import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, AuthResponse, RegisterRequest } from '@/types'
import { apiService } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const loading = ref(false)

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    loading.value = true
    try {
      const response: AuthResponse = await apiService.login({ email, password })
      user.value = response.user
      isAuthenticated.value = true
      apiService.setToken(response.token)
      localStorage.setItem('token', response.token)
      return response
    } finally {
      loading.value = false
    }
  }

  const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
    loading.value = true
    try {
      const response: AuthResponse = await apiService.register(userData)
      user.value = response.user
      isAuthenticated.value = true
      apiService.setToken(response.token)
      localStorage.setItem('token', response.token)
      return response
    } finally {
      loading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await apiService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      user.value = null
      isAuthenticated.value = false
      apiService.setToken('')
      localStorage.removeItem('token')
    }
  }

  const checkAuth = async (): Promise<void> => {
    const token = localStorage.getItem('token')
    if (token) {
      apiService.setToken(token)
      try {
        const response = await apiService.getCurrentUser()
        user.value = response.user
        isAuthenticated.value = true
      } catch (error) {
        console.error('Auth check failed:', error)
        logout()
      }
    }
  }

  const updateUser = async (userData: { username?: string; role?: string }): Promise<User> => {
    if (!user.value) throw new Error('No user logged in')
    
    const updatedUser: User = await apiService.updateUser(user.value.id, userData)
    user.value = updatedUser
    return updatedUser
  }

  return {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuth,
    updateUser // ← Добавляем метод в возвращаемый объект
  }
})