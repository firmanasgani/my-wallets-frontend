<template>
  <div class="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
      <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Jurnal Umum</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">General Journal — audit trail seluruh entri jurnal akuntansi secara kronologis.</p>
    </div>

    <!-- Filters -->
    <div class="mb-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
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
            @click="applyFilters"
            class="flex-1 px-4 py-1.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
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
      <svg class="w-8 h-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
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
    <div v-else class="space-y-3">
      <div
        v-for="entry in data.data"
        :key="entry.id"
        class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <!-- Entry Header -->
        <div class="flex items-start justify-between gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-700/40 border-b border-slate-200 dark:border-slate-700">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <!-- Badge: From Invoice or Manual -->
              <span
                v-if="entry.isSystemGenerated"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shrink-0"
              >
                Dari Invoice
              </span>
              <span
                v-else
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-600 dark:text-slate-300 shrink-0"
              >
                Manual
              </span>
              <!-- Reference -->
              <span v-if="entry.reference" class="text-xs font-mono text-indigo-600 dark:text-indigo-400 shrink-0">{{ entry.reference }}</span>
              <!-- Description -->
              <span class="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{{ entry.description }}</span>
            </div>
            <!-- Contacts + Date -->
            <div class="flex items-center gap-3 mt-1 text-xs text-slate-400 dark:text-slate-500 flex-wrap">
              <span>{{ formatDate(entry.date) }}</span>
              <span v-if="entry.contacts && entry.contacts.length > 0">
                · {{ entry.contacts.join(', ') }}
              </span>
            </div>
          </div>
          <div class="text-right shrink-0">
            <p class="text-xs text-slate-400 dark:text-slate-500">Total</p>
            <p class="text-sm font-bold text-slate-800 dark:text-slate-100 tabular-nums">{{ formatRp(entry.totalDebit) }}</p>
          </div>
        </div>

        <!-- Debit + Credit Lines Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 dark:border-slate-700">
                <th class="text-left px-5 py-2 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide w-16">Tipe</th>
                <th class="text-left px-3 py-2 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">Akun</th>
                <th class="text-left px-3 py-2 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide hidden sm:table-cell">Keterangan</th>
                <th class="text-right px-5 py-2 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">Jumlah</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
              <!-- Debit lines -->
              <tr
                v-for="(line, i) in entry.debitLines"
                :key="'d-' + i"
                class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                <td class="px-5 py-2">
                  <span class="inline-flex items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-400">
                    <span class="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                    D
                  </span>
                </td>
                <td class="px-3 py-2 text-slate-700 dark:text-slate-300">
                  <span class="font-mono text-xs text-slate-400 dark:text-slate-500 mr-1">{{ line.coaCode }}</span>
                  {{ line.coaName }}
                  <span v-if="line.contact" class="text-xs text-slate-400 dark:text-slate-500 ml-1">({{ line.contact }})</span>
                </td>
                <td class="px-3 py-2 text-slate-400 dark:text-slate-500 hidden sm:table-cell text-xs">{{ line.description || '—' }}</td>
                <td class="px-5 py-2 text-right font-medium text-green-700 dark:text-green-400 tabular-nums">{{ formatRp(line.amount) }}</td>
              </tr>
              <!-- Credit lines -->
              <tr
                v-for="(line, i) in entry.creditLines"
                :key="'c-' + i"
                class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                <td class="px-5 py-2 pl-8">
                  <span class="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
                    <span class="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                    K
                  </span>
                </td>
                <td class="px-3 py-2 text-slate-500 dark:text-slate-400 italic">
                  <span class="font-mono text-xs text-slate-400 dark:text-slate-500 mr-1">{{ line.coaCode }}</span>
                  {{ line.coaName }}
                  <span v-if="line.contact" class="text-xs text-slate-400 dark:text-slate-500 ml-1">({{ line.contact }})</span>
                </td>
                <td class="px-3 py-2 text-slate-400 dark:text-slate-500 hidden sm:table-cell text-xs">{{ line.description || '—' }}</td>
                <td class="px-5 py-2 text-right font-medium text-red-600 dark:text-red-400 tabular-nums">{{ formatRp(line.amount) }}</td>
              </tr>
            </tbody>
          </table>
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
import { useBusinessReportsStore } from '@/stores/businessReports'

const reportsStore = useBusinessReportsStore()

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
