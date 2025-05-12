// src/services/apiService.ts
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth'

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore()
    const token = authStore.token

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const authStore = useAuthStore()
    if (error.response?.status === 401 && !originalRequest._retry && authStore.token) {
      originalRequest._retry = true
      console.error(
        'API request unauthorized (401). Token might be expired or invalid. Logging out.',
      )
      try {
        await authStore.logout()
      } catch (logoutError) {
        console.error('Error during automatic logout after 401:', logoutError)
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient
