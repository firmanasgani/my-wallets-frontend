import { defineStore } from 'pinia'
import apiClient from '@/services/apiService'
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  QueryCategoryParams,
} from '@/types/enums'
import { useAuthStore } from './auth'

interface CategoriesState {
  categories: Category[] // Akan menyimpan data hierarkis (top-level dengan subCategories)
  isLoading: boolean
  isSubmitting: boolean // Untuk CUD operations
  error: string | null
}

export const useCategoryStore = defineStore('categories', {
  state: (): CategoriesState => ({
    categories: [],
    isLoading: false,
    isSubmitting: false,
    error: null,
  }),
  getters: {
    allCategories: (state) => state.categories,
    incomeCategories: (state) =>
      state.categories.filter((cat) => cat.categoryType === 'INCOME' && !cat.parentCategoryId),
    expenseCategories: (state) =>
      state.categories.filter((cat) => cat.categoryType === 'EXPENSE' && !cat.parentCategoryId),
    isLoadingCategories: (state) => state.isLoading,
    isSubmittingCategory: (state) => state.isSubmitting,
    categoryError: (state) => state.error,
    totalIncomeParent: (state) =>
      state.categories.filter((cat) => cat.categoryType === 'INCOME' && !cat.parentCategoryId)
        .length,
    totalIncomeSub: (state) => {
      const parentCats = state.categories.filter(
        (cat) => cat.categoryType === 'INCOME' && !cat.parentCategoryId,
      )
      return countSubCategories(parentCats)
    },
    totalExpenseParent: (state) =>
      state.categories.filter((cat) => cat.categoryType === 'EXPENSE' && !cat.parentCategoryId)
        .length,
    totalExpenseSub: (state) => {
      const parentCats = state.categories.filter(
        (cat) => cat.categoryType === 'EXPENSE' && !cat.parentCategoryId,
      )
      return countSubCategories(parentCats)
    },
    totalRecursiveIncome: (state): number => {
      const countRecursive = (cats: Category[]): number => {
        let count = 0
        for (const cat of cats) {
          if (cat.categoryType === 'INCOME') count++
          if (cat.subCategories && cat.subCategories.length > 0) {
            count += countRecursive(cat.subCategories)
          }
        }
        return count
      }
      return countRecursive(state.categories)
    },
    totalRecursiveExpense: (state): number => {
      const countRecursive = (cats: Category[]): number => {
        let count = 0
        for (const cat of cats) {
          if (cat.categoryType === 'EXPENSE') count++
          if (cat.subCategories && cat.subCategories.length > 0) {
            count += countRecursive(cat.subCategories)
          }
        }
        return count
      }
      return countRecursive(state.categories)
    },
    totalCategoriesCount: (state): number => {
      const countRecursive = (cats: Category[]): number => {
        let count = 0
        for (const cat of cats) {
          count++ // Count the category itself
          if (cat.subCategories && cat.subCategories.length > 0) {
            count += countRecursive(cat.subCategories)
          }
        }
        return count
      }
      return countRecursive(state.categories)
    },
  },
  actions: {
    async fetchCategories(query?: QueryCategoryParams) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        this.error = 'User not authenticated.'
        console.error(this.error)
        return
      }
      this.isLoading = true
      this.error = null
      try {
        const params = { ...query, hierarchical: 'true' }
        const response = await apiClient.get<Category[]>('/categories', { params })
        this.categories = response.data
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Gagal memuat daftar kategori.'
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
        this.categories = []
      } finally {
        this.isLoading = false
      }
    },

    async createCategory(payload: CreateCategoryPayload) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) throw new Error('User not authenticated.')

      // Check subscription limit for FREE users
      const isFreePlan = authStore.currentUser?.subscriptionPlan === 'FREE'
      if (isFreePlan) {
        if (payload.type === 'INCOME' && this.totalRecursiveIncome >= 15) {
          const limitError = 'Batas kategori Pemasukan (Income) untuk paket FREE adalah 15.'
          this.error = limitError
          throw new Error(limitError)
        }
        if (payload.type === 'EXPENSE' && this.totalRecursiveExpense >= 15) {
          const limitError = 'Batas kategori Pengeluaran (Expense) untuk paket FREE adalah 15.'
          this.error = limitError
          throw new Error(limitError)
        }
      }

      this.isSubmitting = true
      this.error = null
      try {
        const response = await apiClient.post<Category>('/categories', payload)
        await this.fetchCategories() // Fetch ulang untuk data terbaru
        return response.data
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Gagal membuat kategori.'
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
        throw new Error(this.error ?? 'Unknown error')
      } finally {
        this.isSubmitting = false
      }
    },

    // Action untuk update kategori
    async updateCategory(categoryId: string, payload: UpdateCategoryPayload) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) throw new Error('User not authenticated.')
      this.isSubmitting = true
      this.error = null
      try {
        const response = await apiClient.patch<Category>(`/categories/${categoryId}`, payload)
        await this.fetchCategories() // Fetch ulang untuk data terbaru
        return response.data
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Gagal memperbarui kategori.'
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
        throw new Error(this.error ?? 'Unknown error')
      } finally {
        this.isSubmitting = false
      }
    },

    // Action untuk menghapus kategori
    async deleteCategory(categoryId: string) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) throw new Error('User not authenticated.')
      this.isSubmitting = true
      this.error = null
      try {
        await apiClient.delete(`/categories/${categoryId}`)
        // Hapus dari state lokal atau fetch ulang. Fetch ulang lebih mudah untuk menjaga konsistensi hierarki.
        await this.fetchCategories()
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Gagal menghapus kategori.'
        this.error = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
        throw new Error(this.error ?? 'Unknown error')
      } finally {
        this.isSubmitting = false
      }
    },
  },
})

// Helper function to count all subcategories recursively
function countSubCategories(categories: Category[]): number {
  let count = 0
  for (const cat of categories) {
    if (cat.subCategories && cat.subCategories.length > 0) {
      count += cat.subCategories.length
      count += countSubCategories(cat.subCategories)
    }
  }
  return count
}
