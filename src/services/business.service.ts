import apiClient from './apiService'
import type {
  Company,
  CompanyPayload,
  ChartOfAccount,
  CompanyMember,
  InviteMemberPayload,
  InviteMemberResponse,
  AcceptInviteResponse,
} from '@/types/business'

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

  async getChartOfAccounts(): Promise<Record<string, ChartOfAccount[]>> {
    const response = await apiClient.get<Record<string, ChartOfAccount[]>>('/business/chart-of-accounts')
    return response.data
  },

  async getMembers(): Promise<CompanyMember[]> {
    const response = await apiClient.get<CompanyMember[]>('/business/members')
    return response.data
  },

  async inviteMember(payload: InviteMemberPayload): Promise<InviteMemberResponse> {
    const response = await apiClient.post<InviteMemberResponse>('/business/members/invite', payload)
    return response.data
  },

  async acceptInvite(token: string): Promise<AcceptInviteResponse> {
    const response = await apiClient.post<AcceptInviteResponse>('/business/members/accept', { token })
    return response.data
  },

  async updateMemberRole(memberId: string, role: 'ADMIN' | 'STAFF' | 'VIEWER'): Promise<CompanyMember> {
    const response = await apiClient.put<CompanyMember>(`/business/members/${memberId}/role`, { role })
    return response.data
  },

  async revokeMember(memberId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/business/members/${memberId}`)
    return response.data
  },
}
