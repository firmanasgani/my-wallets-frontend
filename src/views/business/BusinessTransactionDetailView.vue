<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Back Button -->
    <button
      @click="$router.back()"
      class="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group"
    >
      <div class="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 group-hover:border-slate-300 dark:group-hover:border-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
      </div>
      <span class="text-sm font-medium">Kembali</span>
    </button>

    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <svg class="w-8 h-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p class="mt-4 text-slate-500 dark:text-slate-400">Memuat jurnal...</p>
    </div>

    <div v-else-if="tx" class="space-y-5">
      <!-- Header Card -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <!-- Top strip -->
        <div class="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span
                  v-if="tx.isSystemGenerated && tx.invoice"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-white/20 text-white"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Dari Invoice
                </span>
                <span
                  v-else
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-white/20 text-white"
                >
                  Manual
                </span>
              </div>
              <h1 class="text-xl font-bold text-white leading-tight">{{ tx.description }}</h1>
              <p class="text-indigo-200 text-sm mt-1">{{ formatDate(tx.transactionDate) }}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-indigo-200 text-xs font-medium uppercase tracking-wide">Total Debit</p>
              <p class="text-white text-2xl font-bold">{{ formatRp(totalDebit) }}</p>
            </div>
          </div>
        </div>

        <!-- Invoice ref + meta -->
        <div class="px-6 py-3 bg-slate-50 dark:bg-slate-700/40 border-b border-slate-100 dark:border-slate-700 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span>
            <span class="font-medium text-slate-600 dark:text-slate-300">ID Jurnal:</span>
            {{ tx.id }}
          </span>
          <span v-if="tx.invoice">
            <span class="font-medium text-slate-600 dark:text-slate-300">Ref Invoice:</span>
            <RouterLink
              :to="{ name: 'invoice-detail', params: { id: tx.invoiceId! } }"
              class="text-indigo-600 dark:text-indigo-400 hover:underline ml-1"
            >
              {{ tx.invoice.invoiceNumber }}
            </RouterLink>
          </span>
          <span>
            <span class="font-medium text-slate-600 dark:text-slate-300">Dibuat:</span>
            {{ formatDateTime(tx.createdAt) }}
          </span>
        </div>
      </div>

      <!-- Journal Lines Table -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 class="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide flex items-center gap-2">
            <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Entri Jurnal
          </h2>
        </div>

        <!-- Table Desktop -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                <th class="px-4 py-3 text-left font-semibold">Kode</th>
                <th class="px-4 py-3 text-left font-semibold">Nama Akun</th>
                <th class="px-4 py-3 text-left font-semibold">Kontak</th>
                <th class="px-4 py-3 text-left font-semibold hidden sm:table-cell">Keterangan</th>
                <th class="px-4 py-3 text-right font-semibold text-green-700 dark:text-green-400">Debit</th>
                <th class="px-4 py-3 text-right font-semibold text-red-600 dark:text-red-400">Kredit</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
              <tr
                v-for="(line, idx) in tx.lines"
                :key="line.id"
                :class="[
                  'transition-colors',
                  idx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-700/20',
                  line.type === 'CREDIT' ? 'pl-4' : '',
                ]"
              >
                <td class="px-4 py-3 font-mono text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                  {{ line.type === 'CREDIT' ? '\u00a0\u00a0\u00a0\u00a0' : '' }}{{ line.coa.code }}
                </td>
                <td class="px-4 py-3 font-medium text-slate-800 dark:text-slate-100 whitespace-nowrap">
                  <span v-if="line.type === 'CREDIT'" class="text-slate-300 dark:text-slate-600 mr-1 select-none">—</span>
                  {{ line.coa.name }}
                </td>
                <td class="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                  {{ line.contact?.name ?? '—' }}
                </td>
                <td class="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs hidden sm:table-cell">
                  {{ line.description ?? '—' }}
                </td>
                <td class="px-4 py-3 text-right font-medium text-green-700 dark:text-green-400 whitespace-nowrap">
                  {{ line.type === 'DEBIT' ? formatRp(parseFloat(line.amount)) : '—' }}
                </td>
                <td class="px-4 py-3 text-right font-medium text-red-600 dark:text-red-400 whitespace-nowrap">
                  {{ line.type === 'CREDIT' ? formatRp(parseFloat(line.amount)) : '—' }}
                </td>
              </tr>
            </tbody>
            <!-- Total Row -->
            <tfoot>
              <tr class="bg-indigo-50 dark:bg-indigo-900/20 border-t-2 border-indigo-100 dark:border-indigo-800">
                <td colspan="4" class="px-4 py-3 text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">
                  Total
                </td>
                <td class="px-4 py-3 text-right font-bold text-green-700 dark:text-green-400 whitespace-nowrap">
                  {{ formatRp(totalDebit) }}
                </td>
                <td class="px-4 py-3 text-right font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                  {{ formatRp(totalCredit) }}
                </td>
              </tr>
              <!-- Balance check -->
              <tr v-if="!isBalanced" class="bg-red-50 dark:bg-red-900/20">
                <td colspan="6" class="px-4 py-2 text-center text-xs font-medium text-red-600 dark:text-red-400">
                  ⚠ Jurnal tidak seimbang (selisih {{ formatRp(Math.abs(totalDebit - totalCredit)) }})
                </td>
              </tr>
              <tr v-else class="bg-emerald-50 dark:bg-emerald-900/20">
                <td colspan="6" class="px-4 py-2 text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  ✓ Jurnal seimbang
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex items-center justify-between gap-3">
        <div></div>
        <div class="flex gap-3">
          <button
            @click="downloadExcel"
            :disabled="isExporting"
            class="px-4 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Excel
          </button>
          <button
            @click="downloadPDF"
            class="px-4 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDF
          </button>
          <button
            v-if="!tx.isSystemGenerated"
            @click="showDeleteConfirm = true"
            class="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Hapus
          </button>
        </div>
      </div>

      <!-- System-generated note -->
      <div v-if="tx.isSystemGenerated" class="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-300">
        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Jurnal ini dibuat otomatis oleh sistem dan tidak dapat dihapus secara langsung.
      </div>
    </div>

    <!-- 404 -->
    <div v-else class="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
      <svg class="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">Jurnal tidak ditemukan</h2>
      <button
        @click="$router.push({ name: 'business-transactions' })"
        class="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
      >
        Kembali ke Daftar
      </button>
    </div>

    <!-- Delete Confirmation -->
    <ConfirmationModal
      v-model:isOpen="showDeleteConfirm"
      title="Hapus Jurnal?"
      message="Apakah Anda yakin ingin menghapus jurnal ini? Tindakan ini tidak dapat dibatalkan."
      confirmButtonText="Hapus"
      cancelButtonText="Batal"
      iconType="danger"
      :isLoading="isDeleting"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBusinessTransactionsStore } from '@/stores/businessTransactions'
import { useBusinessStore } from '@/stores/business'
import ExportService from '@/services/exportService'
import type { BusinessTransaction } from '@/types/business'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'

const route = useRoute()
const router = useRouter()
const txStore = useBusinessTransactionsStore()
const businessStore = useBusinessStore()

const tx = ref<BusinessTransaction | null>(null)
const isLoading = ref(true)
const isDeleting = ref(false)
const isExporting = ref(false)
const showDeleteConfirm = ref(false)

const totalDebit = computed(() =>
  (tx.value?.lines ?? [])
    .filter((l) => l.type === 'DEBIT')
    .reduce((sum, l) => sum + parseFloat(l.amount), 0),
)

const totalCredit = computed(() =>
  (tx.value?.lines ?? [])
    .filter((l) => l.type === 'CREDIT')
    .reduce((sum, l) => sum + parseFloat(l.amount), 0),
)

const isBalanced = computed(() => Math.abs(totalDebit.value - totalCredit.value) < 0.01)

const loadTransaction = async () => {
  isLoading.value = true
  const id = route.params.id as string
  try {
    tx.value = await txStore.fetchTransactionById(id)
  } catch {
    tx.value = null
  } finally {
    isLoading.value = false
  }
}

const downloadExcel = async () => {
  if (!tx.value) return
  isExporting.value = true
  try {
    await ExportService.exportBusinessTransactionToExcel(tx.value, businessStore.currentCompany?.name)
  } finally {
    isExporting.value = false
  }
}

const downloadPDF = () => {
  if (!tx.value) return
  ExportService.exportBusinessTransactionToPDF(tx.value, businessStore.currentCompany?.name)
}

const handleDelete = async () => {
  if (!tx.value) return
  isDeleting.value = true
  try {
    await txStore.deleteTransaction(tx.value.id)
    router.push({ name: 'business-transactions' })
  } catch {
    // error silently
  } finally {
    isDeleting.value = false
    showDeleteConfirm.value = false
  }
}

const formatRp = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

const formatDateTime = (d: string) =>
  new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

onMounted(() => loadTransaction())
</script>
