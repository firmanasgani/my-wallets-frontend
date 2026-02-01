<template>
  <div class="h-full flex flex-col">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-bold text-gray-800">{{ title }}</h3>
    </div>
    <div class="flex-grow min-h-[300px] relative">
      <Line v-if="chartData" :data="chartData" :options="chartOptions" />
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
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'vue-chartjs'
import type { TrendAnalysis } from '@/types/reports'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

const props = defineProps<{
  data: TrendAnalysis | null
  title: string
}>()

const chartData = computed(() => {
  if (!props.data) return null
  return {
    labels: props.data.labels,
    datasets: props.data.datasets.map((ds) => ({
      ...ds,
      fill: true,
      tension: 0.4, // Smooth curves
    })),
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
    y: {
      beginAtZero: true,
      grid: {
        color: '#f3f4f6',
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
  interaction: {
    mode: 'nearest' as const,
    axis: 'x' as const,
    intersect: false,
  },
}
</script>
