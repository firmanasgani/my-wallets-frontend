<template>
  <div class="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Back -->
    <button @click="$router.back()" class="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group">
      <div class="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 group-hover:border-slate-300 dark:group-hover:border-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
      </div>
      <span class="text-sm font-medium">Kembali</span>
    </button>

    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div class="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-[#2E8B57] to-[#236B43]">
        <h1 class="text-xl font-bold text-white">{{ isEdit ? 'Edit Aset' : 'Tambah Aset Baru' }}</h1>
        <p class="text-emerald-100 text-sm mt-0.5">{{ isEdit ? 'Hanya nama dan catatan yang bisa diubah.' : 'Catat aset tetap atau aset tak berwujud perusahaan.' }}</p>
      </div>

      <form @submit.prevent="submit" class="p-6 space-y-5">
        <!-- Error -->
        <div v-if="errorMsg" class="rounded-md bg-red-50 dark:bg-red-900/30 p-3 border border-red-200 dark:border-red-800">
          <p class="text-sm text-red-800 dark:text-red-300">{{ errorMsg }}</p>
        </div>

        <!-- Tipe Aset -->
        <div v-if="!isEdit">
          <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Jenis Aset <span class="text-red-500">*</span></label>
          <div class="grid grid-cols-2 gap-3">
            <button type="button" @click="form.assetType = 'TANGIBLE'"
              :class="form.assetType === 'TANGIBLE' ? 'border-emerald-500 bg-indigo-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-emerald-300'"
              class="border-2 rounded-xl p-3 text-sm font-medium transition-colors text-left">
              <p class="font-semibold">Aset Tetap</p>
              <p class="text-xs opacity-70 mt-0.5">PSAK 16 (Tangible)</p>
            </button>
            <button type="button" @click="form.assetType = 'INTANGIBLE'"
              :class="form.assetType === 'INTANGIBLE' ? 'border-emerald-500 bg-indigo-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-emerald-300'"
              class="border-2 rounded-xl p-3 text-sm font-medium transition-colors text-left">
              <p class="font-semibold">Aset Tak Berwujud</p>
              <p class="text-xs opacity-70 mt-0.5">PSAK 19 (Intangible)</p>
            </button>
          </div>
        </div>

        <!-- Nama & Kode -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Nama Aset <span class="text-red-500">*</span></label>
            <input v-model="form.name" type="text" required maxlength="150" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50 dark:disabled:bg-slate-800" placeholder="cth: Laptop Dell XPS 15" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Kode Aset <span v-if="!isEdit" class="text-red-500">*</span></label>
            <input v-model="form.code" type="text" :required="!isEdit" :disabled="isEdit" maxlength="30" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50 dark:disabled:bg-slate-800" placeholder="cth: IT-001" />
          </div>
        </div>

        <template v-if="!isEdit">
          <!-- Tanggal & Harga Perolehan -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Tanggal Perolehan <span class="text-red-500">*</span></label>
              <input v-model="form.acquisitionDate" type="date" required class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Harga Perolehan (Rp) <span class="text-red-500">*</span></label>
              <input v-model.number="form.acquisitionCost" type="number" required min="0.01" step="0.01" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="cth: 25000000" />
            </div>
          </div>

          <!-- Nilai Residu & Masa Manfaat -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Nilai Residu (Rp)</label>
              <input v-model.number="form.residualValue" type="number" min="0" step="0.01" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Default: 0" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Masa Manfaat (bulan) <span class="text-red-500">*</span></label>
              <input v-model.number="form.usefulLifeMonths" type="number" required min="1" max="600" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="cth: 48" />
            </div>
          </div>

          <!-- Metode Penyusutan -->
          <div>
            <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Metode Penyusutan <span class="text-red-500">*</span></label>
            <select v-model="form.depreciationMethod" required class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="STRAIGHT_LINE">Garis Lurus (Straight Line)</option>
              <option value="DECLINING_BALANCE">Saldo Menurun (Declining Balance)</option>
              <option value="DOUBLE_DECLINING">Saldo Menurun Ganda (Double Declining)</option>
              <option value="UNITS_OF_PRODUCTION">Unit Produksi (Units of Production)</option>
            </select>
          </div>

          <!-- Total Unit (UoP) -->
          <div v-if="form.depreciationMethod === 'UNITS_OF_PRODUCTION'">
            <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Total Unit Produksi <span class="text-red-500">*</span></label>
            <input v-model.number="form.unitsTotal" type="number" required min="0.0001" step="0.0001" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Total unit sepanjang masa manfaat" />
          </div>

          <!-- COA Section -->
          <div class="border-t border-slate-200 dark:border-slate-700 pt-4">
            <p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Akun COA</p>
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">COA Nilai Perolehan Aset <span class="text-red-500">*</span></label>
                <select v-model="form.assetCoaId" required class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">-- Pilih COA --</option>
                  <option v-for="coa in assetCoas" :key="coa.id" :value="coa.id">{{ coa.code }} — {{ coa.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">COA Akumulasi Penyusutan <span class="text-red-500">*</span></label>
                <select v-model="form.accumulatedCoaId" required class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">-- Pilih COA --</option>
                  <option v-for="coa in accumulationCoas" :key="coa.id" :value="coa.id">{{ coa.code }} — {{ coa.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">COA Beban Penyusutan <span class="text-red-500">*</span></label>
                <select v-model="form.depreciationExpenseCoaId" required class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">-- Pilih COA --</option>
                  <option v-for="coa in expenseCoas" :key="coa.id" :value="coa.id">{{ coa.code }} — {{ coa.name }}</option>
                </select>
              </div>
            </div>
          </div>
        </template>

        <!-- Catatan -->
        <div>
          <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Catatan</label>
          <textarea v-model="form.notes" rows="2" maxlength="1000" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" placeholder="Catatan tambahan tentang aset ini..."></textarea>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
          <button type="button" @click="$router.back()" class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">Batal</button>
          <button type="submit" :disabled="isSaving" class="px-4 py-2 text-sm font-medium text-white bg-[#2E8B57] hover:bg-[#236B43] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {{ isSaving ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Tambah Aset') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { BusinessService } from '@/services/business.service'
import { useBusinessStore } from '@/stores/business'
import type { ChartOfAccount } from '@/types/business'

const router = useRouter()
const route = useRoute()
const businessStore = useBusinessStore()

const isEdit = computed(() => !!route.params.id)
const isSaving = ref(false)
const errorMsg = ref('')

const form = reactive({
  assetType: 'TANGIBLE' as 'TANGIBLE' | 'INTANGIBLE',
  name: '',
  code: '',
  acquisitionDate: new Date().toISOString().slice(0, 10),
  acquisitionCost: 0,
  residualValue: 0,
  usefulLifeMonths: 48,
  depreciationMethod: 'STRAIGHT_LINE' as string,
  unitsTotal: undefined as number | undefined,
  assetCoaId: '',
  accumulatedCoaId: '',
  depreciationExpenseCoaId: '',
  notes: '',
})

const allCoas = computed(() => Object.values(businessStore.chartOfAccounts).flat() as ChartOfAccount[])
const assetCoas = computed(() => allCoas.value.filter(c => c.type === 'ASSET'))
const accumulationCoas = computed(() => allCoas.value.filter(c => c.type === 'ASSET'))
const expenseCoas = computed(() => allCoas.value.filter(c => c.type === 'EXPENSE'))

function findCoa(list: ChartOfAccount[], ...keywords: string[]): string {
  const match = list.find(c => keywords.every(k => c.name.toLowerCase().includes(k.toLowerCase())))
  return match?.id ?? ''
}

function autoSelectCoas(type: 'TANGIBLE' | 'INTANGIBLE') {
  if (type === 'TANGIBLE') {
    form.assetCoaId = findCoa(assetCoas.value, 'tetap') || findCoa(assetCoas.value, 'fixed')
    form.accumulatedCoaId = findCoa(accumulationCoas.value, 'akumulasi', 'tetap') || findCoa(accumulationCoas.value, 'accumulated', 'fixed')
    form.depreciationExpenseCoaId = findCoa(expenseCoas.value, 'beban', 'penyusutan') || findCoa(expenseCoas.value, 'depreciation')
  } else {
    form.assetCoaId = findCoa(assetCoas.value, 'tak berwujud') || findCoa(assetCoas.value, 'tidak berwujud') || findCoa(assetCoas.value, 'berwujud') || findCoa(assetCoas.value, 'intangible')
    form.accumulatedCoaId = findCoa(accumulationCoas.value, 'akumulasi', 'berwujud') || findCoa(accumulationCoas.value, 'akumulasi', 'amortisasi') || findCoa(accumulationCoas.value, 'amortisasi') || findCoa(accumulationCoas.value, 'intangible')
    form.depreciationExpenseCoaId = findCoa(expenseCoas.value, 'amortisasi') || findCoa(expenseCoas.value, 'beban', 'berwujud') || findCoa(expenseCoas.value, 'intangible')
  }
}

watch(() => form.assetType, (type) => {
  if (!isEdit.value) autoSelectCoas(type)
})

async function submit() {
  errorMsg.value = ''
  isSaving.value = true
  try {
    if (isEdit.value) {
      await BusinessService.updateAsset(route.params.id as string, { name: form.name, notes: form.notes || undefined })
      router.push({ name: 'business-asset-detail', params: { id: route.params.id } })
    } else {
      const asset = await BusinessService.createAsset({
        assetType: form.assetType,
        name: form.name,
        code: form.code,
        acquisitionDate: form.acquisitionDate,
        acquisitionCost: form.acquisitionCost,
        residualValue: form.residualValue || undefined,
        usefulLifeMonths: form.usefulLifeMonths,
        depreciationMethod: form.depreciationMethod as any,
        unitsTotal: form.depreciationMethod === 'UNITS_OF_PRODUCTION' ? form.unitsTotal : undefined,
        assetCoaId: form.assetCoaId,
        accumulatedCoaId: form.accumulatedCoaId,
        depreciationExpenseCoaId: form.depreciationExpenseCoaId,
        notes: form.notes || undefined,
      })
      router.push({ name: 'business-asset-detail', params: { id: asset.id } })
    }
  } catch (e: any) {
    errorMsg.value = Array.isArray(e.response?.data?.message) ? e.response.data.message.join(', ') : (e.response?.data?.message ?? 'Terjadi kesalahan.')
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  if (!Object.keys(businessStore.chartOfAccounts).length) {
    await businessStore.fetchChartOfAccounts()
  }
  if (!isEdit.value) {
    autoSelectCoas(form.assetType)
  }
  if (isEdit.value) {
    const asset = await BusinessService.getAssetById(route.params.id as string)
    form.name = asset.name
    form.code = asset.code
    form.notes = asset.notes ?? ''
  }
})
</script>

