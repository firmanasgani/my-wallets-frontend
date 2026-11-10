<template>
  <main class="cash-page">
    <header class="page-header"><div><span class="shell-overline">LAPORAN KEUANGAN</span><h1>Laba rugi</h1><p>Pahami pendapatan dan beban bisnis dalam periode pilihan.</p></div><div v-if="data" class="exports"><button type="button" :disabled="isExporting" @click="doExportExcel">&#8595; &nbsp; Excel</button><button type="button" :disabled="isExporting" @click="doExportPDF">&#8595; &nbsp; PDF</button></div></header>
    <section class="controls" aria-label="Periode laporan"><div><span class="eyebrow">PERIODE LAPORAN</span><h2>Telusuri kinerja</h2><p>Pilih rentang waktu untuk melihat pendapatan dan beban.</p></div><div class="control-actions"><DateRangePicker :start-date="filters.startDate" :end-date="filters.endDate" @apply="applyDateRange" /><button type="button" class="show-button" @click="loadReport">Tampilkan</button><button type="button" class="reset-button" title="Reset ke bulan ini" aria-label="Reset ke bulan ini" @click="resetFilters">&#8635;</button></div></section>
    <div v-if="errorMsg" class="error" role="alert">{{ errorMsg }}</div><div v-if="reportsStore.isLoading" class="state" role="status">Memuat laporan...</div>
    <template v-else-if="data"><section class="overview" aria-label="Ringkasan laba rugi"><div class="overview-main"><span class="eyebrow">KINERJA BISNIS</span><p class="period">{{ data.period.startDate ? formatDate(data.period.startDate) : 'Awal' }} - {{ data.period.endDate ? formatDate(data.period.endDate) : 'Sekarang' }}</p><p class="balance-label">{{ data.isProfit ? 'Laba bersih' : 'Rugi bersih' }}</p><strong class="balance">{{ formatRp(data.netProfit) }}</strong><p class="balance-note">Pendapatan dikurangi beban</p></div><div class="overview-side"><span class="eyebrow">RINGKASAN PERIODE INI</span><div class="movement"><span><i class="dot in"></i>Total pendapatan</span><strong>{{ formatRp(data.revenue.total) }}</strong></div><div class="movement"><span><i class="dot out"></i>Total beban</span><strong>{{ formatRp(data.expense.total) }}</strong></div><div class="movement net"><span>{{ data.isProfit ? 'Laba bersih' : 'Rugi bersih' }}</span><strong>{{ formatRp(data.netProfit) }}</strong></div></div></section>
      <div class="section-heading"><span class="eyebrow">RINCIAN LAPORAN</span><h2>Pendapatan dan beban</h2><p>Rincian akun untuk periode yang dipilih.</p></div>
      <div class="report-grid"><section v-for="section in [{ key: 'revenue', label: 'Pendapatan', group: data.revenue }, { key: 'expense', label: 'Beban', group: data.expense }]" :key="section.key" class="report-card" :aria-labelledby="section.key + '-heading'"><header class="report-card-header"><div class="report-card-title"><span class="report-icon" :class="section.key" aria-hidden="true">{{ section.key === 'revenue' ? '+' : '-' }}</span><div><h3 :id="section.key + '-heading'">{{ section.label }}</h3><p>{{ section.group.accounts.length }} akun</p></div></div><div class="report-total"><span>Total {{ section.label.toLowerCase() }}</span><strong>{{ formatRp(section.group.total) }}</strong></div></header><div class="report-table-wrap"><table><thead><tr><th scope="col">Akun</th><th scope="col">Jumlah</th></tr></thead><tbody><tr v-for="acc in section.group.accounts" :key="acc.coaCode"><td><span class="account-code">{{ acc.coaCode }}</span><span class="account-name">{{ acc.coaName }}</span></td><td class="account-amount">{{ formatRp(acc.amount) }}</td></tr><tr v-if="!section.group.accounts.length"><td colspan="2" class="report-empty">Tidak ada akun {{ section.label.toLowerCase() }} pada periode ini.</td></tr></tbody></table></div></section></div>
    </template><div v-else class="state">Pilih periode lalu klik Tampilkan.</div><aside class="notice"><strong>Catatan laporan</strong><p>Laporan ini belum termasuk Penutupan Periode (Period Closing). Nilai kumulatif sejak perusahaan dibuat.</p></aside>
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

const data = computed(() => reportsStore.profitLoss)

onMounted(() => loadReport())

async function loadReport() {
  errorMsg.value = ''
  try {
    await reportsStore.fetchProfitLoss({
      startDate: filters.value.startDate || undefined,
      endDate: filters.value.endDate || undefined,
    })
  } catch {
    errorMsg.value = 'Gagal memuat laporan laba rugi.'
  }
}

async function doExportExcel() {
  if (!data.value) return
  isExporting.value = true
  try {
    await ExportService.exportProfitLossToExcel(data.value, businessStore.currentCompany?.name, filters.value)
  } finally { isExporting.value = false }
}

function doExportPDF() {
  if (!data.value) return
  ExportService.exportProfitLossToPDF(data.value, businessStore.currentCompany?.name, filters.value)
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
  return 'Rp ' + val.toLocaleString('id-ID')
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

.report-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }
.report-card { min-width:0; overflow:hidden; border:1px solid var(--rule); border-radius:20px; background:var(--surface); }
.report-card-header { display:flex; justify-content:space-between; align-items:center; gap:16px; padding:22px; border-bottom:1px solid var(--rule); }
.report-card-title { display:flex; align-items:center; gap:12px; min-width:0; }
.report-icon { display:grid; place-items:center; flex:none; width:42px; height:42px; border-radius:14px; font-size:22px; font-weight:800; }
.report-icon.revenue { background:var(--shell-mint,#ddf4d9); color:var(--shell-ink,#27231d); }
.report-icon.expense { background:var(--shell-lilac,#eee4ff); color:var(--shell-grape,#5026a5); }
.report-card-title h3 { color:var(--ink); font-size:17px; font-weight:800; }
.report-card-title p,.report-total span { color:var(--muted); font-size:12px; }
.report-total { display:flex; flex-direction:column; align-items:end; text-align:right; min-width:0; gap:4px; }
.report-total strong { color:var(--ink); font-size:16px; font-variant-numeric:tabular-nums; overflow-wrap:anywhere; }
.report-table-wrap { overflow-x:auto; }
.report-card table { width:100%; border-collapse:collapse; text-align:left; }
.report-card th { padding:11px 22px; color:var(--muted); font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.09em; }
.report-card th:last-child { text-align:right; }
.report-card td { padding:14px 22px; border-top:1px solid var(--rule); vertical-align:middle; }
.account-code { display:block; color:var(--muted); font-size:11px; font-family:monospace; }
.account-name { display:block; margin-top:3px; color:var(--ink); font-size:13px; font-weight:700; overflow-wrap:anywhere; }
.account-amount { color:var(--ink); font-size:13px; font-weight:750; text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap; }
.report-card .report-empty { color:var(--muted); font-size:13px; text-align:center; padding:28px 22px; }
@media(max-width:800px) { .report-grid { grid-template-columns:1fr; } }
@media(max-width:420px) { .report-card-header { align-items:flex-start; flex-direction:column; }.report-total { align-items:start; text-align:left; }.report-card th,.report-card td { padding-left:16px; padding-right:16px; } }

</style>
