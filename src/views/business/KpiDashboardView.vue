<template>
  <div class="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 flex items-center justify-between">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">KPI Dashboard</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Ringkasan performa bisnis bulan
          <span v-if="data" class="font-medium text-slate-700 dark:text-slate-200">
            {{ monthName(data.profitability.period.month) }} {{ data.profitability.period.year }}
          </span>
        </p>
      </div>
      <button
        @click="loadKpi"
        :disabled="reportsStore.isLoading"
        class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
        title="Refresh data"
      >
        <svg :class="['w-4 h-4', reportsStore.isLoading ? 'animate-spin' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </button>
    </div>

    <!-- Error -->
    <div v-if="errorMsg" class="mb-4 rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800">
      <p class="text-sm font-medium text-red-800 dark:text-red-300">{{ errorMsg }}</p>
    </div>

    <!-- Loading -->
    <div v-if="reportsStore.isLoading && !data" class="flex justify-center p-16">
      <svg class="w-8 h-8 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <div v-else-if="data" class="space-y-4">
      <!-- Row 1: Profitabilitas + Posisi Kas -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- Profitabilitas -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="px-5 py-3 bg-indigo-50 dark:bg-emerald-900/20 border-b border-slate-200 dark:border-slate-700">
            <h2 class="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Profitabilitas</h2>
          </div>
          <div class="px-5 py-4 space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-slate-500 dark:text-slate-400">Pendapatan</span>
              <span class="text-sm font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">{{ formatRp(data.profitability.totalRevenue) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-slate-500 dark:text-slate-400">Beban</span>
              <span class="text-sm font-medium text-red-600 dark:text-red-400 tabular-nums">{{ formatRp(data.profitability.totalExpense) }}</span>
            </div>
            <div class="border-t border-slate-100 dark:border-slate-700 pt-3 flex justify-between items-center">
              <span :class="['text-sm font-semibold', data.profitability.isProfit ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400']">
                {{ data.profitability.isProfit ? 'Laba Bersih' : 'Rugi Bersih' }}
              </span>
              <span :class="['text-base font-bold tabular-nums', data.profitability.isProfit ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400']">
                {{ formatRp(data.profitability.netProfit) }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-slate-500 dark:text-slate-400">Margin</span>
              <span class="text-sm font-medium text-slate-700 dark:text-slate-200 tabular-nums">
                {{ parseFloat(data.profitability.totalRevenue) > 0 ? data.profitability.profitMargin + '%' : '—' }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-slate-500 dark:text-slate-400">Pertumbuhan Revenue</span>
              <span v-if="data.profitability.revenueGrowth === null" class="text-sm text-slate-400 dark:text-slate-500">—</span>
              <span v-else-if="parseFloat(data.profitability.revenueGrowth) >= 0" class="text-sm font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                ▲ {{ data.profitability.revenueGrowth }}%
              </span>
              <span v-else class="text-sm font-medium text-red-600 dark:text-red-400 tabular-nums">
                ▼ {{ data.profitability.revenueGrowth.replace('-', '') }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Posisi Kas & Kewajiban -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="px-5 py-3 bg-sky-50 dark:bg-sky-900/20 border-b border-slate-200 dark:border-slate-700">
            <h2 class="text-xs font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wide">Posisi Kas &amp; Kewajiban</h2>
          </div>
          <div class="px-5 py-4 space-y-3">
            <div class="flex justify-between items-center">
              <div>
                <span class="text-sm text-slate-500 dark:text-slate-400">Kas &amp; Bank</span>
                <p class="text-xs text-slate-400 dark:text-slate-500">Dana yang sudah tersedia</p>
              </div>
              <span class="text-sm font-medium text-slate-800 dark:text-slate-100 tabular-nums">{{ formatRp(data.liquidity.cashPosition) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <div>
                <span class="text-sm text-slate-500 dark:text-slate-400">Piutang Usaha</span>
                <p class="text-xs text-slate-400 dark:text-slate-500">Tagihan belum diterima</p>
              </div>
              <span class="text-sm font-medium text-amber-600 dark:text-amber-400 tabular-nums">{{ formatRp(data.liquidity.totalReceivable) }}</span>
            </div>
            <div class="border-t border-slate-100 dark:border-slate-700 pt-3 flex justify-between items-center">
              <div>
                <span class="text-sm text-slate-500 dark:text-slate-400">Hutang Usaha</span>
                <p class="text-xs text-slate-400 dark:text-slate-500">Kewajiban belum dibayar</p>
              </div>
              <span class="text-sm font-medium text-red-600 dark:text-red-400 tabular-nums">{{ formatRp(data.liquidity.totalPayable) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 2: Aktivitas Invoice -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-5 py-3 bg-violet-50 dark:bg-violet-900/20 border-b border-slate-200 dark:border-slate-700">
          <h2 class="text-xs font-semibold text-violet-700 dark:text-violet-400 uppercase tracking-wide">Aktivitas Invoice Bulan Ini</h2>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-700">
          <div class="px-5 py-4 text-center">
            <p class="text-2xl font-bold text-slate-800 dark:text-slate-100">{{ data.invoiceActivity.totalSentThisMonth }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Dikirim</p>
          </div>
          <div class="px-5 py-4 text-center">
            <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ data.invoiceActivity.totalPaidThisMonth }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Dibayar</p>
          </div>
          <div class="px-5 py-4 text-center">
            <RouterLink
              :to="{ name: 'business-invoices', query: { status: 'OVERDUE' } }"
              class="block hover:opacity-80 transition-opacity"
            >
              <p :class="['text-2xl font-bold', data.invoiceActivity.totalOverdue > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-100']">
                {{ data.invoiceActivity.totalOverdue }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Terlambat
                <span v-if="data.invoiceActivity.totalOverdue > 0" class="block text-red-500 dark:text-red-400 font-medium">{{ formatRp(data.invoiceActivity.overdueAmount) }}</span>
              </p>
            </RouterLink>
          </div>
          <div class="px-5 py-4 text-center">
            <p class="text-2xl font-bold text-slate-800 dark:text-slate-100 tabular-nums text-lg">{{ formatRpShort(data.invoiceActivity.outstandingAmount) }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Outstanding</p>
          </div>
        </div>
      </div>

      <!-- Row 2b: P&L Detail (Phase 8) -->
      <div v-if="data.profitLossDetail" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-5 py-3 bg-teal-50 dark:bg-teal-900/20 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 class="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wide">Detail Laba Rugi</h2>
          <span v-if="data.profitLossDetail.note" class="text-xs text-amber-600 dark:text-amber-400">{{ data.profitLossDetail.note }}</span>
        </div>
        <div class="px-5 py-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <!-- Laba Kotor -->
            <div class="space-y-2.5">
              <p class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase mb-1">Laba Kotor</p>
              <div class="flex justify-between items-center text-sm">
                <span class="text-slate-500 dark:text-slate-400">Pendapatan Operasional</span>
                <span class="font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">{{ formatRp(data.profitLossDetail.operatingRevenue) }}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-slate-500 dark:text-slate-400">HPP (Cost of Goods Sold)</span>
                <span class="font-medium text-red-500 dark:text-red-400 tabular-nums">{{ formatRp(data.profitLossDetail.costOfGoodsSold) }}</span>
              </div>
              <div class="flex justify-between items-center text-sm border-t border-slate-100 dark:border-slate-700 pt-2">
                <span :class="['font-semibold', data.profitLossDetail.isGrossProfit ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400']">
                  {{ data.profitLossDetail.isGrossProfit ? 'Laba Kotor' : 'Rugi Kotor' }}
                </span>
                <span :class="['font-bold tabular-nums', data.profitLossDetail.isGrossProfit ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400']">
                  {{ formatRp(data.profitLossDetail.grossProfit) }}
                </span>
              </div>
            </div>
            <!-- Laba Bersih -->
            <div class="space-y-2.5">
              <p class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase mb-1">Laba Bersih</p>
              <div class="flex justify-between items-center text-sm">
                <span class="text-slate-500 dark:text-slate-400">Beban Operasional</span>
                <span class="font-medium text-red-500 dark:text-red-400 tabular-nums">{{ formatRp(data.profitLossDetail.operatingExpenses) }}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-slate-500 dark:text-slate-400">Pendapatan Non-Operasional</span>
                <span class="font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">{{ formatRp(data.profitLossDetail.nonOperatingIncome) }}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-slate-500 dark:text-slate-400">Beban Non-Operasional</span>
                <span class="font-medium text-red-500 dark:text-red-400 tabular-nums">{{ formatRp(data.profitLossDetail.nonOperatingExpenses) }}</span>
              </div>
              <div class="flex justify-between items-center text-sm border-t border-slate-100 dark:border-slate-700 pt-2">
                <span :class="['font-semibold', data.profitLossDetail.isNetProfit ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400']">
                  {{ data.profitLossDetail.isNetProfit ? 'Laba Bersih' : 'Rugi Bersih' }}
                </span>
                <span :class="['font-bold tabular-nums', data.profitLossDetail.isNetProfit ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400']">
                  {{ formatRp(data.profitLossDetail.netProfit) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 3: Breakdown Top Accounts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- Top Revenue -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 border-b border-slate-200 dark:border-slate-700">
            <h2 class="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Top Pendapatan</h2>
          </div>
          <div v-if="data.breakdown.topRevenueAccounts.length === 0" class="px-5 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
            Belum ada transaksi bulan ini
          </div>
          <div v-else class="divide-y divide-slate-100 dark:divide-slate-700">
            <div
              v-for="item in data.breakdown.topRevenueAccounts"
              :key="item.coaCode"
              class="px-5 py-3"
            >
              <div class="flex justify-between items-center mb-1.5">
                <span class="text-sm text-slate-700 dark:text-slate-200">
                  <span class="font-mono text-xs text-slate-400 dark:text-slate-500 mr-1.5">{{ item.coaCode }}</span>
                  {{ item.coaName }}
                </span>
                <span class="text-sm font-medium text-emerald-600 dark:text-emerald-400 tabular-nums ml-3 shrink-0">{{ formatRp(item.amount) }}</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                <div
                  class="bg-emerald-500 h-1.5 rounded-full"
                  :style="{ width: barWidth(item.amount, data!.breakdown.topRevenueAccounts) + '%' }"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Top Expense -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="px-5 py-3 bg-red-50 dark:bg-red-900/20 border-b border-slate-200 dark:border-slate-700">
            <h2 class="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide">Top Beban</h2>
          </div>
          <div v-if="data.breakdown.topExpenseAccounts.length === 0" class="px-5 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
            Belum ada transaksi bulan ini
          </div>
          <div v-else class="divide-y divide-slate-100 dark:divide-slate-700">
            <div
              v-for="item in data.breakdown.topExpenseAccounts"
              :key="item.coaCode"
              class="px-5 py-3"
            >
              <div class="flex justify-between items-center mb-1.5">
                <span class="text-sm text-slate-700 dark:text-slate-200">
                  <span class="font-mono text-xs text-slate-400 dark:text-slate-500 mr-1.5">{{ item.coaCode }}</span>
                  {{ item.coaName }}
                </span>
                <span class="text-sm font-medium text-red-600 dark:text-red-400 tabular-nums ml-3 shrink-0">{{ formatRp(item.amount) }}</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                <div
                  class="bg-red-500 h-1.5 rounded-full"
                  :style="{ width: barWidth(item.amount, data!.breakdown.topExpenseAccounts) + '%' }"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useBusinessReportsStore } from '@/stores/businessReports'
import type { KpiCoaItem } from '@/types/business'

const reportsStore = useBusinessReportsStore()
const errorMsg = ref('')

const data = computed(() => reportsStore.kpiDashboard)

onMounted(() => loadKpi())

async function loadKpi() {
  errorMsg.value = ''
  try {
    await reportsStore.fetchKpiDashboard()
  } catch {
    errorMsg.value = 'Gagal memuat KPI Dashboard.'
  }
}

function formatRp(amount: string | number) {
  const val = typeof amount === 'string' ? parseFloat(amount) : amount
  return 'Rp ' + val.toLocaleString('id-ID')
}

function formatRpShort(amount: string | number) {
  const val = typeof amount === 'string' ? parseFloat(amount) : amount
  if (val >= 1_000_000_000) return 'Rp ' + (val / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + 'M'
  if (val >= 1_000_000) return 'Rp ' + (val / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + 'jt'
  return formatRp(val)
}

function barWidth(amount: string, items: KpiCoaItem[]): number {
  const max = Math.max(...items.map((i) => parseFloat(i.amount)))
  if (max === 0) return 0
  return Math.round((parseFloat(amount) / max) * 100)
}

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
function monthName(m: number) {
  return MONTHS[m - 1] ?? m
}
</script>
