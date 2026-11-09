<template>
  <div class="money-accounts">
    <header class="accounts-heading print:hidden">
      <div><span class="shell-overline">TEMPAT UANGMU TERSIMPAN</span><h1 ref="pageHeading" tabindex="-1">Daftar akun.</h1><p>Satu tempat untuk rekening, dompet digital, uang tunai, dan kartu kreditmu.</p></div>
      <div class="accounts-actions">
        <button type="button" class="accounts-icon-button" :aria-label="showBalance ? 'Sembunyikan saldo' : 'Tampilkan saldo'"
          :title="showBalance ? 'Sembunyikan saldo' : 'Tampilkan saldo'" :aria-pressed="!showBalance" @click="showBalance = !showBalance">
          <AppIcon :name="showBalance ? 'eyeOff' : 'eye'" />
        </button>
        <div ref="exportDropdownRef" class="accounts-export" @keydown.esc.stop="closeExport(true)">
          <button ref="exportTrigger" type="button" class="accounts-button" :disabled="!canExport"
            :aria-expanded="isExportOpen" aria-controls="account-export-options" @click="isExportOpen = !isExportOpen">
            <AppIcon name="download" />{{ isExporting ? 'Mengekspor...' : 'Ekspor' }}
          </button>
          <div v-if="isExportOpen" id="account-export-options" class="accounts-export-options">
            <p>Ekspor {{ filteredAccounts.length }} akun sesuai filter.<span>File menyertakan saldo asli.</span></p>
            <button type="button" @click="exportAccounts('excel')"><AppIcon name="file" />Excel (.xlsx)</button>
            <button type="button" @click="exportAccounts('pdf')"><AppIcon name="file" />PDF (.pdf)</button>
          </div>
        </div>
        <RouterLink v-if="canAddAccount && !isLoading && !loadError" :to="{ name: 'account-create' }" class="accounts-button is-primary"><AppIcon name="plus" />Tambah akun</RouterLink>
        <button v-else type="button" class="accounts-button is-primary" disabled :title="!canAddAccount ? 'Batas 4 akun paket Dasar tercapai' : 'Tunggu sampai data akun berhasil dimuat'">
          <AppIcon :name="!canAddAccount ? 'lock' : 'plus'" />{{ !canAddAccount ? 'Batas akun tercapai' : 'Tambah akun' }}
        </button>
      </div>
    </header>

    <div v-if="!isLoading && !loadError" class="accounts-overview">
      <section class="accounts-balance-panel" aria-labelledby="balance-heading">
        <div class="accounts-panel-label"><AppIcon name="wallet" /><h2 id="balance-heading">Saldo tercatat di seluruh akun</h2></div>
        <dl v-if="balanceTotals.length" class="accounts-balance-totals">
          <div v-for="total in balanceTotals" :key="total.currency"><dt>{{ total.currency }} <span>· {{ total.count }} akun</span></dt><dd>{{ showBalance ? accountMoney(total.balance, total.currency) : '••••••••' }}</dd></div>
        </dl>
        <p v-else class="accounts-first-balance">Catatan keuanganmu dimulai dari akun pertama.</p>
        <p class="accounts-balance-note">{{ balanceTotals.length > 1 ? 'Saldo setiap mata uang ditampilkan terpisah tanpa konversi.' : 'Saldo mencakup semua jenis akun, termasuk kartu kredit.' }}</p>
      </section>
      <aside class="accounts-plan-panel">
        <span class="shell-overline">{{ isFreePlan ? 'PAKET DASAR' : 'RUANG UNTUK BERTUMBUH' }}</span>
        <template v-if="isFreePlan"><h2>{{ allAccounts.length }} <span>/ 4 akun</span></h2>
          <div class="accounts-usage-bar" aria-hidden="true"><span :style="{ width: `${Math.min(allAccounts.length / 4, 1) * 100}%` }"></span></div>
          <p>{{ canAddAccount ? 'Tambahkan akun sesuai kebutuhan pencatatanmu.' : 'Batas akun tercapai. Paket Premium memberi ruang untuk lebih banyak akun.' }}</p>
          <RouterLink :to="{ name: 'settings', query: { upgrade: 'true' } }" class="print:hidden">Jelajahi Premium <span aria-hidden="true">↗</span></RouterLink>
        </template>
        <template v-else><h2>{{ allAccounts.length }} <span>akun keuangan</span></h2><p>Pisahkan rekening dan dompet agar setiap catatan punya tempat.</p><RouterLink :to="{ name: 'account-create' }" class="print:hidden">Tambah akun baru <span aria-hidden="true">↗</span></RouterLink></template>
      </aside>
    </div>

    <section v-if="!isLoading && !loadError && allAccounts.length" class="accounts-browser" aria-labelledby="account-list-heading">
      <div class="accounts-list-heading"><div><h2 id="account-list-heading">Akun keuanganmu</h2><p>{{ filteredAccounts.length }} dari {{ allAccounts.length }} akun ditampilkan.</p></div><button v-if="hasFilters" type="button" class="accounts-reset print:hidden" @click="resetFilters">Reset filter</button></div>
      <div class="accounts-type-filters print:hidden" role="group" aria-label="Filter jenis akun">
        <button type="button" :aria-pressed="activeType === null" :class="{ 'is-active': activeType === null }" @click="activeType = null"><AppIcon name="grid" /><span>Semua akun</span><strong>{{ allAccounts.length }}</strong></button>
        <button v-for="type in accountTypes" :key="type.value" type="button" :aria-pressed="activeType === type.value" :class="{ 'is-active': activeType === type.value }" @click="activeType = activeType === type.value ? null : type.value">
          <AppIcon :name="type.icon" /><span>{{ type.label }}</span><strong>{{ allAccounts.filter((account) => account.accountType === type.value).length }}</strong>
        </button>
      </div>
      <div class="accounts-toolbar print:hidden">
        <div class="accounts-search"><AppIcon name="search" /><label for="account-search" class="shell-sr-only">Cari akun</label><input id="account-search" v-model="search" type="search" placeholder="Cari nama akun, bank, atau nomor akun..." /></div>
        <AppSelect v-if="currencyOptions.length > 2" id="account-currency" v-model="currency" :options="currencyOptions" aria-label="Filter mata uang" />
        <AppSelect id="account-sort" v-model="sort" :options="sortOptions" aria-label="Urutkan akun" />
      </div>
      <div v-if="filteredAccounts.length" class="accounts-card-grid">
        <article v-for="account in filteredAccounts" :key="account.id" class="account-card" :class="`is-${account.accountType.toLowerCase()}`">
          <RouterLink :to="{ name: 'account-detail', params: { id: account.id } }" class="account-card-main" :aria-label="`Lihat detail akun ${account.accountName}`">
            <div class="account-card-top"><span class="account-card-icon"><AppIcon :name="accountTypeInfo(account.accountType).icon" /></span><span class="account-type-badge">{{ accountTypeInfo(account.accountType).label }}</span></div>
            <h3>{{ account.accountName }}</h3><p class="account-provider">{{ account.bank?.name || accountTypeInfo(account.accountType).label }}</p>
            <div class="account-card-balance"><span>Saldo saat ini · {{ accountCurrency(account) }}</span><strong :class="{ 'is-negative': showBalance && Number(account.currentBalance) < 0 }">{{ showBalance ? accountMoney(account.currentBalance, accountCurrency(account)) : '••••••••' }}</strong></div>
            <div class="account-card-number"><span>{{ account.accountNumber ? `•••• ${account.accountNumber.slice(-4)}` : 'Tanpa nomor akun' }}</span><AppIcon name="arrow" /></div>
          </RouterLink>
          <footer class="account-card-footer print:hidden">
            <RouterLink :to="{ name: 'account-detail', params: { id: account.id } }">Detail &amp; transaksi</RouterLink>
            <div><RouterLink :to="{ name: 'account-edit', params: { id: account.id } }" class="accounts-icon-button" :aria-label="`Edit akun ${account.accountName}`" title="Edit akun"><AppIcon name="edit" /></RouterLink>
              <button type="button" class="accounts-icon-button is-danger" :disabled="isDeletingAccount" :aria-label="`Hapus akun ${account.accountName}`" title="Hapus akun" @click="promptDelete(account, $event)"><AppIcon name="trash" /></button></div>
          </footer>
        </article>
      </div>
      <div v-else class="accounts-state"><AppIcon name="search" /><h3>Akun yang dicari belum ditemukan.</h3><p>Coba kata kunci lain atau ubah jenis akun dan mata uang.</p><button type="button" class="accounts-button" @click="resetFilters">Tampilkan semua akun</button></div>
    </section>

    <div v-if="isLoading" class="accounts-state" role="status"><span class="accounts-spinner" aria-hidden="true"></span><h2>Memuat akun keuanganmu...</h2><p>Sedang menyiapkan saldo dan daftar akun.</p></div>
    <div v-else-if="loadError" class="accounts-state is-error" role="alert"><AppIcon name="help" /><h2>Daftar akun belum berhasil dimuat.</h2><p>{{ loadError }}</p><button type="button" class="accounts-button" @click="loadAccounts">Coba lagi</button></div>
    <div v-else-if="!allAccounts.length" class="accounts-state"><AppIcon name="wallet" /><h2>Mulai dari akun pertamamu.</h2><p>Tambahkan rekening bank, dompet digital, uang tunai, atau kartu kredit untuk mulai mencatat transaksi.</p><RouterLink :to="{ name: 'account-create' }" class="accounts-button is-primary"><AppIcon name="plus" />Tambah akun pertama</RouterLink></div>

    <Teleport to="body">
      <ConfirmationModal v-model:isOpen="isDeleteModalOpen" title="Hapus akun?"
        :message="`Hapus akun '${accountToDelete?.accountName || ''}'? Tindakan ini tidak dapat dibatalkan dan dapat memengaruhi transaksi terkait.`"
        confirmButtonText="Hapus akun" confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500" iconType="danger"
        :isConfirming="isDeletingAccount" @confirm="confirmDelete" @cancel="closeDelete" />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/common/AppIcon.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import { useAccountStore } from '@/stores/accounts'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import type { Account } from '@/types/accounts'
import type { SelectOption } from '@/types/select'
import type { FrontendAccountType } from '@/types/enums'
import { accountBalanceTotals, accountCurrency, accountMoney, accountTypes, canCreateAccount, filterAccountList, type AccountSort } from '@/utils/accountList'
import '@/assets/accounts.css'

const accountStore = useAccountStore()
const authStore = useAuthStore()
const toastStore = useToastStore()
const allAccounts = computed(() => accountStore.accounts)
const isDeletingAccount = ref(false)
const loadError = ref('')
const pageHeading = ref<HTMLElement | null>(null)
const isLoading = computed(() => accountStore.isLoading && !isDeletingAccount.value)
const isFreePlan = computed(() => authStore.currentUser?.subscriptionPlan === 'FREE')
const canAddAccount = computed(() => canCreateAccount(authStore.currentUser?.subscriptionPlan, allAccounts.value.length))
const balanceTotals = computed(() => accountBalanceTotals(allAccounts.value))
const readBalancePreference = () => { try { return localStorage.getItem('show_balance') === 'true' } catch { return false } }
const showBalance = ref(readBalancePreference())
watch(showBalance, (visible) => { try { localStorage.setItem('show_balance', String(visible)) } catch { /* Keep session preference. */ } })
const search = ref('')
const activeType = ref<FrontendAccountType | null>(null)
const currency = ref('')
const sort = ref<AccountSort>('name')
const sortOptions: SelectOption<AccountSort>[] = [{ value: 'name', label: 'Nama A–Z' }, { value: 'newest', label: 'Terbaru ditambahkan' }, { value: 'oldest', label: 'Terlama ditambahkan' }]
const currencyOptions = computed<SelectOption<string>[]>(() => [{ value: '', label: 'Semua mata uang' }, ...balanceTotals.value.map(({ currency }) => ({ value: currency, label: currency }))])
const filteredAccounts = computed(() => filterAccountList(allAccounts.value, search.value, activeType.value, currency.value, sort.value))
const hasFilters = computed(() => !!search.value || !!activeType.value || !!currency.value)
const resetFilters = () => { search.value = ''; activeType.value = null; currency.value = '' }
const accountTypeInfo = (type: FrontendAccountType) => accountTypes.find((item) => item.value === type) || { label: 'Akun', icon: 'wallet' }
watch(currencyOptions, (options) => { if (currency.value && !options.some((option) => option.value === currency.value)) currency.value = '' })

const isExportOpen = ref(false)
const isExporting = ref(false)
const exportDropdownRef = ref<HTMLElement | null>(null)
const exportTrigger = ref<HTMLButtonElement | null>(null)
const canExport = computed(() => !isLoading.value && !loadError.value && !isExporting.value && !isDeletingAccount.value && filteredAccounts.value.length > 0)
const closeExport = (restoreFocus = false) => { isExportOpen.value = false; if (restoreFocus) exportTrigger.value?.focus() }
const outsideClick = (event: MouseEvent) => { if (!exportDropdownRef.value?.contains(event.target as Node)) closeExport() }
const exportAccounts = async (format: 'excel' | 'pdf') => {
  if (!canExport.value) return
  const rows = [...filteredAccounts.value]
  closeExport(true)
  isExporting.value = true
  try {
    const { default: ExportService } = await import('@/services/exportService')
    if (format === 'excel') await ExportService.exportAccountsToExcel(rows, 'Daftar akun keuangan')
    else ExportService.exportAccountsToPDF(rows, 'Daftar akun keuangan')
  } catch { toastStore.show('Ekspor belum berhasil. Silakan coba lagi.', 'error') }
  finally { isExporting.value = false }
}

const isDeleteModalOpen = ref(false)
const accountToDelete = ref<Account | null>(null)
let deleteTrigger: HTMLElement | null = null
const promptDelete = (account: Account, event: MouseEvent) => {
  accountToDelete.value = account
  deleteTrigger = event.currentTarget as HTMLElement
  closeExport()
  isDeleteModalOpen.value = true
}
const closeDelete = async () => {
  if (isDeletingAccount.value) return
  isDeleteModalOpen.value = false
  accountToDelete.value = null
  await nextTick()
  if (deleteTrigger?.isConnected) deleteTrigger.focus()
  else pageHeading.value?.focus()
}
const confirmDelete = async () => {
  if (!accountToDelete.value || isDeletingAccount.value) return
  isDeletingAccount.value = true
  try {
    await accountStore.deleteAccount(accountToDelete.value.id)
    toastStore.show('Akun berhasil dihapus.')
  } catch { toastStore.show(accountStore.error || 'Akun belum berhasil dihapus.', 'error') }
  finally { isDeletingAccount.value = false; closeDelete() }
}
const loadAccounts = async () => {
  loadError.value = ''
  try { await accountStore.fetchAccounts(); loadError.value = accountStore.error || '' }
  catch { loadError.value = 'Data akun belum berhasil dimuat.' }
}
onMounted(() => { document.addEventListener('click', outsideClick); loadAccounts() })
onUnmounted(() => document.removeEventListener('click', outsideClick))
</script>
