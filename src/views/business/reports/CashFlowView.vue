<template>
  <main class="cash-page">
    <header class="page-header">
      <div><span class="shell-overline">LAPORAN KEUANGAN</span><h1>Arus kas</h1><p>Pahami pergerakan uang bisnis dalam satu tampilan.</p></div>
      <div v-if="data" class="exports"><button type="button" :disabled="isExporting" @click="doExportExcel">? &nbsp; Excel</button><button type="button" :disabled="isExporting" @click="doExportPDF">? &nbsp; PDF</button></div>
    </header>
    <section class="controls" aria-label="Periode laporan">
      <div><span class="eyebrow">PERIODE LAPORAN</span><h2>Telusuri arus kas</h2><p>Pilih rentang waktu untuk melihat pergerakan kas.</p></div>
      <div class="control-actions"><DateRangePicker :start-date="filters.startDate" :end-date="filters.endDate" @apply="applyDateRange" /><button class="show-button" @click="loadReport">Tampilkan</button><button class="reset-button" title="Reset ke bulan ini" aria-label="Reset ke bulan ini" @click="resetFilters">?</button></div>
    </section>
    <div v-if="errorMsg" class="error" role="alert">{{ errorMsg }}</div>
    <div v-if="reportsStore.isLoading" class="state">Memuat laporan?</div>
    <template v-else-if="data">
      <section class="overview">
        <div class="overview-main"><span class="eyebrow">POSISI KAS</span><p class="period">{{ data.period.startDate ? formatDate(data.period.startDate) : 'Awal' }} ? {{ data.period.endDate ? formatDate(data.period.endDate) : 'Sekarang' }}</p><p class="balance-label">Saldo akhir</p><strong class="balance">{{ formatRp(data.endingCash) }}</strong><p class="balance-note">Saldo awal {{ formatRp(data.openingCash) }}</p></div>
        <div class="overview-side"><span class="eyebrow">PERGERAKAN PERIODE INI</span><div class="movement"><span><i class="dot in"></i>Kas masuk</span><strong>{{ formatRp(data.totalInflow) }}</strong></div><div class="movement"><span><i class="dot out"></i>Kas keluar</span><strong>{{ formatRp(data.totalOutflow) }}</strong></div><div class="movement net"><span>Arus kas bersih</span><strong :class="{ negative: netCashIsNegative }">{{ formatRp(data.netCashFlow) }}</strong></div></div>
      </section>
      <div class="section-heading"><div><span class="eyebrow">RINCIAN LAPORAN</span><h2>Ke mana uang bergerak?</h2><p>Pergerakan kas berdasarkan akun selama periode ini.</p></div></div>
      <section class="detail-grid" aria-label="Rincian arus kas">
        <article class="detail-card"><header><div><span class="direction in">?</span><div><h3>Kas masuk</h3><p>{{ data.cashInflows.length }} akun</p></div></div><strong>{{ formatRp(data.totalInflow) }}</strong></header><div v-if="data.cashInflows.length" class="account-list"><div v-for="acc in data.cashInflows" :key="acc.coaCode" class="account"><div><span>{{ acc.coaCode }}</span><p>{{ acc.coaName }}</p></div><strong>+{{ formatRp(acc.amount) }}</strong></div></div><p v-else class="empty">Belum ada kas masuk pada periode ini.</p></article>
        <article class="detail-card"><header><div><span class="direction out">?</span><div><h3>Kas keluar</h3><p>{{ data.cashOutflows.length }} akun</p></div></div><strong>{{ formatRp(data.totalOutflow) }}</strong></header><div v-if="data.cashOutflows.length" class="account-list"><div v-for="acc in data.cashOutflows" :key="acc.coaCode" class="account"><div><span>{{ acc.coaCode }}</span><p>{{ acc.coaName }}</p></div><strong>?{{ formatRp(acc.amount) }}</strong></div></div><p v-else class="empty">Belum ada kas keluar pada periode ini.</p></article>
      </section>
    </template>
    <div v-else class="state">Pilih periode lalu klik Tampilkan.</div>
    <aside class="notice"><strong>Catatan laporan</strong><p>Laporan ini merupakan penyederhanaan yang mencakup semua pergerakan akun Aset dan belum termasuk Penutupan Periode (Period Closing).</p></aside>
  </main>
</template>
<script setup lang="ts">
import DateRangePicker from '@/components/common/DateRangePicker.vue'
import { dateKey, type DateRange } from '@/utils/dateRange'
import { ref, computed, onMounted } from 'vue'
import { useBusinessReportsStore } from '@/stores/businessReports'
import { useBusinessStore } from '@/stores/business'
import ExportService from '@/services/exportService'

const reportsStore = useBusinessReportsStore()
const businessStore = useBusinessStore()
const isExporting = ref(false)

const errorMsg = ref('')

const today = new Date()
const firstOfMonth = dateKey(new Date(today.getFullYear(), today.getMonth(), 1))

const filters = ref({
  startDate: firstOfMonth,
  endDate: dateKey(today),
})

const data = computed(() => reportsStore.cashFlow)
const netCashIsNegative = computed(() => data.value ? parseFloat(data.value.netCashFlow) < 0 : false)

onMounted(() => loadReport())

async function loadReport() {
  errorMsg.value = ''
  try {
    await reportsStore.fetchCashFlow({
      startDate: filters.value.startDate || undefined,
      endDate: filters.value.endDate || undefined,
    })
  } catch {
    errorMsg.value = 'Gagal memuat laporan arus kas.'
  }
}

async function doExportExcel() {
  if (!data.value) return
  isExporting.value = true
  try {
    await ExportService.exportCashFlowToExcel(data.value, businessStore.currentCompany?.name, filters.value)
  } finally { isExporting.value = false }
}

function doExportPDF() {
  if (!data.value) return
  ExportService.exportCashFlowToPDF(data.value, businessStore.currentCompany?.name, filters.value)
}

function resetFilters() {
  filters.value = {
    startDate: firstOfMonth,
    endDate: dateKey(today),
  }
  loadReport()
}

function formatRp(amount: string | number) {
  const val = typeof amount === 'string' ? parseFloat(amount) : amount
  return (val < 0 ? '-Rp ' : 'Rp ') + Math.abs(val).toLocaleString('id-ID')
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
const applyDateRange = (range: DateRange) => {
  Object.assign(filters.value, range)
  loadReport()
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
