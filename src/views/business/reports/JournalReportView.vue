<template>
  <div class="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 flex justify-between items-start gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Jurnal Umum</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">General Journal — audit trail seluruh entri jurnal akuntansi secara kronologis.</p>
      </div>
      <div v-if="data && data.data.length > 0" class="flex items-center gap-1.5 shrink-0">
        <button @click="doExportExcel" :disabled="isExporting" class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50">
          <svg v-if="!isExporting" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <span class="hidden sm:inline">Excel</span>
        </button>
        <button @click="doExportPDF" :disabled="isExporting" class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors disabled:opacity-50">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          <span class="hidden sm:inline">PDF</span>
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="mb-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
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
            @click="applyFilters"
            class="flex-1 px-4 py-1.5 text-sm font-medium bg-[#2E8B57] hover:bg-[#236B43] text-white rounded-lg transition-colors"
          >
            Filter
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

    <!-- Empty State -->
    <div
      v-else-if="!data || data.data.length === 0"
      class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center"
    >
      <svg class="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-base font-medium text-slate-700 dark:text-slate-300">Tidak ada jurnal dalam periode ini</p>
    </div>

    <!-- Journal Entries -->
    <div v-else class="space-y-2">
      <div
        v-for="entry in data.data"
        :key="entry.id"
        class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:border-emerald-300 dark:hover:border-[#2E8B57] hover:shadow-sm transition-all"
        @click="router.push({ name: 'business-transaction-detail', params: { id: entry.id } })"
      >
        <div class="flex items-center justify-between gap-4 px-5 py-3.5">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span
                v-if="entry.isSystemGenerated"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-emerald-300 shrink-0"
              >
                Dari Invoice
              </span>
              <span
                v-else
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-600 dark:text-slate-300 shrink-0"
              >
                Manual
              </span>
              <span v-if="entry.reference" class="text-xs font-mono text-emerald-600 dark:text-emerald-400 shrink-0">{{ entry.reference }}</span>
              <span class="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{{ entry.description }}</span>
            </div>
            <div class="flex items-center gap-3 mt-1 text-xs text-slate-400 dark:text-slate-500 flex-wrap">
              <span>{{ formatDate(entry.date) }}</span>
              <span v-if="entry.contacts && entry.contacts.length > 0">· {{ entry.contacts.join(', ') }}</span>
            </div>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <div class="text-right">
              <p class="text-xs text-slate-400 dark:text-slate-500">Total</p>
              <p class="text-sm font-bold text-slate-800 dark:text-slate-100 tabular-nums">{{ formatRp(entry.totalDebit) }}</p>
            </div>
            <svg class="w-4 h-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="data && data.totalPages > 1"
      class="mt-4 flex items-center justify-between"
    >
      <p class="text-sm text-slate-500 dark:text-slate-400">
        Halaman {{ data.page }} dari {{ data.totalPages }} ({{ data.total }} entri)
      </p>
      <div class="flex gap-2">
        <button
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
          class="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
        >
          ← Sebelumnya
        </button>
        <button
          :disabled="currentPage >= data.totalPages"
          @click="goToPage(currentPage + 1)"
          class="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
        >
          Berikutnya →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBusinessReportsStore } from '@/stores/businessReports'
import { useBusinessStore } from '@/stores/business'
import { BusinessService } from '@/services/business.service'
import ExportService from '@/services/exportService'

const router = useRouter()

const reportsStore = useBusinessReportsStore()
const businessStore = useBusinessStore()
const isExporting = ref(false)

const errorMsg = ref('')
const currentPage = ref(1)

const today = new Date()
const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)

const filters = ref({
  startDate: firstOfMonth,
  endDate: today.toISOString().slice(0, 10),
})

const data = computed(() => reportsStore.journalReport)

onMounted(() => loadReport())

async function loadReport() {
  errorMsg.value = ''
  try {
    await reportsStore.fetchJournalReport({
      startDate: filters.value.startDate || undefined,
      endDate: filters.value.endDate || undefined,
      page: currentPage.value,
      limit: 20,
    })
  } catch {
    errorMsg.value = 'Gagal memuat jurnal umum.'
  }
}

async function fetchAllForExport() {
  const res = await BusinessService.getJournalReport({
    startDate: filters.value.startDate || undefined,
    endDate: filters.value.endDate || undefined,
    page: 1,
    limit: 9999,
  })
  return res.data
}

async function doExportExcel() {
  isExporting.value = true
  try {
    const entries = await fetchAllForExport()
    await ExportService.exportJournalReportToExcel(entries, businessStore.currentCompany?.name, filters.value)
  } finally { isExporting.value = false }
}

async function doExportPDF() {
  isExporting.value = true
  try {
    const entries = await fetchAllForExport()
    ExportService.exportJournalReportToPDF(entries, businessStore.currentCompany?.name, filters.value)
  } finally { isExporting.value = false }
}

async function applyFilters() {
  currentPage.value = 1
  await loadReport()
}

function resetFilters() {
  filters.value = {
    startDate: firstOfMonth,
    endDate: today.toISOString().slice(0, 10),
  }
  currentPage.value = 1
  loadReport()
}

async function goToPage(page: number) {
  currentPage.value = page
  await loadReport()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function formatRp(amount: string | number) {
  const val = typeof amount === 'string' ? parseFloat(amount) : amount
  return 'Rp ' + val.toLocaleString('id-ID')
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
