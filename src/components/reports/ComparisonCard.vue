<template>
  <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-bold text-gray-800">Month-over-Month Comparison</h3>
      <span v-if="data" class="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
        {{ data.period.current }} vs {{ data.period.previous }}
      </span>
    </div>

    <div v-if="data" class="grid grid-cols-2 gap-6 flex-grow">
      <!-- Income Comparison -->
      <div class="flex flex-col justify-center">
        <p class="text-sm text-gray-500 mb-1">Income Change</p>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold text-gray-800"
            >{{ data.income.percentageChange > 0 ? '+' : ''
            }}{{ data.income.percentageChange.toFixed(1) }}%</span
          >
          <span
            :class="[
              'text-xs font-medium px-2 py-0.5 rounded',
              data.income.percentageChange >= 0
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700',
            ]"
          >
            {{ data.income.status }}
          </span>
        </div>
        <p class="text-xs text-gray-500 mt-2">{{ data.income.message }}</p>
        <div class="mt-3 w-full bg-gray-100 rounded-full h-1.5 dark:bg-gray-200">
          <!-- Simple visual bar showing magnitude (capped at 100%) -->
          <div
            :class="[
              'h-1.5 rounded-full',
              data.income.percentageChange >= 0 ? 'bg-green-500' : 'bg-red-500',
            ]"
            :style="{ width: Math.min(Math.abs(data.income.percentageChange), 100) + '%' }"
          ></div>
        </div>
      </div>

      <!-- Expense Comparison -->
      <div class="flex flex-col justify-center">
        <p class="text-sm text-gray-500 mb-1">Expense Change</p>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold text-gray-800"
            >{{ data.expense.percentageChange > 0 ? '+' : ''
            }}{{ data.expense.percentageChange.toFixed(1) }}%</span
          >
          <span
            :class="[
              'text-xs font-medium px-2 py-0.5 rounded',
              data.expense.percentageChange <= 0
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700',
            ]"
          >
            {{ data.expense.status }}
          </span>
        </div>
        <p class="text-xs text-gray-500 mt-2">{{ data.expense.message }}</p>
        <div class="mt-3 w-full bg-gray-100 rounded-full h-1.5 dark:bg-gray-200">
          <div
            :class="[
              'h-1.5 rounded-full',
              data.expense.percentageChange <= 0 ? 'bg-green-500' : 'bg-red-500',
            ]"
            :style="{ width: Math.min(Math.abs(data.expense.percentageChange), 100) + '%' }"
          ></div>
        </div>
      </div>
    </div>
    <div v-else class="flex-grow flex items-center justify-center text-gray-400">
      No comparison data available
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PeriodComparison } from '@/types/reports'

defineProps<{
  data: PeriodComparison | null
}>()
</script>
