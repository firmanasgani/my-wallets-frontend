// src/views/TransactionsView.vue
<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
      <h1 class="text-2xl sm:text-3xl font-semibold text-gray-800">Riwayat Transaksi</h1>
      <div v-if="transactionStore.transactionList.length > 0">
        <button
          @click="openAddTransactionModal"
          class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5 mr-2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Transaksi
        </button>
      </div>
    </div>

    <div class="bg-white p-4 rounded-lg shadow print:hidden">
      <h2 class="text-lg font-medium text-slate-700 mb-3">Filter Transaksi</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label for="filter-daterange-start" class="block text-sm font-medium text-slate-600 mb-1"
            >Tanggal Mulai</label
          >
          <input
            type="date"
            id="filter-daterange-start"
            v-model="localFilters.startDate"
            class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
          />
        </div>
        <div>
          <label for="filter-daterange-end" class="block text-sm font-medium text-slate-600 mb-1"
            >Tanggal Akhir</label
          >
          <input
            type="date"
            id="filter-daterange-end"
            v-model="localFilters.endDate"
            class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
          />
        </div>
        <div>
          <label for="filter-account" class="block text-sm font-medium text-slate-600 mb-1"
            >Akun</label
          >
          <select
            id="filter-account"
            v-model="localFilters.accountId"
            class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
          >
            <option :value="undefined">Semua Akun</option>
            <option v-for="acc in accountsForFilter" :key="acc.id" :value="acc.id">
              {{ acc.accountName }}
            </option>
          </select>
          <p v-if="accountStore.isLoading" class="text-xs text-slate-500 mt-1">Memuat akun...</p>
        </div>
        <div>
          <label for="filter-category" class="block text-sm font-medium text-slate-600 mb-1"
            >Kategori</label
          >
          <select
            id="filter-category"
            v-model="localFilters.categoryId"
            class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
          >
            <option :value="undefined">Semua Kategori</option>
            <option v-for="cat in categoriesForFilter" :key="cat.id" :value="cat.id">
              {{ cat.parentPrefix || '' }}{{ cat.categoryName }} ({{ cat.categoryType }})
            </option>
          </select>
          <p v-if="categoryStore.isLoadingCategories" class="text-xs text-slate-500 mt-1">
            Memuat kategori...
          </p>
        </div>
        <div>
          <label for="filter-type" class="block text-sm font-medium text-slate-600 mb-1"
            >Tipe</label
          >
          <select
            id="filter-type"
            v-model="localFilters.type"
            class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
          >
            <option :value="undefined">Semua Tipe</option>
            <option value="INCOME">Pemasukan</option>
            <option value="EXPENSE">Pengeluaran</option>
            <option value="TRANSFER">Transfer</option>
          </select>
        </div>
      </div>
      <div class="mt-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
        <button
          @click="resetFilters"
          class="inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors w-full sm:w-auto"
        >
          Reset
        </button>
        <button
          @click="applyCurrentFilters"
          class="inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors w-full sm:w-auto"
        >
          Terapkan
        </button>
      </div>
    </div>

    <div class="bg-white p-4 rounded-lg shadow print:hidden">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div>
          <p class="text-sm text-slate-500">Total Pemasukan</p>
          <p class="text-xl font-semibold text-green-600">
            {{ formatCurrency(summary.income, 'IDR') }}
          </p>
        </div>
        <div>
          <p class="text-sm text-slate-500">Total Pengeluaran</p>
          <p class="text-xl font-semibold text-red-600">
            {{ formatCurrency(summary.expense, 'IDR') }}
          </p>
        </div>
        <div>
          <p class="text-sm text-slate-500">Selisih</p>
          <p
            :class="[
              'text-xl font-semibold',
              summary.net >= 0 ? 'text-blue-600' : 'text-orange-600',
            ]"
          >
            {{ formatCurrency(summary.net, 'IDR') }}
          </p>
        </div>
      </div>
    </div>

    <LoadingSpinner
      v-if="transactionStore.isLoadingTransactions && transactionStore.transactionList.length === 0"
      :visible="true"
      text="Memuat data transaksi..."
      size="lg"
      overlay
    />
    <div
      v-if="transactionStore.transactionError && !transactionStore.isLoadingTransactions"
      class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
      role="alert"
    >
      <p class="font-bold">Gagal Memuat Transaksi</p>
      <p>{{ transactionStore.transactionError }}</p>
    </div>

    <div
      v-if="
        !transactionStore.isLoadingTransactions &&
        transactionStore.transactionList.length === 0 &&
        !transactionStore.transactionError
      "
      class="text-center py-10 bg-white rounded-lg shadow-md"
    >
      <svg
        class="mx-auto h-16 w-16 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
        />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-slate-800">Belum Ada Transaksi</h3>
      <p class="mt-1 text-sm text-slate-500">
        Tidak ada transaksi yang cocok dengan filter ini, atau Anda belum membuat transaksi.
      </p>
      <button
        @click="openAddTransactionModal"
        class="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
      >
        + Tambah Transaksi
      </button>
    </div>

    <div
      v-if="!transactionStore.isLoadingTransactions && transactionStore.transactionList.length > 0"
      class="bg-white rounded-lg shadow"
    >
      <ul role="list" class="divide-y divide-slate-200">
        <TransactionItem
          v-for="transaction in transactionStore.transactionList"
          :key="transaction.id"
          :transaction="transaction"
          @edit="editTransaction"
          @delete="promptDeleteTransaction"
        />
      </ul>
      <div
        v-if="transactionStore.meta.lastPage > 1"
        class="px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6 print:hidden"
      >
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="prevPage"
            :disabled="!transactionStore.meta.hasPreviousPage"
            class="btn-secondary-filter text-sm"
          >
            Sebelumnya
          </button>
          <button
            @click="nextPage"
            :disabled="!transactionStore.meta.hasNextPage"
            class="btn-secondary-filter text-sm ml-3"
          >
            Berikutnya
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-slate-700">
              Menampilkan
              <span class="font-medium">{{
                (transactionStore.meta.page - 1) * transactionStore.meta.limit + 1
              }}</span>
              sampai
              <span class="font-medium">{{
                Math.min(
                  transactionStore.meta.page * transactionStore.meta.limit,
                  transactionStore.meta.total,
                )
              }}</span>
              dari
              <span class="font-medium">{{ transactionStore.meta.total }}</span>
              hasil
            </p>
          </div>
          <div>
            <nav
              class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                @click="prevPage"
                :disabled="!transactionStore.meta.hasPreviousPage"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <span
                class="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700"
              >
                Hal {{ transactionStore.meta.page }} dari {{ transactionStore.meta.lastPage }}
              </span>
              <button
                @click="nextPage"
                :disabled="!transactionStore.meta.hasNextPage"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
              >
                Berikutnya
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
    <AddTransactionModal
      v-model:isOpen="isAddTransactionModalOpen"
      @transaction-saved="handleTransactionSaved"
    />

    <ConfirmationModal
      v-model:isOpen="isDeleteModalOpen"
      title="Konfirmasi Hapus Transaksi"
      :message="`Apakah Anda yakin ingin menghapus transaksi '${transactionToDelete?.description || 'ini'}'? Aksi ini tidak dapat dibatalkan dan akan mengembalikan saldo akun terkait.`"
      confirmButtonText="Ya, Hapus"
      confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      iconType="danger"
      :isConfirming="isDeletingTransaction || transactionStore.isSubmittingTransaction"
      @confirm="handleConfirmDelete"
      @cancel="closeDeleteModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive, watch } from 'vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import TransactionItem from '@/components/transactions/TransactionItem.vue'
import { useTransactionStore } from '@/stores/transactions'
import { useAccountStore } from '@/stores/accounts'
import { useCategoryStore } from '@/stores/categories'
import type { Transaction, QueryTransactionDto } from '@/types/transaction'
import type { FrontendTransactionType } from '@/types/enums'
import AddTransactionModal from '@/components/transactions/AddTransactionModal.vue'

const transactionStore = useTransactionStore()
const accountStore = useAccountStore()
const categoryStore = useCategoryStore()

// Helper function untuk mendapatkan current date dalam format YYYY-MM-DD
const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0]
}

// Set default filter dengan current date
const localFilters = reactive<QueryTransactionDto>({
  ...transactionStore.activeFilters,
  startDate: transactionStore.activeFilters.startDate || getCurrentDate(),
  endDate: transactionStore.activeFilters.endDate || getCurrentDate(),
})

// Computed properties untuk mengambil data dari store
const transactions = computed(() => transactionStore.transactionList)
const isLoading = computed(() => transactionStore.isLoadingTransactions)
const error = computed(() => transactionStore.transactionError)

const accountsForFilter = computed(() => accountStore.allAccounts)
const categoriesForFilter = computed(() => {
  // Buat daftar kategori flat untuk filter
  const flatList: {
    id: string
    categoryName: string
    categoryType: string
    parentPrefix?: string
  }[] = []
  function flatten(items: any[], prefix = '') {
    // Ganti any dengan tipe Category
    items.forEach((item) => {
      flatList.push({
        id: item.id,
        categoryName: item.categoryName,
        categoryType: item.categoryType,
        parentPrefix: prefix,
      })
      if (item.subCategories && item.subCategories.length > 0) {
        flatten(item.subCategories, prefix + '- ')
      }
    })
  }
  flatten(categoryStore.allCategories)
  return flatList
})

const summary = reactive({ income: 0, expense: 0, net: 0 })

const calculateSummary = (txns: Transaction[]) => {
  let incomeTotal = 0
  let expenseTotal = 0
  txns.forEach((tx) => {
    const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount
    if (tx.transactionType === 'INCOME') incomeTotal += amount
    else if (tx.transactionType === 'EXPENSE') expenseTotal += amount
  })
  summary.income = incomeTotal
  summary.expense = expenseTotal
  summary.net = incomeTotal - expenseTotal
}

// Watch perubahan pada daftar transaksi untuk update summary
watch(
  transactions,
  (newTransactions) => {
    calculateSummary(newTransactions)
  },
  { deep: true },
)

onMounted(async () => {
  // Ambil data awal untuk filter dan transaksi
  // Cek apakah perlu fetch atau data sudah ada di store (tergantung strategi Anda)
  if (accountStore.accounts.length === 0) await accountStore.fetchAccounts()
  if (categoryStore.categories.length === 0)
    await categoryStore.fetchCategories({ hierarchical: 'true' }) // Untuk dropdown filter yang hierarkis
  await transactionStore.fetchTransactions(localFilters) // Fetch transaksi dengan filter awal
})

const applyCurrentFilters = () => {
  // Bersihkan field filter yang kosong agar tidak dikirim sebagai string kosong
  const cleanFilters: QueryTransactionDto = { page: 1 } // Selalu reset ke page 1 saat filter baru
  if (localFilters.accountId) cleanFilters.accountId = localFilters.accountId
  if (localFilters.categoryId) cleanFilters.categoryId = localFilters.categoryId
  if (localFilters.type) cleanFilters.type = localFilters.type as FrontendTransactionType
  if (localFilters.startDate) cleanFilters.startDate = localFilters.startDate
  if (localFilters.endDate) cleanFilters.endDate = localFilters.endDate
  if (localFilters.limit) cleanFilters.limit = localFilters.limit
  if (localFilters.sortBy) cleanFilters.sortBy = localFilters.sortBy
  if (localFilters.sortOrder) cleanFilters.sortOrder = localFilters.sortOrder

  transactionStore.applyFilters(cleanFilters)
}

const resetFilters = () => {
  const currentDate = getCurrentDate()
  localFilters.accountId = undefined
  localFilters.categoryId = undefined
  localFilters.type = undefined
  localFilters.startDate = currentDate
  localFilters.endDate = currentDate
  localFilters.page = 1 // Reset ke halaman 1
  // localFilters.limit tetap (atau reset ke default store)
  // localFilters.sortBy & sortOrder tetap (atau reset ke default store)
  transactionStore.applyFilters({
    page: 1,
    limit: localFilters.limit,
    sortBy: 'transactionDate',
    sortOrder: 'desc',
    startDate: currentDate,
    endDate: currentDate,
  })
}

const prevPage = () => {
  if (transactionStore.meta.hasPreviousPage && transactionStore.meta.page > 1) {
    transactionStore.applyFilters({ page: transactionStore.meta.page - 1 })
  }
}
const nextPage = () => {
  if (transactionStore.meta.hasNextPage) {
    transactionStore.applyFilters({ page: transactionStore.meta.page + 1 })
  }
}

const formatCurrency = (value: number | string, currency: string = 'IDR') => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numericValue)) return 'N/A'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(numericValue)
}

// Logika Modal Tambah Transaksi (Placeholder)
const isAddTransactionModalOpen = ref(false)
const openAddTransactionModal = () => {
  isAddTransactionModalOpen.value = true
}

// Logika Modal Hapus Transaksi
const isDeleteModalOpen = ref(false)
const transactionToDelete = ref<Transaction | null>(null)
const isDeletingTransaction = ref(false)

const promptDeleteTransaction = (transaction: Transaction) => {
  transactionToDelete.value = transaction
  isDeleteModalOpen.value = true
}
const handleTransactionSaved = () => {
  isAddTransactionModalOpen.value = false
  transactionStore.fetchTransactions(localFilters)
}
const handleConfirmDelete = async () => {
  if (!transactionToDelete.value) return
  isDeletingTransaction.value = true
  try {
    await transactionStore.deleteTransaction(transactionToDelete.value.id)
    // Notifikasi sukses
    alert(`Transaksi '${transactionToDelete.value.description || 'ini'}' berhasil dihapus.`)
  } catch (error: any) {
    // Notifikasi error
    alert(`Gagal menghapus transaksi: ${transactionStore.transactionError || error.message}`)
  } finally {
    isDeletingTransaction.value = false
    closeDeleteModal()
  }
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  transactionToDelete.value = null
}

const editTransaction = (transaction: Transaction) => {
  alert(`Edit transaksi: ${transaction.description} (implementasi nanti)`)
  // Nanti: buka modal edit atau navigasi ke halaman edit
}
</script>

<style scoped></style>
