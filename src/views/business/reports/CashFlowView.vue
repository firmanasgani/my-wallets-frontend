<template>
  <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 flex justify-between items-start gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Laporan Arus Kas</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Cash Flow — pergerakan kas masuk dan keluar dalam periode tertentu.</p>
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
      <p class="text-xs text-amber-700 dark:text-amber-300">
        Laporan arus kas ini adalah penyederhanaan. Mencakup semua pergerakan akun Aset.
        Laporan ini belum termasuk Penutupan Periode (Period Closing).
      </p>
    </div>

    <!-- Filters -->
    <div class="mb-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Dari Tanggal</label>
          <input
            v-model="filters.startDate"
            type="date"
            class="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Sampai Tanggal</label>
          <input
            v-model="filters.endDate"
            type="date"
            class="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div class="flex items-end gap-2">
          <button
            @click="loadReport"
            class="flex-1 px-4 py-1.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
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
      <svg class="w-8 h-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
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

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Saldo Awal</p>
          <p class="text-lg font-bold text-slate-800 dark:text-slate-100 tabular-nums">{{ formatRp(data.openingCash) }}</p>
        </div>
        <div
          :class="[
            'rounded-xl border p-4 text-center',
            netCashIsNegative
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
              : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700',
          ]"
        >
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Arus Kas Bersih</p>
          <p
            :class="[
              'text-lg font-bold tabular-nums',
              netCashIsNegative ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400',
            ]"
          >
            {{ formatRp(data.netCashFlow) }}
          </p>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Saldo Akhir</p>
          <p class="text-lg font-bold text-slate-800 dark:text-slate-100 tabular-nums">{{ formatRp(data.endingCash) }}</p>
        </div>
      </div>

      <!-- Cash Inflows -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 border-b border-slate-200 dark:border-slate-700">
          <h2 class="text-sm font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Kas Masuk</h2>
        </div>
        <div v-if="data.cashInflows.length > 0" class="divide-y divide-slate-100 dark:divide-slate-700">
          <div
            v-for="acc in data.cashInflows"
            :key="acc.coaCode"
            class="flex justify-between items-center px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span class="text-sm text-slate-600 dark:text-slate-300">
              <span class="font-mono text-xs text-slate-400 dark:text-slate-500 mr-2">{{ acc.coaCode }}</span>
              {{ acc.coaName }}
            </span>
            <span class="text-sm font-medium text-emerald-700 dark:text-emerald-400 tabular-nums">+{{ formatRp(acc.amount) }}</span>
          </div>
        </div>
        <div v-else class="px-5 py-4 text-sm text-slate-400 dark:text-slate-500 italic">Tidak ada kas masuk dalam periode ini.</div>
        <div class="flex justify-between items-center px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 border-t border-slate-200 dark:border-slate-700">
          <span class="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Total Kas Masuk</span>
          <span class="text-base font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{{ formatRp(data.totalInflow) }}</span>
        </div>
      </div>

      <!-- Cash Outflows -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-5 py-3 bg-red-50 dark:bg-red-900/20 border-b border-slate-200 dark:border-slate-700">
          <h2 class="text-sm font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide">Kas Keluar</h2>
        </div>
        <div v-if="data.cashOutflows.length > 0" class="divide-y divide-slate-100 dark:divide-slate-700">
          <div
            v-for="acc in data.cashOutflows"
            :key="acc.coaCode"
            class="flex justify-between items-center px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span class="text-sm text-slate-600 dark:text-slate-300">
              <span class="font-mono text-xs text-slate-400 dark:text-slate-500 mr-2">{{ acc.coaCode }}</span>
              {{ acc.coaName }}
            </span>
            <span class="text-sm font-medium text-red-700 dark:text-red-400 tabular-nums">-{{ formatRp(acc.amount) }}</span>
          </div>
        </div>
        <div v-else class="px-5 py-4 text-sm text-slate-400 dark:text-slate-500 italic">Tidak ada kas keluar dalam periode ini.</div>
        <div class="flex justify-between items-center px-5 py-3 bg-red-50 dark:bg-red-900/20 border-t border-slate-200 dark:border-slate-700">
          <span class="text-sm font-semibold text-red-700 dark:text-red-400">Total Kas Keluar</span>
          <span class="text-base font-bold text-red-700 dark:text-red-400 tabular-nums">{{ formatRp(data.totalOutflow) }}</span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!reportsStore.isLoading"
      class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center"
    >
      <svg class="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
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

const data = computed(() => reportsStore.cashFlow)
const netCashIsNegative = computed(() => data.value ? parseFloat(data.value.netCashFlow) < 0 : false)

onMounted(() => loadReport())

async function loadReport() {
  errorMsg.value = ''
  try {
    await reportsStore.fetchCashFlow({
      startDate: filters.value.startDate || undefined,
      endDate: filters.value.endDate || undefined,
    })
  } catch {
    errorMsg.value = 'Gagal memuat laporan arus kas.'
  }
}

async function doExportExcel() {
  if (!data.value) return
  isExporting.value = true
  try {
    await ExportService.exportCashFlowToExcel(data.value, businessStore.currentCompany?.name, filters.value)
  } finally { isExporting.value = false }
}

function doExportPDF() {
  if (!data.value) return
  ExportService.exportCashFlowToPDF(data.value, businessStore.currentCompany?.name, filters.value)
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
  return 'Rp ' + Math.abs(val).toLocaleString('id-ID')
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
