<template>
  <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 flex justify-between items-start gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Neraca Keuangan</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Balance Sheet — posisi aset, liabilitas, dan ekuitas per tanggal tertentu.</p>
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
      <p class="text-xs text-amber-700 dark:text-amber-300">Laporan ini belum termasuk Penutupan Periode (Period Closing). Saldo kumulatif sejak company dibuat.</p>
    </div>

    <!-- Filters -->
    <div class="mb-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Per Tanggal</label>
          <input
            v-model="filters.date"
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
            title="Reset ke hari ini"
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
      <!-- As-of Date + Balance Badge -->
      <div class="flex items-center justify-between">
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Per tanggal:
          <span class="font-medium text-slate-700 dark:text-slate-200">{{ formatDate(data.asOfDate) }}</span>
        </p>
        <span
          v-if="data.isBalanced"
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
          Neraca Seimbang
        </span>
        <span
          v-else
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        >
          ⚠️ Neraca tidak seimbang — kemungkinan ada jurnal yang belum terekam.
        </span>
      </div>

      <!-- Assets -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-5 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-slate-200 dark:border-slate-700">
          <h2 class="text-sm font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide">Aset</h2>
        </div>
        <div class="divide-y divide-slate-100 dark:divide-slate-700">
          <div
            v-for="acc in data.assets.accounts"
            :key="acc.coaCode"
            class="flex justify-between items-center px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span class="text-sm text-slate-600 dark:text-slate-300">
              <span class="font-mono text-xs text-slate-400 dark:text-slate-500 mr-2">{{ acc.coaCode }}</span>
              {{ acc.coaName }}
            </span>
            <span class="text-sm font-medium text-slate-800 dark:text-slate-100 tabular-nums">{{ formatRp(acc.balance) }}</span>
          </div>
        </div>
        <div class="flex justify-between items-center px-5 py-3 bg-blue-50 dark:bg-blue-900/20 border-t border-slate-200 dark:border-slate-700">
          <span class="text-sm font-semibold text-blue-700 dark:text-blue-400">Total Aset</span>
          <span class="text-base font-bold text-blue-700 dark:text-blue-400 tabular-nums">{{ formatRp(data.assets.total) }}</span>
        </div>
      </div>

      <!-- Liabilities -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-5 py-3 bg-red-50 dark:bg-red-900/20 border-b border-slate-200 dark:border-slate-700">
          <h2 class="text-sm font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide">Liabilitas</h2>
        </div>
        <div class="divide-y divide-slate-100 dark:divide-slate-700">
          <div
            v-for="acc in data.liabilities.accounts"
            :key="acc.coaCode"
            class="flex justify-between items-center px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span class="text-sm text-slate-600 dark:text-slate-300">
              <span class="font-mono text-xs text-slate-400 dark:text-slate-500 mr-2">{{ acc.coaCode }}</span>
              {{ acc.coaName }}
            </span>
            <span class="text-sm font-medium text-slate-800 dark:text-slate-100 tabular-nums">{{ formatRp(acc.balance) }}</span>
          </div>
        </div>
        <div class="flex justify-between items-center px-5 py-3 bg-red-50 dark:bg-red-900/20 border-t border-slate-200 dark:border-slate-700">
          <span class="text-sm font-semibold text-red-700 dark:text-red-400">Total Liabilitas</span>
          <span class="text-base font-bold text-red-700 dark:text-red-400 tabular-nums">{{ formatRp(data.liabilities.total) }}</span>
        </div>
      </div>

      <!-- Equity -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-5 py-3 bg-violet-50 dark:bg-violet-900/20 border-b border-slate-200 dark:border-slate-700">
          <h2 class="text-sm font-semibold text-violet-700 dark:text-violet-400 uppercase tracking-wide">Ekuitas</h2>
        </div>
        <div class="divide-y divide-slate-100 dark:divide-slate-700">
          <div
            v-for="acc in data.equity.accounts"
            :key="acc.coaCode"
            class="flex justify-between items-center px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span class="text-sm text-slate-600 dark:text-slate-300">
              <span class="font-mono text-xs text-slate-400 dark:text-slate-500 mr-2">{{ acc.coaCode }}</span>
              {{ acc.coaName }}
            </span>
            <span class="text-sm font-medium text-slate-800 dark:text-slate-100 tabular-nums">{{ formatRp(acc.balance) }}</span>
          </div>
          <!-- Current Period Profit row -->
          <div class="flex justify-between items-center px-5 py-2.5 bg-slate-50 dark:bg-slate-700/30">
            <span class="text-sm text-slate-600 dark:text-slate-300 italic">Laba / Rugi Periode Ini</span>
            <span
              :class="[
                'text-sm font-medium tabular-nums',
                parseFloat(data.equity.currentPeriodProfit) >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400',
              ]"
            >
              {{ formatRp(data.equity.currentPeriodProfit) }}
            </span>
          </div>
        </div>
        <div class="flex justify-between items-center px-5 py-3 bg-violet-50 dark:bg-violet-900/20 border-t border-slate-200 dark:border-slate-700">
          <span class="text-sm font-semibold text-violet-700 dark:text-violet-400">Total Ekuitas</span>
          <span class="text-base font-bold text-violet-700 dark:text-violet-400 tabular-nums">{{ formatRp(data.equity.total) }}</span>
        </div>
      </div>

      <!-- Total Liabilities + Equity -->
      <div class="rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 p-5 flex justify-between items-center">
        <span class="text-base font-bold text-slate-700 dark:text-slate-200">Total Liabilitas + Ekuitas</span>
        <span class="text-xl font-extrabold text-slate-800 dark:text-slate-100 tabular-nums">{{ formatRp(data.totalLiabilitiesAndEquity) }}</span>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!reportsStore.isLoading"
      class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center"
    >
      <svg class="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18M10 3v18M14 3v18" />
      </svg>
      <p class="text-base font-medium text-slate-700 dark:text-slate-300">Pilih tanggal lalu klik Tampilkan</p>
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

const today = new Date().toISOString().slice(0, 10)
const filters = ref({ date: today })

const data = computed(() => reportsStore.balanceSheet)

onMounted(() => loadReport())

async function loadReport() {
  errorMsg.value = ''
  try {
    await reportsStore.fetchBalanceSheet({
      date: filters.value.date || undefined,
    })
  } catch {
    errorMsg.value = 'Gagal memuat neraca keuangan.'
  }
}

async function doExportExcel() {
  if (!data.value) return
  isExporting.value = true
  try {
    await ExportService.exportBalanceSheetToExcel(data.value, businessStore.currentCompany?.name)
  } finally { isExporting.value = false }
}

function doExportPDF() {
  if (!data.value) return
  ExportService.exportBalanceSheetToPDF(data.value, businessStore.currentCompany?.name)
}

function resetFilters() {
  filters.value = { date: today }
  loadReport()
}

function formatRp(amount: string | number) {
  const val = typeof amount === 'string' ? parseFloat(amount) : amount
  return 'Rp ' + val.toLocaleString('id-ID')
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>
