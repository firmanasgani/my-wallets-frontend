import { defineStore } from 'pinia'
import { ref } from 'vue'
import { BusinessService } from '@/services/business.service'
import type { Company, CompanyPayload, ChartOfAccount } from '@/types/business'

export const useBusinessStore = defineStore('business', () => {
  const currentCompany = ref<Company | null>(null)
  const chartOfAccounts = ref<ChartOfAccount[]>([])
  const isLoading = ref(false)
  const isCompanyLoaded = ref(false)

  const fetchMyCompany = async () => {
    isLoading.value = true
    try {
      const company = await BusinessService.getMyCompany()
      currentCompany.value = company
      isCompanyLoaded.value = true
      return company
    } catch (error: any) {
      if (error.response?.status === 404) {
        currentCompany.value = null
        isCompanyLoaded.value = true
      }
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const createCompany = async (payload: CompanyPayload) => {
    isLoading.value = true
    try {
      const company = await BusinessService.createCompany(payload)
      currentCompany.value = company
      isCompanyLoaded.value = true
      return company
    } finally {
      isLoading.value = false
    }
  }

  const updateCompany = async (payload: Partial<CompanyPayload>) => {
    isLoading.value = true
    try {
      const company = await BusinessService.updateCompany(payload)
      currentCompany.value = company
      return company
    } finally {
      isLoading.value = false
    }
  }

  const fetchChartOfAccounts = async () => {
    isLoading.value = true
    try {
      const accounts = await BusinessService.getChartOfAccounts()
      chartOfAccounts.value = accounts
      return accounts
    } finally {
      isLoading.value = false
    }
  }

  const clearStore = () => {
    currentCompany.value = null
    chartOfAccounts.value = []
    isCompanyLoaded.value = false
  }

  return {
    currentCompany,
    chartOfAccounts,
    isLoading,
    isCompanyLoaded,
    fetchMyCompany,
    createCompany,
    updateCompany,
    fetchChartOfAccounts,
    clearStore,
  }
})
