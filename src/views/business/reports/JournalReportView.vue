<template>
  <main class="cash-page journal-page">
    <header class="page-header"><div><span class="shell-overline">LAPORAN KEUANGAN</span><h1>Jurnal umum</h1><p>Telusuri catatan jurnal bisnis secara kronologis.</p></div><div v-if="data && data.data.length" class="exports"><button type="button" :disabled="isExporting" @click="doExportExcel">&#8595; &nbsp; Excel</button><button type="button" :disabled="isExporting" @click="doExportPDF">&#8595; &nbsp; PDF</button></div></header>
    <section class="controls" aria-label="Periode jurnal"><div><span class="eyebrow">PERIODE LAPORAN</span><h2>Telusuri jurnal</h2><p>Pilih rentang tanggal untuk melihat entri jurnal.</p></div><div class="control-actions"><DateRangePicker :start-date="filters.startDate" :end-date="filters.endDate" @apply="applyDateRange" /><button type="button" class="show-button" @click="applyFilters">Tampilkan</button><button type="button" class="reset-button" title="Reset ke bulan ini" aria-label="Reset ke bulan ini" @click="resetFilters">&#8635;</button></div></section>
    <div v-if="errorMsg" class="error" role="alert">{{ errorMsg }}</div>
    <div v-if="reportsStore.isLoading" class="state">Memuat jurnal...</div>
    <template v-else-if="data">
      <section class="journal-overview"><div><span class="eyebrow">IKHTISAR JURNAL</span><h2>Catatan periode ini</h2><p>{{ formatDate(filters.startDate) }} - {{ formatDate(filters.endDate) }}</p></div><div class="entry-count"><strong>{{ data.total }}</strong><span>entri jurnal</span></div><div class="page-count"><span>DITAMPILKAN</span><strong>{{ data.data.length }} entri</strong><small>Halaman {{ data.page }} dari {{ data.totalPages || 1 }}</small></div></section>
      <div class="section-heading"><span class="eyebrow">DAFTAR JURNAL</span><h2>Entri jurnal</h2><p>Pilih entri untuk melihat rincian transaksi dan akun.</p></div>
      <div v-if="!data.data.length" class="state"><strong>Tidak ada jurnal dalam periode ini</strong><p class="empty-caption">Coba pilih rentang tanggal lain.</p></div>
      <div v-else class="journal-list"><RouterLink v-for="entry in data.data" :key="entry.id" :to="{ name: 'business-transaction-detail', params: { id: entry.id } }" class="journal-entry"><div class="entry-date"><span>TANGGAL</span><strong>{{ formatDate(entry.date) }}</strong></div><div class="entry-main"><div class="entry-meta"><span class="entry-type" :class="{ system: entry.isSystemGenerated }">{{ entry.isSystemGenerated ? 'Dari Invoice' : 'Manual' }}</span><span v-if="entry.reference" class="reference">{{ entry.reference }}</span></div><h3>{{ entry.description || 'Tanpa deskripsi' }}</h3><p v-if="entry.contacts && entry.contacts.length">{{ entry.contacts.join(', ') }}</p></div><div class="entry-total"><span>TOTAL DEBIT</span><strong>{{ formatRp(entry.totalDebit) }}</strong></div><span class="entry-arrow" aria-hidden="true">&#8594;</span></RouterLink></div>
      <nav v-if="data.totalPages > 1" class="pagination" aria-label="Halaman jurnal"><p>Halaman {{ data.page }} dari {{ data.totalPages }} <span>({{ data.total }} entri)</span></p><div><button type="button" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">&#8592; Sebelumnya</button><button type="button" :disabled="currentPage >= data.totalPages" @click="goToPage(currentPage + 1)">Berikutnya &#8594;</button></div></nav>
    </template><div v-else class="state">Belum ada laporan untuk ditampilkan.</div>
  </main>
</template>
<script setup lang="ts">
import DateRangePicker from '@/components/common/DateRangePicker.vue'
import { dateKey, type DateRange } from '@/utils/dateRange'
import { ref, computed, onMounted } from 'vue'
import { useBusinessReportsStore } from '@/stores/businessReports'
import { useBusinessStore } from '@/stores/business'
import { BusinessService } from '@/services/business.service'
import ExportService from '@/services/exportService'


const reportsStore = useBusinessReportsStore()
const businessStore = useBusinessStore()
const isExporting = ref(false)

const errorMsg = ref('')
const currentPage = ref(1)

const today = new Date()
const firstOfMonth = dateKey(new Date(today.getFullYear(), today.getMonth(), 1))

const filters = ref({
  startDate: firstOfMonth,
  endDate: dateKey(today),
})

const data = computed(() => reportsStore.journalReport)

onMounted(() => loadReport())

async function loadReport() {
  errorMsg.value = ''
  try {
    await reportsStore.fetchJournalReport({
      startDate: filters.value.startDate || undefined,
      endDate: filters.value.endDate || undefined,
      page: currentPage.value,
      limit: 20,
    })
  } catch {
    errorMsg.value = 'Gagal memuat jurnal umum.'
  }
}

async function fetchAllForExport() {
  const res = await BusinessService.getJournalReport({
    startDate: filters.value.startDate || undefined,
    endDate: filters.value.endDate || undefined,
    page: 1,
    limit: 9999,
  })
  return res.data
}

async function doExportExcel() {
  isExporting.value = true
  try {
    const entries = await fetchAllForExport()
    await ExportService.exportJournalReportToExcel(entries, businessStore.currentCompany?.name, filters.value)
  } finally { isExporting.value = false }
}

async function doExportPDF() {
  isExporting.value = true
  try {
    const entries = await fetchAllForExport()
    ExportService.exportJournalReportToPDF(entries, businessStore.currentCompany?.name, filters.value)
  } finally { isExporting.value = false }
}

async function applyFilters() {
  currentPage.value = 1
  await loadReport()
}

function resetFilters() {
  filters.value = {
    startDate: firstOfMonth,
    endDate: dateKey(today),
  }
  currentPage.value = 1
  loadReport()
}

async function goToPage(page: number) {
  currentPage.value = page
  await loadReport()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function formatRp(amount: string | number) {
  const val = typeof amount === 'string' ? parseFloat(amount) : amount
  return 'Rp ' + val.toLocaleString('id-ID')
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
const applyDateRange = (range: DateRange) => {
  Object.assign(filters.value, range)
  applyFilters()
}
</script>
<style scoped>
.cash-page { --ink: var(--shell-ink, #27231d); --muted: var(--shell-muted, #6c6256); --surface: var(--shell-surface, #fffcf5); --rule: var(--shell-rule, #e2d8c7); max-width: 1280px; margin: auto; padding: clamp(20px,3vw,40px) clamp(16px,3vw,32px); color: var(--ink); }
.page-header { display:flex; justify-content:space-between; align-items:end; gap:20px; margin-bottom:28px; }.page-header h1 { font-size:clamp(34px,4vw,52px); line-height:1; letter-spacing:-.055em; font-weight:900; margin:9px 0; }.page-header p,.controls p,.section-heading p { color:var(--muted); font-size:14px; }.exports { display:flex; gap:8px; }.exports button,.reset-button { border:1px solid var(--rule); background:var(--surface); border-radius:999px; padding:10px 16px; font-weight:700; }.exports button:disabled { opacity:.5; }
.eyebrow { font-size:10px; letter-spacing:.13em; font-weight:800; color:var(--muted); }.controls { display:flex; justify-content:space-between; align-items:center; gap:20px; background:var(--surface); border:1px solid var(--rule); border-radius:20px; padding:20px 24px; margin-bottom:20px; }.controls h2 { font-size:18px; font-weight:800; margin:3px 0; }.control-actions { display:flex; align-items:end; gap:8px; }.show-button { background:var(--shell-grape, #5026a5); color:white; border-radius:999px; padding:10px 18px; font-weight:700; white-space:nowrap; }.reset-button { font-size:20px; line-height:1; }
.overview { display:grid; grid-template-columns:1.15fr 1fr; border-radius:24px; overflow:hidden; background:#31244c; color:#fff; }.overview-main { padding:32px; background:radial-gradient(circle at 100% 0%, #7756ad, transparent 55%), #3d2c60; }.overview .eyebrow { color:#d7c9ef; }.period { font-size:13px; color:#e0d5ef; margin-top:8px; }.balance-label { margin-top:40px; font-size:14px; color:#e0d5ef; }.balance { display:block; font-size:clamp(30px,4vw,48px); letter-spacing:-.045em; overflow-wrap:anywhere; }.balance-note { margin-top:8px; color:#e0d5ef; font-size:13px; }.overview-side { padding:32px; }.movement { display:flex; justify-content:space-between; gap:16px; padding:17px 0; border-bottom:1px solid #ffffff26; font-size:14px; }.movement strong { text-align:right; overflow-wrap:anywhere; }.movement.net { border:0; padding-bottom:0; font-size:16px; }.negative { color:#ffb7b7; }.dot { display:inline-block; width:9px; height:9px; border-radius:50%; margin-right:9px; }.dot.in { background:#a5e7c0; }.dot.out { background:#ffb3a9; }
.section-heading { margin:36px 0 16px; }.section-heading h2 { font-size:26px; font-weight:850; letter-spacing:-.04em; margin:4px 0; }.detail-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }.detail-card { background:var(--surface); border:1px solid var(--rule); border-radius:20px; overflow:hidden; }.detail-card header { display:flex; justify-content:space-between; gap:12px; align-items:center; padding:22px; border-bottom:1px solid var(--rule); }.detail-card header > div { display:flex; align-items:center; gap:12px; }.detail-card header > strong { text-align:right; overflow-wrap:anywhere; }.detail-card h3 { font-size:17px; font-weight:800; }.detail-card header p { font-size:12px; color:var(--muted); }.direction { display:grid; place-items:center; width:42px; height:42px; border-radius:14px; font-size:22px; }.direction.in { background:#d9f2e2; color:#267447; }.direction.out { background:#ffe2dc; color:#ac493b; }.account { display:flex; justify-content:space-between; align-items:center; gap:16px; padding:15px 22px; border-bottom:1px solid var(--rule); }.account:last-child { border:0; }.account span { color:var(--muted); font-size:11px; }.account p { font-size:14px; font-weight:700; }.account strong { font-size:14px; text-align:right; overflow-wrap:anywhere; }.empty { padding:30px 22px; color:var(--muted); font-size:14px; }.notice { display:flex; gap:16px; margin-top:22px; padding:18px 22px; border:1px solid var(--rule); border-radius:16px; color:var(--muted); font-size:12px; }.notice strong { color:var(--ink); white-space:nowrap; }.state,.error { padding:32px; text-align:center; background:var(--surface); border:1px solid var(--rule); border-radius:18px; }.error { color:#b42318; margin-bottom:16px; }.cash-page :deep(button:focus-visible),.cash-page :deep(input:focus-visible) { outline:3px solid #9a78d5; outline-offset:3px; }
@media(max-width:800px) { .controls { align-items:stretch; flex-direction:column; }.control-actions { flex-wrap:wrap; }.overview { grid-template-columns:1fr; }.detail-grid { grid-template-columns:1fr; } } @media(max-width:520px) { .page-header { align-items:start; flex-direction:column; }.overview-main,.overview-side { padding:24px; }.balance-label { margin-top:28px; }.control-actions :deep(.date-range-picker) { width:100%; }.notice { flex-direction:column; gap:5px; } }
</style>
<style scoped>
.journal-overview { display:flex; align-items:center; gap:36px; padding:28px 32px; border-radius:24px; background:radial-gradient(circle at 100% 0%, #7756ad, transparent 55%), #3d2c60; color:white; }.journal-overview > div:first-child { flex:1; }.journal-overview .eyebrow,.journal-overview p,.page-count span,.page-count small,.entry-count span { color:#e0d5ef; }.journal-overview h2 { font-size:24px; font-weight:850; letter-spacing:-.04em; margin:6px 0; }.journal-overview p { font-size:13px; }.entry-count,.page-count { display:flex; flex-direction:column; }.entry-count strong { font-size:44px; line-height:1; letter-spacing:-.05em; }.entry-count span,.page-count small { font-size:12px; margin-top:5px; }.page-count { border-left:1px solid #ffffff33; padding-left:30px; }.page-count span { font-size:10px; font-weight:800; letter-spacing:.12em; }.page-count strong { font-size:18px; margin-top:7px; }.journal-list { border:1px solid var(--rule); border-radius:20px; background:var(--surface); overflow:hidden; }.journal-entry { display:grid; grid-template-columns:140px minmax(0,1fr) minmax(130px,auto) 24px; gap:20px; align-items:center; padding:20px 24px; border-bottom:1px solid var(--rule); color:var(--ink); text-decoration:none; transition:background .2s; }.journal-entry:last-child { border-bottom:0; }.journal-entry:hover { background:var(--shell-lilac, #eee4ff); }.entry-date,.entry-total { display:flex; flex-direction:column; gap:6px; }.entry-date span,.entry-total span { color:var(--muted); font-size:10px; font-weight:800; letter-spacing:.1em; }.entry-date strong,.entry-total strong { font-size:14px; }.entry-total { text-align:right; }.entry-total strong { overflow-wrap:anywhere; }.entry-meta { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }.entry-type { background:var(--shell-lilac, #eee4ff); color:#5026a5; border-radius:999px; font-size:11px; font-weight:700; padding:4px 9px; }.entry-type.system { background:#d9f2e2; color:#267447; }.reference { color:var(--muted); font-size:12px; overflow-wrap:anywhere; }.entry-main { min-width:0; }.entry-main h3 { font-size:15px; font-weight:800; margin-top:7px; overflow-wrap:anywhere; }.entry-main p { color:var(--muted); font-size:12px; margin-top:4px; }.entry-arrow { font-size:20px; color:var(--muted); text-align:right; }.empty-caption { color:var(--muted); font-size:13px; margin-top:6px; }.pagination { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-top:18px; color:var(--muted); font-size:13px; }.pagination div { display:flex; gap:8px; }.pagination button { padding:9px 14px; border:1px solid var(--rule); background:var(--surface); color:var(--ink); border-radius:999px; font-weight:700; }.pagination button:disabled { opacity:.4; }.journal-entry:focus-visible { outline:3px solid #9a78d5; outline-offset:-3px; } @media(max-width:700px) { .journal-overview { flex-wrap:wrap; gap:20px; padding:24px; }.journal-overview > div:first-child { flex-basis:100%; }.journal-entry { grid-template-columns:minmax(0,1fr) auto; gap:10px; padding:18px; }.entry-date { grid-column:1 / -1; flex-direction:row; align-items:baseline; }.entry-main { grid-column:1; }.entry-total { grid-column:1; text-align:left; margin-top:4px; }.entry-arrow { grid-column:2; grid-row:2 / 4; }.pagination { align-items:flex-start; flex-direction:column; } }
</style>
