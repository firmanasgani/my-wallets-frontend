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
  requiresApprovalWorkflow: boolean
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
  withholdingTaxAmount: string
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
  taxConfigId: string | null
  createdByUserId: string
  createdAt: string
  updatedAt: string
  items: InvoiceItem[]
  attachments?: InvoiceAttachment[]
  contact: InvoiceContact | null
  paymentBankAccount?: CompanyBankAccount | null
  taxConfig?: TaxConfig | null
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
  taxConfigId?: string
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
  taxConfigId?: string | null
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

export type CompanyMemberRole = 'OWNER' | 'ADMIN' | 'CHECKER' | 'STAFF' | 'VIEWER'
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
  role: 'ADMIN' | 'CHECKER' | 'STAFF' | 'VIEWER'
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

// ─── Phase 8 — Approval Workflow & Attachments ───────────────────────────────

export type JournalEntryStatus = 'DRAFT' | 'PENDING_CHECK' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'

export interface JournalAttachment {
  id: string
  journalEntryId: string
  companyId: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  createdAt: string
  presignedUrl: string | null
  uploadedBy: { id: string; fullName: string; email: string } | null
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

export interface UserSummary {
  id: string
  fullName: string | null
  email: string
}

export interface BusinessTransaction {
  id: string
  companyId: string
  invoiceId: string | null
  isSystemGenerated: boolean
  transactionDate: string
  description: string
  status: JournalEntryStatus
  createdByUserId: string
  checkerUserId: string | null
  checkedAt: string | null
  approverUserId: string | null
  approvedAt: string | null
  rejectedAt: string | null
  rejectionNote: string | null
  createdAt: string
  updatedAt: string
  lines: JournalLine[]
  invoice: InvoiceSummary | null
  attachments: JournalAttachment[]
  checker: UserSummary | null
  approver: UserSummary | null
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
  files?: File[]
}

export interface BusinessTransactionsParams {
  startDate?: string
  endDate?: string
  coaId?: string
  contactId?: string
  status?: JournalEntryStatus
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

// ─── KPI Dashboard (Phase 6 + Phase 8) ───────────────────────────────────────

export interface KpiCoaItem {
  coaCode: string
  coaName: string
  amount: string
}

export interface KpiDashboardResponse {
  profitability: {
    period: { month: number; year: number }
    totalRevenue: string
    totalExpense: string
    netProfit: string
    isProfit: boolean
    profitMargin: string
    revenueGrowth: string | null
  }
  profitLossDetail: {
    period: { month: number; year: number }
    operatingRevenue: string
    costOfGoodsSold: string
    grossProfit: string
    isGrossProfit: boolean
    operatingExpenses: string
    nonOperatingIncome: string
    nonOperatingExpenses: string
    netProfit: string
    isNetProfit: boolean
    note: string | null
  } | null
  liquidity: {
    cashPosition: string
    totalReceivable: string
    totalPayable: string
  }
  invoiceActivity: {
    totalSentThisMonth: number
    totalPaidThisMonth: number
    totalOverdue: number
    overdueAmount: string
    outstandingAmount: string
  }
  breakdown: {
    topRevenueAccounts: KpiCoaItem[]
    topExpenseAccounts: KpiCoaItem[]
  }
}

// ─── Tax Config (Phase 8) ─────────────────────────────────────────────────────

export type TaxType = 'PPN' | 'PPH_21' | 'PPH_22' | 'PPH_23' | 'PPH_4_2' | 'PPH_15'

export interface TaxConfig {
  id: string
  companyId: string
  type: TaxType
  name: string
  rate: string
  isActive: boolean
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface TaxConfigPayload {
  type: TaxType
  name: string
  rate: number
  isActive?: boolean
  description?: string
}

export interface TaxSuggestion {
  taxConfigId: string
  type: TaxType
  name: string
  rate: string
  taxAmount: string | null
  netAmount: string | null
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  reason: string
  source: 'SYSTEM_RULE' | 'CUSTOM_RULE'
}

export interface TaxSuggestPayload {
  debitCoaId?: string
  creditCoaId?: string
  contactId?: string
  amount?: number
  description?: string
}

export interface TaxSuggestResponse {
  suggestions: TaxSuggestion[]
  notes: string | null
}

export interface TaxSuggestionRule {
  id: string
  companyId: string
  taxConfigId: string
  triggerCoaIds: string[]
  triggerContactType: ContactType | null
  triggerKeywords: string[]
  minAmount: string | null
  priority: number
  note: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  taxConfig: Pick<TaxConfig, 'id' | 'name' | 'type' | 'rate'>
}

export interface TaxSuggestionRulePayload {
  taxConfigId: string
  triggerCoaIds?: string[]
  triggerContactType?: ContactType
  triggerKeywords?: string[]
  minAmount?: number
  priority?: number
  note?: string
  isActive?: boolean
}

// ─── Asset Management (Phase 8) ───────────────────────────────────────────────

export type AssetType = 'TANGIBLE' | 'INTANGIBLE'
export type AssetStatus = 'ACTIVE' | 'FULLY_DEPRECIATED' | 'DISPOSED'
export type DepreciationMethod = 'STRAIGHT_LINE' | 'DECLINING_BALANCE' | 'DOUBLE_DECLINING' | 'UNITS_OF_PRODUCTION'

export interface AssetDepreciation {
  id: string
  assetId: string
  companyId: string
  periodYear: number
  periodMonth: number
  depreciationAmount: string
  accumulatedDepreciation: string
  bookValue: string
  unitsProduced: number | null
  journalEntryId: string | null
  createdAt: string
  journalEntry: { id: string; description: string; transactionDate: string } | null
}

export interface Asset {
  id: string
  companyId: string
  assetType: AssetType
  name: string
  code: string
  acquisitionDate: string
  acquisitionCost: string
  residualValue: string
  usefulLifeMonths: number
  depreciationMethod: DepreciationMethod
  unitsTotal: number | null
  status: AssetStatus
  disposalDate: string | null
  disposalAmount: string | null
  disposalCoaId: string | null
  notes: string | null
  createdByUserId: string
  createdAt: string
  updatedAt: string
  assetCoa: CoaSummary
  accumulatedCoa: CoaSummary
  depreciationExpenseCoa: CoaSummary
  disposalCoa?: CoaSummary | null
  depreciationCount: number
  totalDepreciated: string
  currentBookValue: string
  depreciations?: AssetDepreciation[]
}

export interface AssetPayload {
  assetType: AssetType
  name: string
  code: string
  acquisitionDate: string
  acquisitionCost: number
  residualValue?: number
  usefulLifeMonths: number
  depreciationMethod: DepreciationMethod
  unitsTotal?: number | null
  assetCoaId: string
  accumulatedCoaId: string
  depreciationExpenseCoaId: string
  notes?: string
}

export interface DisposeAssetPayload {
  disposalDate: string
  disposalAmount: number
  disposalCoaId: string
  gainCoaId?: string
  lossCoaId?: string
}

export interface DisposeAssetResponse {
  asset: Asset
  journalEntry: { id: string; description: string; status: string }
  bookValue: string
  gain: string
}

export interface DepreciationScheduleItem {
  periodYear: number
  periodMonth: number
  depreciationAmount: string
  accumulatedDepreciation: string
  bookValue: string
}

export interface DepreciationScheduleResponse {
  asset: {
    id: string
    code: string
    name: string
    depreciationMethod: DepreciationMethod
    acquisitionCost: string
    residualValue: string
    usefulLifeMonths: number
    currentBookValue: string
    totalDepreciated: string
    periodsAlreadyRun: number
  }
  projectedSchedule: DepreciationScheduleItem[]
}

export interface RunDepreciationPayload {
  year: number
  month: number
  assetIds?: string[]
}

export interface RunDepreciationResult {
  assetId: string
  assetCode: string
  assetName: string
  period: { year: number; month: number }
  depreciationAmount: string
  accumulatedDepreciation: string
  bookValue: string
  isFullyDepreciated: boolean
  journalEntryId: string
}

export interface RunDepreciationResponse {
  period: { year: number; month: number }
  total: number
  processed: number
  skipped: number
  results: RunDepreciationResult[]
}
