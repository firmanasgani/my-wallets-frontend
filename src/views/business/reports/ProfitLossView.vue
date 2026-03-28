<template>
  <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 flex justify-between items-start gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Laporan Laba Rugi</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Profit & Loss — pendapatan vs beban dalam periode tertentu.</p>
      </div>
      <div v-if="data" class="flex items-center gap-1.5 shrink-0">
        <button @click="doExportExcel" :disabled="isExporting" class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <span class="hidden sm:inline">Excel</span>
        </button>
        <button @click="doExportPDF" :disabled="isExporting" class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors disabled:opacity-50">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          <span class="hidden sm:inline">PDF</span>
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
    <div class="mb-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Dari Tanggal</label>
          <input
            v-model="filters.startDate"
            type="date"
            class="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Sampai Tanggal</label>
          <input
            v-model="filters.endDate"
            type="date"
            class="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
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
import { ref, computed, onMounted } from 'vue'
import { useBusinessReportsStore } from '@/stores/businessReports'
import { useBusinessStore } from '@/stores/business'
import ExportService from '@/services/exportService'

const reportsStore = useBusinessReportsStore()
const businessStore = useBusinessStore()
const isExporting = ref(false)

const errorMsg = ref('')

const today = new Date()
const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)

const filters = ref({
  startDate: firstOfMonth,
  endDate: today.toISOString().slice(0, 10),
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
    endDate: today.toISOString().slice(0, 10),
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
</script>
