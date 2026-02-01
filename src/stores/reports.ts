import { defineStore } from 'pinia'
import { ref } from 'vue'
import reportsService from '@/services/reports.service'
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

export const useReportsStore = defineStore('reports', () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Data States
  const summary = ref<FinancialSummary | null>(null)
  const categoryBreakdown = ref<CategoryBreakdownItem[]>([])
  const trendAnalysis = ref<TrendAnalysis | null>(null)
  const categoryTrend = ref<CategoryTrendAnalysis | null>(null)
  const comparison = ref<PeriodComparison | null>(null)
  const budgetHealth = ref<BudgetHealthItem[]>([])
  const insights = ref<Insight[]>([])

  // Actions
  async function fetchSummary(startDate: string, endDate: string) {
    isLoading.value = true
    error.value = null
    try {
      summary.value = await reportsService.getSummary(startDate, endDate)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch summary'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCategoryBreakdown(
    startDate: string,
    endDate: string,
    type: 'INCOME' | 'EXPENSE',
  ) {
    isLoading.value = true
    error.value = null
    try {
      categoryBreakdown.value = await reportsService.getCategoryBreakdown(startDate, endDate, type)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch category breakdown'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTrend(
    startDate: string,
    endDate: string,
    interval: ReportsInterval,
    type?: ReportsType,
    categoryId?: string,
  ) {
    isLoading.value = true
    error.value = null
    try {
      trendAnalysis.value = await reportsService.getTrend(
        startDate,
        endDate,
        interval,
        type,
        categoryId,
      )
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch trend analysis'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCategoryTrend(
    startDate: string,
    endDate: string,
    interval: ReportsInterval,
    type: 'INCOME' | 'EXPENSE',
  ) {
    isLoading.value = true
    error.value = null
    try {
      categoryTrend.value = await reportsService.getCategoryTrend(
        startDate,
        endDate,
        interval,
        type,
      )
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch category trend'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchComparison(month: number, year: number, target: ReportsType = 'ALL') {
    isLoading.value = true
    error.value = null
    try {
      comparison.value = await reportsService.getComparison(month, year, target)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch comparison'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchBudgetHealth(month: number, year: number) {
    isLoading.value = true
    error.value = null
    try {
      budgetHealth.value = await reportsService.getBudgetHealth(month, year)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch budget health'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchInsights(month?: number, year?: number) {
    isLoading.value = true
    error.value = null
    try {
      insights.value = await reportsService.getInsights(month, year)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch insights'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    summary,
    categoryBreakdown,
    trendAnalysis,
    categoryTrend,
    comparison,
    budgetHealth,
    insights,
    fetchSummary,
    fetchCategoryBreakdown,
    fetchTrend,
    fetchCategoryTrend,
    fetchComparison,
    fetchBudgetHealth,
    fetchInsights,
  }
})
