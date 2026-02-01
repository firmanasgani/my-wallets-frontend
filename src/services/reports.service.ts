import apiClient from './apiService'
import type {
  FinancialSummary,
  CategoryBreakdownItem,
  TrendAnalysis,
  CategoryTrendAnalysis,
  PeriodComparison,
  BudgetHealthItem,
  Insight,
  ReportsInterval,
  ReportsType,
} from '@/types/reports'

class ReportsService {
  async getSummary(startDate: string, endDate: string): Promise<FinancialSummary> {
    const response = await apiClient.get<FinancialSummary>('/reports/summary', {
      params: { startDate, endDate },
    })
    return response.data
  }

  async getCategoryBreakdown(
    startDate: string,
    endDate: string,
    type: 'INCOME' | 'EXPENSE' = 'EXPENSE',
  ): Promise<CategoryBreakdownItem[]> {
    const response = await apiClient.get<CategoryBreakdownItem[]>('/reports/category-breakdown', {
      params: { startDate, endDate, type },
    })
    return response.data
  }

  async getTrend(
    startDate: string,
    endDate: string,
    interval: ReportsInterval,
    type?: ReportsType,
    categoryId?: string,
  ): Promise<TrendAnalysis> {
    const response = await apiClient.get<TrendAnalysis>('/reports/trend', {
      params: { startDate, endDate, interval, type, categoryId },
    })
    return response.data
  }

  async getCategoryTrend(
    startDate: string,
    endDate: string,
    interval: ReportsInterval,
    type: 'INCOME' | 'EXPENSE',
  ): Promise<CategoryTrendAnalysis> {
    const response = await apiClient.get<CategoryTrendAnalysis>('/reports/category-trend', {
      params: { startDate, endDate, interval, type },
    })
    return response.data
  }

  async getComparison(
    month: number,
    year: number,
    target: ReportsType = 'ALL',
  ): Promise<PeriodComparison> {
    const response = await apiClient.get<PeriodComparison>('/reports/comparison', {
      params: { month, year, target },
    })
    return response.data
  }

  async getBudgetHealth(month: number, year: number): Promise<BudgetHealthItem[]> {
    const response = await apiClient.get<BudgetHealthItem[]>('/reports/budget-health', {
      params: { month, year },
    })
    return response.data
  }

  async getInsights(month?: number, year?: number): Promise<Insight[]> {
    const response = await apiClient.get<Insight[]>('/reports/insights', {
      params: { month, year },
    })
    return response.data
  }
}

export default new ReportsService()
