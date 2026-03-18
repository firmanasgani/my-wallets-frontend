export interface Company {
  id: string
  name: string
  npwp?: string
  address?: string
  phone?: string
  email?: string
  taxEnabled: boolean
  taxRate: number
  currency: string
  createdAt: string
  updatedAt: string
}

export interface CompanyPayload {
  name: string
  npwp?: string
  address?: string
  phone?: string
  email?: string
  taxEnabled?: boolean
  taxRate?: number
  currency?: string
}

export interface ChartOfAccount {
  id: string
  companyId: string
  code: string
  name: string
  type: string
  isSystem: boolean
  createdAt: string
  updatedAt: string
}
