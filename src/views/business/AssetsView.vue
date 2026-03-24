<template>
  <div class="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-6 flex justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Manajemen Aset</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Aset tetap (PSAK 16) dan aset tak berwujud (PSAK 19).</p>
      </div>
      <RouterLink v-if="isAdmin" :to="{ name: 'business-asset-create' }" class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-1.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Tambah Aset
      </RouterLink>
    </div>

    <!-- Error -->
    <div v-if="errorMsg" class="mb-4 rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800">
      <p class="text-sm text-red-800 dark:text-red-300">{{ errorMsg }}</p>
    </div>

    <!-- Run Depreciation Panel -->
    <div v-if="isAdmin" class="mb-5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4">
      <div class="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div class="flex items-start gap-3">
          <div class="mt-0.5 w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-800/60 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-indigo-600 dark:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-indigo-800 dark:text-indigo-200">Jalankan Penyusutan Manual</p>
            <p class="text-xs text-indigo-500 dark:text-indigo-400 mt-0.5">Sistem otomatis berjalan tiap tanggal 1. Gunakan ini untuk run manual jika diperlukan.</p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <div class="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-lg px-2.5 py-1.5">
            <select v-model="deprMonth" class="bg-transparent text-slate-800 dark:text-slate-100 text-sm focus:outline-none cursor-pointer">
              <option v-for="m in 12" :key="m" :value="m">{{ String(m).padStart(2,'0') }}</option>
            </select>
            <span class="text-slate-300 dark:text-slate-600">/</span>
            <input v-model.number="deprYear" type="number" min="2000" max="2100"
              class="bg-transparent text-slate-800 dark:text-slate-100 text-sm w-16 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
          </div>
          <button @click="runDepreciation" :disabled="isRunningDepr"
            class="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium py-1.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1.5">
            <svg v-if="isRunningDepr" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {{ isRunningDepr ? 'Memproses...' : 'Jalankan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Run Result -->
    <div v-if="deprResult" class="mb-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
      <p class="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-1">
        Penyusutan {{ String(deprResult.period.month).padStart(2,'0') }}/{{ deprResult.period.year }} selesai
      </p>
      <p class="text-xs text-emerald-700 dark:text-emerald-300">
        Diproses: {{ deprResult.processed }} aset — Dilewati: {{ deprResult.skipped }} aset
      </p>
    </div>

    <!-- Filter -->
    <div class="mb-4 flex items-center gap-2 flex-wrap">
      <button v-for="s in STATUS_FILTERS" :key="s.value"
        @click="statusFilter = s.value"
        :class="statusFilter === s.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-indigo-400'"
        class="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors">
        {{ s.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-16">
      <svg class="w-8 h-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredAssets.length === 0" class="text-center py-16 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      <svg class="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
      </svg>
      <p class="font-medium">Belum ada aset</p>
      <p class="text-sm mt-1" v-if="isAdmin">Klik "Tambah Aset" untuk mencatat aset pertama.</p>
    </div>

    <!-- Asset Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <RouterLink
        v-for="asset in filteredAssets" :key="asset.id"
        :to="{ name: 'business-asset-detail', params: { id: asset.id } }"
        class="block bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all p-5 group"
      >
        <div class="flex items-start justify-between gap-2 mb-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-xs font-medium"
                :class="asset.assetType === 'TANGIBLE' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'">
                {{ asset.assetType === 'TANGIBLE' ? 'Tetap' : 'Tak Berwujud' }}
              </span>
              <span class="text-xs text-slate-400 dark:text-slate-500 font-mono">{{ asset.code }}</span>
            </div>
            <h3 class="mt-1 font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">{{ asset.name }}</h3>
          </div>
          <span :class="statusClass(asset.status)" class="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium">{{ statusLabel(asset.status) }}</span>
        </div>

        <div class="space-y-1.5 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-500 dark:text-slate-400">Nilai Perolehan</span>
            <span class="font-medium text-slate-800 dark:text-slate-100">{{ formatRp(asset.acquisitionCost) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500 dark:text-slate-400">Nilai Buku</span>
            <span class="font-semibold text-indigo-600 dark:text-indigo-400">{{ formatRp(asset.currentBookValue) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500 dark:text-slate-400">Akumulasi</span>
            <span class="font-medium text-slate-800 dark:text-slate-100">{{ formatRp(asset.totalDepreciated) }}</span>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="mt-3">
          <div class="flex justify-between text-xs text-slate-400 dark:text-slate-500 mb-1">
            <span>{{ asset.depreciationCount }}/{{ asset.usefulLifeMonths }} periode</span>
            <span>{{ deprProgress(asset) }}%</span>
          </div>
          <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
            <div class="bg-indigo-500 h-1.5 rounded-full transition-all" :style="{ width: deprProgress(asset) + '%' }"></div>
          </div>
        </div>

        <div class="mt-3 text-xs text-slate-400 dark:text-slate-500">
          Metode: {{ methodLabel(asset.depreciationMethod) }} · {{ formatDate(asset.acquisitionDate) }}
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { BusinessService } from '@/services/business.service'
import { useBusinessStore } from '@/stores/business'
import type { Asset, AssetStatus, RunDepreciationResponse } from '@/types/business'

const businessStore = useBusinessStore()
const isAdmin = computed(() => ['OWNER', 'ADMIN'].includes(businessStore.myRole ?? ''))

const assets = ref<Asset[]>([])
const isLoading = ref(false)
const errorMsg = ref('')
const statusFilter = ref<string>('')

const STATUS_FILTERS = [
  { value: '', label: 'Semua' },
  { value: 'ACTIVE', label: 'Aktif' },
  { value: 'FULLY_DEPRECIATED', label: 'Fully Depreciated' },
  { value: 'DISPOSED', label: 'Disposed' },
]

const filteredAssets = computed(() =>
  statusFilter.value ? assets.value.filter(a => a.status === statusFilter.value) : assets.value
)

// Run Depreciation
const now = new Date()
const deprMonth = ref(now.getMonth() + 1)
const deprYear = ref(now.getFullYear())
const isRunningDepr = ref(false)
const deprResult = ref<RunDepreciationResponse | null>(null)

async function runDepreciation() {
  isRunningDepr.value = true
  deprResult.value = null
  try {
    deprResult.value = await BusinessService.runDepreciation({ year: deprYear.value, month: deprMonth.value })
    await loadAssets()
  } catch (e: any) {
    errorMsg.value = e.response?.data?.message ?? 'Gagal menjalankan penyusutan.'
  } finally {
    isRunningDepr.value = false
  }
}

async function loadAssets() {
  isLoading.value = true
  try {
    assets.value = await BusinessService.getAssets()
  } catch {
    errorMsg.value = 'Gagal memuat daftar aset.'
  } finally {
    isLoading.value = false
  }
}

function deprProgress(asset: Asset): number {
  if (!asset.usefulLifeMonths) return 0
  return Math.min(100, Math.round((asset.depreciationCount / asset.usefulLifeMonths) * 100))
}

function statusClass(status: AssetStatus) {
  return {
    ACTIVE: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    FULLY_DEPRECIATED: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    DISPOSED: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
  }[status]
}

function statusLabel(status: AssetStatus) {
  return { ACTIVE: 'Aktif', FULLY_DEPRECIATED: 'Fully Depreciated', DISPOSED: 'Disposed' }[status]
}

function methodLabel(method: string) {
  return { STRAIGHT_LINE: 'Garis Lurus', DECLINING_BALANCE: 'Saldo Menurun', DOUBLE_DECLINING: 'Double Declining', UNITS_OF_PRODUCTION: 'Unit Produksi' }[method] ?? method
}

function formatRp(val: string | number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val))
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(async () => {
  await businessStore.fetchMembers()
  await loadAssets()
})
</script>

