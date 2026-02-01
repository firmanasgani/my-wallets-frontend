<template>
  <div class="space-y-6">
    <!-- Header & Controls -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Spending Analysis</h1>
        <p class="text-gray-500">Deep dive into your financial habits</p>
      </div>

      <!-- Controls -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Month Selector -->
        <select
          v-model="selectedMonth"
          class="bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option v-for="m in 12" :key="m" :value="m">{{ getMonthName(m) }}</option>
        </select>

        <!-- Year Selector -->
        <select
          v-model="selectedYear"
          class="bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
        </select>

        <!-- Refresh Button -->
        <button
          @click="fetchData"
          class="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
          title="Refresh Data"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="reportsStore.isLoading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Main Content -->
    <div v-else class="space-y-8">
      <!-- 1. Financial Summary Cards -->
      <FinancialSummary :data="reportsStore.summary" />

      <!-- 2. Insights & Comparison -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <ComparisonCard :data="reportsStore.comparison" />
        </div>
        <div>
          <InsightsList :insights="reportsStore.insights" />
        </div>
      </div>

      <!-- 3. Charts Row: Trend & Breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Trend Analysis (Line Chart) -->
        <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <TrendAnalysisChart :data="reportsStore.trendAnalysis" title="Income vs Expense Trend" />
        </div>

        <!-- Category Breakdown (List/Pie) -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <CategoryBreakdown :data="reportsStore.categoryBreakdown" />
        </div>
      </div>

      <!-- 4. Category Trend (Stacked Bar) -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <CategoryTrendChart :data="reportsStore.categoryTrend" />
      </div>

      <!-- 5. Budget Health -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <BudgetHealthList :data="reportsStore.budgetHealth" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useReportsStore } from '@/stores/reports'
import FinancialSummary from '@/components/reports/FinancialSummary.vue'
import InsightsList from '@/components/reports/InsightsList.vue'
import ComparisonCard from '@/components/reports/ComparisonCard.vue'
import TrendAnalysisChart from '@/components/reports/TrendAnalysisChart.vue'
import CategoryBreakdown from '@/components/reports/CategoryBreakdown.vue'
import CategoryTrendChart from '@/components/reports/CategoryTrendChart.vue'
import BudgetHealthList from '@/components/reports/BudgetHealthList.vue'

const reportsStore = useReportsStore()

const currentDate = new Date()
const selectedMonth = ref(currentDate.getMonth() + 1)
const selectedYear = ref(currentDate.getFullYear())

// Generate last 5 years
const availableYears = computed(() => {
  const current = currentDate.getFullYear()
  return Array.from({ length: 5 }, (_, i) => current - i)
})

const getMonthName = (m: number) => {
  return new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })
}

const getDatesFromMonthYear = (m: number, y: number) => {
  // Start Date: YYYY-MM-01
  const startDate = `${y}-${String(m).padStart(2, '0')}-01`
  // End Date: Last day of month
  const lastDay = new Date(y, m, 0).getDate()
  const endDate = `${y}-${String(m).padStart(2, '0')}-${lastDay}`
  return { startDate, endDate }
}

const fetchData = async () => {
  const { startDate, endDate } = getDatesFromMonthYear(selectedMonth.value, selectedYear.value)

  // Parallel Fetching
  await Promise.all([
    reportsStore.fetchSummary(startDate, endDate),
    reportsStore.fetchComparison(selectedMonth.value, selectedYear.value),
    reportsStore.fetchInsights(selectedMonth.value, selectedYear.value),
    reportsStore.fetchCategoryBreakdown(startDate, endDate, 'EXPENSE'), // Default focus on Expense
    reportsStore.fetchTrend(startDate, endDate, 'DAY'), // Daily trend for the month
    reportsStore.fetchCategoryTrend(startDate, endDate, 'DAY', 'EXPENSE'),
    reportsStore.fetchBudgetHealth(selectedMonth.value, selectedYear.value),
  ])
}

onMounted(() => {
  fetchData()
})

watch([selectedMonth, selectedYear], () => {
  fetchData()
})
</script>
