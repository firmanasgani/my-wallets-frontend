<template>
  <div class="h-full flex flex-col">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-bold text-gray-800">Category Spending Distribution</h3>
    </div>

    <div class="flex-grow min-h-[350px] relative flex items-center justify-center">
      <Doughnut v-if="chartData" :data="chartData" :options="chartOptions" />
      <div v-else class="absolute inset-0 flex items-center justify-center text-gray-400">
        No Data to Display
      </div>

      <!-- Center Text -->
      <div
        v-if="chartData"
        class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
      >
        <span class="text-xs text-gray-500 font-medium">TOTAL</span>
        <span class="text-lg font-bold text-gray-800">{{ formatCurrency(totalAmount) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import type { CategoryTrendAnalysis } from '@/types/reports'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  data: CategoryTrendAnalysis | null
}>()

const totalAmount = computed(() => {
  if (!props.data) return 0
  return props.data.datasets.reduce((sum, ds) => {
    return sum + ds.data.reduce((a, b) => a + b, 0)
  }, 0)
})

const chartData = computed(() => {
  if (!props.data || props.data.datasets.length === 0) return null

  return {
    labels: props.data.datasets.map((ds) => ds.label),
    datasets: [
      {
        data: props.data.datasets.map((ds) => ds.data.reduce((a, b) => a + b, 0)),
        backgroundColor: props.data.datasets.map((ds) => ds.backgroundColor),
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 12,
        spacing: 2,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%', // Makes it a donut
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 11,
        },
      },
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          const value = context.raw
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return `${context.label}: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)} (${percentage}%)`
        },
      },
    },
  },
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}
</script>
