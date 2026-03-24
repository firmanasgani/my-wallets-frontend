import { defineStore } from 'pinia'
import { ref } from 'vue'
import { BusinessService } from '@/services/business.service'
import type {
  BusinessTransaction,
  BusinessTransactionsParams,
  CreateBusinessTransactionPayload,
} from '@/types/business'

export const useBusinessTransactionsStore = defineStore('businessTransactions', () => {
  const transactions = ref<BusinessTransaction[]>([])
  const total = ref(0)
  const page = ref(1)
  const totalPages = ref(1)
  const isLoading = ref(false)
  const isSubmitting = ref(false)

  const fetchTransactions = async (params?: BusinessTransactionsParams) => {
    isLoading.value = true
    try {
      const res = await BusinessService.getBusinessTransactions(params)
      transactions.value = res.data
      total.value = res.total
      page.value = res.page
      totalPages.value = res.totalPages
      return res
    } finally {
      isLoading.value = false
    }
  }

  const createTransaction = async (payload: CreateBusinessTransactionPayload) => {
    isSubmitting.value = true
    try {
      const tx = await BusinessService.createBusinessTransaction(payload)
      return tx
    } finally {
      isSubmitting.value = false
    }
  }

  const fetchTransactionById = async (id: string): Promise<BusinessTransaction> => {
    return await BusinessService.getBusinessTransactionById(id)
  }

  const deleteTransaction = async (id: string) => {
    const result = await BusinessService.deleteBusinessTransaction(id)
    transactions.value = transactions.value.filter((t) => t.id !== id)
    total.value = Math.max(0, total.value - 1)
    return result
  }

  const clearStore = () => {
    transactions.value = []
    total.value = 0
    page.value = 1
    totalPages.value = 1
  }

  return {
    transactions,
    total,
    page,
    totalPages,
    isLoading,
    isSubmitting,
    fetchTransactions,
    fetchTransactionById,
    createTransaction,
    deleteTransaction,
    clearStore,
  }
})
