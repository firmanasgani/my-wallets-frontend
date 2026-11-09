<template>
  <div class="money-budgets">
    <BudgetPageHeader title="Beri arah pada uangmu." subtitle="Susun batas pengeluaran dan target pemasukan, satu kategori setiap bulan." active="setup" :query="periodQuery">
      <RouterLink :to="{ name: 'budget-create', query: periodQuery }" class="budget-button is-primary"><AppIcon name="plus" />Buat anggaran</RouterLink>
    </BudgetPageHeader>
    <section class="budget-toolbar" aria-label="Filter anggaran">
      <BudgetPeriodPicker id="setup-period" v-model:year="year" v-model:month="month" :disabled="deleting" />
      <AppSelect id="budget-type" v-model="type" :options="typeOptions" label="Jenis kategori" :disabled="deleting" />
      <div class="budget-search"><label for="budget-search">Cari anggaran</label><div><AppIcon name="search" /><input id="budget-search" v-model="search" type="search" placeholder="Kategori atau catatan..." /></div></div>
    </section>
    <div v-if="loading" class="budget-state" role="status"><span class="budget-spinner" aria-hidden="true"></span><h2>Memuat anggaran...</h2><p>{{ periodLabel }}</p></div>
    <div v-else-if="loadError" class="budget-state" role="alert"><AppIcon name="help" /><h2>Anggaran belum berhasil dimuat.</h2><p>{{ loadError }}</p><button class="budget-button" type="button" @click="fetchData">Coba lagi</button></div>
    <template v-else>
      <section class="budget-summary" aria-label="Ringkasan periode">
        <article class="budget-summary-card is-lilac"><span><AppIcon name="calendar" />{{ periodLabel }}</span><strong>{{ rows.length }} kategori</strong><p>Rencana keuangan bulan ini</p></article>
        <article class="budget-summary-card is-sun"><span><AppIcon name="wallet" />Batas pengeluaran</span><strong>{{ accountMoney(expenseTotal, 'IDR') }}</strong><p>{{ expenseCount }} kategori pengeluaran</p></article>
        <article class="budget-summary-card is-mint"><span><AppIcon name="target" />Target pemasukan</span><strong>{{ accountMoney(incomeTotal, 'IDR') }}</strong><p>{{ incomeCount }} kategori pemasukan</p></article>
      </section>
      <section class="budget-list-panel" aria-labelledby="budget-list-heading">
        <header class="budget-panel-heading"><div><span class="shell-overline">RENCANA BULANAN</span><h2 id="budget-list-heading">Daftar anggaran</h2></div><span class="budget-count" role="status">{{ visibleRows.length }} dari {{ rows.length }} kategori</span></header>
        <div v-if="!visibleRows.length" class="budget-empty"><AppIcon :name="rows.length ? 'search' : 'target'" /><h3>{{ rows.length ? 'Belum ada yang cocok.' : 'Mulai dari satu kategori.' }}</h3><p>{{ rows.length ? 'Coba kata kunci atau jenis kategori lainnya.' : `Belum ada anggaran untuk ${periodLabel}. Tentukan rencana pertamamu.` }}</p><button v-if="rows.length" type="button" class="budget-button" @click="search = ''; type = ''">Reset pencarian</button><RouterLink v-else :to="{ name: 'budget-create', query: periodQuery }" class="budget-button is-primary"><AppIcon name="plus" />Buat anggaran</RouterLink></div>
        <ul v-else class="budget-list">
          <li v-for="budget in visibleRows" :key="budget.id" class="budget-row">
            <div class="budget-category"><CategoryBadge :color="budget.category?.color" :icon="budget.category?.icon" /><div><h3>{{ budget.category?.categoryName || 'Kategori tidak tersedia' }}</h3><span class="budget-kind" :class="budget.category?.categoryType === 'INCOME' ? 'is-income' : 'is-expense'">{{ budget.category?.categoryType === 'INCOME' ? 'Target pemasukan' : 'Batas pengeluaran' }}</span></div></div>
            <p class="budget-row-note">{{ budget.description || 'Tanpa catatan' }}</p>
            <strong class="budget-row-amount">{{ accountMoney(budget.amount, 'IDR') }}</strong>
            <div class="budget-row-actions"><RouterLink :to="{ name: 'budget-edit', params: { id: budget.id }, query: periodQuery }" class="budget-icon-button" :aria-label="`Edit anggaran ${budget.category?.categoryName || ''}`" title="Edit anggaran"><AppIcon name="edit" /></RouterLink><button type="button" class="budget-icon-button is-danger" :disabled="deleting" :aria-label="`Hapus anggaran ${budget.category?.categoryName || ''}`" title="Hapus anggaran" @click="confirmDelete(budget)"><AppIcon name="trash" /></button></div>
          </li>
        </ul>
        <footer v-if="rows.length" class="budget-list-footer"><AppIcon name="info" /><p>Bandingkan rencana dengan transaksi bulan ini melalui laporan realisasi.</p><RouterLink :to="{ name: 'budget-report', query: periodQuery }">Lihat realisasi <AppIcon name="arrow" /></RouterLink></footer>
      </section>
    </template>
    <ConfirmationModal v-model:isOpen="showDelete" title="Hapus anggaran?" :message="`Hapus anggaran ${selectedBudget?.category?.categoryName || 'ini'} untuk ${selectedBudget ? budgetPeriodLabel(selectedBudget.year, selectedBudget.month) : periodLabel}? Transaksi dan saldo akun tetap tersimpan. Anggaran yang dihapus tidak dapat dikembalikan.`" confirmButtonText="Hapus anggaran" iconType="danger" :isConfirming="deleting" @confirm="handleDelete" />
  </div>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import BudgetPageHeader from '@/components/budgets/BudgetPageHeader.vue'
import BudgetPeriodPicker from '@/components/budgets/BudgetPeriodPicker.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import CategoryBadge from '@/components/categories/CategoryBadge.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import { useBudgetStore } from '@/stores/budget'
import { useToastStore } from '@/stores/toast'
import { useBudgetPeriod } from '@/composables/useBudgetPeriod'
import { accountMoney } from '@/utils/accountList'
import { budgetNumber, budgetPeriodLabel, filterBudgets } from '@/utils/budget'
import type { Budget } from '@/types/budget'
import '@/assets/categories.css'
import '@/assets/budgets.css'

const store = useBudgetStore(), toast = useToastStore()
const { year, month, periodLabel, periodQuery } = useBudgetPeriod()
const search = ref(''), type = ref('')
const typeOptions = [{ value: '', label: 'Semua jenis' }, { value: 'EXPENSE', label: 'Pengeluaran' }, { value: 'INCOME', label: 'Pemasukan' }]
const rows = ref<Budget[]>([]), loading = ref(true), loadError = ref('')
const visibleRows = computed(() => filterBudgets(rows.value, search.value, type.value))
const expenseRows = computed(() => rows.value.filter((row) => row.category?.categoryType === 'EXPENSE'))
const incomeRows = computed(() => rows.value.filter((row) => row.category?.categoryType === 'INCOME'))
const expenseTotal = computed(() => expenseRows.value.reduce((sum, row) => sum + budgetNumber(row.amount), 0))
const incomeTotal = computed(() => incomeRows.value.reduce((sum, row) => sum + budgetNumber(row.amount), 0))
const expenseCount = computed(() => expenseRows.value.length), incomeCount = computed(() => incomeRows.value.length)
let request = 0, active = true
const fetchData = async () => {
  const version = ++request
  loading.value = true; loadError.value = ''
  try {
    const data = await store.fetchBudgets({ year: year.value, month: month.value })
    if (!active || version !== request) return
    if (data === null || data === undefined) loadError.value = store.budgetError || 'Silakan coba lagi.'
    else rows.value = data
  } catch { if (active && version === request) loadError.value = 'Silakan coba lagi.' }
  finally { if (active && version === request) loading.value = false }
}
const showDelete = ref(false), deleting = ref(false), selectedBudget = ref<Budget | null>(null)
const confirmDelete = (budget: Budget) => { if (!deleting.value) { selectedBudget.value = budget; showDelete.value = true } }
const handleDelete = async () => {
  if (!selectedBudget.value || deleting.value) return
  deleting.value = true
  try { await store.deleteBudget(selectedBudget.value.id); toast.show('Anggaran berhasil dihapus.'); showDelete.value = false; await fetchData() }
  catch { toast.show(store.budgetError || 'Anggaran belum berhasil dihapus.', 'error') }
  finally { deleting.value = false }
}
watch([year, month], fetchData, { immediate: true })
onBeforeUnmount(() => { active = false; request++ })
</script>
