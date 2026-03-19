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

export type ChartOfAccountsGrouped = Record<string, ChartOfAccount[]>

export type CompanyMemberRole = 'OWNER' | 'ADMIN' | 'STAFF' | 'VIEWER'
export type CompanyMemberStatus = 'PENDING' | 'ACTIVE' | 'REVOKED'

export interface CompanyMemberUser {
  id: string
  email: string
  username: string
  fullName: string | null
  profilePicture: string | null
}

export interface CompanyMember {
  id: string
  companyId: string
  userId: string
  role: CompanyMemberRole
  status: CompanyMemberStatus
  invitedAt: string
  joinedAt: string | null
  createdAt: string
  updatedAt: string
  user: CompanyMemberUser
}

export interface InviteMemberPayload {
  email: string
  role: 'ADMIN' | 'STAFF' | 'VIEWER'
}

export interface InviteMemberResponse {
  message: string
  memberId: string
}

export interface AcceptInviteResponse {
  message: string
  companyId: string
  companyName: string
  role: CompanyMemberRole
}
