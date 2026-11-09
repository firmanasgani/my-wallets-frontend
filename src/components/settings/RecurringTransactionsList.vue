<template>
  <div class="settings-subpage">
    <header class="settings-subpage-heading"><div><button type="button" class="settings-back" @click="$emit('back')"><AppIcon name="arrow" />Pengaturan umum</button><span class="shell-overline">CATATAN YANG BERJALAN OTOMATIS</span><h2>Transaksi berulang.</h2><p>Kelola jadwal pemasukan, pengeluaran, dan transfer otomatis.</p></div><RouterLink :to="{ name: 'transaction-create' }" class="settings-button is-primary"><AppIcon name="plus" />Buat jadwal</RouterLink></header>
    <div class="settings-filter-row"><div class="settings-search"><label for="recurring-search">Cari jadwal</label><div><AppIcon name="search" /><input id="recurring-search" v-model="search" type="search" placeholder="Catatan, kategori, atau akun..." /></div></div><AppSelect id="recurring-type" v-model="type" :options="typeOptions" label="Jenis transaksi" /><button type="button" class="settings-button" :disabled="loading || deleting" @click="loadRows"><AppIcon name="refresh" />Muat ulang</button></div>
    <div v-if="loading" class="settings-state" role="status"><span class="settings-spinner" aria-hidden="true"></span><h3>Memuat jadwal transaksi...</h3></div>
    <div v-else-if="loadError" class="settings-state" role="alert"><AppIcon name="help" /><h3>Jadwal belum berhasil dimuat.</h3><p>{{ loadError }}</p><button type="button" class="settings-button" @click="loadRows">Coba lagi</button></div>
    <template v-else>
      <section class="settings-summary" aria-label="Ringkasan jadwal"><article class="is-lilac"><span>Total jadwal</span><strong>{{ rows.length }}</strong><p>Seluruh transaksi berulang</p></article><article class="is-mint"><span>Jadwal aktif</span><strong>{{ activeCount }}</strong><p>Belum ditandai tidak aktif</p></article></section>
      <div class="settings-result-heading"><h3>Daftar jadwal</h3><span class="settings-chip" role="status">{{ visibleRows.length }} dari {{ rows.length }} jadwal</span></div>
      <div v-if="!visibleRows.length" class="settings-state"><AppIcon :name="rows.length ? 'search' : 'calendar'" /><h3>{{ rows.length ? 'Belum ada yang cocok.' : 'Mulai dari transaksi rutinmu.' }}</h3><p>{{ rows.length ? 'Coba kata kunci atau jenis transaksi lainnya.' : 'Buka formulir transaksi baru dan aktifkan Jadikan transaksi berulang.' }}</p><button v-if="rows.length" type="button" class="settings-button" @click="search = ''; type = ''">Reset pencarian</button><RouterLink v-else :to="{ name: 'transaction-create' }" class="settings-button is-primary">Buat jadwal</RouterLink></div>
      <ul v-else class="settings-recurring-list"><li v-for="row in visibleRows" :key="row.id"><header><span class="settings-row-symbol" :class="`is-${row.transactionType.toLowerCase()}`"><AppIcon :name="row.transactionType === 'TRANSFER' ? 'transfer' : row.transactionType === 'INCOME' ? 'plus' : 'wallet'" /></span><div><div class="settings-recurring-labels"><span class="settings-type-chip" :class="`is-${row.transactionType.toLowerCase()}`">{{ recurringTypeLabel(row.transactionType) }}</span><span class="settings-chip" :class="row.status === 'INACTIVE' ? 'is-muted' : 'is-good'">{{ row.status === 'INACTIVE' ? 'Tidak aktif' : 'Aktif' }}</span></div><h3>{{ row.description || row.category?.categoryName || 'Transaksi berulang' }}</h3></div><button type="button" class="settings-icon-button is-danger" :aria-label="`Hapus jadwal ${row.description || recurringTypeLabel(row.transactionType)}`" title="Hapus jadwal" :disabled="deleting" @click="selected = row"><AppIcon name="trash" /></button></header><div class="settings-recurring-amount"><strong>{{ accountMoney(row.amount, 'IDR') }}</strong><span>{{ recurringIntervalLabel(row.interval) }}</span></div><dl class="settings-schedule-details"><div v-if="row.sourceAccount"><dt>Dari akun</dt><dd>{{ row.sourceAccount.accountName }}</dd></div><div v-if="row.destinationAccount"><dt>Ke akun</dt><dd>{{ row.destinationAccount.accountName }}</dd></div><div><dt>Mulai pada</dt><dd>{{ transactionDateLabel(row.startDate) }}</dd></div><div><dt>Jadwal berikutnya</dt><dd>{{ row.status === 'INACTIVE' ? 'Tidak dijadwalkan' : transactionDateLabel(row.nextRunDate) }}</dd></div><div><dt>Berakhir pada</dt><dd>{{ row.endDate ? transactionDateLabel(row.endDate) : 'Tanpa tanggal akhir' }}</dd></div><div v-if="row.category"><dt>Kategori</dt><dd>{{ row.category.categoryName }}</dd></div></dl></li></ul>
      <p class="settings-footer-note"><AppIcon name="info" />Menghapus jadwal menghentikan transaksi otomatis berikutnya. Transaksi yang sudah tercatat tetap tersimpan.</p>
    </template>
    <ConfirmationModal :is-open="!!selected" title="Hapus jadwal transaksi?" :message="`Hentikan jadwal ${selected?.description || 'transaksi berulang'} ${selected ? accountMoney(selected.amount, 'IDR') : ''}? Jadwal tidak dapat dikembalikan setelah dihapus. Transaksi yang sudah tercatat tetap tersimpan.`" confirmButtonText="Hapus jadwal" iconType="danger" :is-confirming="deleting" @update:is-open="!$event && (selected = null)" @confirm="deleteSchedule" />
  </div>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/common/AppIcon.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import { useTransactionStore } from '@/stores/transactions'
import { useToastStore } from '@/stores/toast'
import { accountMoney } from '@/utils/accountList'
import { transactionDateLabel } from '@/utils/transactionForm'
import { filterRecurring, recurringIntervalLabel, recurringTypeLabel } from '@/utils/settings'
import type { RecurringTransaction } from '@/types/transaction'
defineEmits<{ back: [] }>()
const store = useTransactionStore(), toast = useToastStore()
const rows = ref<RecurringTransaction[]>([]), loading = ref(true), loadError = ref(''), search = ref(''), type = ref('')
const selected = ref<RecurringTransaction | null>(null), deleting = ref(false)
const typeOptions = [{ value: '', label: 'Semua jenis' }, ...['INCOME', 'EXPENSE', 'TRANSFER'].map((value) => ({ value, label: recurringTypeLabel(value) }))]
const visibleRows = computed(() => filterRecurring(rows.value, search.value, type.value))
const activeCount = computed(() => rows.value.filter((row) => row.status !== 'INACTIVE').length)
let active = true, request = 0
const loadRows = async () => {
  const version = ++request
  loading.value = true; loadError.value = ''
  try { const data = await store.fetchRecurringTransactions(); if (!active || version !== request) return; if (data) rows.value = data; else loadError.value = store.transactionError || 'Silakan coba lagi.' }
  catch { if (active && version === request) loadError.value = 'Silakan coba lagi.' }
  finally { if (active && version === request) loading.value = false }
}
const deleteSchedule = async () => {
  if (!selected.value || deleting.value) return
  deleting.value = true
  const id = selected.value.id
  try { await store.deleteRecurringTransaction(id); if (active) { rows.value = rows.value.filter((row) => row.id !== id); selected.value = null; toast.show('Jadwal transaksi berhasil dihapus.') } }
  catch (failure: unknown) { toast.show(failure instanceof Error ? failure.message : 'Jadwal belum berhasil dihapus.', 'error') }
  finally { deleting.value = false }
}
onMounted(loadRows)
onBeforeUnmount(() => { active = false; request++ })
</script>
