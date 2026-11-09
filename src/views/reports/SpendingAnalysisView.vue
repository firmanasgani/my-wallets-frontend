<template>
  <div class="money-analysis">
    <header class="analysis-heading"><div><span class="shell-overline">KENALI POLANYA, ATUR LANGKAHNYA</span><h1>Pahami ke mana uangmu pergi.</h1><p>Lihat arus kas, kategori pengeluaran, dan perkembangan rencana keuanganmu.</p></div><div class="analysis-actions"><button type="button" class="analysis-button" :disabled="!canExport || exporting" @click="exportReport('excel')"><AppIcon name="download" />Excel</button><button type="button" class="analysis-button" :disabled="!canExport || exporting" @click="exportReport('pdf')"><AppIcon name="file" />PDF</button><button type="button" class="analysis-button is-primary" :disabled="store.isLoading" @click="fetchData"><span v-if="store.isLoading" class="analysis-spinner" aria-hidden="true"></span><AppIcon v-else name="refresh" />Muat ulang</button></div></header>
    <section class="analysis-toolbar" aria-label="Filter analisis">
      <DateRangePicker :start-date="filters.startDate" :end-date="filters.endDate" label="Rentang analisis" @apply="applyRange" />
      <AppSelect id="analysis-interval" :model-value="filters.interval" :options="intervalOptions" label="Kelompokkan grafik" @update:model-value="setInterval" />
      <div class="analysis-period-note"><AppIcon name="calendar" /><div><strong>{{ rangeLabel }}</strong><p>Ringkasan dan grafik mengikuti rentang ini.</p></div></div>
    </section>
    <p v-if="exporting" class="analysis-export-status" role="status">Menyiapkan laporan {{ exportFormat === 'excel' ? 'Excel' : 'PDF' }}...</p>
    <div v-if="store.isLoading" class="analysis-state" role="status"><span class="analysis-spinner" aria-hidden="true"></span><h2>Menyusun gambaran keuanganmu...</h2><p>Memuat ringkasan, tren, dan sorotan periode pilihan.</p></div>
    <div v-else-if="store.sectionErrors.length === 6" class="analysis-state" role="alert"><AppIcon name="help" /><h2>Analisis belum berhasil dimuat.</h2><p>Periksa koneksi, lalu coba muat ulang laporan.</p><button type="button" class="analysis-button is-primary" @click="fetchData">Coba lagi</button></div>
    <template v-else-if="data">
      <div v-if="store.sectionErrors.length" class="analysis-partial-error" role="alert"><AppIcon name="warning" /><p>Beberapa bagian belum tersedia. Bagian yang berhasil dimuat tetap bisa dilihat. Lengkapi laporan sebelum mengekspor.</p><button type="button" class="analysis-button" @click="fetchData">Muat ulang</button></div>
      <FinancialSummary v-if="data.summary" :data="data.summary" />
      <AnalysisSectionError v-else label="Ringkasan keuangan" @retry="fetchData" />
      <div v-if="data.summary && !analysisNumber(data.summary.totalIncome) && !analysisNumber(data.summary.totalExpense)" class="analysis-zero-note"><AppIcon name="info" /><p>Belum ada pemasukan atau pengeluaran dalam rentang ini. Transfer antar akun tidak termasuk arus kas.</p><RouterLink :to="{ name: 'transaction-create', query: { startDate: filters.startDate, endDate: filters.endDate } }">Catat transaksi <AppIcon name="arrow" /></RouterLink></div>
      <div class="analysis-charts-layout">
        <section class="analysis-panel" aria-labelledby="cashflow-heading"><header class="analysis-panel-heading"><div><span class="shell-overline">GAMBARAN BESAR</span><h2 id="cashflow-heading">Pemasukan &amp; pengeluaran</h2><p>Arus kas pada rentang pilihan, per {{ filters.interval === 'DAY' ? 'hari' : 'bulan' }}.</p></div><RouterLink :to="{ name: 'transactions-list', query: { startDate: filters.startDate, endDate: filters.endDate } }" class="analysis-text-link">Lihat transaksi <AppIcon name="arrow" /></RouterLink></header><TrendAnalysisChart v-if="data.trend" :data="data.trend" /><AnalysisSectionError v-else label="Tren arus kas" @retry="fetchData" /></section>
        <section class="analysis-panel" aria-labelledby="categories-heading"><header class="analysis-panel-heading"><div><span class="shell-overline">PORSI PENGELUARAN</span><h2 id="categories-heading">Kategori dominan</h2><p>Lima kategori teratas; kategori lain digabung sebagai Lainnya.</p></div></header><CategoryBreakdown v-if="data.categories" :data="data.categories" /><AnalysisSectionError v-else label="Distribusi kategori" @retry="fetchData" /></section>
      </div>
      <section class="analysis-panel" aria-labelledby="category-trend-heading"><header class="analysis-panel-heading"><div><span class="shell-overline">KEBIASAAN DARI WAKTU KE WAKTU</span><h2 id="category-trend-heading">Tren pengeluaran kategori</h2><p>Bandingkan komposisi kategori pada setiap {{ filters.interval === 'DAY' ? 'hari' : 'bulan' }} yang memiliki transaksi.</p></div><span class="analysis-period-pill">{{ rangeLabel }}</span></header><CategoryTrendChart v-if="data.categories" :data="data.categories" /><AnalysisSectionError v-else label="Tren kategori" @retry="fetchData" /></section>
      <div class="analysis-month-divider"><AppIcon name="calendar" /><div><span class="shell-overline">KONTEKS BULANAN</span><h2>{{ monthly.label }}</h2><p>Perbandingan, sorotan, dan anggaran memakai satu bulan penuh sesuai tanggal akhir rentang pilihan.</p></div></div>
      <div class="analysis-month-layout">
        <section class="analysis-panel" aria-labelledby="comparison-heading"><header class="analysis-panel-heading"><div><span class="shell-overline">BANDINGKAN PERUBAHANNYA</span><h2 id="comparison-heading">Dibanding bulan sebelumnya</h2><p>{{ monthly.label }} dibanding {{ previousMonthLabel }}.</p></div></header><ComparisonCard v-if="data.comparison" :data="data.comparison" /><AnalysisSectionError v-else label="Perbandingan bulanan" @retry="fetchData" /></section>
        <section class="analysis-panel is-insights" aria-labelledby="insights-heading"><header class="analysis-panel-heading"><div><span class="shell-overline">CATATAN UNTUK LANGKAH BERIKUTNYA</span><h2 id="insights-heading">Sorotan keuangan</h2><p>Catatan otomatis untuk {{ monthly.label }}.</p></div></header><InsightsList v-if="data.insights" :insights="data.insights" /><AnalysisSectionError v-else label="Sorotan bulanan" @retry="fetchData" /></section>
      </div>
      <section class="analysis-panel" aria-labelledby="budget-health-heading"><header class="analysis-panel-heading"><div><span class="shell-overline">JAGA RENCANAMU TETAP TERARAH</span><h2 id="budget-health-heading">Kondisi anggaran pengeluaran</h2><p>Realisasi anggaran {{ monthly.label }}. Selisih negatif berarti melewati batas.</p></div><RouterLink :to="{ name: 'budget-report', query: { year: String(monthly.year), month: String(monthly.month) } }" class="analysis-text-link">Lihat anggaran <AppIcon name="arrow" /></RouterLink></header><BudgetHealthList v-if="data.budgets" :data="data.budgets" /><AnalysisSectionError v-else label="Realisasi anggaran" @retry="fetchData" /></section>
      <footer class="analysis-footnote"><AppIcon name="info" /><p>Ringkasan arus kas tidak mencakup transfer antar akun. Data kategori mengikuti pengelompokan transaksi; laporan bulanan memiliki cakupan tersendiri seperti tertulis di setiap bagian.</p></footer>
    </template>
  </div>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useReportsStore } from '@/stores/reports'
import { useToastStore } from '@/stores/toast'
import AppIcon from '@/components/common/AppIcon.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import DateRangePicker from '@/components/common/DateRangePicker.vue'
import FinancialSummary from '@/components/reports/FinancialSummary.vue'
import InsightsList from '@/components/reports/InsightsList.vue'
import ComparisonCard from '@/components/reports/ComparisonCard.vue'
import TrendAnalysisChart from '@/components/reports/TrendAnalysisChart.vue'
import CategoryBreakdown from '@/components/reports/CategoryBreakdown.vue'
import CategoryTrendChart from '@/components/reports/CategoryTrendChart.vue'
import BudgetHealthList from '@/components/reports/BudgetHealthList.vue'
import AnalysisSectionError from '@/components/reports/AnalysisSectionError.vue'
import { analysisFilters, analysisMonth, analysisNumber, analysisRangeLabel } from '@/utils/spendingAnalysis'
import type { DateRange } from '@/utils/dateRange'
import type { ReportsInterval, SpendingAnalysisData } from '@/types/reports'
import '@/assets/categories.css'
import '@/assets/spending-analysis.css'

const route = useRoute(), router = useRouter(), store = useReportsStore(), toast = useToastStore()
const filters = computed(() => analysisFilters(route.query))
const data = computed(() => store.analysis)
const rangeLabel = computed(() => analysisRangeLabel(filters.value))
const monthly = computed(() => analysisMonth(filters.value.endDate))
const previousMonthLabel = computed(() => new Date(monthly.value.year, monthly.value.month - 2, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }))
const intervalOptions: { value: ReportsInterval; label: string }[] = [{ value: 'DAY', label: 'Harian' }, { value: 'MONTH', label: 'Bulanan' }]
const applyRange = (range: DateRange) => router.replace({ query: { ...route.query, startDate: range.startDate, endDate: range.endDate } })
const setInterval = (interval: ReportsInterval) => router.replace({ query: { ...route.query, interval } })
const fetchData = () => store.fetchAnalysis({ ...filters.value })
const canExport = computed(() => !!data.value && !store.isLoading && !store.sectionErrors.length)
const exporting = ref(false), exportFormat = ref<'excel' | 'pdf'>('excel')
const exportReport = async (format: 'excel' | 'pdf') => {
  if (!canExport.value || exporting.value || !data.value) return
  const snapshot = JSON.parse(JSON.stringify(data.value)) as SpendingAnalysisData, period = { ...filters.value }
  exporting.value = true; exportFormat.value = format
  try {
    const { default: service } = await import('@/services/exportService')
    if (format === 'excel') await service.exportSpendingAnalysisToExcel(snapshot, period)
    else await service.exportSpendingAnalysisToPDF(snapshot, period)
  } catch { toast.show('Laporan belum berhasil diekspor. Silakan coba lagi.', 'error') }
  finally { exporting.value = false }
}
watch(() => `${filters.value.startDate}|${filters.value.endDate}|${filters.value.interval}`, fetchData, { immediate: true })
onBeforeUnmount(() => store.cancelPending())
</script>
