<template>
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
    <!-- Breadcrumb / Back Navigation -->
    <nav class="flex items-center text-sm text-slate-500">
      <RouterLink
        :to="{ name: 'accounts-list' }"
        class="hover:text-indigo-600 transition-colors flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-4 h-4 mr-1"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
        Kembali ke Daftar Akun
      </RouterLink>
    </nav>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <LoadingSpinner :visible="true" text="Memuat detail akun..." size="lg" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-red-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">
            {{ error }}
          </p>
        </div>
      </div>
    </div>

    <div v-else-if="account" class="space-y-6">
      <!-- Header & Actions -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">{{ account.accountName }}</h1>
          <p class="text-sm text-slate-500 mt-1">Detail informasi akun dan riwayat transaksi</p>
        </div>
        <div class="flex gap-3">
          <RouterLink
            :to="{ name: 'account-edit', params: { id: account.id } }"
            class="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-4 h-4 mr-2 text-slate-500"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
            Edit Akun
          </RouterLink>
        </div>
      </div>

      <!-- Account Detail Card -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-6 md:p-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Balance Info -->
            <div
              class="md:col-span-1 p-6 bg-slate-50 rounded-xl border border-slate-100 dark:bg-slate-900/50"
            >
              <h3 class="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                Saldo Saat Ini
              </h3>
              <p class="text-3xl font-bold text-slate-900 tracking-tight text-indigo-600">
                {{ formatCurrency(account.currentBalance, account.currency) }}
              </p>
              <p class="text-xs text-slate-400 mt-2">
                Saldo Awal: {{ formatCurrency(account.initialBalance, account.currency) }}
              </p>
            </div>

            <!-- Detail Info -->
            <div class="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <dt class="text-sm font-medium text-slate-500">Tipe Akun</dt>
                <dd class="mt-1 text-base font-medium text-slate-900 flex items-center">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getAccountTypeBadgeClass(account.accountType)"
                  >
                    {{ formatAccountType(account.accountType) }}
                  </span>
                </dd>
              </div>

              <div v-if="account.bankId">
                <dt class="text-sm font-medium text-slate-500">Bank</dt>
                <dd class="mt-1 text-base font-medium text-slate-900">
                  {{ bankName }}
                </dd>
              </div>

              <div v-if="account.accountNumber">
                <dt class="text-sm font-medium text-slate-500">Nomor Akun/Rekening</dt>
                <dd class="mt-1 text-base font-medium text-slate-900 font-mono">
                  {{ account.accountNumber }}
                </dd>
              </div>

              <div>
                <dt class="text-sm font-medium text-slate-500">Mata Uang</dt>
                <dd class="mt-1 text-base font-medium text-slate-900">
                  {{ account.currency }}
                </dd>
              </div>

              <div>
                <dt class="text-sm font-medium text-slate-500">Dibuat Pada</dt>
                <dd class="mt-1 text-base text-slate-700">
                  {{ formatDate(account.createdAt) }}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Transactions List -->
      <section class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <header
          class="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50"
        >
          <h3 class="text-lg font-medium text-slate-900">Riwayat Transaksi</h3>
        </header>

        <!-- Loading State for Transactions -->
        <div
          v-if="isLoadingTransactions && transactions.length === 0"
          class="flex justify-center py-12"
        >
          <LoadingSpinner
            :visible="true"
            text="Memuat transaksi..."
            size="md"
            color="text-indigo-500"
          />
        </div>

        <!-- Transactions Table -->
        <div v-else-if="transactions.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Tanggal
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Kategori
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Deskripsi
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Tipe
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Jumlah
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">
              <tr
                v-for="trx in transactions"
                :key="trx.id"
                class="hover:bg-slate-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {{ formatDate(trx.transactionDate) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    v-if="trx.category"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800"
                  >
                    {{ trx.category.categoryName }}
                  </span>
                  <span v-else class="text-slate-400 text-xs italic">-</span>
                </td>
                <td
                  class="px-6 py-4 text-sm text-slate-900 max-w-xs truncate"
                  :title="trx.description || ''"
                >
                  {{ trx.description || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    :class="getTransactionBadgeClass(trx)"
                  >
                    {{ formatTransactionType(trx) }}
                  </span>
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium"
                  :class="getTransactionAmountClass(trx)"
                >
                  {{ getTransactionSign(trx) }}
                  {{ formatCurrency(trx.amount, account?.currency) }}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination / Load More -->
          <div v-if="hasMorePages" class="px-6 py-4 border-t border-slate-200 flex justify-center">
            <button
              @click="loadMoreTransactions"
              :disabled="isLoadingMore"
              class="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LoadingSpinner
                v-if="isLoadingMore"
                :visible="true"
                size="xs"
                color="text-indigo-600"
                class="mr-2"
              />
              {{ isLoadingMore ? 'Memuat...' : 'Halaman Berikutnya' }}
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <svg
            class="mx-auto h-12 w-12 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-slate-900">Belum ada transaksi</h3>
          <p class="mt-1 text-sm text-slate-500">Transaksi yang Anda buat akan muncul di sini.</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAccountStore } from '@/stores/accounts'
import { useBankStore } from '@/stores/banks'
import { useTransactionStore } from '@/stores/transactions'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { Account } from '@/types/accounts'
import { FrontendAccountType, FrontendTransactionType } from '@/types/enums'
import type { Transaction } from '@/types/transaction'

const route = useRoute()
const accountStore = useAccountStore()
const bankStore = useBankStore()
const transactionStore = useTransactionStore()

const account = ref<Account | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const isLoadingMore = ref(false)

// Ambil data transaksi dari store
const transactions = computed(() => transactionStore.transactionList)
const isLoadingTransactions = computed(() => transactionStore.isLoadingTransactions)
const transactionMeta = computed(() => transactionStore.transactionMeta)
const currentAccountId = computed(() => route.params.id as string)

const hasMorePages = computed(() => {
  return transactionMeta.value.page < transactionMeta.value.lastPage
})

// Formatters
const formatCurrency = (value: number | undefined, currency: string = 'IDR') => {
  if (value === undefined) return '0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatAccountType = (type: string) => {
  switch (type) {
    case FrontendAccountType.BANK:
      return 'Rekening Bank'
    case FrontendAccountType.E_WALLET:
      return 'E-Wallet'
    case FrontendAccountType.CASH:
      return 'Tunai'
    case FrontendAccountType.CREDIT_CARD:
      return 'Kartu Kredit'
    default:
      return type
  }
}

const getAccountTypeBadgeClass = (type: string) => {
  switch (type) {
    case FrontendAccountType.BANK:
      return 'bg-blue-100 text-blue-800'
    case FrontendAccountType.E_WALLET:
      return 'bg-purple-100 text-purple-800'
    case FrontendAccountType.CASH:
      return 'bg-green-100 text-green-800'
    case FrontendAccountType.CREDIT_CARD:
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const bankName = computed(() => {
  if (!account.value?.bankId) return '-'
  const bank = bankStore.allBanks.find((b) => b.id === account.value?.bankId)
  return bank ? bank.name : 'Loading...'
})

// === Transaction Helpers ===
const getTransactionBadgeClass = (trx: Transaction) => {
  if (trx.transactionType === FrontendTransactionType.INCOME) return 'bg-green-100 text-green-800'
  if (trx.transactionType === FrontendTransactionType.EXPENSE) return 'bg-red-100 text-red-800'
  if (trx.transactionType === FrontendTransactionType.TRANSFER) return 'bg-blue-100 text-blue-800'
  return 'bg-gray-100 text-gray-800'
}

const formatTransactionType = (trx: Transaction) => {
  if (trx.transactionType === FrontendTransactionType.INCOME) return 'Pemasukan'
  if (trx.transactionType === FrontendTransactionType.EXPENSE) return 'Pengeluaran'
  if (trx.transactionType === FrontendTransactionType.TRANSFER) {
    if (trx.sourceAccountId === currentAccountId.value) return 'Transfer Keluar'
    if (trx.destinationAccountId === currentAccountId.value) return 'Transfer Masuk'
    return 'Transfer'
  }
  return trx.transactionType
}

const getTransactionAmountClass = (trx: Transaction) => {
  if (trx.transactionType === FrontendTransactionType.INCOME) return 'text-green-600'
  if (trx.transactionType === FrontendTransactionType.EXPENSE) return 'text-red-600'
  if (trx.transactionType === FrontendTransactionType.TRANSFER) {
    if (trx.destinationAccountId === currentAccountId.value) return 'text-green-600'
    return 'text-red-600'
  }
  return 'text-slate-900'
}

const getTransactionSign = (trx: Transaction) => {
  if (trx.transactionType === FrontendTransactionType.INCOME) return '+'
  if (trx.transactionType === FrontendTransactionType.EXPENSE) return '-'
  if (trx.transactionType === FrontendTransactionType.TRANSFER) {
    if (trx.destinationAccountId === currentAccountId.value) return '+'
    return '-'
  }
  return ''
}

const fetchAccountData = async () => {
  const accountId = route.params.id as string
  if (!accountId) {
    error.value = 'ID Akun tidak ditemukan'
    isLoading.value = false
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const fetchedAccount = await accountStore.fetchAccountByIdForEdit(accountId)
    if (fetchedAccount) {
      account.value = fetchedAccount
      if (fetchedAccount.accountType === FrontendAccountType.BANK && fetchedAccount.bankId) {
        if (bankStore.allBanks.length === 0) {
          await bankStore.fetchBanks()
        }
      }

      // Fetch Transactions
      await transactionStore.fetchTransactionsByAccount(accountId, { page: 1, limit: 10 })
    } else {
      error.value = 'Akun tidak ditemukan.'
    }
  } catch (err: any) {
    console.error('Error fetching account detail:', err)
    error.value = err.message || 'Gagal mengambil detail akun.'
  } finally {
    isLoading.value = false
  }
}

const loadMoreTransactions = async () => {
  if (isLoadingMore.value || !hasMorePages.value) return

  isLoadingMore.value = true
  const nextPage = transactionMeta.value.page + 1
  try {
    await transactionStore.fetchTransactionsByAccount(currentAccountId.value, {
      page: nextPage,
      limit: 10,
    })
  } catch (err) {
    console.error(err)
  } finally {
    isLoadingMore.value = false
  }
}

onMounted(() => {
  fetchAccountData()
})

watch(
  () => route.params.id,
  (newId) => {
    if (newId) fetchAccountData()
  },
)
</script>

<style scoped>
/* Transisi halus untuk hover */
tr {
  transition: background-color 0.15s ease-in-out;
}
</style>
