<template>
<div class="money-accounts account-detail">
<header class="account-detail-heading"><div><RouterLink :to="{ name: 'accounts-list' }" class="account-detail-back"><AppIcon name="arrow" />Daftar akun</RouterLink><span class="shell-overline">RINCIAN AKUN KEUANGAN</span><h1>{{ account?.accountName || 'Detail akun.' }}</h1><p>Saldo, informasi akun, dan riwayat transaksi dalam satu tempat.</p></div><RouterLink v-if="account && !isLoading && !error" :to="{ name: 'account-edit', params: { id: account.id } }" class="accounts-button is-primary"><AppIcon name="edit" />Edit akun</RouterLink></header>
<div v-if="isLoading" class="accounts-state" role="status"><span class="accounts-spinner" aria-hidden="true"></span><h2>Memuat detail akun...</h2><p>Menyiapkan informasi akun dan transaksimu.</p></div>
<div v-else-if="error" class="accounts-state is-error" role="alert"><AppIcon name="help" /><h2>Detail akun belum berhasil dimuat.</h2><p>{{ error }}</p><button type="button" class="accounts-button" @click="fetchAccountData">Coba lagi</button></div>
<template v-else-if="account"><div class="account-detail-overview">
<section class="account-detail-balance" aria-labelledby="balance-title"><div class="account-detail-balance-top"><span class="account-detail-icon"><AppIcon name="wallet" /></span><span class="account-detail-type">{{ formatAccountType(account.accountType) }}</span></div><p id="balance-title">Saldo saat ini ? {{ account.currency }}</p><strong>{{ showBalance ? formatCurrency(account.currentBalance, account.currency) : '????????' }}</strong><div class="account-detail-balance-bottom"><span>Saldo awal<br /><b>{{ showBalance ? formatCurrency(account.initialBalance, account.currency) : '????????' }}</b></span><button type="button" :aria-label="showBalance ? 'Sembunyikan saldo' : 'Tampilkan saldo'" :aria-pressed="!showBalance" @click="showBalance = !showBalance"><AppIcon :name="showBalance ? 'eyeOff' : 'eye'" /></button></div></section>
<section class="account-detail-info" aria-labelledby="info-title"><div class="account-detail-section-heading"><div><span class="shell-overline">INFORMASI AKUN</span><h2 id="info-title">Tentang akun ini.</h2></div><AppIcon name="info" /></div><dl><div><dt>Jenis akun</dt><dd>{{ formatAccountType(account.accountType) }}</dd></div><div v-if="account.bankId"><dt>Bank</dt><dd>{{ bankName }}</dd></div><div v-if="account.accountNumber"><dt>Nomor akun / rekening</dt><dd>{{ account.accountNumber }}</dd></div><div><dt>Mata uang</dt><dd>{{ account.currency }}</dd></div><div><dt>Dibuat pada</dt><dd>{{ formatDate(account.createdAt) }}</dd></div></dl></section></div>
<section class="account-detail-history" aria-labelledby="history-title"><header class="account-detail-history-heading"><div><span class="shell-overline">AKTIVITAS AKUN</span><h2 id="history-title">Riwayat transaksi.</h2><p>Catatan transaksi yang terhubung dengan akun ini.</p></div><div v-if="transactions.length && !transactionError" class="account-detail-export"><span>Ekspor halaman ini</span><button type="button" class="accounts-button" :disabled="isExporting" @click="exportAccountTransactions('excel')"><AppIcon name="download" />Excel</button><button type="button" class="accounts-button" :disabled="isExporting" @click="exportAccountTransactions('pdf')"><AppIcon name="file" />PDF</button></div></header>
<div v-if="isLoadingTransactions && !transactions.length" class="accounts-state" role="status"><span class="accounts-spinner" aria-hidden="true"></span><h3>Memuat transaksi...</h3></div><div v-else-if="transactionError" class="accounts-state is-error" role="alert"><AppIcon name="help" /><h3>Transaksi belum berhasil dimuat.</h3><p>{{ transactionError }}</p><button type="button" class="accounts-button" @click="retryTransactions">Coba lagi</button></div>
<template v-else-if="transactions.length"><div class="account-detail-table-wrap"><table class="account-detail-table"><thead><tr><th scope="col">Tanggal</th><th scope="col">Transaksi</th><th scope="col">Jenis</th><th scope="col">Jumlah</th></tr></thead><tbody><tr v-for="trx in transactions" :key="trx.id"><td>{{ formatDate(trx.transactionDate) }}</td><td><RouterLink :to="{ name: 'transaction-detail', params: { id: trx.id } }" class="account-detail-transaction"><strong>{{ trx.description || trx.category?.categoryName || 'Tanpa catatan' }}</strong><span>{{ trx.category?.categoryName || 'Tanpa kategori' }} <AppIcon v-if="trx.attachmentPath || trx.attachmentUrl" name="attachment" /></span></RouterLink></td><td><span class="account-detail-badge" :class="trx.transactionType.toLowerCase()">{{ formatTransactionType(trx) }}</span></td><td class="account-detail-amount" :class="getTransactionAmountClass(trx)">{{ getTransactionSign(trx) }}{{ formatCurrency(trx.amount, account.currency) }}</td></tr></tbody></table></div><div v-if="hasPrevPage || hasMorePages" class="account-detail-pagination"><button type="button" class="accounts-button" :disabled="isLoadingMore || !hasPrevPage" @click="loadPrevTransactions">Sebelumnya</button><span>Halaman {{ transactionMeta.page }} dari {{ transactionMeta.lastPage }}</span><button type="button" class="accounts-button" :disabled="isLoadingMore || !hasMorePages" @click="loadMoreTransactions">Berikutnya</button></div></template>
<div v-else class="accounts-state"><AppIcon name="transfer" /><h3>Belum ada transaksi.</h3><p>Transaksi yang terhubung dengan akun ini akan muncul di sini.</p><RouterLink :to="{ name: 'transaction-create' }" class="accounts-button">Catat transaksi</RouterLink></div></section></template></div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAccountStore } from '@/stores/accounts'
import { useBankStore } from '@/stores/banks'
import { useTransactionStore } from '@/stores/transactions'
import ExportService from '@/services/exportService'
import AppIcon from '@/components/common/AppIcon.vue'
import { useToastStore } from '@/stores/toast'
import '@/assets/accounts.css'
import '@/assets/account-detail.css'
import type { Account } from '@/types/accounts'
import { FrontendAccountType, FrontendTransactionType } from '@/types/enums'
import type { Transaction } from '@/types/transaction'

const route = useRoute()
const accountStore = useAccountStore()
const bankStore = useBankStore()
const transactionStore = useTransactionStore()
const toastStore = useToastStore()
const showBalance = ref((() => { try { return localStorage.getItem('show_balance') === 'true' } catch { return false } })())
watch(showBalance, (value) => { try { localStorage.setItem('show_balance', String(value)) } catch { /* Keep session preference. */ } })
const isExporting = ref(false)

const account = ref<Account | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const isLoadingMore = ref(false)

// Ambil data transaksi dari store
const transactions = computed(() => transactionStore.transactionList)
const isLoadingTransactions = computed(() => transactionStore.isLoadingTransactions)
const transactionError = computed(() => transactionStore.transactionError)
const transactionMeta = computed(() => transactionStore.transactionMeta)
const currentAccountId = computed(() => route.params.id as string)

const hasMorePages = computed(() => {
  return transactionMeta.value.page < transactionMeta.value.lastPage
})

const hasPrevPage = computed(() => {
  return transactionMeta.value.page > 1
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

const bankName = computed(() => {
  if (!account.value?.bankId) return '-'
  const bank = bankStore.allBanks.find((b) => b.id === account.value?.bankId)
  return bank ? bank.name : account.value?.bank?.name || 'Tidak tersedia'
})

// === Transaction Helpers ===
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
  if (trx.transactionType === FrontendTransactionType.INCOME) return 'is-incoming'
  if (trx.transactionType === FrontendTransactionType.EXPENSE) return 'is-outgoing'
  if (trx.transactionType === FrontendTransactionType.TRANSFER) {
    if (trx.destinationAccountId === currentAccountId.value) return 'is-incoming'
    return 'is-outgoing'
  }
  return ''
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

const loadPrevTransactions = async () => {
  if (isLoadingMore.value || !hasPrevPage.value) return

  isLoadingMore.value = true
  const prevPage = transactionMeta.value.page - 1
  try {
    await transactionStore.fetchTransactionsByAccount(currentAccountId.value, {
      page: prevPage,
      limit: 10,
    })
  } catch (err) {
    console.error(err)
  } finally {
    isLoadingMore.value = false
  }
}

const retryTransactions = () => transactionStore.fetchTransactionsByAccount(currentAccountId.value, { page: transactionMeta.value.page || 1, limit: 10 })

const exportAccountTransactions = async (format: 'excel' | 'pdf') => {
  if (transactions.value.length === 0 || !account.value || isExporting.value) return
  const title = `Laporan Transaksi Akun - ${account.value.accountName}`
  isExporting.value = true
  try {
    if (format === 'excel') await ExportService.exportTransactionsToExcel(transactions.value, title)
    else ExportService.exportTransactionsToPDF(transactions.value, title)
  } catch { toastStore.show('Ekspor belum berhasil. Silakan coba lagi.', 'error') }
  finally { isExporting.value = false }
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

