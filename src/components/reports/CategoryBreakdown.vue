<template>
  <div class="h-full flex flex-col">
    <h3 class="text-lg font-bold text-gray-800 mb-6">Top Spending Categories</h3>

    <div
      v-if="data && data.length > 0"
      class="flex-grow overflow-auto pr-2 space-y-4 custom-scrollbar"
    >
      <div
        v-for="item in data"
        :key="item.categoryId"
        class="flex items-center justify-between group"
      >
        <div class="flex items-center gap-3">
          <!-- Icon Placeholder -->
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm"
            :style="{ backgroundColor: item.color + '20', color: item.color || '#666' }"
          >
            {{ item.icon || '🏷️' }}
          </div>
          <div>
            <p class="font-semibold text-gray-800 text-sm">{{ item.categoryName }}</p>
            <p class="text-xs text-gray-500">{{ item.transactionCount }} transactions</p>
          </div>
        </div>

        <div class="text-right">
          <p class="font-bold text-gray-800 text-sm">{{ formatCurrency(item.totalAmount) }}</p>
          <p class="text-xs font-medium" :style="{ color: item.color || '#666' }">
            {{ item.percentage.toFixed(1) }}%
          </p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="flex-grow flex flex-col items-center justify-center text-center text-gray-400"
    >
      <p>No expense data found for this period.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CategoryBreakdownItem } from '@/types/reports'

defineProps<{
  data: CategoryBreakdownItem[]
}>()

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}
</style>
