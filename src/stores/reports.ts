import { defineStore } from 'pinia'
import { ref } from 'vue'
import reportsService from '@/services/reports.service'
import { analysisMonth } from '@/utils/spendingAnalysis'
import type { AnalysisFilters, AnalysisSection, SpendingAnalysisData } from '@/types/reports'

export const useReportsStore = defineStore('reports', () => {
  const isLoading = ref(false)
  const analysis = ref<SpendingAnalysisData | null>(null)
  const sectionErrors = ref<AnalysisSection[]>([])
  let request = 0
  const value = <T>(result: PromiseSettledResult<T>) => result.status === 'fulfilled' ? result.value : null

  async function fetchAnalysis(filters: AnalysisFilters) {
    const version = ++request
    const { startDate, endDate, interval } = filters
    const { month, year } = analysisMonth(endDate)
    isLoading.value = true
    sectionErrors.value = []
    try {
      const results = await Promise.allSettled([
        reportsService.getSummary(startDate, endDate),
        reportsService.getTrend(startDate, endDate, interval),
        reportsService.getCategoryTrend(startDate, endDate, interval, 'EXPENSE'),
        reportsService.getComparison(month, year),
        reportsService.getInsights(month, year),
        reportsService.getBudgetRealization(year, month),
      ])
      if (version !== request) return
      const sections: AnalysisSection[] = ['summary', 'trend', 'categories', 'comparison', 'insights', 'budgets']
      sectionErrors.value = sections.filter((_, index) => results[index]?.status === 'rejected')
      analysis.value = { summary: value(results[0]), trend: value(results[1]), categories: value(results[2]), comparison: value(results[3]), insights: value(results[4]), budgets: value(results[5]) }
    } finally { if (version === request) isLoading.value = false }
  }
  function cancelPending() { request++; isLoading.value = false }
  return { isLoading, analysis, sectionErrors, fetchAnalysis, cancelPending }
})
