<template>
  <div class="accounts-page">
    <header class="accounts-heading"><div><span class="shell-overline">PENGATURAN PEMBUKUAN</span><h1>Bagan akun</h1><p>Kelola daftar akun yang digunakan untuk mencatat transaksi bisnis.</p></div><button v-if="isAdmin" type="button" class="add-button" @click="openCreateModal"><span aria-hidden="true">+</span> Tambah akun</button></header>
    <section class="accounts-overview"><div><span class="overview-label">BAGAN AKUN</span><h2>Struktur pembukuan</h2><p>Temukan akun berdasarkan kode atau nama, lalu buka kelompoknya untuk melihat rincian.</p></div><div class="overview-count"><strong>{{ totalAccounts }}</strong><span>akun terdaftar</span></div><div class="overview-count"><strong>{{ Object.keys(businessStore.chartOfAccounts).length }}</strong><span>kelompok akun</span></div></section>
    <section class="accounts-toolbar"><div><span class="section-label">DAFTAR AKUN</span><h2>Semua akun</h2><p>Saldo awal dan tipe akun tersusun menurut kelompok.</p></div><div class="search-field"><label for="account-search">Cari akun</label><input id="account-search" v-model.trim="search" type="search" placeholder="Cari nama atau kode akun" /></div></section>
    <!-- Error -->
    <div v-if="errorMsg" class="mb-6 rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800">
      <p class="text-sm font-medium text-red-800 dark:text-red-300">{{ errorMsg }}</p>
    </div>

    <!-- Loading -->
    <div v-if="businessStore.isLoading && Object.keys(businessStore.chartOfAccounts).length === 0" class="flex justify-center p-12">
      <LoadingSpinner :visible="true" />
    </div>

    <!-- Table -->
    <div v-else-if="search && Object.keys(filteredAccounts).length === 0" class="search-empty">Tidak ada akun yang cocok dengan pencarian.</div>
    <COATable
      v-else
      :accounts="filteredAccounts"
      :is-admin="isAdmin"
      @edit="openEditModal"
      @delete="openDeleteConfirm"
    />

    <!-- COA Form Modal -->
    <COAFormModal
      :is-open="isModalOpen"
      :account="selectedAccount"
      @close="isModalOpen = false"
      @saved="onSaved"
    />

    <!-- Delete Confirmation -->
    <ConfirmationModal
      :is-open="isDeleteModalOpen"
      title="Hapus COA"
      :message="`Apakah Anda yakin ingin menghapus akun '${selectedAccount?.name}'? Tindakan ini tidak dapat dibatalkan.`"
      confirm-button-text="Ya, Hapus"
      confirm-button-class="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      :is-confirming="isDeleting"
      @update:is-open="isDeleteModalOpen = $event"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBusinessStore } from '@/stores/business'
import COATable from '@/components/business/COATable.vue'
import COAFormModal from '@/components/business/COAFormModal.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { ChartOfAccount } from '@/types/business'

const businessStore = useBusinessStore()

const search = ref('')
const totalAccounts = computed(() => Object.values(businessStore.chartOfAccounts).reduce((total, accounts) => total + accounts.length, 0))
const filteredAccounts = computed(() => {
  const query = search.value.toLocaleLowerCase()
  if (!query) return businessStore.chartOfAccounts
  return Object.fromEntries(Object.entries(businessStore.chartOfAccounts).map(([type, accounts]) => [type, accounts.filter(account => account.name.toLocaleLowerCase().includes(query) || account.code.toLocaleLowerCase().includes(query))]).filter(([, accounts]) => (accounts as ChartOfAccount[]).length > 0))
})
const errorMsg = ref('')
const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)
const selectedAccount = ref<ChartOfAccount | null>(null)

const isAdmin = computed(() => {
  const role = businessStore.myRole
  return role === 'ADMIN' || role === 'OWNER'
})

onMounted(async () => {
  try {
    await businessStore.fetchChartOfAccounts()
  } catch {
    errorMsg.value = 'Gagal memuat Chart of Accounts.'
  }
})

const openCreateModal = () => {
  selectedAccount.value = null
  isModalOpen.value = true
}

const openEditModal = (account: ChartOfAccount) => {
  selectedAccount.value = account
  isModalOpen.value = true
}

const openDeleteConfirm = (account: ChartOfAccount) => {
  selectedAccount.value = account
  isDeleteModalOpen.value = true
}

const onSaved = () => {
  errorMsg.value = ''
}

const handleDelete = async () => {
  if (!selectedAccount.value) return
  isDeleting.value = true
  try {
    await businessStore.deleteChartOfAccount(selectedAccount.value.id)
    isDeleteModalOpen.value = false
    selectedAccount.value = null
  } catch (err: any) {
    const msg = err.response?.data?.message
    errorMsg.value = msg || 'Gagal menghapus COA.'
    isDeleteModalOpen.value = false
  } finally {
    isDeleting.value = false
  }
}
</script>

<style scoped>
.accounts-page { --ink:var(--shell-ink,#27231d); --muted:var(--shell-muted,#6c6256); --surface:var(--shell-surface,#fffcf5); --rule:var(--shell-rule,#e2d8c7); max-width:1280px; margin:auto; padding:clamp(20px,3vw,40px) clamp(16px,3vw,32px); color:var(--ink); }.accounts-heading { display:flex; justify-content:space-between; align-items:end; gap:20px; margin-bottom:28px; }.accounts-heading h1 { font-size:clamp(34px,4vw,52px); line-height:1; letter-spacing:-.055em; font-weight:900; margin:9px 0; }.accounts-heading p,.accounts-toolbar p { color:var(--muted); font-size:14px; }.add-button { background:var(--shell-grape,#5026a5); color:white; padding:11px 18px; border-radius:999px; font-weight:750; white-space:nowrap; }.add-button span { font-size:20px; vertical-align:middle; margin-right:4px; }.accounts-overview { display:flex; align-items:center; gap:36px; padding:30px 32px; border-radius:24px; background:radial-gradient(circle at 100% 0%,#7756ad,transparent 55%),#3d2c60; color:white; }.accounts-overview > div:first-child { flex:1; }.overview-label,.section-label { font-size:10px; letter-spacing:.13em; font-weight:800; }.overview-label { color:#d7c9ef; }.accounts-overview h2 { font-size:25px; font-weight:850; letter-spacing:-.04em; margin:7px 0; }.accounts-overview p { color:#e0d5ef; font-size:13px; max-width:460px; }.overview-count { display:flex; flex-direction:column; min-width:105px; border-left:1px solid #ffffff44; padding-left:24px; }.overview-count strong { font-size:32px; line-height:1; }.overview-count span { color:#e0d5ef; font-size:12px; margin-top:8px; }.accounts-toolbar { display:flex; justify-content:space-between; align-items:end; gap:20px; margin:32px 0 16px; }.section-label { color:var(--muted); }.accounts-toolbar h2 { font-size:26px; font-weight:850; letter-spacing:-.04em; margin:4px 0; }.search-field { display:flex; flex-direction:column; gap:5px; min-width:260px; }.search-field label { font-size:12px; font-weight:700; color:var(--muted); }.search-field input { background:var(--surface); border:1px solid var(--rule); border-radius:12px; padding:10px 14px; color:var(--ink); }.search-empty { padding:40px; background:var(--surface); border:1px solid var(--rule); border-radius:20px; text-align:center; color:var(--muted); }.accounts-page :deep(button:focus-visible),.accounts-page input:focus-visible { outline:3px solid #9a78d5; outline-offset:3px; } @media(max-width:700px) { .accounts-heading,.accounts-toolbar { align-items:start; flex-direction:column; }.accounts-overview { flex-wrap:wrap; padding:24px; gap:20px; }.accounts-overview > div:first-child { flex-basis:100%; }.overview-count:first-of-type { border:0; padding:0; }.search-field { width:100%; min-width:0; } }
</style>
