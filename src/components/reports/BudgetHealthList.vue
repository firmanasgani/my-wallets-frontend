<template>
  <div>
    <h3 class="text-lg font-bold text-gray-800 mb-6">Budget Health</h3>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th
              class="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
            >
              Category
            </th>
            <th
              class="px-3 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider"
            >
              Budget
            </th>
            <th
              class="px-3 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider"
            >
              Spent
            </th>
            <th
              class="px-3 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider"
            >
              Remaining
            </th>
            <th
              class="px-3 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="!data || data.length === 0">
            <td colspan="5" class="px-3 py-4 text-center text-sm text-gray-500">
              No active budgets for this period.
            </td>
          </tr>
          <tr v-for="(item, index) in data" :key="index">
            <td
              class="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-3"
            >
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                :style="{
                  backgroundColor: (item.color || '#64748b') + '20',
                  color: item.color || '#64748b',
                }"
              >
                <span v-if="item.icon">
                  <i :class="['fa-solid', `fa-${item.icon}`]"></i>
                </span>
                <span v-else>🏷️</span>
              </div>
              {{ item.categoryName }}
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
              {{ formatCurrency(item.budgetAmount) }}
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
              {{ formatCurrency(item.actualSpent) }}
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-right font-medium">
              {{ formatCurrency(item.remaining || item.budgetAmount - item.actualSpent) }}
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-center">
              <span
                :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  getStatusClass(item.status),
                ]"
              >
                {{ item.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BudgetHealthItem } from '@/types/reports'

defineProps<{
  data: BudgetHealthItem[]
}>()

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'SAFE':
      return 'bg-green-100 text-green-800'
    case 'WARNING':
      return 'bg-yellow-100 text-yellow-800'
    case 'EXCEEDED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>
