<template>
  <div class="space-y-6 sm:space-y-8">
    <!-- Subscription Expiry Alert -->
    <div
      v-if="subscriptionExpiryAlert"
      class="flex items-start gap-3 rounded-xl p-4 border"
      :class="subscriptionExpiryAlert.urgent
        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'"
    >
      <div class="flex-shrink-0 mt-0.5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-5 h-5"
          :class="subscriptionExpiryAlert.urgent ? 'text-red-500 dark:text-red-400' : 'text-amber-500 dark:text-amber-400'"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>
      <div class="flex-1 text-sm">
        <p
          class="font-semibold"
          :class="subscriptionExpiryAlert.urgent ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'"
        >
          {{ subscriptionExpiryAlert.urgent ? 'Langganan Segera Berakhir!' : 'Langganan Akan Berakhir' }}
        </p>
        <p
          class="mt-0.5"
          :class="subscriptionExpiryAlert.urgent ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'"
        >
          Paket <strong>{{ subscriptionExpiryAlert.planName }}</strong> Anda akan berakhir dalam
          <strong>{{ subscriptionExpiryAlert.daysLeft }} hari</strong>
          ({{ subscriptionExpiryAlert.endDateFormatted }}).
          Segera perpanjang agar tidak kehilangan akses fitur premium.
        </p>
      </div>
      <RouterLink
        :to="{ name: 'settings', query: { upgrade: 'true' } }"
        class="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
        :class="subscriptionExpiryAlert.urgent
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-amber-500 hover:bg-amber-600 text-white'"
      >
        Perpanjang Sekarang
      </RouterLink>
    </div>

    <div class="flex items-center space-x-3">
      <h1 class="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-white">Dashboard</h1>
      <button
        @click="showBalance = !showBalance"
        class="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-indigo-50 rounded-full transition-colors focus:outline-none"
        :title="showBalance ? 'Sembunyikan Saldo' : 'Tampilkan Saldo'"
      >
        <svg
          v-if="showBalance"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.752 8.242 7.313 5 12 5c4.687 0 8.248 3.242 9.964 6.678a1.012 1.012 0 0 1 0 .644C20.248 15.758 16.687 19 12 19c-4.687 0-8.248-3.242-9.964-6.678Z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
          />
        </svg>
      </button>
    </div>

    <section aria-labelledby="summary-heading">
      <h2 id="summary-heading" class="sr-only">Ringkasan Keuangan</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
        <StatsCard
          title="Total Saldo Saat Ini"
          :value="showBalance ? formatCurrency(overallNetBalance, 'IDR') : 'Rp ••••••••'"
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
          :value="showBalance ? formatCurrency(monthlySummary.income, 'IDR') : 'Rp ••••••••'"
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
          :value="showBalance ? formatCurrency(monthlySummary.expense, 'IDR') : 'Rp ••••••••'"
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
          :value="showBalance ? formatCurrency(monthlySummary.net, 'IDR') : 'Rp ••••••••'"
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
                d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
              />
            </svg>
          </template>
        </StatsCard>
      </div>
    </section>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
      <section aria-labelledby="recent-transactions-heading" class="lg:col-span-3">
        <div class="bg-white shadow-lg rounded-xl dark:bg-slate-800">
          <div class="px-4 py-5 sm:px-6 border-b border-slate-200">
            <div class="flex justify-between items-center">
              <h2 id="recent-transactions-heading" class="text-lg font-medium text-slate-900 dark:text-white">
                Transaksi Terbaru
              </h2>
              <RouterLink
                :to="{ name: 'transactions-list' }"
                class="text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
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
              :showAmount="showBalance"
              @edit="navigateToEditTransaction"
              @delete="promptDeleteTransaction"
            />
          </ul>
        </div>
      </section>

      <div class="lg:col-span-2 space-y-6">
        <section aria-labelledby="account-balances-heading">
          <div class="bg-white shadow-lg rounded-xl dark:bg-slate-800">
            <div class="px-4 py-5 sm:px-6 border-b border-slate-200">
              <h2 id="account-balances-heading" class="text-lg font-medium text-slate-900 dark:text-white">
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
                class="max-h-80 dark:text-slate-200"
              />
            </div>
          </div>
        </section>

        <section aria-labelledby="spending-category-heading">
          <div class="bg-white shadow-lg rounded-xl dark:bg-slate-800">
            <div class="px-4 py-5 sm:px-6 border-b border-slate-200">
              <h2 id="spending-category-heading" class="text-lg font-medium text-slate-900 dark:text-slate-200">
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
                    <span class="text-slate-700 dark:text-slate-200">{{ item?.name }}</span>
                  </div>
                  <span class="font-medium text-slate-800 dark:text-slate-200">{{
                    showBalance ? formatCurrency(item.amount, 'IDR') : '••••••••'
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

    <WelcomeWizardModal
      :visible="showWelcomeModal"
      @close="handleCloseWelcome"
      @upgrade="handleUpgradeFromWelcome"
    />

    <PremiumSuccessModal :visible="showPremiumSuccessModal" @close="handleClosePremiumSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAccountStore } from '@/stores/accounts'
import { useTransactionStore } from '@/stores/transactions'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import TransactionItem from '@/components/transactions/TransactionItem.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import StatsCard from '@/components/common/StatsCard.vue'
import WelcomeWizardModal from '@/components/dashboard/WelcomeWizardModal.vue'
import PremiumSuccessModal from '@/components/dashboard/PremiumSuccessModal.vue'

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
const route = useRoute()
const accountStore = useAccountStore()
const transactionStore = useTransactionStore()
const authStore = useAuthStore()

const showBalance = ref(localStorage.getItem('show_balance') === 'false')
const showWelcomeModal = ref(false)
const showPremiumSuccessModal = ref(false)

const overallNetBalance = ref(0)
const monthlySummary = reactive({ income: 0, expense: 0, net: 0 })
const recentTransactions = ref<Transaction[]>([])
const isLoadingRecentTransactions = ref(true)
const topSpendingCategories = ref([{ name: '', amount: 0, colorClass: '' }])
const isLoadingSpendingCategories = ref(true)

const isDeleteModalOpen = ref(false)
const transactionToDelete = ref<Transaction | null>(null)
const isDeletingTransaction = ref(false)

watch(showBalance, (val) => {
  localStorage.setItem('show_balance', val.toString())
})

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
    legend: { display: false },
    title: { display: false },
    colors: { enabled: true, forceOverride: false },
  },
})

const subscriptionExpiryAlert = computed(() => {
  const user = authStore.currentUser
  if (!user || user.subscriptionPlan === 'FREE') return null

  const activeSub = user.subscriptions?.find((s) => s.status === 'ACTIVE')
  if (!activeSub?.endDate) return null

  const endDate = new Date(activeSub.endDate)
  const now = new Date()
  const msPerDay = 1000 * 60 * 60 * 24
  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / msPerDay)

  if (daysLeft > 5 || daysLeft <= 0) return null

  return {
    daysLeft,
    urgent: daysLeft <= 3,
    planName: activeSub.plan?.name || user.subscriptionPlan,
    endDateFormatted: endDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  }
})

const transactionToDeleteDescription = computed(() => {
  if (!transactionToDelete.value) return 'transaksi ini'
  return (
    transactionToDelete.value.description ||
    `transaksi ${transactionToDelete.value.category?.categoryName || transactionToDelete.value.transactionType}`
  )
})

const formatCurrency = (value: number | string, currency: string = 'IDR') => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numericValue)) return 'N/A'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(numericValue)
}

const calculateOverallNetBalance = () => {
  let total = 0
  accountStore.allAccounts.forEach((acc) => {
    if (acc.accountType === 'CREDIT_CARD') {
      total -= Number(acc.currentBalance)
    } else {
      total += Number(acc.currentBalance)
    }
  })
  overallNetBalance.value = total
}

const fetchAndCalculateMonthlySummary = async () => {
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  let incomeThisMonth = 0
  let expenseThisMonth = 0

  transactionStore.transactionList.forEach((tx) => {
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
  const expenseByCategory: Record<string, { name: string; amount: number; colorClass: string }> = {}
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  transactionStore.transactionList.forEach((tx) => {
    if (tx.transactionType === 'EXPENSE' && tx.category) {
      const txDate = new Date(tx.transactionDate)
      if (txDate >= startDate && txDate <= endDate) {
        if (!expenseByCategory[tx.category.id]) {
          expenseByCategory[tx.category.id] = {
            name: tx.category.categoryName,
            amount: 0,
            colorClass: `bg-[${tx.category.color || '#718096'}]`,
          }
        }
        expenseByCategory[tx.category.id].amount += Number(tx.amount)
      }
    }
  })
  topSpendingCategories.value = Object.values(expenseByCategory)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
  isLoadingSpendingCategories.value = false
}

const promptDeleteTransaction = (transaction: Transaction) => {
  transactionToDelete.value = transaction
  isDeleteModalOpen.value = true
}

const handleConfirmDelete = async () => {
  if (!transactionToDelete.value) return
  isDeletingTransaction.value = true
  try {
    await transactionStore.deleteTransaction(transactionToDelete.value.id)
    await transactionStore.fetchTransactions({
      page: 1,
      limit: 5,
      sortBy: 'transactionDate',
      sortOrder: 'desc',
    })
    recentTransactions.value = transactionStore.transactionList
    await fetchAndCalculateMonthlySummary()
    await fetchAndCalculateTopSpendingCategories()
  } catch (error: any) {
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
  alert(`Edit transaksi: ${transaction.description} (navigasi nanti)`)
}

const handleCloseWelcome = () => {
  showWelcomeModal.value = false
}

const handleUpgradeFromWelcome = () => {
  showWelcomeModal.value = false
  router.push({ name: 'settings', query: { upgrade: 'true' } })
}

const handleClosePremiumSuccess = () => {
  showPremiumSuccessModal.value = false
}

const checkAndShowWelcomeModal = () => {
  const profile = authStore.user
  if (!profile?.createdAt) return

  const createdAt = new Date(profile.createdAt)
  const now = new Date()
  const diffMs = now.getTime() - createdAt.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)

  if (diffHours <= 8 && profile.subscriptionPlan === 'FREE') {
    showWelcomeModal.value = true
  }
}

const fetchDashboardData = async () => {
  if (!authStore.isAuthenticated) return

  try {
    await authStore.fetchUserProfile()
  } catch (e) {
    console.error('[PersonalDashboard] Error fetching profile:', e)
  }

  try {
    if (accountStore.accounts.length === 0) {
      await accountStore.fetchAccounts()
    }
    calculateOverallNetBalance()
  } catch (e) {
    console.error('[PersonalDashboard] Error fetching accounts:', e)
  }

  try {
    isLoadingRecentTransactions.value = true
    await transactionStore.fetchTransactions({
      page: 1,
      limit: 5,
      sortBy: 'transactionDate',
      sortOrder: 'desc',
    })
    recentTransactions.value = transactionStore.transactionList
  } catch (e) {
    console.error('[PersonalDashboard] Error fetching transactions:', e)
  } finally {
    isLoadingRecentTransactions.value = false
  }

  try {
    await fetchAndCalculateMonthlySummary()
    await fetchAndCalculateTopSpendingCategories()
  } catch (e) {
    console.error('[PersonalDashboard] Error calculating summaries:', e)
    isLoadingSpendingCategories.value = false
  }

  checkAndShowWelcomeModal()
}

watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) fetchDashboardData()
  },
)

onMounted(async () => {
  if (route.query.upgraded === 'true') {
    showPremiumSuccessModal.value = true
    try {
      const url = new URL(window.location.href)
      url.searchParams.delete('upgraded')
      window.history.replaceState({}, '', url.toString())
    } catch (e) {
      console.error('[PersonalDashboard] Failed to clean URL:', e)
    }
  }

  await fetchDashboardData()
})
</script>

<style scoped>
.max-h-80 {
  max-height: 20rem;
}
</style>
