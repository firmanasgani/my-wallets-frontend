<template>
  <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-5">
    <!-- Back -->
    <button @click="$router.back()" class="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group">
      <div class="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 group-hover:border-slate-300 dark:group-hover:border-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
      </div>
      <span class="text-sm font-medium">Kembali</span>
    </button>

    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <svg class="w-8 h-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>

    <template v-else-if="asset">
      <!-- Header Card -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-white/20 text-white">
                  {{ asset.assetType === 'TANGIBLE' ? 'Aset Tetap' : 'Aset Tak Berwujud' }} · {{ asset.code }}
                </span>
                <span :class="statusBgClass(asset.status)" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold">
                  {{ statusLabel(asset.status) }}
                </span>
              </div>
              <h1 class="text-xl font-bold text-white">{{ asset.name }}</h1>
              <p class="text-indigo-200 text-sm mt-0.5">Diperoleh {{ formatDate(asset.acquisitionDate) }}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-indigo-200 text-xs font-medium uppercase tracking-wide">Nilai Buku</p>
              <p class="text-white text-2xl font-bold">{{ formatRp(asset.currentBookValue) }}</p>
            </div>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="px-6 py-3 bg-slate-50 dark:bg-slate-700/40 border-b border-slate-100 dark:border-slate-700">
          <div class="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span>Periode penyusutan: {{ asset.depreciationCount }}/{{ asset.usefulLifeMonths }}</span>
            <span>{{ deprProgress }}%</span>
          </div>
          <div class="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
            <div class="bg-indigo-500 h-2 rounded-full transition-all" :style="{ width: deprProgress + '%' }"></div>
          </div>
        </div>

        <!-- Meta grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 dark:divide-slate-700 border-t border-slate-100 dark:border-slate-700">
          <div class="px-5 py-4">
            <p class="text-xs text-slate-400 dark:text-slate-500">Harga Perolehan</p>
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">{{ formatRp(asset.acquisitionCost) }}</p>
          </div>
          <div class="px-5 py-4">
            <p class="text-xs text-slate-400 dark:text-slate-500">Akumulasi</p>
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">{{ formatRp(asset.totalDepreciated) }}</p>
          </div>
          <div class="px-5 py-4">
            <p class="text-xs text-slate-400 dark:text-slate-500">Nilai Residu</p>
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">{{ formatRp(asset.residualValue) }}</p>
          </div>
          <div class="px-5 py-4">
            <p class="text-xs text-slate-400 dark:text-slate-500">Metode</p>
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">{{ methodLabel(asset.depreciationMethod) }}</p>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="actionError" class="rounded-md bg-red-50 dark:bg-red-900/30 p-3 border border-red-200 dark:border-red-800">
        <p class="text-sm text-red-800 dark:text-red-300">{{ actionError }}</p>
      </div>

      <!-- Actions (Admin) -->
      <div v-if="isAdmin && asset.status === 'ACTIVE'" class="flex flex-wrap gap-2">
        <RouterLink :to="{ name: 'business-asset-edit', params: { id: asset.id } }" class="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium py-1.5 px-4 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">Edit Nama/Catatan</RouterLink>
        <button @click="showDisposeModal = true" class="bg-red-600 hover:bg-red-700 text-white font-medium py-1.5 px-4 text-sm rounded-lg transition-colors">Lepas Aset (Disposal)</button>
        <button @click="deleteAsset" :disabled="asset.depreciationCount > 0" class="bg-red-600 hover:bg-red-700 text-white font-medium py-1.5 px-4 text-sm rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed" title="Tidak bisa dihapus jika sudah ada penyusutan">Hapus</button>
      </div>

      <!-- COA Info -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">COA Terkait</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
            <p class="text-slate-400 dark:text-slate-500 mb-0.5">Nilai Perolehan</p>
            <p class="font-medium text-slate-800 dark:text-slate-100">{{ asset.assetCoa.code }} — {{ asset.assetCoa.name }}</p>
          </div>
          <div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
            <p class="text-slate-400 dark:text-slate-500 mb-0.5">Akumulasi Penyusutan</p>
            <p class="font-medium text-slate-800 dark:text-slate-100">{{ asset.accumulatedCoa.code }} — {{ asset.accumulatedCoa.name }}</p>
          </div>
          <div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
            <p class="text-slate-400 dark:text-slate-500 mb-0.5">Beban Penyusutan</p>
            <p class="font-medium text-slate-800 dark:text-slate-100">{{ asset.depreciationExpenseCoa.code }} — {{ asset.depreciationExpenseCoa.name }}</p>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div v-if="asset.notes" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Catatan</h2>
        <p class="text-sm text-slate-600 dark:text-slate-400">{{ asset.notes }}</p>
      </div>

      <!-- Depreciation History -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300">Riwayat Penyusutan</h2>
          <button @click="loadSchedule" class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Lihat Proyeksi</button>
        </div>

        <!-- UoP: Unit input -->
        <div v-if="isAdmin && asset.depreciationMethod === 'UNITS_OF_PRODUCTION' && asset.status === 'ACTIVE'" class="px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-amber-50 dark:bg-amber-900/10">
          <p class="text-xs font-medium text-amber-800 dark:text-amber-300 mb-2">Catat Unit Produksi Bulan Ini</p>
          <div class="flex items-center gap-2">
            <select v-model.number="uopMonth" class="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option v-for="m in 12" :key="m" :value="m">{{ String(m).padStart(2,'0') }}</option>
            </select>
            <input v-model.number="uopYear" type="number" min="2000" max="2100" class="w-24 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input v-model.number="uopUnits" type="number" min="0.0001" step="0.0001" class="w-32 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Unit diproduksi" />
            <button @click="recordUnits" :disabled="isSavingUop" class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1.5 px-4 text-xs rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap">{{ isSavingUop ? '...' : 'Catat' }}</button>
          </div>
        </div>

        <div v-if="isLoadingHistory" class="flex justify-center py-8">
          <svg class="w-5 h-5 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
        <div v-else-if="depreciations.length === 0" class="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
          Belum ada riwayat penyusutan.
        </div>
        <table v-else class="w-full text-sm">
          <thead class="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase">
            <tr>
              <th class="px-4 py-3 text-left">Periode</th>
              <th class="px-4 py-3 text-right">Penyusutan</th>
              <th class="px-4 py-3 text-right">Akumulasi</th>
              <th class="px-4 py-3 text-right">Nilai Buku</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
            <tr v-for="d in depreciations" :key="d.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/30">
              <td class="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{{ String(d.periodMonth).padStart(2,'0') }}/{{ d.periodYear }}</td>
              <td class="px-4 py-3 text-right text-slate-800 dark:text-slate-100">{{ formatRp(d.depreciationAmount) }}</td>
              <td class="px-4 py-3 text-right text-slate-800 dark:text-slate-100">{{ formatRp(d.accumulatedDepreciation) }}</td>
              <td class="px-4 py-3 text-right font-semibold text-indigo-600 dark:text-indigo-400">{{ formatRp(d.bookValue) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Schedule Modal -->
      <Teleport to="body">
        <div v-if="showSchedule" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showSchedule = false">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 class="font-semibold text-slate-800 dark:text-slate-100">Proyeksi Jadwal Penyusutan</h3>
              <button @click="showSchedule = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
            </div>
            <div class="overflow-y-auto flex-1">
              <table class="w-full text-sm">
                <thead class="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase sticky top-0">
                  <tr>
                    <th class="px-4 py-3 text-left">Periode</th>
                    <th class="px-4 py-3 text-right">Penyusutan</th>
                    <th class="px-4 py-3 text-right">Nilai Buku</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                  <tr v-for="s in schedule" :key="`${s.periodYear}-${s.periodMonth}`" class="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td class="px-4 py-2 font-medium text-slate-700 dark:text-slate-300">{{ String(s.periodMonth).padStart(2,'0') }}/{{ s.periodYear }}</td>
                    <td class="px-4 py-2 text-right text-slate-800 dark:text-slate-100">{{ formatRp(s.depreciationAmount) }}</td>
                    <td class="px-4 py-2 text-right font-semibold text-indigo-600 dark:text-indigo-400">{{ formatRp(s.bookValue) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Dispose Modal -->
        <div v-if="showDisposeModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showDisposeModal = false">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md">
            <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 class="font-semibold text-slate-800 dark:text-slate-100">Pelepasan Aset</h3>
              <button @click="showDisposeModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
            </div>
            <form @submit.prevent="disposeAsset" class="p-6 space-y-4">
              <div v-if="disposeError" class="text-sm text-red-500">{{ disposeError }}</div>
              <div>
                <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Tanggal Pelepasan <span class="text-red-500">*</span></label>
                <input v-model="disposeForm.disposalDate" type="date" required class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Nilai Penerimaan (Rp) <span class="text-red-500">*</span></label>
                <input v-model.number="disposeForm.disposalAmount" type="number" required min="0" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0 jika dibuang/scrapped" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">COA Penerimaan (Kas/Bank) <span class="text-red-500">*</span></label>
                <select v-model="disposeForm.disposalCoaId" required class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">-- Pilih COA --</option>
                  <option v-for="coa in cashCoas" :key="coa.id" :value="coa.id">{{ coa.code }} — {{ coa.name }}</option>
                </select>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">Jurnal pelepasan otomatis dibuat oleh sistem.</p>
              <div class="flex justify-end gap-3 pt-2">
                <button type="button" @click="showDisposeModal = false" class="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium py-1.5 px-4 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">Batal</button>
                <button type="submit" :disabled="isDisposing" class="bg-red-600 hover:bg-red-700 text-white font-medium py-1.5 px-4 text-sm rounded-lg transition-colors disabled:opacity-50">{{ isDisposing ? 'Memproses...' : 'Lepas Aset' }}</button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { BusinessService } from '@/services/business.service'
import { useBusinessStore } from '@/stores/business'
import type { Asset, AssetDepreciation, DepreciationScheduleItem, ChartOfAccount } from '@/types/business'

const route = useRoute()
const router = useRouter()
const businessStore = useBusinessStore()

const isAdmin = computed(() => ['OWNER', 'ADMIN'].includes(businessStore.myRole ?? ''))

const asset = ref<Asset | null>(null)
const depreciations = ref<AssetDepreciation[]>([])
const schedule = ref<DepreciationScheduleItem[]>([])
const isLoading = ref(false)
const isLoadingHistory = ref(false)
const actionError = ref('')

// Schedule
const showSchedule = ref(false)
async function loadSchedule() {
  showSchedule.value = true
  if (schedule.value.length) return
  const data = await BusinessService.getDepreciationSchedule(route.params.id as string)
  schedule.value = data.projectedSchedule
}

// UoP
const now = new Date()
const uopMonth = ref(now.getMonth() + 1)
const uopYear = ref(now.getFullYear())
const uopUnits = ref<number | undefined>(undefined)
const isSavingUop = ref(false)
async function recordUnits() {
  if (!uopUnits.value) return
  isSavingUop.value = true
  try {
    await BusinessService.recordUnitProduction(asset.value!.id, { year: uopYear.value, month: uopMonth.value, unitsProduced: uopUnits.value })
    await loadAsset()
  } catch (e: any) {
    actionError.value = e.response?.data?.message ?? 'Gagal mencatat unit produksi.'
  } finally {
    isSavingUop.value = false
  }
}

// Dispose
const showDisposeModal = ref(false)
const isDisposing = ref(false)
const disposeError = ref('')
const disposeForm = reactive({ disposalDate: new Date().toISOString().slice(0, 10), disposalAmount: 0, disposalCoaId: '' })
const allCoas = computed(() => Object.values(businessStore.chartOfAccounts).flat() as ChartOfAccount[])
const cashCoas = computed(() => allCoas.value.filter(c => c.type === 'ASSET'))

async function disposeAsset() {
  disposeError.value = ''
  isDisposing.value = true
  try {
    await BusinessService.disposeAsset(asset.value!.id, {
      disposalDate: disposeForm.disposalDate,
      disposalAmount: disposeForm.disposalAmount,
      disposalCoaId: disposeForm.disposalCoaId,
    })
    showDisposeModal.value = false
    await loadAsset()
  } catch (e: any) {
    disposeError.value = e.response?.data?.message ?? 'Gagal melakukan disposal.'
  } finally {
    isDisposing.value = false
  }
}

// Delete
async function deleteAsset() {
  if (!confirm('Hapus aset ini? Tindakan tidak dapat diurungkan.')) return
  try {
    await BusinessService.deleteAsset(asset.value!.id)
    router.push({ name: 'business-assets' })
  } catch (e: any) {
    actionError.value = e.response?.data?.message ?? 'Gagal menghapus aset.'
  }
}

// Load
async function loadAsset() {
  isLoading.value = true
  try {
    asset.value = await BusinessService.getAssetById(route.params.id as string)
  } catch {
    actionError.value = 'Aset tidak ditemukan.'
  } finally {
    isLoading.value = false
  }
}

const deprProgress = computed(() => {
  if (!asset.value) return 0
  return Math.min(100, Math.round((asset.value.depreciationCount / asset.value.usefulLifeMonths) * 100))
})

function statusBgClass(status: string) {
  return { ACTIVE: 'bg-emerald-500/20 text-emerald-100', FULLY_DEPRECIATED: 'bg-amber-500/20 text-amber-100', DISPOSED: 'bg-slate-500/20 text-slate-200' }[status] ?? ''
}
function statusLabel(status: string) {
  return { ACTIVE: 'Aktif', FULLY_DEPRECIATED: 'Fully Depreciated', DISPOSED: 'Disposed' }[status] ?? status
}
function methodLabel(method: string) {
  return { STRAIGHT_LINE: 'Garis Lurus', DECLINING_BALANCE: 'Saldo Menurun', DOUBLE_DECLINING: 'Double Declining', UNITS_OF_PRODUCTION: 'Unit Produksi' }[method] ?? method
}
function formatRp(val: string | number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val))
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

onMounted(async () => {
  await Promise.all([businessStore.fetchMembers(), businessStore.fetchChartOfAccounts()])
  await loadAsset()
  isLoadingHistory.value = true
  try {
    depreciations.value = await BusinessService.getDepreciationHistory(route.params.id as string)
  } finally {
    isLoadingHistory.value = false
  }
})
</script>
