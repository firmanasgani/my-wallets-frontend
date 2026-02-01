<template>
  <div v-if="data" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Income -->
    <div
      class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between"
    >
      <div>
        <p class="text-sm text-gray-500 font-medium">Income</p>
        <p class="text-xl font-bold text-green-600">{{ formatCurrency(data.totalIncome) }}</p>
      </div>
      <div class="bg-green-100 p-2 rounded-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 11l5-5m0 0l5 5m-5-5v12"
          />
        </svg>
      </div>
    </div>

    <!-- Expense -->
    <div
      class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between"
    >
      <div>
        <p class="text-sm text-gray-500 font-medium">Expenses</p>
        <p class="text-xl font-bold text-red-600">{{ formatCurrency(data.totalExpense) }}</p>
      </div>
      <div class="bg-red-100 p-2 rounded-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 13l-5 5m0 0l-5-5m5 5V6"
          />
        </svg>
      </div>
    </div>

    <!-- Net Cash Flow -->
    <div
      class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between"
    >
      <div>
        <p class="text-sm text-gray-500 font-medium">Net Cash Flow</p>
        <p :class="['text-xl font-bold', data.netCashFlow >= 0 ? 'text-blue-600' : 'text-red-500']">
          {{ formatCurrency(data.netCashFlow) }}
        </p>
      </div>
      <div class="bg-blue-100 p-2 rounded-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    </div>

    <!-- Savings Rate -->
    <div
      class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between"
    >
      <div>
        <p class="text-sm text-gray-500 font-medium">Savings Rate</p>
        <p :class="['text-xl font-bold', getSavingsRateColor(data.savingsRate)]">
          {{ data.savingsRate.toFixed(1) }}%
        </p>
      </div>
      <div class="bg-purple-100 p-2 rounded-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 text-purple-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FinancialSummary } from '@/types/reports'

defineProps<{
  data: FinancialSummary | null
}>()

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

const getSavingsRateColor = (rate: number) => {
  if (rate >= 20) return 'text-green-600'
  if (rate > 0) return 'text-blue-600'
  return 'text-red-500'
}
</script>
