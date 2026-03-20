import apiClient from './apiService'
import type {
  Company,
  CompanyPayload,
  ChartOfAccount,
  ChartOfAccountsGrouped,
  CreateCoaPayload,
  UpdateCoaPayload,
  CompanyMember,
  InviteMemberPayload,
  InviteMemberResponse,
  AcceptInviteResponse,
  Contact,
  ContactPayload,
  ContactsResponse,
  Invoice,
  InvoicesResponse,
  InvoiceAttachment,
  CreateInvoicePayload,
  UpdateInvoicePayload,
  PayInvoicePayload,
  PayInvoiceResponse,
  CompanyBankAccount,
  BankAccountPayload,
} from '@/types/business'

export const BusinessService = {
  // ─── Company ───────────────────────────────────────────────────────────────
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

  // ─── Chart of Accounts ─────────────────────────────────────────────────────
  async getChartOfAccounts(): Promise<ChartOfAccountsGrouped> {
    const response = await apiClient.get<ChartOfAccountsGrouped>('/business/chart-of-accounts')
    return response.data
  },

  async getChartOfAccountById(id: string): Promise<ChartOfAccount> {
    const response = await apiClient.get<ChartOfAccount>(`/business/chart-of-accounts/${id}`)
    return response.data
  },

  async createChartOfAccount(payload: CreateCoaPayload): Promise<ChartOfAccount> {
    const response = await apiClient.post<ChartOfAccount>('/business/chart-of-accounts', payload)
    return response.data
  },

  async updateChartOfAccount(id: string, payload: UpdateCoaPayload): Promise<ChartOfAccount> {
    const response = await apiClient.patch<ChartOfAccount>(`/business/chart-of-accounts/${id}`, payload)
    return response.data
  },

  async deleteChartOfAccount(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/business/chart-of-accounts/${id}`)
    return response.data
  },

  // ─── Members ───────────────────────────────────────────────────────────────
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

  // ─── Contacts ──────────────────────────────────────────────────────────────
  async getContacts(params?: { type?: string; search?: string; page?: number; limit?: number }): Promise<ContactsResponse> {
    const response = await apiClient.get<ContactsResponse>('/business/contacts', { params })
    return response.data
  },

  async getContactById(id: string): Promise<Contact> {
    const response = await apiClient.get<Contact>(`/business/contacts/${id}`)
    return response.data
  },

  async createContact(payload: ContactPayload): Promise<Contact> {
    const response = await apiClient.post<Contact>('/business/contacts', payload)
    return response.data
  },

  async updateContact(id: string, payload: Partial<ContactPayload>): Promise<Contact> {
    const response = await apiClient.put<Contact>(`/business/contacts/${id}`, payload)
    return response.data
  },

  async deleteContact(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/business/contacts/${id}`)
    return response.data
  },

  // ─── Invoices ──────────────────────────────────────────────────────────────
  async getInvoices(params?: { status?: string; search?: string; startDate?: string; endDate?: string; contactId?: string; page?: number; limit?: number }): Promise<InvoicesResponse> {
    const response = await apiClient.get<InvoicesResponse>('/business/invoices', { params })
    return response.data
  },

  async getInvoiceById(id: string): Promise<Invoice> {
    const response = await apiClient.get<Invoice>(`/business/invoices/${id}`)
    return response.data
  },

  async createInvoice(payload: CreateInvoicePayload): Promise<Invoice> {
    const response = await apiClient.post<Invoice>('/business/invoices', payload)
    return response.data
  },

  async updateInvoice(id: string, payload: UpdateInvoicePayload): Promise<Invoice> {
    const response = await apiClient.put<Invoice>(`/business/invoices/${id}`, payload)
    return response.data
  },

  async deleteInvoice(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/business/invoices/${id}`)
    return response.data
  },

  async sendInvoice(id: string): Promise<Invoice> {
    const response = await apiClient.post<Invoice>(`/business/invoices/${id}/send`)
    return response.data
  },

  async payInvoice(id: string, payload: PayInvoicePayload): Promise<PayInvoiceResponse> {
    const response = await apiClient.post<PayInvoiceResponse>(`/business/invoices/${id}/pay`, payload)
    return response.data
  },

  async duplicateInvoice(id: string): Promise<Invoice> {
    const response = await apiClient.post<Invoice>(`/business/invoices/${id}/duplicate`)
    return response.data
  },

  // ─── Invoice Attachments ───────────────────────────────────────────────────
  async getInvoiceAttachments(invoiceId: string): Promise<InvoiceAttachment[]> {
    const response = await apiClient.get<InvoiceAttachment[]>(`/business/invoices/${invoiceId}/attachments`)
    return response.data
  },

  async uploadInvoiceAttachment(invoiceId: string, file: File): Promise<InvoiceAttachment> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post<InvoiceAttachment>(`/business/invoices/${invoiceId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  async deleteInvoiceAttachment(invoiceId: string, attachmentId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/business/invoices/${invoiceId}/attachments/${attachmentId}`)
    return response.data
  },

  // ─── Company Bank Accounts ─────────────────────────────────────────────────
  async getBankAccounts(): Promise<CompanyBankAccount[]> {
    const response = await apiClient.get<CompanyBankAccount[]>('/business/bank-accounts')
    return response.data
  },

  async getBankAccountById(id: string): Promise<CompanyBankAccount> {
    const response = await apiClient.get<CompanyBankAccount>(`/business/bank-accounts/${id}`)
    return response.data
  },

  async createBankAccount(payload: BankAccountPayload): Promise<CompanyBankAccount> {
    const response = await apiClient.post<CompanyBankAccount>('/business/bank-accounts', payload)
    return response.data
  },

  async updateBankAccount(id: string, payload: Partial<BankAccountPayload>): Promise<CompanyBankAccount> {
    const response = await apiClient.put<CompanyBankAccount>(`/business/bank-accounts/${id}`, payload)
    return response.data
  },

  async setDefaultBankAccount(id: string): Promise<CompanyBankAccount> {
    const response = await apiClient.patch<CompanyBankAccount>(`/business/bank-accounts/${id}/set-default`)
    return response.data
  },

  async deleteBankAccount(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/business/bank-accounts/${id}`)
    return response.data
  },

  // ─── Company Logo ──────────────────────────────────────────────────────────
  async uploadCompanyLogo(file: File): Promise<Company> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.patch<Company>('/business/company/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  async deleteCompanyLogo(): Promise<Company> {
    const response = await apiClient.delete<Company>('/business/company/logo')
    return response.data
  },
}
