<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-900 py-8 px-4 print:bg-white print:py-0">
    <!-- Top Action Bar -->
    <div class="max-w-5xl mx-auto mb-4 flex items-center justify-between print:hidden">
      <RouterLink
        :to="{ name: 'invoice-detail', params: { id: route.params.id } }"
        class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Detail
      </RouterLink>

      <div class="flex items-center gap-2">
        <button
          @click="handleDownloadExcel"
          :disabled="isExportingExcel || isLoading || journals.length === 0"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg transition-colors shadow-sm"
        >
          <svg v-if="isExportingExcel" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          {{ isExportingExcel ? 'Mengunduh...' : 'Unduh Excel' }}
        </button>

        <button
          @click="handleDownloadPDF"
          :disabled="isExportingPDF || isLoading || journals.length === 0"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors shadow-sm"
        >
          <svg v-if="isExportingPDF" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {{ isExportingPDF ? 'Mengunduh...' : 'Unduh PDF' }}
        </button>

        <button
          @click="print()"
          :disabled="isLoading || journals.length === 0"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="max-w-5xl mx-auto flex justify-center p-20">
      <svg class="animate-spin w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <!-- Error -->
    <div v-else-if="errorMsg" class="max-w-5xl mx-auto rounded-xl bg-red-50 dark:bg-red-900/30 p-6 border border-red-200 dark:border-red-800 text-center">
      <p class="text-sm font-medium text-red-800 dark:text-red-300">{{ errorMsg }}</p>
    </div>

    <!-- Journal Paper -->
    <div
      v-else-if="invoice"
      class="max-w-5xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg print:shadow-none print:rounded-none print:max-w-none"
    >
      <!-- Header Strip -->
      <div class="bg-indigo-600 rounded-t-xl print:rounded-none px-8 py-6 flex items-center justify-between">
        <div>
          <p class="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-1">Jurnal Pembayaran Invoice</p>
          <h1 class="text-white font-bold text-xl font-mono">{{ invoice.invoiceNumber }}</h1>
          <p v-if="businessStore.currentCompany?.name" class="text-indigo-200 text-sm mt-0.5">{{ businessStore.currentCompany.name }}</p>
        </div>
        <div class="text-right">
          <p class="text-indigo-200 text-xs">Klien</p>
          <p class="text-white font-semibold">{{ invoice.clientName }}</p>
          <p class="text-indigo-200 text-xs mt-2">Total Invoice</p>
          <p class="text-white font-bold text-lg">{{ formatCurrency(invoice.totalAmount) }}</p>
        </div>
      </div>

      <div class="px-8 py-6">
        <!-- Empty State -->
        <div v-if="journals.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
          <svg class="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p class="text-slate-500 dark:text-slate-400 font-medium">Belum ada jurnal</p>
          <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">Jurnal akan muncul setelah invoice dibayar.</p>
        </div>

        <!-- Journal Entries -->
        <div v-else class="space-y-6">
          <div v-for="tx in journals" :key="tx.id">
            <!-- Entry Header -->
            <div class="flex items-center gap-3 mb-3">
              <div class="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></div>
              <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ tx.description }}</span>
              <span class="text-xs text-slate-400 dark:text-slate-500 ml-auto shrink-0">{{ formatDate(tx.transactionDate) }}</span>
            </div>

            <!-- Lines Table -->
            <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table class="w-full text-sm text-left">
                <thead>
                  <tr class="bg-slate-50 dark:bg-slate-700/50">
                    <th class="px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-12">Tipe</th>
                    <th class="px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-28">Kode Akun</th>
                    <th class="px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama Akun</th>
                    <th class="px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Keterangan</th>
                    <th class="px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right w-36">Debit</th>
                    <th class="px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right w-36">Kredit</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                  <tr v-for="line in tx.lines" :key="line.id" class="text-slate-700 dark:text-slate-300">
                    <td class="px-4 py-3">
                      <span
                        :class="[
                          'inline-flex items-center px-2 py-0.5 rounded text-xs font-bold tracking-wide',
                          line.type === 'DEBIT'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                        ]"
                      >
                        {{ line.type === 'DEBIT' ? 'D' : 'K' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{{ line.coa.code }}</td>
                    <td class="px-4 py-3 text-slate-800 dark:text-slate-100">{{ line.coa.name }}</td>
                    <td class="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                      <span v-if="line.description">{{ line.description }}</span>
                      <span v-else-if="line.contact" class="italic">{{ line.contact.name }}</span>
                      <span v-else class="text-slate-300 dark:text-slate-600">—</span>
                    </td>
                    <td class="px-4 py-3 text-right font-mono font-medium text-green-700 dark:text-green-400">
                      <span v-if="line.type === 'DEBIT'">{{ formatCurrency(line.amount) }}</span>
                      <span v-else class="text-slate-300 dark:text-slate-600">—</span>
                    </td>
                    <td class="px-4 py-3 text-right font-mono font-medium text-red-600 dark:text-red-400">
                      <span v-if="line.type === 'CREDIT'">{{ formatCurrency(line.amount) }}</span>
                      <span v-else class="text-slate-300 dark:text-slate-600">—</span>
                    </td>
                  </tr>
                </tbody>
                <!-- Entry Total -->
                <tfoot class="bg-slate-50 dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-600">
                  <tr>
                    <td colspan="4" class="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 text-right">Total</td>
                    <td class="px-4 py-2 text-right font-mono font-bold text-green-700 dark:text-green-400 text-sm">
                      {{ formatCurrency(totalDebit(tx)) }}
                    </td>
                    <td class="px-4 py-2 text-right font-mono font-bold text-red-600 dark:text-red-400 text-sm">
                      {{ formatCurrency(totalCredit(tx)) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Grand Total -->
          <div class="flex justify-end pt-2">
            <div class="w-80 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 overflow-hidden">
              <div class="flex justify-between px-5 py-3 text-sm">
                <span class="font-semibold text-slate-600 dark:text-slate-300">Total Debit</span>
                <span class="font-mono font-bold text-green-700 dark:text-green-400">{{ formatCurrency(grandTotalDebit) }}</span>
              </div>
              <div class="flex justify-between px-5 py-3 text-sm border-t border-indigo-100 dark:border-indigo-800">
                <span class="font-semibold text-slate-600 dark:text-slate-300">Total Kredit</span>
                <span class="font-mono font-bold text-red-600 dark:text-red-400">{{ formatCurrency(grandTotalCredit) }}</span>
              </div>
              <div
                class="flex justify-between px-5 py-3 text-sm border-t border-indigo-100 dark:border-indigo-800"
                :class="isBalanced ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'"
              >
                <span class="font-semibold" :class="isBalanced ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600 dark:text-red-400'">
                  {{ isBalanced ? 'Jurnal Seimbang ✓' : 'Selisih' }}
                </span>
                <span
                  class="font-mono font-bold"
                  :class="isBalanced ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600 dark:text-red-400'"
                >
                  {{ isBalanced ? '—' : formatCurrency(Math.abs(grandTotalDebit - grandTotalCredit)) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="border-t border-slate-100 dark:border-slate-700 px-8 py-4 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 rounded-b-xl print:rounded-none">
        <span>Dicetak pada {{ new Date().toLocaleString('id-ID') }}</span>
        <span>Dibuat dengan MyWallets</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useInvoicesStore } from '@/stores/invoices'
import { useBusinessStore } from '@/stores/business'
import { BusinessService } from '@/services/business.service'
import exportService from '@/services/exportService'
import type { BusinessTransaction } from '@/types/business'

const print = () => window.print()

const route = useRoute()
const invoicesStore = useInvoicesStore()
const businessStore = useBusinessStore()

const isLoading = ref(false)
const isExportingExcel = ref(false)
const isExportingPDF = ref(false)
const errorMsg = ref('')
const journals = ref<BusinessTransaction[]>([])

const invoice = computed(() => invoicesStore.currentInvoice)

const grandTotalDebit = computed(() =>
  journals.value.reduce(
    (sum, tx) => sum + tx.lines.filter((l) => l.type === 'DEBIT').reduce((s, l) => s + parseFloat(l.amount), 0),
    0,
  ),
)

const grandTotalCredit = computed(() =>
  journals.value.reduce(
    (sum, tx) => sum + tx.lines.filter((l) => l.type === 'CREDIT').reduce((s, l) => s + parseFloat(l.amount), 0),
    0,
  ),
)

const isBalanced = computed(() => Math.abs(grandTotalDebit.value - grandTotalCredit.value) < 0.01)

onMounted(async () => {
  isLoading.value = true
  try {
    const invoiceId = route.params.id as string
    await Promise.all([
      invoicesStore.fetchInvoiceById(invoiceId),
      businessStore.fetchMyCompany().catch(() => {}),
    ])
    const res = await BusinessService.getBusinessTransactions({ limit: 100 })
    journals.value = res.data.filter((tx) => tx.invoiceId === invoiceId)
  } catch {
    errorMsg.value = 'Gagal memuat data jurnal.'
  } finally {
    isLoading.value = false
  }
})

const handleDownloadExcel = async () => {
  if (!invoice.value) return
  isExportingExcel.value = true
  try {
    await exportService.exportInvoiceJournalToExcel(journals.value, invoice.value, businessStore.currentCompany)
  } finally {
    isExportingExcel.value = false
  }
}

const handleDownloadPDF = () => {
  if (!invoice.value) return
  isExportingPDF.value = true
  try {
    exportService.exportInvoiceJournalToPDF(journals.value, invoice.value, businessStore.currentCompany)
  } finally {
    isExportingPDF.value = false
  }
}

const totalDebit = (tx: BusinessTransaction) =>
  tx.lines.filter((l) => l.type === 'DEBIT').reduce((s, l) => s + parseFloat(l.amount), 0)

const totalCredit = (tx: BusinessTransaction) =>
  tx.lines.filter((l) => l.type === 'CREDIT').reduce((s, l) => s + parseFloat(l.amount), 0)

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

const formatCurrency = (val: string | number) => {
  const num = typeof val === 'string' ? parseFloat(val) : val
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
}
</script>

<style scoped>
@media print {
  .print\:hidden { display: none !important; }
  .print\:shadow-none { box-shadow: none !important; }
  .print\:rounded-none { border-radius: 0 !important; }
  .print\:max-w-none { max-width: none !important; }
  .print\:bg-white { background-color: white !important; }
  .print\:py-0 { padding-top: 0 !important; padding-bottom: 0 !important; }
}
</style>
