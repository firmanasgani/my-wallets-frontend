<template>
  <div class="h-full flex flex-col">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-bold text-gray-800">Category Trends (Daily)</h3>
    </div>
    <div class="flex-grow min-h-[300px] relative">
      <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
      <div v-else class="absolute inset-0 flex items-center justify-center text-gray-400">
        Loading or No Data
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'vue-chartjs'
import type { CategoryTrendAnalysis } from '@/types/reports'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  data: CategoryTrendAnalysis | null
}>()

const chartData = computed(() => {
  if (!props.data) return null
  return {
    labels: props.data.labels,
    datasets: props.data.datasets,
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
    },
  },
  scales: {
    x: {
      stacked: true,
      grid: {
        display: false,
      },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      grid: {
        color: '#f3f4f6',
      },
    },
  },
}
</script>
