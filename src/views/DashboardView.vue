<template>
  <div class="space-y-6 sm:space-y-8">
    <h1 class="text-2xl sm:text-3xl font-semibold text-gray-800">Dashboard</h1>

    <section aria-labelledby="summary-heading">
      <h2 id="summary-heading" class="sr-only">Ringkasan Keuangan</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
        <StatsCard
          title="Total Saldo Saat Ini"
          :value="formatCurrency(overallNetBalance, 'IDR')"
          variant="indigo"
        >
          <template #icon>
            <svg
              class="h-6 w-6 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"
              />
            </svg>
          </template>
        </StatsCard>

        <StatsCard
          title="Pemasukan Bulan Ini"
          :value="formatCurrency(monthlySummary.income, 'IDR')"
          variant="green"
        >
          <template #icon>
            <svg
              class="h-6 w-6 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75"
              />
            </svg>
          </template>
        </StatsCard>

        <StatsCard
          title="Pengeluaran Bulan Ini"
          :value="formatCurrency(monthlySummary.expense, 'IDR')"
          variant="red"
        >
          <template #icon>
            <svg
              class="h-6 w-6 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75"
              />
            </svg>
          </template>
        </StatsCard>

        <StatsCard
          title="Arus Kas Bersih (Bulan Ini)"
          :value="formatCurrency(monthlySummary.net, 'IDR')"
          variant="blue"
        >
          <template #icon>
            <svg
              class="h-6 w-6 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A2.25 2.25 0 0 1 1.5 18.75v-5.625c0-1.036.84-1.875 1.875-1.875H13.5A2.25 2.25 0 0 1 15.75 12v2.25A2.25 2.25 0 0 1 13.5 16.5h-2.25A2.25 2.25 0 0 0 9 18.75v2.25M15.75 12A2.25 2.25 0 0 0 13.5 9.75h-2.25A2.25 2.25 0 0 0 9 7.5V5.25A2.25 2.25 0 0 1 11.25 3h2.25A2.25 2.25 0 0 1 15.75 5.25v6.75Z"
              />
            </svg>
          </template>
        </StatsCard>
      </div>
    </section>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
      <section aria-labelledby="recent-transactions-heading" class="lg:col-span-3">
        <div class="bg-white shadow-lg rounded-xl">
          <div class="px-4 py-5 sm:px-6 border-b border-slate-200">
            <div class="flex justify-between items-center">
              <h2 id="recent-transactions-heading" class="text-lg font-medium text-slate-900">
                Transaksi Terbaru
              </h2>
              <RouterLink
                :to="{ name: 'transactions-list' }"
                class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Lihat semua
              </RouterLink>
            </div>
          </div>
          <ul role="list" class="divide-y divide-slate-200">
            <li v-if="isLoadingRecentTransactions" class="px-4 py-10 text-center text-slate-500">
              Memuat transaksi terbaru...
            </li>
            <li
              v-if="!isLoadingRecentTransactions && recentTransactions.length === 0"
              class="px-4 py-10 text-center text-slate-500"
            >
              Belum ada transaksi.
            </li>
            <TransactionItem
              v-for="transaction in recentTransactions"
              :key="transaction.id"
              :transaction="transaction"
              @edit="navigateToEditTransaction"
              @delete="promptDeleteTransaction"
            />
          </ul>
        </div>
      </section>

      <div class="lg:col-span-2 space-y-6">
        <section aria-labelledby="account-balances-heading">
          <div class="bg-white shadow-lg rounded-xl">
            <div class="px-4 py-5 sm:px-6 border-b border-slate-200">
              <h2 id="account-balances-heading" class="text-lg font-medium text-slate-900">
                Saldo per Akun
              </h2>
            </div>
            <div class="p-4 sm:p-6">
              <LoadingSpinner
                v-if="accountStore.isLoading && accountStore.accounts.length === 0"
                :visible="true"
                text="Memuat data akun..."
                size="md"
                color="text-slate-500"
              />
              <div
                v-if="!accountStore.isLoading && accountStore.accounts.length === 0"
                class="text-center text-slate-500 py-8"
              >
                <p>Belum ada akun untuk ditampilkan.</p>
              </div>
              <Bar
                v-if="!accountStore.isLoading && accountChartData.labels.length > 0"
                :data="accountChartData"
                :options="accountChartOptions"
                class="max-h-80"
              />
            </div>
          </div>
        </section>

        <section aria-labelledby="spending-category-heading">
          <div class="bg-white shadow-lg rounded-xl">
            <div class="px-4 py-5 sm:px-6 border-b border-slate-200">
              <h2 id="spending-category-heading" class="text-lg font-medium text-slate-900">
                Pengeluaran per Kategori (Bulan Ini)
              </h2>
            </div>
            <div class="p-6">
              <ul class="space-y-3">
                <li
                  v-for="item in topSpendingCategories"
                  :key="item?.name"
                  class="flex justify-between items-center text-sm"
                >
                  <div class="flex items-center">
                    <span :class="['w-3 h-3 rounded-full mr-2', item?.colorClass]"></span>
                    <span class="text-slate-700">{{ item?.name }}</span>
                  </div>
                  <span class="font-medium text-slate-800">{{
                    formatCurrency(item.amount, 'IDR')
                  }}</span>
                </li>
              </ul>
              <div
                v-if="topSpendingCategories.length === 0 && !isLoadingSpendingCategories"
                class="text-center text-slate-500 py-8"
              >
                <p>Belum ada data pengeluaran bulan ini.</p>
              </div>
              <p v-if="isLoadingSpendingCategories" class="text-center text-slate-500 py-8">
                Memuat pengeluaran...
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
    <ConfirmationModal
      v-model:isOpen="isDeleteModalOpen"
      title="Konfirmasi Hapus Transaksi"
      :message="`Apakah Anda yakin ingin menghapus transaksi '${transactionToDeleteDescription}'? Aksi ini tidak dapat dibatalkan dan akan mengembalikan saldo akun terkait.`"
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
import { ref, reactive, onMounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAccountStore } from '@/stores/accounts'
import { useTransactionStore } from '@/stores/transactions'
// import { useCategoryStore } from '@/stores/categories'; // Jika diperlukan untuk filter spending
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import TransactionItem from '@/components/transactions/TransactionItem.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import StatsCard from '@/components/common/StatsCard.vue'

import type { Transaction } from '@/types/transaction'

import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  Colors,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, Colors)

const router = useRouter()
const accountStore = useAccountStore()
const transactionStore = useTransactionStore()
const overallNetBalance = ref(0)
const monthlySummary = reactive({ income: 0, expense: 0, net: 0 })
const recentTransactions = ref<Transaction[]>([])
const isLoadingRecentTransactions = ref(true)
const topSpendingCategories = ref([{ name: '', amount: 0, colorClass: '' }])
const isLoadingSpendingCategories = ref(true)

// --- Data dan Opsi untuk Grafik Saldo Akun ---
const accountChartData = computed(() => {
  const relevantAccounts = accountStore.allAccounts.filter(
    (acc) => acc.accountType !== 'CREDIT_CARD' && acc.currentBalance > 0,
  )

  return {
    labels: relevantAccounts.map((acc) => acc.accountName),
    datasets: [
      {
        label: 'Saldo Akun (IDR)',
        data: relevantAccounts.map((acc) => acc.currentBalance),
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }
})

const accountChartOptions = ref({
  responsive: true,
  maintainAspectRatio: true,
  indexAxis: 'y' as const,
  scales: {
    x: {
      beginAtZero: true,
      ticks: {
        callback: function (value: string | number) {
          // Format angka menjadi K, Jt, M, dll. jika perlu
          const numValue = Number(value)
          if (numValue >= 1000000000) return numValue / 1000000000 + ' M'
          if (numValue >= 1000000) return numValue / 1000000 + ' Jt'
          if (numValue >= 1000) return numValue / 1000 + ' K'
          return value
        },
      },
    },
    y: {
      ticks: {
        autoSkip: false,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
    colors: {
      enabled: true,
      forceOverride: false,
    },
  },
})

// --- Fungsi Helper ---
const formatCurrency = (value: number | string, currency: string = 'IDR') => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numericValue)) return 'N/A'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(numericValue)
}

// --- Fetch Data Saat Komponen Dimuat ---
onMounted(async () => {
  // 1. Ambil semua akun untuk chart dan kalkulasi total saldo
  if (accountStore.accounts.length === 0) {
    await accountStore.fetchAccounts()
  }
  calculateOverallNetBalance() // Hitung total saldo setelah akun di-fetch

  // 2. Ambil transaksi terbaru
  isLoadingRecentTransactions.value = true
  await transactionStore.fetchTransactions({
    page: 1,
    limit: 5,
    sortBy: 'transactionDate',
    sortOrder: 'desc',
  })
  recentTransactions.value = transactionStore.transactionList
  isLoadingRecentTransactions.value = false

  // 3. Ambil summary pemasukan/pengeluaran bulan ini & spending per kategori (Nanti dari API khusus dashboard)
  // Untuk sekarang, kita bisa coba hitung dari transaksi bulan ini jika ada
  await fetchAndCalculateMonthlySummary()
  await fetchAndCalculateTopSpendingCategories()
})

const calculateOverallNetBalance = () => {
  let total = 0
  accountStore.allAccounts.forEach((acc) => {
    if (acc.accountType === 'CREDIT_CARD') {
      total -= Number(acc.currentBalance) // Asumsi saldo kartu kredit adalah utang (positif berarti tagihan)
    } else {
      total += Number(acc.currentBalance)
    }
  })
  overallNetBalance.value = total
}

const fetchAndCalculateMonthlySummary = async () => {
  // Dapatkan tanggal awal dan akhir bulan ini
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0] // Hari terakhir bulan ini

  let incomeThisMonth = 0
  let expenseThisMonth = 0

  const tempTransactionsForSummary = transactionStore.transactionList // Ini hanya transaksi terbaru, bukan seluruh bulan

  tempTransactionsForSummary.forEach((tx) => {
    const txDate = new Date(tx.transactionDate)
    if (txDate >= new Date(startDate) && txDate <= new Date(endDate)) {
      if (tx.transactionType === 'INCOME') {
        incomeThisMonth += Number(tx.amount)
      } else if (tx.transactionType === 'EXPENSE') {
        expenseThisMonth += Number(tx.amount)
      }
    }
  })
  monthlySummary.income = incomeThisMonth
  monthlySummary.expense = expenseThisMonth
  monthlySummary.net = Number(incomeThisMonth) - Number(expenseThisMonth)
}

const fetchAndCalculateTopSpendingCategories = async () => {
  isLoadingSpendingCategories.value = true
  // Ini juga placeholder, idealnya dari API: GET /api/dashboard/spending-by-category?period=this_month
  // Untuk demo, kita proses data dummy atau transaksi yang ada
  const expenseByCategory: Record<string, { name: string; amount: number; colorClass: string }> = {}
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  transactionStore.transactionList.forEach((tx) => {
    // Sekali lagi, ini hanya dari recent tx, tidak akurat
    if (tx.transactionType === 'EXPENSE' && tx.category) {
      const txDate = new Date(tx.transactionDate)
      if (txDate >= startDate && txDate <= endDate) {
        if (!expenseByCategory[tx.category.id]) {
          expenseByCategory[tx.category.id] = {
            name: tx.category.categoryName,
            amount: 0,
            colorClass: `bg-[${tx.category.color || '#718096'}]`, // Placeholder color
          }
        }
        expenseByCategory[tx.category.id].amount += tx.amount
      }
    }
  })
  topSpendingCategories.value = Object.values(expenseByCategory)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5) // Ambil top 5
  isLoadingSpendingCategories.value = false
}

// --- Logika untuk Delete Transaction Modal (dipindahkan dari TransactionItem) ---
const isDeleteModalOpen = ref(false)
const transactionToDelete = ref<Transaction | null>(null)
const isDeletingTransaction = ref(false)

const transactionToDeleteDescription = computed(() => {
  if (!transactionToDelete.value) return 'transaksi ini'
  return (
    transactionToDelete.value.description ||
    `transaksi ${transactionToDelete.value.category?.categoryName || transactionToDelete.value.transactionType}`
  )
})

const promptDeleteTransaction = (transaction: Transaction) => {
  transactionToDelete.value = transaction
  isDeleteModalOpen.value = true
}

const handleConfirmDelete = async () => {
  if (!transactionToDelete.value) return
  isDeletingTransaction.value = true
  try {
    await transactionStore.deleteTransaction(transactionToDelete.value.id)
    // Refresh recent transactions and summaries
    await transactionStore.fetchTransactions({
      page: 1,
      limit: 5,
      sortBy: 'transactionDate',
      sortOrder: 'desc',
    })
    recentTransactions.value = transactionStore.transactionList
    await fetchAndCalculateMonthlySummary()
    await fetchAndCalculateTopSpendingCategories()
    // Notifikasi sukses
  } catch (error: any) {
    // Notifikasi error
    console.error('Failed to delete transaction from dashboard:', error)
  } finally {
    isDeletingTransaction.value = false
    closeDeleteModal()
  }
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  transactionToDelete.value = null
}

const navigateToEditTransaction = (transaction: Transaction) => {
  // Nanti: router.push({ name: 'transaction-edit', params: { id: transaction.id } });
  alert(`Edit transaksi: ${transaction.description} (navigasi nanti)`)
}
</script>

<style scoped>
/* Style spesifik untuk halaman dashboard jika diperlukan */
.max-h-80 {
  /* Batasi tinggi chart agar tidak terlalu dominan */
  max-height: 20rem; /* 320px */
}
</style>
