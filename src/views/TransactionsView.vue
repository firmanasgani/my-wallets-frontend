<template>
  <div class="tx-history">
    <header class="tx-heading print:hidden">
      <div>
        <span class="shell-overline">CATATAN KEUANGANMU</span>
        <h1>Riwayat transaksi.</h1>
        <p>Telusuri setiap pemasukan, pengeluaran, dan perpindahan dana.</p>
      </div>
      <div class="tx-heading-actions">
        <div ref="exportDropdownRef" class="tx-export" @keydown.esc.stop="closeExport(true)">
          <button ref="exportTrigger" type="button" class="tx-button" :disabled="!canExport"
            :aria-expanded="isExportDropdownOpen" aria-controls="transaction-export-options"
            @click="isExportDropdownOpen = !isExportDropdownOpen">
            <AppIcon name="download" />{{ isExporting ? 'Mengekspor...' : 'Ekspor' }}<AppIcon name="down" />
          </button>
          <div v-if="isExportDropdownOpen" id="transaction-export-options" class="tx-export-options">
            <p>Ekspor halaman ini ({{ transactions.length }} transaksi)</p>
            <button type="button" @click="exportTransactions('excel')"><AppIcon name="file" />Excel (.xlsx)</button>
            <button type="button" @click="exportTransactions('pdf')"><AppIcon name="file" />PDF (.pdf)</button>
          </div>
        </div>
        <button type="button" class="tx-button" @click="isCalendarModalOpen = true"><AppIcon name="calendar" />Kalender</button>
        <button type="button" class="tx-button is-primary" @click="addTransaction"><AppIcon name="plus" />Catat transaksi</button>
      </div>
    </header>

    <aside v-if="authStore.currentUser?.subscriptionPlan === 'FREE'" class="tx-plan-note print:hidden">
      <AppIcon name="book" />
      <p><strong>Paket Dasar</strong> menampilkan riwayat 12 bulan terakhir.
        <RouterLink :to="{ name: 'settings', query: { upgrade: 'true' } }">Lihat paket Premium ↗</RouterLink>
      </p>
    </aside>

    <section class="tx-filter-panel print:hidden" aria-labelledby="filter-heading">
      <div class="tx-panel-heading">
        <div><h2 id="filter-heading">Temukan transaksi</h2><p>Cari catatan atau persempit berdasarkan periode dan akun.</p></div>
        <button type="button" class="tx-reset" @click="resetFilters">Reset ke hari ini</button>
      </div>
      <div class="tx-search">
        <AppIcon name="search" />
        <label for="filter-search" class="shell-sr-only">Cari transaksi</label>
        <input id="filter-search" v-model="localFilters.search" type="search"
          placeholder="Cari deskripsi, kategori, atau akun..." @input="handleSearchInput" @keydown.enter.prevent="applyCurrentFilters" />
      </div>
      <div class="tx-type-tabs" role="group" aria-label="Jenis transaksi">
        <button v-for="option in typeOptions" :key="option.value" type="button"
          :aria-pressed="(localFilters.type || '') === option.value"
          :class="{ 'is-active': (localFilters.type || '') === option.value }" @click="selectType(option.value)">
          <AppIcon :name="option.icon" />{{ option.label }}
        </button>
      </div>
      <div class="tx-filter-grid">
        <DateRangePicker class="tx-range-field" :start-date="localFilters.startDate" :end-date="localFilters.endDate" @apply="applyDateRange" />
        <div class="tx-field">
          <label for="filter-account">Akun keuangan</label>
          <AppSelect id="filter-account" v-model="localFilters.accountId" :options="accountOptions" aria-label="Akun keuangan" searchable
            :loading="accountStore.isLoading" @change="applyCurrentFilters" />
        </div>
        <div class="tx-field">
          <label for="filter-category">Kategori</label>
          <AppSelect id="filter-category" v-model="localFilters.categoryId" :options="categoryOptions" aria-label="Kategori" searchable
            :loading="categoryStore.isLoadingCategories" @change="applyCurrentFilters" />
        </div>
      </div>
      <p v-if="dateRangeError" id="date-range-error" class="tx-inline-error" role="alert">{{ dateRangeError }}</p>
      <p v-if="filterLoadError" class="tx-inline-error" role="alert">{{ filterLoadError }}
        <button type="button" class="tx-reset" @click="loadFilterOptions">Coba lagi</button>
      </p>
      <div class="tx-period-shortcuts">
        <span>Pilih periode kustom atau gunakan periode cepat di pemilih tanggal.</span>
        <span v-if="accountStore.isLoading || categoryStore.isLoadingCategories" role="status">Memuat pilihan filter...</span>
      </div>
    </section>

    <section aria-labelledby="summary-heading" class="print:hidden">
      <div class="tx-summary-heading"><h2 id="summary-heading">Ringkasan halaman ini</h2><span>Transfer tidak termasuk dalam selisih.</span></div>
      <dl class="tx-summary-grid">
        <div class="tx-summary-card is-income"><dt><AppIcon name="arrow" />Pemasukan</dt><dd>{{ isLoading ? '…' : currency(summary.income) }}</dd></div>
        <div class="tx-summary-card is-expense"><dt><AppIcon name="arrow" />Pengeluaran</dt><dd>{{ isLoading ? '…' : currency(summary.expense) }}</dd></div>
        <div class="tx-summary-card"><dt><AppIcon name="transfer" />Selisih</dt><dd>{{ isLoading ? '…' : currency(summary.net) }}</dd></div>
      </dl>
    </section>

    <section class="tx-results" aria-labelledby="results-heading" :aria-busy="isLoading">
      <div class="tx-results-heading">
        <div><h2 id="results-heading">Daftar transaksi <span v-if="!isLoading && !loadError && !invalidQueryRange" class="tx-result-count">{{ transactionStore.meta.total }}</span></h2>
          <p>{{ periodLabel }}</p>
        </div>
        <div class="tx-field tx-sort print:hidden">
          <label for="transaction-sort" class="shell-sr-only">Urutkan transaksi</label>
          <AppSelect id="transaction-sort" v-model="sortSelection" :options="sortOptions" aria-label="Urutkan transaksi" @change="changeSort" />
        </div>
      </div>
      <div v-if="isLoading" class="tx-state" role="status"><span class="tx-spinner" aria-hidden="true"></span><h3>Memuat transaksi...</h3><p>Sedang menyiapkan catatan keuanganmu.</p></div>
      <div v-else-if="invalidQueryRange || loadError" class="tx-state is-error" role="alert">
        <AppIcon name="help" /><h3>{{ invalidQueryRange ? 'Periksa rentang tanggal' : 'Transaksi belum berhasil dimuat' }}</h3>
        <p>{{ invalidQueryRange ? 'Tanggal awal harus sama atau lebih awal dari tanggal akhir.' : loadError }}</p>
        <button type="button" class="tx-button" @click="invalidQueryRange ? resetFilters() : retryTransactions()">{{ invalidQueryRange ? 'Reset ke hari ini' : 'Coba lagi' }}</button>
      </div>
      <div v-else-if="transactions.length === 0" class="tx-state">
        <AppIcon name="wallet" /><h3>Belum ada transaksi di sini.</h3>
        <p>Tidak ada catatan yang sesuai dengan periode dan filter ini. Ubah filter atau mulai catat transaksi baru.</p>
        <button type="button" class="tx-button is-primary" @click="addTransaction"><AppIcon name="plus" />Catat transaksi</button>
      </div>
      <template v-else>
        <div class="tx-column-headings" aria-hidden="true"><span>Tanggal</span><span>Transaksi</span><span>Akun</span><span>Jenis</span><span>Nominal</span><span></span></div>
        <ul class="tx-list"><TransactionHistoryRow v-for="transaction in transactions" :key="transaction.id" :transaction="transaction" :return-query="route.query" /></ul>
        <div class="tx-pagination print:hidden">
          <p aria-live="polite">{{ firstResult }}–{{ lastResult }} dari {{ transactionStore.meta.total }} transaksi</p>
          <nav aria-label="Halaman transaksi">
            <button type="button" class="tx-button" :disabled="!hasPreviousPage" @click="changePage(-1)">Sebelumnya</button>
            <span>Hal {{ transactionStore.meta.page }} / {{ transactionStore.meta.lastPage }}</span>
            <button type="button" class="tx-button" :disabled="!hasNextPage" @click="changePage(1)">Berikutnya</button>
          </nav>
        </div>
      </template>
    </section>
    <Teleport to="body"><CalendarViewModal :visible="isCalendarModalOpen" @close="isCalendarModalOpen = false" /></Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/common/AppIcon.vue'
import DateRangePicker from '@/components/common/DateRangePicker.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import type { SelectOption } from '@/types/select'
import TransactionHistoryRow from '@/components/transactions/TransactionHistoryRow.vue'
import CalendarViewModal from '@/components/transactions/CalendarViewModal.vue'
import { useTransactionStore } from '@/stores/transactions'
import { useAccountStore } from '@/stores/accounts'
import { useCategoryStore } from '@/stores/categories'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { FrontendTransactionType, type Category } from '@/types/enums'
import { historyQuery, historySummary, parseHistoryFilters } from '@/utils/transactionHistory'
import type { DateRange } from '@/utils/dateRange'
import '@/assets/transactions.css'

const route = useRoute()
const router = useRouter()
const transactionStore = useTransactionStore()
const accountStore = useAccountStore()
const categoryStore = useCategoryStore()
const authStore = useAuthStore()
const toastStore = useToastStore()
const localFilters = reactive(parseHistoryFilters(route.query))
const appliedFilters = computed(() => parseHistoryFilters(route.query))
const transactions = computed(() => transactionStore.transactionList)
const isLoading = computed(() => transactionStore.isLoadingTransactions)
const loadError = computed(() => transactionStore.transactionError)
const invalidQueryRange = computed(() => String(appliedFilters.value.startDate) > String(appliedFilters.value.endDate))
const dateRangeError = computed(() => localFilters.startDate && localFilters.endDate && localFilters.startDate > localFilters.endDate
  ? 'Tanggal awal harus sama atau lebih awal dari tanggal akhir.' : '')
const summary = computed(() => historySummary(invalidQueryRange.value || loadError.value ? [] : transactions.value))
const isCalendarModalOpen = ref(false)
const isExportDropdownOpen = ref(false)
const isExporting = ref(false)
const exportDropdownRef = ref<HTMLElement | null>(null)
const exportTrigger = ref<HTMLButtonElement | null>(null)
const filterLoadError = ref('')
const canExport = computed(() => !isLoading.value && !loadError.value && !invalidQueryRange.value && transactions.value.length > 0 && !isExporting.value)
const sortSelection = ref(`${localFilters.sortBy}:${localFilters.sortOrder}`)
const sortOptions: SelectOption<string>[] = [
  { value: 'transactionDate:desc', label: 'Terbaru dulu' }, { value: 'transactionDate:asc', label: 'Terlama dulu' },
  { value: 'amount:desc', label: 'Nominal terbesar' }, { value: 'amount:asc', label: 'Nominal terkecil' },
]
const accountOptions = computed<SelectOption<string | null | undefined>[]>(() => [
  { value: undefined, label: 'Semua akun' },
  ...accountStore.allAccounts.map((account) => ({ value: account.id, label: account.accountName })),
])
const firstResult = computed(() => (transactionStore.meta.page - 1) * transactionStore.meta.limit + 1)
const lastResult = computed(() => Math.min(transactionStore.meta.page * transactionStore.meta.limit, transactionStore.meta.total))
const hasPreviousPage = computed(() => !isLoading.value && transactionStore.meta.page > 1)
const hasNextPage = computed(() => !isLoading.value && transactionStore.meta.page < transactionStore.meta.lastPage)
const typeOptions = [
  { value: '', label: 'Semua transaksi', icon: 'grid' },
  { value: FrontendTransactionType.INCOME, label: 'Pemasukan', icon: 'plus' },
  { value: FrontendTransactionType.EXPENSE, label: 'Pengeluaran', icon: 'arrow' },
  { value: FrontendTransactionType.TRANSFER, label: 'Transfer', icon: 'transfer' },
]
const categoriesForFilter = computed(() => {
  const result: { id: string; label: string; categoryType: string }[] = []
  const flatten = (categories: Category[], prefix = '') => {
    for (const category of categories) {
      result.push({ id: category.id, label: prefix + category.categoryName, categoryType: category.categoryType })
      if (category.subCategories?.length) flatten(category.subCategories, prefix + '— ')
    }
  }
  flatten(categoryStore.allCategories)
  return result
})
const periodLabel = computed(() => {
  const label = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  const { startDate, endDate } = appliedFilters.value
  return startDate === endDate ? label(String(startDate)) : `${label(String(startDate))} – ${label(String(endDate))}`
})
const categoryOptions = computed<SelectOption<string | null | undefined>[]>(() => [
  { value: undefined, label: 'Semua kategori' },
  ...categoriesForFilter.value.map((category) => ({ value: category.id, label: category.label,
    group: category.categoryType === 'INCOME' ? 'Pemasukan' : 'Pengeluaran' })),
])
const currency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)

let searchTimer: ReturnType<typeof setTimeout> | undefined
const cancelSearch = () => { if (searchTimer) { clearTimeout(searchTimer); searchTimer = undefined } }
const retryTransactions = () => {
  if (!invalidQueryRange.value) return transactionStore.fetchTransactions(appliedFilters.value)
}
watch(() => route.query, (query) => {
  cancelSearch()
  const filters = parseHistoryFilters(query)
  Object.assign(localFilters, filters)
  sortSelection.value = `${filters.sortBy}:${filters.sortOrder}`
  isExportDropdownOpen.value = false
  if (!invalidQueryRange.value) transactionStore.fetchTransactions(filters)
}, { immediate: true })

const applyCurrentFilters = () => {
  cancelSearch()
  if (dateRangeError.value) return
  const filters = parseHistoryFilters(historyQuery({ ...localFilters, page: 1 }))
  Object.assign(localFilters, filters)
  router.push({ query: historyQuery(filters) })
}
const handleSearchInput = () => { cancelSearch(); searchTimer = setTimeout(applyCurrentFilters, 400) }
const selectType = (value: string) => { localFilters.type = (value || undefined) as FrontendTransactionType | undefined; applyCurrentFilters() }
const applyDateRange = (range: DateRange) => {
  Object.assign(localFilters, range)
  applyCurrentFilters()
}
const resetFilters = () => {
  cancelSearch()
  const filters = parseHistoryFilters({ limit: String(localFilters.limit || 10) })
  Object.assign(localFilters, filters)
  sortSelection.value = `${filters.sortBy}:${filters.sortOrder}`
  router.push({ query: historyQuery(filters) })
}
const changeSort = () => {
  const [sortBy, sortOrder] = sortSelection.value.split(':')
  localFilters.sortBy = sortBy
  localFilters.sortOrder = sortOrder as 'asc' | 'desc'
  applyCurrentFilters()
}
const changePage = (direction: -1 | 1) => {
  if (direction === -1 ? !hasPreviousPage.value : !hasNextPage.value) return
  cancelSearch()
  router.push({ query: historyQuery({ ...appliedFilters.value, page: transactionStore.meta.page + direction }) })
}
const addTransaction = () => { cancelSearch(); router.push({ name: 'transaction-create', query: route.query }) }
const closeExport = (restoreFocus = false) => { isExportDropdownOpen.value = false; if (restoreFocus) exportTrigger.value?.focus() }
const handleOutsideClick = (event: MouseEvent) => { if (!exportDropdownRef.value?.contains(event.target as Node)) closeExport() }
const exportTransactions = async (format: 'excel' | 'pdf') => {
  if (!canExport.value) return
  closeExport()
  isExporting.value = true
  // Snapshot the visible page before the asynchronous export module loads.
  const rows = [...transactions.value]
  const title = `Transaksi ${periodLabel.value} — halaman ${transactionStore.meta.page}`
  try {
    const { default: ExportService } = await import('@/services/exportService')
    if (format === 'excel') await ExportService.exportTransactionsToExcel(rows, title)
    else ExportService.exportTransactionsToPDF(rows, title)
  } catch {
    toastStore.show('Ekspor belum berhasil. Silakan coba lagi.', 'error')
  } finally { isExporting.value = false }
}
const loadFilterOptions = async () => {
  filterLoadError.value = ''
  const results = await Promise.allSettled([
    accountStore.accounts.length ? Promise.resolve() : accountStore.fetchAccounts(),
    categoryStore.categories.length ? Promise.resolve() : categoryStore.fetchCategories({ hierarchical: 'true' }),
  ])
  if (results.some((result) => result.status === 'rejected') || accountStore.error || categoryStore.error)
    filterLoadError.value = 'Sebagian pilihan filter belum berhasil dimuat.'
}
onMounted(() => { document.addEventListener('click', handleOutsideClick); loadFilterOptions() })
onUnmounted(() => { cancelSearch(); document.removeEventListener('click', handleOutsideClick) })
</script>
