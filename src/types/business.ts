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
  logoUrl?: string | null
  logoPresignedUrl?: string | null
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

export type CoaType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE'

export interface ChartOfAccount {
  id: string
  companyId: string
  code: string
  name: string
  type: CoaType
  openingBalance: string
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export type ChartOfAccountsGrouped = Record<string, ChartOfAccount[]>

export interface CreateCoaPayload {
  code: string
  name: string
  type: CoaType
  openingBalance?: number
}

export interface UpdateCoaPayload {
  name?: string
  type?: CoaType
  openingBalance?: number
}

// ─── Contacts ────────────────────────────────────────────────────────────────

export type ContactType = 'CUSTOMER' | 'VENDOR' | 'EMPLOYEE'

export interface Contact {
  id: string
  companyId: string
  type: ContactType
  name: string
  email: string | null
  phone: string | null
  address: string | null
  bankName: string | null
  bankAccountNumber: string | null
  bankAccountHolder: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface ContactPayload {
  type: ContactType
  name: string
  email?: string
  phone?: string
  address?: string
  bankName?: string
  bankAccountNumber?: string
  bankAccountHolder?: string
  notes?: string
}

export interface ContactsResponse {
  data: Contact[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'

export interface InvoiceItem {
  id: string
  invoiceId: string
  description: string
  quantity: string
  unitPrice: string
  discountAmount: string
  taxable: boolean
  taxRate: string
  taxAmount: string
  total: string
}

export interface InvoiceAttachment {
  id: string
  invoiceId: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  uploadedByUserId: string
  createdAt: string
}

export interface InvoiceContact {
  id: string
  name: string
  type: ContactType
}

export interface Invoice {
  id: string
  companyId: string
  contactId: string | null
  invoiceNumber: string
  clientName: string
  clientEmail: string | null
  clientAddress: string | null
  issueDate: string
  dueDate: string
  status: InvoiceStatus
  subtotal: string
  taxAmount: string
  totalAmount: string
  amountPaid: string
  sentAt: string | null
  paidAt: string | null
  paymentDate: string | null
  paymentCoaId: string | null
  paymentMethod: string | null
  paymentReference: string | null
  paymentBankAccountId: string | null
  notes: string | null
  createdByUserId: string
  createdAt: string
  updatedAt: string
  items: InvoiceItem[]
  attachments?: InvoiceAttachment[]
  contact: InvoiceContact | null
  paymentBankAccount?: CompanyBankAccount | null
}

export interface InvoicesResponse {
  data: Invoice[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface InvoiceItemPayload {
  description: string
  quantity: number
  unitPrice: number
  discountAmount?: number
  taxable?: boolean
}

export interface CreateInvoicePayload {
  contactId?: string
  clientName?: string
  clientEmail?: string
  clientAddress?: string
  issueDate: string
  dueDate: string
  notes?: string
  paymentBankAccountId?: string
  items: InvoiceItemPayload[]
}

export interface UpdateInvoicePayload {
  contactId?: string
  clientName?: string
  clientEmail?: string
  clientAddress?: string
  issueDate?: string
  dueDate?: string
  notes?: string
  paymentBankAccountId?: string | null
  items?: InvoiceItemPayload[]
}

export interface PayInvoicePayload {
  paymentCoaId: string
  paymentDate: string
  amount?: number
  paymentMethod?: string
  paymentReference?: string
}

export interface PayInvoiceResponse {
  message: string
  amountPaid?: string
  remaining?: string
}

// ─── Company Bank Accounts ────────────────────────────────────────────────────

export interface CompanyBankAccount {
  id: string
  companyId: string
  bankName: string
  accountNumber: string
  accountHolder: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface BankAccountPayload {
  bankName: string
  accountNumber: string
  accountHolder: string
  isDefault?: boolean
}

export type CompanyMemberRole = 'OWNER' | 'ADMIN' | 'STAFF' | 'VIEWER'
export type CompanyMemberStatus = 'PENDING' | 'ACTIVE' | 'REVOKED'

export interface CompanyMemberUser {
  id: string
  email: string
  username: string
  fullName: string | null
  profilePicture: string | null
  profilePictureUrl: string | null
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

// ─── Business Transactions (Phase 4 - Compound Journal) ──────────────────────

export interface CoaSummary {
  id: string
  code: string
  name: string
  type: CoaType
}

export interface ContactSummary {
  id: string
  name: string
  type: ContactType
}

export interface InvoiceSummary {
  id: string
  invoiceNumber: string
}

export type JournalLineType = 'DEBIT' | 'CREDIT'

export interface JournalLine {
  id: string
  journalEntryId: string
  type: JournalLineType
  amount: string           // Decimal as string — parse before arithmetic
  description: string | null
  coaId: string
  contactId: string | null
  coa: CoaSummary
  contact: ContactSummary | null
}

export interface BusinessTransaction {
  id: string
  companyId: string
  invoiceId: string | null
  isSystemGenerated: boolean
  transactionDate: string
  description: string
  createdByUserId: string
  createdAt: string
  lines: JournalLine[]
  invoice: InvoiceSummary | null
}

export interface BusinessTransactionsResponse {
  data: BusinessTransaction[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateJournalLinePayload {
  coaId: string
  type: JournalLineType
  amount: number
  description?: string
  contactId?: string
}

export interface CreateBusinessTransactionPayload {
  description: string
  transactionDate: string
  lines: CreateJournalLinePayload[]
}

export interface BusinessTransactionsParams {
  startDate?: string
  endDate?: string
  coaId?: string
  contactId?: string
  page?: number
  limit?: number
}

// ─── Financial Reports (Phase 5) ─────────────────────────────────────────────

export interface ReportAccountItem {
  coaCode: string
  coaName: string
  amount: string
}

export interface ProfitLossResponse {
  period: { startDate: string | null; endDate: string | null }
  revenue: {
    accounts: ReportAccountItem[]
    total: string
  }
  expense: {
    accounts: ReportAccountItem[]
    total: string
  }
  netProfit: string   // Decimal string, bisa negatif
  isProfit: boolean
}

export interface BalanceSheetAccountItem {
  coaCode: string
  coaName: string
  balance: string
}

export interface BalanceSheetResponse {
  asOfDate: string
  assets: {
    accounts: BalanceSheetAccountItem[]
    total: string
  }
  liabilities: {
    accounts: BalanceSheetAccountItem[]
    total: string
  }
  equity: {
    accounts: BalanceSheetAccountItem[]
    currentPeriodProfit: string   // bisa negatif (rugi)
    total: string
  }
  totalLiabilitiesAndEquity: string
  isBalanced: boolean
}

export interface CashFlowAccountItem {
  coaCode: string
  coaName: string
  amount: string
}

export interface CashFlowResponse {
  period: { startDate: string | null; endDate: string | null }
  openingCash: string
  cashInflows: CashFlowAccountItem[]
  totalInflow: string
  cashOutflows: CashFlowAccountItem[]
  totalOutflow: string
  netCashFlow: string   // bisa negatif
  endingCash: string
}

export interface JournalReportLine {
  coaCode: string
  coaName: string
  amount: string
  description: string | null
  contact: string | null
}

export interface JournalReportEntry {
  id: string
  date: string
  description: string
  reference: string | null
  contacts: string[] | null
  isSystemGenerated: boolean
  debitLines: JournalReportLine[]
  creditLines: JournalReportLine[]
  totalDebit: string
  totalCredit: string
}

export interface JournalReportResponse {
  data: JournalReportEntry[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ReportDateParams {
  startDate?: string
  endDate?: string
}

export interface BalanceSheetParams {
  date?: string
}

export interface JournalReportParams {
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}
