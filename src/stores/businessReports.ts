import { ref } from 'vue'
import { defineStore } from 'pinia'
import { BusinessService } from '@/services/business.service'
import type {
  ProfitLossResponse,
  BalanceSheetResponse,
  CashFlowResponse,
  JournalReportResponse,
  ReportDateParams,
  BalanceSheetParams,
  JournalReportParams,
  KpiDashboardResponse,
} from '@/types/business'

export const useBusinessReportsStore = defineStore('businessReports', () => {
  const isLoading = ref(false)
  const profitLoss = ref<ProfitLossResponse | null>(null)
  const balanceSheet = ref<BalanceSheetResponse | null>(null)
  const cashFlow = ref<CashFlowResponse | null>(null)
  const journalReport = ref<JournalReportResponse | null>(null)
  const kpiDashboard = ref<KpiDashboardResponse | null>(null)

  const fetchProfitLoss = async (params?: ReportDateParams) => {
    isLoading.value = true
    try {
      profitLoss.value = await BusinessService.getProfitLoss(params)
    } finally {
      isLoading.value = false
    }
  }

  const fetchBalanceSheet = async (params?: BalanceSheetParams) => {
    isLoading.value = true
    try {
      balanceSheet.value = await BusinessService.getBalanceSheet(params)
    } finally {
      isLoading.value = false
    }
  }

  const fetchCashFlow = async (params?: ReportDateParams) => {
    isLoading.value = true
    try {
      cashFlow.value = await BusinessService.getCashFlow(params)
    } finally {
      isLoading.value = false
    }
  }

  const fetchJournalReport = async (params?: JournalReportParams) => {
    isLoading.value = true
    try {
      journalReport.value = await BusinessService.getJournalReport(params)
    } finally {
      isLoading.value = false
    }
  }

  const fetchKpiDashboard = async () => {
    isLoading.value = true
    try {
      kpiDashboard.value = await BusinessService.getKpiDashboard()
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    profitLoss,
    balanceSheet,
    cashFlow,
    journalReport,
    kpiDashboard,
    fetchProfitLoss,
    fetchBalanceSheet,
    fetchCashFlow,
    fetchJournalReport,
    fetchKpiDashboard,
  }
})
