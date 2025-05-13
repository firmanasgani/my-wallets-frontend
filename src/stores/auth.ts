import { defineStore } from 'pinia'
import apiClient from '@/services/apiService'
import router from '@/router'

export interface ChangePasswordPayload {
  newPassword: string
  currentPassword: string
}

interface UserProfile {
  id: string
  username: string
  email: string
  fullName?: string | null
}

interface LoginResponse {
  access_token: string
  user: UserProfile
}

interface RegisterPayload {
  username: string
  email: string
  password: string
  fullName?: string | null
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as UserProfile | null,
    token: localStorage.getItem('authToken') || (null as string | null),
    isLoading: false,
    error: null as string | null, // Untuk menyimpan pesan error
  }),
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    currentUser: (state) => state.user,
    authIsLoading: (state) => state.isLoading,
    authError: (state) => state.error,
  },
  actions: {
    setToken(token: string | null) {
      this.token = token
      if (token) {
        localStorage.setItem('authToken', token)
      } else {
        localStorage.removeItem('authToken')
      }
    },
    setUser(userData: UserProfile | null) {
      this.user = userData
    },

    async register(payload: RegisterPayload) {
      this.isLoading = true
      this.error = null
      try {
        const { ...dataToSubmit } = payload
        if (!dataToSubmit.fullName?.trim()) {
          delete dataToSubmit.fullName
        }

        await apiClient.post('/auth/register', dataToSubmit)

        router.push({ name: 'login', query: { registered: 'true' } })
        return true // Kembalikan true jika sukses
      } catch (err: any) {
        this.error =
          err.response?.data?.message || err.message || 'Registrasi gagal. Silakan coba lagi.'
        throw this.error
      } finally {
        this.isLoading = false
      }
    },

    async login(credentials: { login: string; password: string }) {
      this.isLoading = true
      this.error = null
      try {
        const response = await apiClient.post<LoginResponse>('/auth/login', credentials)
        this.setToken(response.data.access_token)
        this.setUser(response.data.user)
        const redirectPath =
          (router.currentRoute.value.query.redirect as string) || '/app/dashboard'
        router.push(redirectPath)
        return true
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message || 'Login gagal. Silakan coba lagi.'
        this.setToken(null)
        this.setUser(null)
        throw this.error
      } finally {
        this.isLoading = false
      }
    },

    async fetchUserProfile() {
      if (!this.token) {
        return
      }

      this.isLoading = true
      try {
        const response = await apiClient.get<UserProfile>('/auth/profile')
        this.setUser(response.data)
      } catch (err: any) {
        await this.logout()
        throw err
      } finally {
        this.isLoading = false
      }
    },
    async changePassword(payload: ChangePasswordPayload) {
      if (!this.isAuthenticated) {
        // Tambahan pengecekan
        throw new Error('User not authenticated.')
      }
      this.isLoading = true // Gunakan isLoading global atau buat state spesifik
      this.error = null
      try {
        // Asumsi endpoint backend Anda adalah PATCH /api/auth/change-password
        await apiClient.patch('/auth/change-password', payload)
        // Backend akan memvalidasi currentPassword, lalu update
        console.log('Password changed successfully via API.')
        // Anda bisa memilih untuk:
        // 1. Tidak melakukan apa-apa, biarkan token saat ini tetap valid
        // 2. Menganggap sesi ini masih valid, tapi sarankan user login ulang di perangkat lain
        // 3. Logout user saat ini untuk memaksa login ulang dengan password baru (lebih aman)
        // Pilihan 3 diimplementasikan di modal setelah pesan sukses.
      } catch (err: any) {
        console.error('Change password failed in store:', err.response?.data || err.message)
        const errorMessage = err.response?.data?.message || 'Gagal mengubah password.'
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
        throw new Error(this.error ?? '') // Lemparkan error agar komponen bisa menangani
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      this.setToken(null)
      this.setUser(null)
      router.push({ name: 'login' })
      if (router.currentRoute.value.name !== 'login') {
        router.push({ name: 'login' })
      }
    },

    async tryAutoLogin() {
      if (this.token && !this.user) {
        await this.fetchUserProfile()
      } else if (this.token && this.user) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      }
    },
  },
})
