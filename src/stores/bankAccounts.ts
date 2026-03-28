import { defineStore } from 'pinia'
import { ref } from 'vue'
import { BusinessService } from '@/services/business.service'
import type { CompanyBankAccount, BankAccountPayload } from '@/types/business'

export const useBankAccountsStore = defineStore('bankAccounts', () => {
  const bankAccounts = ref<CompanyBankAccount[]>([])
  const isLoading = ref(false)

  const fetchBankAccounts = async () => {
    isLoading.value = true
    try {
      const list = await BusinessService.getBankAccounts()
      bankAccounts.value = list
      return list
    } finally {
      isLoading.value = false
    }
  }

  const createBankAccount = async (payload: BankAccountPayload) => {
    const account = await BusinessService.createBankAccount(payload)
    await fetchBankAccounts()
    return account
  }

  const updateBankAccount = async (id: string, payload: Partial<BankAccountPayload>) => {
    const account = await BusinessService.updateBankAccount(id, payload)
    await fetchBankAccounts()
    return account
  }

  const setDefaultBankAccount = async (id: string) => {
    const account = await BusinessService.setDefaultBankAccount(id)
    await fetchBankAccounts()
    return account
  }

  const deleteBankAccount = async (id: string) => {
    const result = await BusinessService.deleteBankAccount(id)
    bankAccounts.value = bankAccounts.value.filter((a) => a.id !== id)
    return result
  }

  const clearStore = () => {
    bankAccounts.value = []
  }

  return {
    bankAccounts,
    isLoading,
    fetchBankAccounts,
    createBankAccount,
    updateBankAccount,
    setDefaultBankAccount,
    deleteBankAccount,
    clearStore,
  }
})
