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
  profilePicture?: string | null
  profilePictureUrl?: string | null
  subscriptionPlan: 'FREE' | 'PREMIUM' | 'FAMILY'
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
        const dataToSubmit = {
          ...payload,
          email: payload.email.toLowerCase(),
          username: payload.username.toLowerCase(),
        }
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
        const loginData = {
          ...credentials,
          login: credentials.login.toLowerCase(),
        }
        const response = await apiClient.post<LoginResponse>('/auth/login', loginData)
        this.setToken(response.data.access_token)
        this.setUser(response.data.user)
        await this.fetchUserProfile() // Fetch full profile to get profilePictureUrl
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
        throw new Error('User not authenticated.')
      }
      this.isLoading = true
      this.error = null
      try {
        await apiClient.patch('/auth/change-password', payload)
        console.log('Password changed successfully via API.')
      } catch (err: any) {
        console.error('Change password failed in store:', err.response?.data || err.message)

        // Handle specific error responses from backend
        const response = err.response?.data
        let errorMessage = 'Gagal mengubah password.'

        if (response) {
          // Handle validation errors (array of messages)
          if (Array.isArray(response.message)) {
            errorMessage = response.message.join(', ')
          }
          // Handle specific error messages
          else if (typeof response.message === 'string') {
            // Map backend error messages to user-friendly Indonesian messages
            if (response.message === 'Current password is incorrect') {
              errorMessage = 'Password saat ini tidak benar.'
            } else if (
              response.message === 'New password must be different from current password'
            ) {
              errorMessage = 'Password baru harus berbeda dari password saat ini.'
            } else if (response.message.includes('at least 6 characters')) {
              errorMessage = 'Password baru minimal 6 karakter.'
            } else {
              errorMessage = response.message
            }
          }
        }

        this.error = errorMessage
        throw new Error(this.error)
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
