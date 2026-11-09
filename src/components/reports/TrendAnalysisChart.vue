<template>
  <div v-if="hasData" class="analysis-chart">
    <div class="analysis-chart-canvas"><Line :data="chartData" :options="chartOptions" role="img" aria-label="Grafik pemasukan, pengeluaran, dan arus kas bersih. Data lengkap tersedia di tabel berikut." /></div>
    <details class="analysis-chart-data"><summary>Lihat data grafik</summary><div class="analysis-data-scroll"><table><caption class="shell-sr-only">Data arus kas</caption><thead><tr><th scope="col">Periode</th><th v-for="(dataset, index) in data?.datasets" :key="index" scope="col">{{ analysisSeriesLabel(dataset.label) }}</th></tr></thead><tbody><tr v-for="(label, index) in data?.labels" :key="label"><th scope="row">{{ label }}</th><td v-for="(dataset, series) in data?.datasets" :key="series">{{ accountMoney(analysisNumber(dataset.data[index]), 'IDR') }}</td></tr></tbody></table></div></details>
  </div>
  <div v-else class="analysis-empty"><AppIcon name="chart" /><h3>Belum ada arus kas tercatat.</h3><p>Pilih rentang lain atau mulai catat transaksi.</p></div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, type ChartOptions } from 'chart.js'
import { Line } from 'vue-chartjs'
import AppIcon from '@/components/common/AppIcon.vue'
import { useAnalysisChartTheme } from '@/composables/useAnalysisChartTheme'
import { accountMoney } from '@/utils/accountList'
import { analysisChartLabel, analysisHasTrend, analysisNumber, analysisSeriesLabel } from '@/utils/spendingAnalysis'
import type { TrendAnalysis } from '@/types/reports'
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)
const props = defineProps<{ data: TrendAnalysis | null }>()
const theme = useAnalysisChartTheme()
const hasData = computed(() => analysisHasTrend(props.data))
const chartData = computed(() => ({ labels: props.data?.labels.map(analysisChartLabel) || [], datasets: (props.data?.datasets || []).map((dataset, index) => ({
  label: analysisSeriesLabel(dataset.label), data: dataset.data.map(analysisNumber),
  borderColor: [theme.value.income, theme.value.expense, theme.value.net][index % 3],
  backgroundColor: [theme.value.income, theme.value.expense, theme.value.net][index % 3],
  borderWidth: 2, borderDash: index === 2 ? [5, 4] : [], pointRadius: (props.data?.labels.length || 0) > 31 ? 0 : 2, pointHoverRadius: 5, tension: .15, cubicInterpolationMode: 'monotone' as const,
})) }))
const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true, maintainAspectRatio: false, animation: theme.value.reducedMotion ? false : { duration: 250 },
  plugins: { legend: { position: 'bottom', labels: { color: theme.value.ink, usePointStyle: true, padding: 18, font: { size: 10 } } }, tooltip: { mode: 'index', intersect: false, backgroundColor: theme.value.surface, titleColor: theme.value.ink, bodyColor: theme.value.ink, borderColor: theme.value.rule, borderWidth: 1, callbacks: { label: (context) => `${context.dataset.label}: ${accountMoney(context.parsed.y, 'IDR')}` } } },
  scales: { y: { beginAtZero: true, grid: { color: theme.value.rule }, ticks: { color: theme.value.muted, font: { size: 10 }, callback: (value) => Number(value).toLocaleString('id-ID', { notation: 'compact', maximumFractionDigits: 1 }) } }, x: { grid: { display: false }, ticks: { color: theme.value.muted, maxTicksLimit: 8, maxRotation: 0, font: { size: 10 } } } },
  interaction: { mode: 'index', intersect: false },
}))
</script>
