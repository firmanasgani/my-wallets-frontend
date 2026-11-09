<template>
  <div class="money-budgets">
    <BudgetPageHeader title="Lihat rencanamu berjalan." subtitle="Bandingkan anggaran dengan realisasi transaksi pada kategori yang sama." active="report" :query="periodQuery">
      <button type="button" class="budget-button" :disabled="loading || !!loadError || exporting || !visibleRows.length" @click="exportBudget('excel')"><AppIcon name="download" />Excel</button>
      <button type="button" class="budget-button" :disabled="loading || !!loadError || exporting || !visibleRows.length" @click="exportBudget('pdf')"><span v-if="exporting" class="budget-spinner" aria-hidden="true"></span><AppIcon v-else name="file" />PDF</button>
    </BudgetPageHeader>
    <section class="budget-toolbar" aria-label="Filter laporan">
      <BudgetPeriodPicker id="report-period" v-model:year="year" v-model:month="month" />
      <AppSelect id="report-type" v-model="type" :options="typeOptions" label="Jenis kategori" />
      <div class="budget-search"><label for="report-search">Cari kategori</label><div><AppIcon name="search" /><input id="report-search" v-model="search" type="search" placeholder="Kategori atau catatan..." /></div></div>
    </section>
    <div v-if="loading" class="budget-state" role="status"><span class="budget-spinner" aria-hidden="true"></span><h2>Memuat realisasi anggaran...</h2><p>{{ periodLabel }}</p></div>
    <div v-else-if="loadError" class="budget-state" role="alert"><AppIcon name="help" /><h2>Laporan belum berhasil dimuat.</h2><p>{{ loadError }}</p><button type="button" class="budget-button" @click="fetchData">Coba lagi</button></div>
    <template v-else>
      <section class="budget-report-overview" aria-label="Ringkasan realisasi periode">
        <article v-for="summary in summaries" :key="summary.type" class="budget-overview-card" :class="summary.type === 'INCOME' ? 'is-mint' : 'is-sun'">
          <header><AppIcon :name="summary.type === 'INCOME' ? 'target' : 'wallet'" /><div><span class="shell-overline">{{ periodLabel }}</span><h2>{{ summary.type === 'INCOME' ? 'Target pemasukan' : 'Batas pengeluaran' }}</h2></div><span class="budget-count">{{ summary.count }} kategori</span></header>
          <strong>{{ accountMoney(summary.actual, 'IDR') }}</strong><p>{{ summary.type === 'INCOME' ? 'Pemasukan tercatat' : 'Pengeluaran tercatat' }} dari rencana {{ accountMoney(summary.amount, 'IDR') }}</p>
          <div class="budget-overview-bottom"><span>{{ summary.type === 'INCOME' ? summary.remaining > 0 ? 'Menuju target' : 'Di atas target' : summary.remaining >= 0 ? 'Sisa anggaran' : 'Melebihi anggaran' }}</span><b>{{ accountMoney(Math.abs(summary.remaining), 'IDR') }}</b></div>
        </article>
      </section>
      <section class="budget-list-panel" aria-labelledby="report-list-heading">
        <header class="budget-panel-heading"><div><span class="shell-overline">DARI RENCANA KE REALISASI</span><h2 id="report-list-heading">Rincian per kategori</h2></div><span class="budget-count" role="status">{{ visibleRows.length }} dari {{ rows.length }} kategori</span></header>
        <div v-if="!visibleRows.length" class="budget-empty"><AppIcon :name="rows.length ? 'search' : 'chart'" /><h3>{{ rows.length ? 'Belum ada yang cocok.' : 'Rencanakan dulu, pantau kemudian.' }}</h3><p>{{ rows.length ? 'Coba pencarian atau jenis kategori lain.' : `Buat anggaran untuk ${periodLabel} agar realisasinya bisa dipantau di sini.` }}</p><button v-if="rows.length" class="budget-button" type="button" @click="search = ''; type = ''">Reset pencarian</button><RouterLink v-else :to="{ name: 'budget-create', query: periodQuery }" class="budget-button is-primary"><AppIcon name="plus" />Buat anggaran</RouterLink></div>
        <ul v-else class="budget-report-list">
          <li v-for="item in displayRows" :key="item.id" class="budget-report-row">
            <header><div class="budget-category"><CategoryBadge :color="item.category?.color" :icon="item.category?.icon" /><div><h3>{{ item.category?.categoryName || 'Kategori tidak tersedia' }}</h3><p>{{ item.description || (item.progress.income ? 'Target pemasukan' : 'Batas pengeluaran') }}</p></div></div><span class="budget-status" :class="`is-${item.progress.tone}`">{{ item.progress.status }}</span></header>
            <dl class="budget-report-metrics"><div><dt>{{ item.progress.income ? 'Target' : 'Anggaran' }}</dt><dd>{{ accountMoney(item.amount, 'IDR') }}</dd></div><div><dt>{{ item.progress.income ? 'Tercapai' : 'Terpakai' }}</dt><dd>{{ accountMoney(item.spent, 'IDR') }}</dd></div><div><dt>{{ item.progress.income ? item.progress.remaining > 0 ? 'Menuju target' : 'Di atas target' : item.progress.remaining >= 0 ? 'Tersisa' : 'Melebihi batas' }}</dt><dd>{{ accountMoney(Math.abs(item.progress.remaining), 'IDR') }}</dd></div></dl>
            <div class="budget-progress-heading"><span>{{ item.progress.income ? 'Pencapaian target' : 'Pemakaian anggaran' }}</span><strong>{{ item.progress.hasRatio ? `${item.progress.percentage.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%` : 'Rencana Rp0' }}</strong></div>
            <div class="budget-progress" :class="`is-${item.progress.tone}`" role="progressbar" :aria-label="`${item.category?.categoryName || 'Kategori'}: ${item.progress.status}`" :aria-valuenow="item.progress.width" :aria-valuetext="item.progress.hasRatio ? `${item.progress.percentage.toFixed(1)}% — ${item.progress.status}` : item.progress.status" aria-valuemin="0" aria-valuemax="100"><span :style="{ width: `${item.progress.width}%` }"></span></div>
            <footer><span>{{ item.progress.income ? 'Realisasi mengikuti pemasukan kategori ini.' : 'Realisasi mengikuti pengeluaran kategori ini.' }}</span><RouterLink :to="{ name: 'budget-edit', params: { id: item.id }, query: periodQuery }">Sesuaikan anggaran <AppIcon name="arrow" /></RouterLink></footer>
          </li>
        </ul>
        <footer v-if="rows.length" class="budget-list-footer"><AppIcon name="info" /><p>Ringkasan mencakup seluruh anggaran periode ini. Ekspor mengikuti kategori yang tampil. Transaksi tanpa anggaran tidak termasuk.</p></footer>
      </section>
    </template>
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
import { useBudgetStore } from '@/stores/budget'
import { useToastStore } from '@/stores/toast'
import { useBudgetPeriod } from '@/composables/useBudgetPeriod'
import { accountMoney } from '@/utils/accountList'
import { budgetNumber, budgetProgress, filterBudgets } from '@/utils/budget'
import type { BudgetReportItem } from '@/types/budget'
import '@/assets/categories.css'
import '@/assets/budgets.css'

const store = useBudgetStore(), toast = useToastStore()
const { year, month, periodLabel, periodQuery } = useBudgetPeriod()
const loading = ref(true), loadError = ref(''), exporting = ref(false), search = ref(''), type = ref('')
const typeOptions = [{ value: '', label: 'Semua jenis' }, { value: 'EXPENSE', label: 'Pengeluaran' }, { value: 'INCOME', label: 'Pemasukan' }]
const rows = ref<BudgetReportItem[]>([])
const visibleRows = computed(() => filterBudgets(rows.value, search.value, type.value))
const displayRows = computed(() => visibleRows.value.map((row) => ({ ...row, progress: budgetProgress(row) })))
const summaries = computed(() => ['EXPENSE', 'INCOME'].map((categoryType) => {
  const items = rows.value.filter((row) => row.category?.categoryType === categoryType)
  const amount = items.reduce((sum, row) => sum + budgetNumber(row.amount), 0)
  const actual = items.reduce((sum, row) => sum + budgetNumber(row.spent), 0)
  return { type: categoryType, count: items.length, amount, actual, remaining: amount - actual }
}))
let request = 0, active = true
const fetchData = async () => {
  const version = ++request
  loading.value = true; loadError.value = ''
  try {
    const data = await store.fetchBudgetReport(year.value, month.value)
    if (!active || version !== request) return
    if (data === null || data === undefined) loadError.value = store.budgetError || 'Silakan coba lagi.'
    else rows.value = data
  } catch { if (active && version === request) loadError.value = 'Silakan coba lagi.' }
  finally { if (active && version === request) loading.value = false }
}
const exportBudget = async (format: 'excel' | 'pdf') => {
  if (exporting.value || loading.value || loadError.value || !visibleRows.value.length) return
  const data = visibleRows.value.map((row) => ({ ...row })), label = periodLabel.value
  exporting.value = true
  try {
    const { default: service } = await import('@/services/exportService')
    if (format === 'excel') await service.exportBudgetsToExcel(data, label)
    else await service.exportBudgetsToPDF(data, label)
  } catch { toast.show('Laporan belum berhasil diekspor. Silakan coba lagi.', 'error') }
  finally { exporting.value = false }
}
watch([year, month], fetchData, { immediate: true })
onBeforeUnmount(() => { active = false; request++ })
</script>
