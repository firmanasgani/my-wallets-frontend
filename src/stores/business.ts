import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { BusinessService } from '@/services/business.service'
import { useAuthStore } from '@/stores/auth'
import type {
  Company,
  CompanyPayload,
  ChartOfAccount,
  CompanyMember,
  CompanyMemberRole,
  InviteMemberPayload,
  CreateCoaPayload,
  UpdateCoaPayload,
} from '@/types/business'

export const useBusinessStore = defineStore('business', () => {
  const currentCompany = ref<Company | null>(null)
  const chartOfAccounts = ref<Record<string, ChartOfAccount[]>>({})
  const members = ref<CompanyMember[]>([])
  const isLoading = ref(false)
  const isCompanyLoaded = ref(false)
  const isMembersLoading = ref(false)
  const isLogoUploading = ref(false)

  const myRole = computed<CompanyMemberRole | null>(() => {
    const authStore = useAuthStore()
    const userId = authStore.currentUser?.id
    if (!userId) return null
    return members.value.find((m) => m.userId === userId)?.role ?? null
  })

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

  const createChartOfAccount = async (payload: CreateCoaPayload) => {
    const account = await BusinessService.createChartOfAccount(payload)
    // Refresh grouped list
    await fetchChartOfAccounts()
    return account
  }

  const updateChartOfAccount = async (id: string, payload: UpdateCoaPayload) => {
    const account = await BusinessService.updateChartOfAccount(id, payload)
    await fetchChartOfAccounts()
    return account
  }

  const deleteChartOfAccount = async (id: string) => {
    const result = await BusinessService.deleteChartOfAccount(id)
    await fetchChartOfAccounts()
    return result
  }

  const fetchMembers = async () => {
    isMembersLoading.value = true
    try {
      const list = await BusinessService.getMembers()
      members.value = list
      return list
    } finally {
      isMembersLoading.value = false
    }
  }

  const inviteMember = async (payload: InviteMemberPayload) => {
    const result = await BusinessService.inviteMember(payload)
    await fetchMembers()
    return result
  }

  const updateMemberRole = async (memberId: string, role: 'ADMIN' | 'CHECKER' | 'STAFF' | 'VIEWER') => {
    const updated = await BusinessService.updateMemberRole(memberId, role)
    const idx = members.value.findIndex((m) => m.id === memberId)
    if (idx !== -1) members.value[idx] = updated
    return updated
  }

  const revokeMember = async (memberId: string) => {
    const result = await BusinessService.revokeMember(memberId)
    members.value = members.value.filter((m) => m.id !== memberId)
    return result
  }

  const uploadLogo = async (file: File) => {
    isLogoUploading.value = true
    try {
      const company = await BusinessService.uploadCompanyLogo(file)
      currentCompany.value = company
      return company
    } finally {
      isLogoUploading.value = false
    }
  }

  const deleteLogo = async () => {
    isLogoUploading.value = true
    try {
      const company = await BusinessService.deleteCompanyLogo()
      currentCompany.value = company
      return company
    } finally {
      isLogoUploading.value = false
    }
  }

  const clearStore = () => {
    currentCompany.value = null
    chartOfAccounts.value = {}
    members.value = []
    isCompanyLoaded.value = false
  }

  return {
    currentCompany,
    chartOfAccounts,
    members,
    myRole,
    isLoading,
    isLogoUploading,
    isMembersLoading,
    isCompanyLoaded,
    fetchMyCompany,
    createCompany,
    updateCompany,
    uploadLogo,
    deleteLogo,
    fetchChartOfAccounts,
    createChartOfAccount,
    updateChartOfAccount,
    deleteChartOfAccount,
    fetchMembers,
    inviteMember,
    updateMemberRole,
    revokeMember,
    clearStore,
  }
})
