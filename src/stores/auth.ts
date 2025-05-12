import { defineStore } from 'pinia'
import apiClient from '@/services/apiService'
import router from '@/router'

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

        const response = await apiClient.post('/auth/register', dataToSubmit)

        console.log('Registration successful:', response.data)

        router.push({ name: 'login', query: { registered: 'true' } })
        return true // Kembalikan true jika sukses
      } catch (err: any) {
        console.error('Registration failed:', err.response?.data || err.message)
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
      console.log('Attempting login with:', credentials)
      try {
        const response = await apiClient.post<LoginResponse>('/auth/login', credentials)
        this.setToken(response.data.access_token)
        this.setUser(response.data.user)
        const redirectPath =
          (router.currentRoute.value.query.redirect as string) || '/app/dashboard'
        router.push(redirectPath)
        return true
      } catch (err: any) {
        console.error('Login failed:', err.response?.data || err.message)
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
        console.log('FetchUserProfile: No token, skipping fetch.')
        return
      }

      this.isLoading = true
      try {
        const response = await apiClient.get<UserProfile>('/auth/profile')
        this.setUser(response.data)
      } catch (err: any) {
        console.error('Failed to fetch user profile:', err.response?.data || err.message)
        await this.logout()
        throw err
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
      console.log('Attemping auto-login...')
      if (this.token && !this.user) {
        await this.fetchUserProfile()
      } else if (this.token && this.user) {
        console.log('Auto-login successful.')
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      }
    },
  },
})
