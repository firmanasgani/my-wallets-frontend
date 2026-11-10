<template>
  <main class="cash-page balance-page">
    <header class="page-header"><div><span class="shell-overline">LAPORAN KEUANGAN</span><h1>Neraca keuangan</h1><p>Lihat posisi aset, liabilitas, dan ekuitas bisnis pada tanggal pilihan.</p></div><div v-if="data" class="exports"><button type="button" :disabled="isExporting" @click="doExportExcel">&#8595; &nbsp; Excel</button><button type="button" :disabled="isExporting" @click="doExportPDF">&#8595; &nbsp; PDF</button></div></header>
    <section class="controls" aria-label="Tanggal laporan"><div><span class="eyebrow">TANGGAL LAPORAN</span><h2>Posisi pada tanggal tertentu</h2><p>Pilih tanggal untuk melihat saldo kumulatif hingga hari tersebut.</p></div><div class="control-actions"><div class="date-field"><label for="balance-date">Per tanggal</label><input id="balance-date" v-model="filters.date" type="date" /></div><button class="show-button" type="button" @click="loadReport">Tampilkan</button><button class="reset-button" type="button" title="Reset ke hari ini" aria-label="Reset ke hari ini" @click="resetFilters">&#8635;</button></div></section>
    <div v-if="errorMsg" class="error" role="alert">{{ errorMsg }}</div>
    <div v-if="reportsStore.isLoading" class="state">Memuat laporan...</div>
    <template v-else-if="data">
      <section class="overview" aria-label="Ringkasan neraca"><div class="overview-main"><span class="eyebrow">POSISI KEUANGAN</span><p class="period">Per {{ formatDate(data.asOfDate) }}</p><p class="balance-label">Total aset</p><strong class="balance">{{ formatRp(data.assets.total) }}</strong><p class="balance-note">Aset = liabilitas + ekuitas</p></div><div class="overview-side"><span class="eyebrow">SUMBER PENDANAAN</span><div class="movement"><span><i class="dot in"></i>Liabilitas</span><strong>{{ formatRp(data.liabilities.total) }}</strong></div><div class="movement"><span><i class="dot out"></i>Ekuitas</span><strong>{{ formatRp(data.equity.total) }}</strong></div><div class="movement net"><span>Total liabilitas + ekuitas</span><strong>{{ formatRp(data.totalLiabilitiesAndEquity) }}</strong></div><p class="balance-status" :class="{ unbalanced: !data.isBalanced }">{{ data.isBalanced ? 'Neraca seimbang' : 'Neraca tidak seimbang' }}</p><p v-if="!data.isBalanced" class="status-note">Periksa jurnal yang mungkin belum terekam.</p></div></section>
      <div class="section-heading"><span class="eyebrow">RINCIAN LAPORAN</span><h2>Rincian posisi keuangan</h2><p>Saldo setiap akun pada tanggal laporan.</p></div>
      <section class="balance-grid" aria-label="Rincian akun neraca">
        <article v-for="section in [{ label: 'Aset', group: data.assets, icon: 'A' }, { label: 'Liabilitas', group: data.liabilities, icon: 'L' }, { label: 'Ekuitas', group: data.equity, icon: 'E' }]" :key="section.label" class="detail-card"><header><div><span class="account-icon">{{ section.icon }}</span><div><h3>{{ section.label }}</h3><p>{{ section.group.accounts.length }} akun</p></div></div><strong>{{ formatRp(section.group.total) }}</strong></header><div class="account-list"><div v-for="acc in section.group.accounts" :key="acc.coaCode" class="account"><div><span>{{ acc.coaCode }}</span><p>{{ acc.coaName }}</p></div><strong>{{ formatRp(acc.balance) }}</strong></div><div v-if="section.label === 'Ekuitas'" class="account profit-row"><div><p>Laba / Rugi Periode Ini</p></div><strong>{{ formatRp(data.equity.currentPeriodProfit) }}</strong></div><p v-else-if="!section.group.accounts.length" class="empty">Tidak ada akun pada tanggal ini.</p></div></article>
      </section>
    </template><div v-else class="state">Pilih tanggal lalu klik Tampilkan.</div>
    <aside class="notice"><strong>Catatan laporan</strong><p>Saldo kumulatif sejak perusahaan dibuat dan belum termasuk Penutupan Periode (Period Closing).</p></aside>
  </main>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { dateKey } from '@/utils/dateRange'
import { useBusinessReportsStore } from '@/stores/businessReports'
import { useBusinessStore } from '@/stores/business'
import ExportService from '@/services/exportService'

const reportsStore = useBusinessReportsStore()
const businessStore = useBusinessStore()
const isExporting = ref(false)

const errorMsg = ref('')

const today = dateKey(new Date())
const filters = ref({ date: today })

const data = computed(() => reportsStore.balanceSheet)

onMounted(() => loadReport())

async function loadReport() {
  errorMsg.value = ''
  try {
    await reportsStore.fetchBalanceSheet({
      date: filters.value.date || undefined,
    })
  } catch {
    errorMsg.value = 'Gagal memuat neraca keuangan.'
  }
}

async function doExportExcel() {
  if (!data.value) return
  isExporting.value = true
  try {
    await ExportService.exportBalanceSheetToExcel(data.value, businessStore.currentCompany?.name)
  } finally { isExporting.value = false }
}

function doExportPDF() {
  if (!data.value) return
  ExportService.exportBalanceSheetToPDF(data.value, businessStore.currentCompany?.name)
}

function resetFilters() {
  filters.value = { date: today }
  loadReport()
}

function formatRp(amount: string | number) {
  const val = typeof amount === 'string' ? parseFloat(amount) : amount
  return 'Rp ' + val.toLocaleString('id-ID')
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
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
.date-field { display:flex; flex-direction:column; gap:5px; }.date-field label { font-size:12px; font-weight:700; color:var(--muted); }.date-field input { min-height:40px; padding:8px 12px; color:var(--ink); background:var(--surface); border:1px solid var(--rule); border-radius:10px; }.balance-status { display:inline-block; margin-top:22px; padding:6px 10px; border-radius:999px; color:#d6f8e2; background:#ffffff20; font-size:12px; font-weight:700; }.balance-status.unbalanced { color:#ffe0dc; background:#a94040; }.status-note { color:#ffe0dc; font-size:12px; margin-top:8px; }.balance-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; align-items:start; }.account-icon { display:grid; place-items:center; width:42px; height:42px; flex:none; border-radius:14px; background:var(--shell-lilac, #eee4ff); color:#5026a5; font-weight:800; }.profit-row { background:var(--shell-lilac, #eee4ff); color:#31244c; } @media(max-width:1000px) { .balance-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } } @media(max-width:650px) { .balance-grid { grid-template-columns:1fr; } .date-field { flex:1 1 100%; } }
</style>
