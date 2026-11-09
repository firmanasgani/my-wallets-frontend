<template>
  <div v-if="hasData" class="analysis-chart">
    <div class="analysis-chart-canvas"><Bar :data="chartData" :options="chartOptions" role="img" aria-label="Grafik pengeluaran per kategori sepanjang rentang pilihan. Data lengkap tersedia di tabel berikut." /></div>
    <details class="analysis-chart-data"><summary>Lihat data grafik</summary><div class="analysis-data-scroll"><table><caption class="shell-sr-only">Data pengeluaran kategori</caption><thead><tr><th scope="col">Periode</th><th v-for="(dataset, series) in data?.datasets" :key="series" scope="col">{{ dataset.label }}</th></tr></thead><tbody><tr v-for="(label, index) in data?.labels" :key="label"><th scope="row">{{ label }}</th><td v-for="(dataset, series) in data?.datasets" :key="series">{{ accountMoney(analysisNumber(dataset.data[index]), 'IDR') }}</td></tr></tbody></table></div></details>
  </div>
  <div v-else class="analysis-empty"><AppIcon name="chart" /><h3>Belum ada tren kategori.</h3><p>Pengeluaran per kategori akan tampil sesuai rentang pilihan.</p></div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, type ChartOptions } from 'chart.js'
import { Bar } from 'vue-chartjs'
import AppIcon from '@/components/common/AppIcon.vue'
import { useAnalysisChartTheme } from '@/composables/useAnalysisChartTheme'
import { accountMoney } from '@/utils/accountList'
import { analysisChartLabel, analysisHasTrend, analysisNumber, analysisColors } from '@/utils/spendingAnalysis'
import { normalizeCategoryColor } from '@/utils/categoryTree'
import type { CategoryTrendAnalysis } from '@/types/reports'
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)
const props = defineProps<{ data: CategoryTrendAnalysis | null }>()
const theme = useAnalysisChartTheme()
const hasData = computed(() => analysisHasTrend(props.data))
const chartData = computed(() => ({ labels: props.data?.labels.map(analysisChartLabel) || [], datasets: (props.data?.datasets || []).map((dataset, index) => ({ label: dataset.label, data: dataset.data.map(analysisNumber), backgroundColor: normalizeCategoryColor(dataset.backgroundColor) || analysisColors[index % analysisColors.length]!, borderWidth: 0, maxBarThickness: 42 })) }))
const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true, maintainAspectRatio: false, animation: theme.value.reducedMotion ? false : { duration: 250 },
  plugins: { legend: { position: 'bottom', labels: { color: theme.value.ink, usePointStyle: true, padding: 18, font: { size: 10 } } }, tooltip: { backgroundColor: theme.value.surface, titleColor: theme.value.ink, bodyColor: theme.value.ink, borderColor: theme.value.rule, borderWidth: 1, callbacks: { label: (context) => `${context.dataset.label}: ${accountMoney(context.parsed.y, 'IDR')}` } } },
  scales: { y: { stacked: true, beginAtZero: true, grid: { color: theme.value.rule }, ticks: { color: theme.value.muted, font: { size: 10 }, callback: (value) => Number(value).toLocaleString('id-ID', { notation: 'compact', maximumFractionDigits: 1 }) } }, x: { stacked: true, grid: { display: false }, ticks: { color: theme.value.muted, maxTicksLimit: 8, maxRotation: 0, font: { size: 10 } } } },
  interaction: { mode: 'index', intersect: false },
}))
</script>
