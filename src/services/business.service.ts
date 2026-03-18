import apiClient from './apiService'
import type { Company, CompanyPayload, ChartOfAccount } from '@/types/business'

export const BusinessService = {
  async createCompany(payload: CompanyPayload): Promise<Company> {
    const response = await apiClient.post<Company>('/business/company', payload)
    return response.data
  },

  async getMyCompany(): Promise<Company> {
    const response = await apiClient.get<Company>('/business/company')
    return response.data
  },

  async updateCompany(payload: Partial<CompanyPayload>): Promise<Company> {
    const response = await apiClient.put<Company>('/business/company', payload)
    return response.data
  },

  async getChartOfAccounts(): Promise<ChartOfAccount[]> {
    const response = await apiClient.get<ChartOfAccount[]>('/business/chart-of-accounts')
    return response.data
  },
}
