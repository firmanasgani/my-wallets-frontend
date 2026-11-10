<template>
  <div class="profit-loss-page">
    <!-- Header -->
    <div class="profit-heading">
      <div>
        <span class="shell-overline">RINGKASAN KINERJA BISNIS</span>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Laporan Laba Rugi</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Profit & Loss — pendapatan vs beban dalam periode tertentu.</p>
      </div>
      <div v-if="data" class="flex items-center gap-1.5 shrink-0">
        <button @click="doExportExcel" :disabled="isExporting" class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <span>Excel</span>
        </button>
        <button @click="doExportPDF" :disabled="isExporting" class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors disabled:opacity-50">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          <span>PDF</span>
        </button>
      </div>
    </div>

    <!-- Disclaimer -->
    <div class="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3">
      <svg class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <p class="text-xs text-amber-700 dark:text-amber-300">Laporan ini belum termasuk Penutupan Periode (Period Closing). Nilai kumulatif sejak company dibuat.</p>
    </div>

    <!-- Filters -->
    <div class="profit-filters">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <DateRangePicker class="sm:col-span-2" :start-date="filters.startDate" :end-date="filters.endDate" @apply="applyDateRange" />
        <div class="flex items-end gap-2">
          <button
            @click="loadReport"
            class="flex-1 px-4 py-1.5 text-sm font-medium bg-[#2E8B57] hover:bg-[#236B43] text-white rounded-lg transition-colors"
          >
            Tampilkan
          </button>
          <button
            @click="resetFilters"
            class="px-3 py-1.5 text-sm font-medium bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            title="Reset ke bulan ini"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="errorMsg" class="mb-4 rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800">
      <p class="text-sm font-medium text-red-800 dark:text-red-300">{{ errorMsg }}</p>
    </div>

    <!-- Loading -->
    <div v-if="reportsStore.isLoading" class="flex justify-center p-12">
      <svg class="w-8 h-8 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <!-- Report Content -->
    <div v-else-if="data" class="space-y-4">
      <!-- Period Badge -->
      <div class="text-sm text-slate-500 dark:text-slate-400">
        Periode:
        <span class="font-medium text-slate-700 dark:text-slate-200">
          {{ data.period.startDate ? formatDate(data.period.startDate) : 'Awal' }}
          –
          {{ data.period.endDate ? formatDate(data.period.endDate) : 'Sekarang' }}
        </span>
      </div>

      <div class="profit-summary">
        <div><span>Total pendapatan</span><strong>{{ formatRp(data.revenue.total) }}</strong></div>
        <div><span>Total beban</span><strong>{{ formatRp(data.expense.total) }}</strong></div>
        <div><span>{{ data.isProfit ? 'Laba bersih' : 'Rugi bersih' }}</span><strong>{{ formatRp(data.netProfit) }}</strong></div>
      </div>
      <div class="profit-detail-heading"><span class="shell-overline">RINCIAN LAPORAN</span><h2>Pendapatan &amp; beban</h2><p>Rincian akun untuk periode yang dipilih.</p></div>
      <!-- Revenue Section -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 border-b border-slate-200 dark:border-slate-700">
          <h2 class="text-sm font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Pendapatan</h2>
        </div>
        <div class="divide-y divide-slate-100 dark:divide-slate-700">
          <div
            v-for="acc in data.revenue.accounts"
            :key="acc.coaCode"
            class="flex justify-between items-center px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span class="text-sm text-slate-600 dark:text-slate-300">
              <span class="font-mono text-xs text-slate-400 dark:text-slate-500 mr-2">{{ acc.coaCode }}</span>
              {{ acc.coaName }}
            </span>
            <span class="text-sm font-medium text-slate-800 dark:text-slate-100 tabular-nums">{{ formatRp(acc.amount) }}</span>
          </div>
        </div>
        <div class="flex justify-between items-center px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 border-t border-slate-200 dark:border-slate-700">
          <span class="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Total Pendapatan</span>
          <span class="text-base font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{{ formatRp(data.revenue.total) }}</span>
        </div>
      </div>

      <!-- Expense Section -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-5 py-3 bg-red-50 dark:bg-red-900/20 border-b border-slate-200 dark:border-slate-700">
          <h2 class="text-sm font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide">Beban</h2>
        </div>
        <div class="divide-y divide-slate-100 dark:divide-slate-700">
          <div
            v-for="acc in data.expense.accounts"
            :key="acc.coaCode"
            class="flex justify-between items-center px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span class="text-sm text-slate-600 dark:text-slate-300">
              <span class="font-mono text-xs text-slate-400 dark:text-slate-500 mr-2">{{ acc.coaCode }}</span>
              {{ acc.coaName }}
            </span>
            <span class="text-sm font-medium text-slate-800 dark:text-slate-100 tabular-nums">{{ formatRp(acc.amount) }}</span>
          </div>
        </div>
        <div class="flex justify-between items-center px-5 py-3 bg-red-50 dark:bg-red-900/20 border-t border-slate-200 dark:border-slate-700">
          <span class="text-sm font-semibold text-red-700 dark:text-red-400">Total Beban</span>
          <span class="text-base font-bold text-red-700 dark:text-red-400 tabular-nums">{{ formatRp(data.expense.total) }}</span>
        </div>
      </div>

      <!-- Net Profit / Loss -->
      <div
        :class="[
          'rounded-xl border p-5 flex justify-between items-center',
          data.isProfit
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700',
        ]"
      >
        <span :class="['text-base font-bold', data.isProfit ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400']">
          {{ data.isProfit ? 'Laba Bersih' : 'Rugi Bersih' }}
        </span>
        <span :class="['text-xl font-extrabold tabular-nums', data.isProfit ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400']">
          {{ formatRp(data.netProfit) }}
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!reportsStore.isLoading"
      class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center"
    >
      <svg class="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p class="text-base font-medium text-slate-700 dark:text-slate-300">Pilih periode lalu klik Tampilkan</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import DateRangePicker from '@/components/common/DateRangePicker.vue'
import { dateKey, type DateRange } from '@/utils/dateRange'
import { ref, computed, onMounted } from 'vue'
import { useBusinessReportsStore } from '@/stores/businessReports'
import { useBusinessStore } from '@/stores/business'
import ExportService from '@/services/exportService'

const reportsStore = useBusinessReportsStore()
const businessStore = useBusinessStore()
const isExporting = ref(false)

const errorMsg = ref('')

const today = new Date()
const firstOfMonth = dateKey(new Date(today.getFullYear(), today.getMonth(), 1))

const filters = ref({
  startDate: firstOfMonth,
  endDate: dateKey(today),
})

const data = computed(() => reportsStore.profitLoss)

onMounted(() => loadReport())

async function loadReport() {
  errorMsg.value = ''
  try {
    await reportsStore.fetchProfitLoss({
      startDate: filters.value.startDate || undefined,
      endDate: filters.value.endDate || undefined,
    })
  } catch {
    errorMsg.value = 'Gagal memuat laporan laba rugi.'
  }
}

async function doExportExcel() {
  if (!data.value) return
  isExporting.value = true
  try {
    await ExportService.exportProfitLossToExcel(data.value, businessStore.currentCompany?.name, filters.value)
  } finally { isExporting.value = false }
}

function doExportPDF() {
  if (!data.value) return
  ExportService.exportProfitLossToPDF(data.value, businessStore.currentCompany?.name, filters.value)
}

function resetFilters() {
  filters.value = {
    startDate: firstOfMonth,
    endDate: dateKey(today),
  }
  loadReport()
}

function formatRp(amount: string | number) {
  const val = typeof amount === 'string' ? parseFloat(amount) : amount
  return 'Rp ' + val.toLocaleString('id-ID')
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
const applyDateRange = (range: DateRange) => {
  Object.assign(filters.value, range)
  loadReport()
}
</script>

<style scoped>
.profit-loss-page { --ink: var(--shell-ink, #27231d); --muted: var(--shell-muted, #6c6256); --surface: var(--shell-surface, #fffcf5); --rule: var(--shell-rule, #e2d8c7); width: min(100%, 1280px); margin: auto; padding: clamp(20px, 3.2vw, 40px) clamp(16px, 2.8vw, 30px); color: var(--ink); }
.profit-heading { display: flex; justify-content: space-between; align-items: end; gap: 20px; padding: 28px; margin-bottom: 18px; border: 1px solid var(--rule); border-radius: 22px; background: var(--surface); }
.profit-heading h1 { margin: 7px 0 0; color: var(--ink); font-size: clamp(27px, 3.2vw, 39px); font-weight: 900; letter-spacing: -.05em; line-height: 1.05; }
.profit-heading p { color: var(--muted); line-height: 1.6; }
.profit-heading button { min-height: 40px; padding: 9px 15px; border: 1px solid var(--rule); border-radius: 999px; background: var(--surface); color: var(--ink); font-weight: 750; }
.profit-heading button:hover { background: var(--shell-lilac, #eee4ff); }
.profit-filters { margin-bottom: 24px; padding: 20px; border: 1px solid var(--rule); border-radius: 18px; background: var(--surface); }
.profit-filters button { min-height: 38px; border-radius: 999px; }
.profit-summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border: 1px solid var(--rule); border-radius: 18px; background: var(--surface); overflow: hidden; }
.profit-summary > div { display: flex; flex-direction: column; gap: 10px; padding: 22px 24px; min-width: 0; }
.profit-summary > div + div { border-left: 1px solid var(--rule); }
.profit-summary span { color: var(--muted); font-size: 12px; font-weight: 700; }
.profit-summary strong { color: var(--ink); font-size: clamp(17px, 2vw, 25px); letter-spacing: -.04em; overflow-wrap: anywhere; }
.profit-detail-heading { padding: 20px 0 2px; }
.profit-detail-heading h2 { margin: 5px 0 3px; color: var(--ink); font-size: 24px; font-weight: 850; letter-spacing: -.04em; }
.profit-detail-heading p { margin: 0; color: var(--muted); font-size: 13px; }
.profit-loss-page :deep(button:focus-visible), .profit-loss-page :deep(input:focus-visible) { outline: 3px solid var(--shell-grape, #5026a5); outline-offset: 3px; }
@media (max-width: 680px) { .profit-heading { align-items: flex-start; flex-direction: column; padding: 22px; } .profit-summary { grid-template-columns: 1fr; } .profit-summary > div { padding: 16px; } .profit-summary > div + div { border-left: 0; border-top: 1px solid var(--rule); } }
</style>
