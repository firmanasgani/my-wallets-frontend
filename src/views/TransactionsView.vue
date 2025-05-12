<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
      <h1 class="text-2xl sm:text-3xl font-semibold text-gray-800">Riwayat Transaksi</h1>
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

    <div class="bg-white p-4 rounded-lg shadow print:hidden">
      <h2 class="text-lg font-medium text-slate-700 mb-3">Filter Transaksi</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label for="filter-daterange" class="block text-sm font-medium text-slate-600 mb-1"
            >Rentang Tanggal</label
          >
          <input
            type="date"
            id="filter-daterange"
            placeholder="Pilih tanggal..."
            class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 border border-1 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
          />
        </div>
        <div>
          <label for="filter-account" class="block text-sm font-medium text-slate-600 mb-1"
            >Akun</label
          >
          <select
            id="filter-account"
            class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 border border-1 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
          >
            <option value="">Semua Akun</option>
          </select>
        </div>
        <div>
          <label for="filter-category" class="block text-sm font-medium text-slate-600 mb-1"
            >Kategori</label
          >
          <select
            id="filter-category"
            class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 border border-1 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
          >
            <option value="">Semua Kategori</option>
          </select>
        </div>
        <div>
          <label for="filter-type" class="block text-sm font-medium text-slate-600 mb-1"
            >Tipe</label
          >
          <select
            id="filter-type"
            class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 border border-1 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
          >
            <option value="">Semua Tipe</option>
            <option value="INCOME">Pemasukan</option>
            <option value="EXPENSE">Pengeluaran</option>
            <option value="TRANSFER">Transfer</option>
          </select>
        </div>
      </div>
      <div class="mt-4 flex justify-end space-x-2">
        <button class="btn-secondary-filter text-sm">Reset</button>
        <button class="btn-primary-filter text-sm">Terapkan</button>
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
      v-if="isLoading"
      :visible="true"
      text="Memuat data transaksi..."
      size="lg"
      overlay
      color="text-sky-500"
      text-color="text-sky-700"
    />

    <div
      v-if="!isLoading && transactions.length === 0 && !error"
      class="text-center py-10 bg-white rounded-lg shadow-md"
    >
      <svg
        class="mx-auto h-16 w-16 text-slate-400"
        xmlns="http://www.w3.org/2000/svg"
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
        Tidak ada transaksi yang cocok dengan filter Anda, atau Anda belum membuat transaksi apapun.
      </p>
      <button
        @click="openAddTransactionModal"
        class="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
      >
        + Tambah Transaksi
      </button>
    </div>

    <div
      v-if="error && !isLoading"
      class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
      role="alert"
    >
      <p class="font-bold">Gagal Memuat Transaksi</p>
      <p>{{ error }}</p>
    </div>

    <div v-if="!isLoading && transactions.length > 0" class="bg-white rounded-lg shadow">
      <ul role="list" class="divide-y divide-slate-200">
        <TransactionItem
          v-for="transaction in transactions"
          :key="transaction.id"
          :transaction="transaction"
          @edit="editTransaction"
          @delete="promptDeleteTransaction"
        />
      </ul>
      <div
        class="px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6 print:hidden"
      >
        <p class="text-sm text-slate-700">
          Menampilkan <span class="font-medium">1</span> sampai
          <span class="font-medium">10</span> dari <span class="font-medium">97</span> hasil
        </p>
        <div class="flex-1 flex justify-between sm:justify-end">
          <button class="btn-secondary-filter text-sm">Sebelumnya</button>
          <button class="btn-secondary-filter text-sm ml-3">Berikutnya</button>
        </div>
      </div>
    </div>

    <ConfirmationModal
      v-model:isOpen="isDeleteModalOpen"
      title="Konfirmasi Hapus Transaksi"
      :message="`Apakah Anda yakin ingin menghapus transaksi '${transactionToDelete?.description || 'ini'}'? Aksi ini tidak dapat dibatalkan.`"
      confirmButtonText="Ya, Hapus"
      confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      iconType="danger"
      :isConfirming="isDeletingTransaction"
      @confirm="handleConfirmDelete"
      @cancel="closeDeleteModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import TransactionItem from '@/components/transactions/TransactionItem.vue' // Komponen baru
// import AddTransactionModal from '@/components/transactions/AddTransactionModal.vue'; // Nanti

// Tipe untuk transaksi (sesuaikan dengan API)
interface Transaction {
  id: string
  transactionDate: string // Atau Date
  description?: string | null
  amount: number // Prisma Decimal akan jadi number
  transactionType: 'INCOME' | 'EXPENSE' | 'TRANSFER' // Seharusnya enum
  category?: {
    id: string
    categoryName: string
    color?: string | null
    icon?: string | null
  } | null
  sourceAccount?: { id: string; accountName: string } | null
  destinationAccount?: { id: string; accountName: string } | null
  // ... field lain dari backend
}

const isLoading = ref(true)
const transactions = ref<Transaction[]>([])
const error = ref<string | null>(null)

// --- DATA DUMMY ---
const dummyTransactions: Transaction[] = [
  {
    id: 'tx-1',
    transactionDate: '2025-05-10T10:00:00Z',
    description: 'Makan Siang Nasi Padang',
    amount: 25000,
    transactionType: 'EXPENSE',
    category: {
      id: 'cat-exp-1b',
      categoryName: 'Makan di Luar',
      color: '#FFA726',
      icon: 'glass-cheers',
    },
    sourceAccount: { id: 'uuid-2', accountName: 'GoPay Harian' },
  },
  {
    id: 'tx-2',
    transactionDate: '2025-05-10T08:00:00Z',
    description: 'Gaji Bulan Mei',
    amount: 7500000,
    transactionType: 'INCOME',
    category: { id: 'cat-inc-1', categoryName: 'Gaji', color: '#4CAF50', icon: 'briefcase' },
    destinationAccount: { id: 'uuid-1', accountName: 'BCA Utama' },
  },
  {
    id: 'tx-3',
    transactionDate: '2025-05-09T15:30:00Z',
    description: 'Transfer ke Dompet Tunai',
    amount: 200000,
    transactionType: 'TRANSFER',
    sourceAccount: { id: 'uuid-1', accountName: 'BCA Utama' },
    destinationAccount: { id: 'uuid-3', accountName: 'Dompet Kas Tunai' },
  },
  {
    id: 'tx-4',
    transactionDate: '2025-05-08T12:00:00Z',
    description: 'Beli Bensin Pertamax',
    amount: 150000,
    transactionType: 'EXPENSE',
    category: { id: 'sub-cat-trans-1', categoryName: 'BBM', color: '#64B5F6', icon: 'gas-pump' },
    sourceAccount: { id: 'uuid-3', accountName: 'Dompet Kas Tunai' },
  },
]

const summary = reactive({
  income: 0,
  expense: 0,
  net: 0,
})

const calculateSummary = (txns: Transaction[]) => {
  let incomeTotal = 0
  let expenseTotal = 0
  txns.forEach((tx) => {
    if (tx.transactionType === 'INCOME') {
      incomeTotal += tx.amount
    } else if (tx.transactionType === 'EXPENSE') {
      expenseTotal += tx.amount
    }
    // Transfer tidak dihitung dalam summary income/expense ini
    // karena hanya perpindahan dana antar akun sendiri
  })
  summary.income = incomeTotal
  summary.expense = expenseTotal
  summary.net = incomeTotal - expenseTotal
}

onMounted(async () => {
  // Nanti: Panggil action dari useTransactionStore()
  setTimeout(() => {
    transactions.value = dummyTransactions.sort(
      (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime(),
    )
    calculateSummary(transactions.value)
    isLoading.value = false
  }, 1000)
})
// --- AKHIR DATA DUMMY ---

const formatCurrency = (value: number, currency: string = 'IDR') => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(value)
}

// Logika Modal Tambah Transaksi (Placeholder)
const isAddTransactionModalOpen = ref(false)
const openAddTransactionModal = () => {
  isAddTransactionModalOpen.value = true
  alert('Buka modal tambah transaksi (implementasi nanti)')
}
const handleSaveTransaction = (savedTx: any) => {
  console.log('Transaksi disimpan:', savedTx)
  isAddTransactionModalOpen.value = false
  // Refresh list atau tambahkan ke list
}

// Logika Modal Hapus Transaksi
const isDeleteModalOpen = ref(false)
const transactionToDelete = ref<Transaction | null>(null)
const isDeletingTransaction = ref(false)

const promptDeleteTransaction = (transaction: Transaction) => {
  transactionToDelete.value = transaction
  isDeleteModalOpen.value = true
}

const handleConfirmDelete = async () => {
  if (!transactionToDelete.value) return
  isDeletingTransaction.value = true
  console.log(`Menghapus transaksi: ${transactionToDelete.value.description}`)
  setTimeout(() => {
    // Simulasi
    transactions.value = transactions.value.filter((tx) => tx.id !== transactionToDelete.value!.id)
    calculateSummary(transactions.value) // Hitung ulang summary
    alert(
      `Transaksi '${transactionToDelete.value?.description || 'ini'}' (placeholder) telah dihapus.`,
    )
    isDeletingTransaction.value = false
    closeDeleteModal()
  }, 1000)
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  transactionToDelete.value = null
}

// Placeholder untuk edit
const editTransaction = (transaction: Transaction) => {
  alert(`Edit transaksi: ${transaction.description} (implementasi nanti)`)
}
</script>

<style scoped></style>
