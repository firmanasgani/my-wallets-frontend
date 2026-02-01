export interface FinancialSummary {
  period: { start: string; end: string }
  totalIncome: number
  totalExpense: number
  netCashFlow: number
  savingsRate: number
}

export interface CategoryBreakdownItem {
  categoryId: string
  categoryName: string
  icon?: string
  color?: string
  totalAmount: number
  percentage: number
  transactionCount: number
}

export interface TrendDataset {
  label: string
  borderColor?: string
  backgroundColor?: string
  data: number[]
}

export interface TrendAnalysis {
  labels: string[]
  datasets: TrendDataset[]
}

export interface CategoryTrendDataset {
  label: string
  data: number[]
  backgroundColor: string
}

export interface CategoryTrendAnalysis {
  labels: string[]
  datasets: CategoryTrendDataset[]
}

export interface ComparisonData {
  current: number
  previous: number
  difference: number
  percentageChange: number
  status: 'INCREASED' | 'DECREASED' | 'UNCHANGED'
  message: string
}

export interface PeriodComparison {
  period: { current: string; previous: string }
  income: ComparisonData
  expense: ComparisonData
}

export interface BudgetHealthItem {
  categoryName: string
  budgetAmount: number
  actualSpent: number
  remaining?: number
  usagePercentage: number
  status: 'SAFE' | 'WARNING' | 'EXCEEDED'
}

export interface Insight {
  type: 'WARNING' | 'DANGER' | 'TIP' | 'INFO'
  title: string
  message: string
  action?: string
}

export type ReportsInterval = 'DAY' | 'MONTH'
export type ReportsType = 'INCOME' | 'EXPENSE' | 'ALL'
