<template>
  <div class="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-6 flex justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Transaksi Bisnis</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Jurnal double-entry perusahaan.</p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <!-- Export buttons -->
        <div v-if="txStore.transactions.length > 0" class="flex items-center gap-1.5">
          <button
            @click="doExportExcel"
            :disabled="isExporting"
            class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50"
            title="Export Excel"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="hidden sm:inline">Excel</span>
          </button>
          <button
            @click="doExportPDF"
            :disabled="isExporting"
            class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors disabled:opacity-50"
            title="Export PDF"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span class="hidden sm:inline">PDF</span>
          </button>
        </div>
        <RouterLink
          v-if="canCreate"
          :to="{ name: 'business-transaction-create' }"
          class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Transaksi Baru
        </RouterLink>
      </div>
    </div>

    <!-- Error -->
    <div v-if="errorMsg" class="mb-4 rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800">
      <p class="text-sm font-medium text-red-800 dark:text-red-300">{{ errorMsg }}</p>
    </div>

    <!-- Filters -->
    <div class="mb-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Start Date -->
        <div>
          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Dari Tanggal</label>
          <input
            v-model="filters.startDate"
            type="date"
            class="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <!-- End Date -->
        <div>
          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Sampai Tanggal</label>
          <input
            v-model="filters.endDate"
            type="date"
            class="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <!-- COA Filter -->
        <div>
          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Akun (COA)</label>
          <select
            v-model="filters.coaId"
            class="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Semua Akun</option>
            <optgroup v-for="(group, type) in businessStore.chartOfAccounts" :key="type" :label="String(type)">
              <option v-for="coa in group" :key="coa.id" :value="coa.id">
                {{ coa.code }} {{ coa.name }}
              </option>
            </optgroup>
          </select>
        </div>
        <!-- Actions -->
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
            title="Reset filter"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <!-- Buku Besar button (only when COA selected) -->
          <button
            v-if="filters.coaId"
            @click="openLedger"
            class="px-3 py-1.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors whitespace-nowrap flex items-center gap-1"
            title="Lihat Buku Besar"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Buku Besar
          </button>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="!txStore.isLoading && txStore.transactions.length > 0" class="mb-4 grid grid-cols-3 gap-3">
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center">
        <p class="text-xs text-slate-500 dark:text-slate-400">Total Transaksi</p>
        <p class="text-lg font-bold text-slate-800 dark:text-slate-100">{{ txStore.total }}</p>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center">
        <p class="text-xs text-slate-500 dark:text-slate-400">Manual</p>
        <p class="text-lg font-bold text-slate-800 dark:text-slate-100">{{ manualCount }}</p>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center">
        <p class="text-xs text-slate-500 dark:text-slate-400">Dari Invoice</p>
        <p class="text-lg font-bold text-slate-800 dark:text-slate-100">{{ invoiceCount }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="txStore.isLoading" class="flex justify-center p-12">
      <svg class="w-8 h-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="txStore.transactions.length === 0"
      class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center"
    >
      <svg class="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p class="text-base font-medium text-slate-700 dark:text-slate-300">Belum ada transaksi</p>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
        {{ canCreate ? 'Klik tombol Transaksi Baru untuk membuat jurnal.' : 'Transaksi akan muncul di sini.' }}
      </p>
    </div>

    <!-- Transaction List -->
    <div v-else class="space-y-2">
      <div
        v-for="tx in txStore.transactions"
        :key="tx.id"
        class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-4 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
      >
        <div class="flex items-start justify-between gap-4">
          <!-- Left: Info -->
          <div class="min-w-0 flex-1">
            <!-- Source badge + description -->
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <!-- Invoice badge -->
              <RouterLink
                v-if="tx.invoiceId && tx.invoice"
                :to="{ name: 'invoice-detail', params: { id: tx.invoiceId } }"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                Dari Invoice {{ tx.invoice.invoiceNumber }}
              </RouterLink>
              <!-- Manual badge -->
              <span
                v-else
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
              >
                Manual
              </span>
              <span class="font-medium text-slate-800 dark:text-slate-100 truncate">{{ tx.description }}</span>
            </div>

            <!-- Lines summary -->
            <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span
                v-for="line in tx.lines.slice(0, 4)"
                :key="line.id"
                class="flex items-center gap-1"
              >
                <span
                  :class="[
                    'w-2 h-2 rounded-full inline-block',
                    line.type === 'DEBIT' ? 'bg-green-500' : 'bg-red-500',
                  ]"
                />
                <span :class="line.type === 'DEBIT' ? 'text-green-700 dark:text-green-400 font-medium' : 'text-red-700 dark:text-red-400 font-medium'">
                  {{ line.type === 'DEBIT' ? 'D' : 'C' }}
                </span>
                {{ line.coa.code }} {{ line.coa.name }}
                <span v-if="line.contact" class="text-slate-400">· {{ line.contact.name }}</span>
                <span class="text-slate-600 dark:text-slate-300 font-medium">{{ formatRp(line.amount) }}</span>
              </span>
              <span v-if="tx.lines.length > 4" class="text-slate-400 dark:text-slate-500">
                +{{ tx.lines.length - 4 }} baris lagi
              </span>
            </div>

            <!-- Date -->
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">{{ formatDate(tx.transactionDate) }}</p>
          </div>

          <!-- Right: Amount + Actions -->
          <div class="flex items-center gap-3 shrink-0">
            <div class="text-right">
              <p class="text-xs text-slate-400 dark:text-slate-500">Total</p>
              <p class="text-base font-bold text-slate-800 dark:text-slate-100">{{ formatRp(totalDebitAmount(tx)) }}</p>
            </div>
            <button
              @click="openDetail(tx)"
              class="p-2 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-colors"
              title="Lihat Detail"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>
            <button
              v-if="canDelete && !tx.isSystemGenerated"
              @click="openDeleteConfirm(tx)"
              class="p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
              title="Hapus"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="txStore.totalPages > 1"
      class="mt-4 flex items-center justify-between"
    >
      <p class="text-sm text-slate-500 dark:text-slate-400">
        Halaman {{ txStore.page }} dari {{ txStore.totalPages }} ({{ txStore.total }} transaksi)
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
          :disabled="currentPage >= txStore.totalPages"
          @click="goToPage(currentPage + 1)"
          class="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
        >
          Berikutnya →
        </button>
      </div>
    </div>
  </div>

  <!-- Transaction Form Modal -->
  <TransactionFormModal
    :is-open="isFormModalOpen"
    @close="isFormModalOpen = false"
    @saved="onTransactionSaved"
  />

  <!-- General Ledger Modal -->
  <GeneralLedgerModal
    :is-open="isLedgerModalOpen"
    :coa="selectedCoa"
    @close="isLedgerModalOpen = false"
  />

  <!-- Delete Confirmation -->
  <ConfirmationModal
    :is-open="isDeleteModalOpen"
    title="Hapus Transaksi"
    :message="`Hapus transaksi '${selectedTx?.description}'? Tindakan ini tidak dapat dibatalkan.`"
    confirm-button-text="Ya, Hapus"
    confirm-button-class="bg-red-600 hover:bg-red-700 focus:ring-red-500"
    :is-confirming="isDeleting"
    @update:is-open="isDeleteModalOpen = $event"
    @confirm="handleDelete"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBusinessTransactionsStore } from '@/stores/businessTransactions'
import { useBusinessStore } from '@/stores/business'
import { useContactsStore } from '@/stores/contacts'
import ExportService from '@/services/exportService'
import TransactionFormModal from '@/components/business/TransactionFormModal.vue'
import GeneralLedgerModal from '@/components/business/GeneralLedgerModal.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import type { BusinessTransaction, ChartOfAccount } from '@/types/business'

const router = useRouter()
const txStore = useBusinessTransactionsStore()
const businessStore = useBusinessStore()
const contactsStore = useContactsStore()

const errorMsg = ref('')
const isFormModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isLedgerModalOpen = ref(false)
const isDeleting = ref(false)
const selectedTx = ref<BusinessTransaction | null>(null)
const selectedCoa = ref<ChartOfAccount | null>(null)
const currentPage = ref(1)

const today = new Date()
const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)

const filters = ref({
  startDate: firstOfMonth,
  endDate: today.toISOString().slice(0, 10),
  coaId: '',
})

const isExporting = ref(false)

async function doExportExcel() {
  isExporting.value = true
  try {
    await ExportService.exportBusinessTransactionsToExcel(
      txStore.transactions,
      businessStore.currentCompany?.name,
      { startDate: filters.value.startDate, endDate: filters.value.endDate },
    )
  } finally {
    isExporting.value = false
  }
}

function doExportPDF() {
  ExportService.exportBusinessTransactionsToPDF(
    txStore.transactions,
    businessStore.currentCompany?.name,
    { startDate: filters.value.startDate, endDate: filters.value.endDate },
  )
}

const canCreate = computed(() => {
  const role = businessStore.myRole
  return role !== null && ['STAFF', 'ADMIN', 'OWNER'].includes(role)
})

const canDelete = computed(() => {
  const role = businessStore.myRole
  return role === 'ADMIN' || role === 'OWNER'
})

const manualCount = computed(() => txStore.transactions.filter((t) => !t.isSystemGenerated).length)
const invoiceCount = computed(() => txStore.transactions.filter((t) => t.isSystemGenerated).length)

onMounted(async () => {
  try {
    await Promise.all([
      loadTransactions(),
      businessStore.fetchChartOfAccounts().catch(() => {}),
      businessStore.fetchMembers().catch(() => {}),
      contactsStore.fetchContacts().catch(() => {}),
    ])
  } catch {
    errorMsg.value = 'Gagal memuat data transaksi.'
  }
})

async function loadTransactions() {
  await txStore.fetchTransactions({
    startDate: filters.value.startDate || undefined,
    endDate: filters.value.endDate || undefined,
    coaId: filters.value.coaId || undefined,
    page: currentPage.value,
    limit: 20,
  })
}

async function applyFilters() {
  currentPage.value = 1
  errorMsg.value = ''
  try {
    await loadTransactions()
  } catch {
    errorMsg.value = 'Gagal memuat transaksi.'
  }
}

function resetFilters() {
  filters.value = {
    startDate: firstOfMonth,
    endDate: today.toISOString().slice(0, 10),
    coaId: '',
  }
  currentPage.value = 1
  loadTransactions()
}

async function goToPage(page: number) {
  currentPage.value = page
  await loadTransactions()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openDetail(tx: BusinessTransaction) {
  router.push({ name: 'business-transaction-detail', params: { id: tx.id } })
}

function openDeleteConfirm(tx: BusinessTransaction) {
  selectedTx.value = tx
  isDeleteModalOpen.value = true
}

async function handleDelete() {
  if (!selectedTx.value) return
  isDeleting.value = true
  try {
    await txStore.deleteTransaction(selectedTx.value.id)
    isDeleteModalOpen.value = false
    selectedTx.value = null
  } catch (err: any) {
    const msg = err.response?.data?.message
    errorMsg.value = msg || 'Gagal menghapus transaksi.'
    isDeleteModalOpen.value = false
  } finally {
    isDeleting.value = false
  }
}

async function onTransactionSaved() {
  currentPage.value = 1
  await loadTransactions()
}

function openLedger() {
  if (!filters.value.coaId) return
  const allCoas = Object.values(businessStore.chartOfAccounts).flat()
  selectedCoa.value = allCoas.find((c) => c.id === filters.value.coaId) ?? null
  isLedgerModalOpen.value = true
}

function totalDebitAmount(tx: BusinessTransaction): number {
  return tx.lines
    .filter((l) => l.type === 'DEBIT')
    .reduce((s, l) => s + parseFloat(l.amount), 0)
}

function formatRp(amount: string | number) {
  const val = typeof amount === 'string' ? parseFloat(amount) : amount
  return 'Rp ' + val.toLocaleString('id-ID')
}

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
