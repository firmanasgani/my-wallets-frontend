<template>
  <div class="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Konfigurasi Pajak</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Atur jenis PPh & aturan saran pajak otomatis untuk jurnal.</p>
      </div>
    </div>

    <!-- Error -->
    <div v-if="errorMsg" class="rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800">
      <p class="text-sm font-medium text-red-800 dark:text-red-300">{{ errorMsg }}</p>
    </div>

    <!-- ═══ TAX CONFIGS ═══ -->
    <section>
      <div class="flex justify-between items-center mb-3">
        <div>
          <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">Jenis Pajak (PPh)</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">Daftar pajak yang berlaku untuk perusahaan ini.</p>
        </div>
        <button v-if="isAdmin" @click="openTaxForm()" class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-1.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">+ Tambah Pajak</button>
      </div>

      <div v-if="isLoadingTax" class="flex justify-center py-10">
        <svg class="w-6 h-6 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>

      <div v-else-if="taxConfigs.length === 0" class="text-center py-10 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        Belum ada konfigurasi pajak. Tambahkan jenis PPh yang relevan.
      </div>

      <div v-else class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
            <tr>
              <th class="px-4 py-3 text-left">Nama</th>
              <th class="px-4 py-3 text-left">Jenis</th>
              <th class="px-4 py-3 text-right">Tarif</th>
              <th class="px-4 py-3 text-center">Status</th>
              <th v-if="isAdmin" class="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
            <tr v-for="tax in taxConfigs" :key="tax.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
              <td class="px-4 py-3">
                <p class="font-medium text-slate-800 dark:text-slate-100">{{ tax.name }}</p>
                <p v-if="tax.description" class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{{ tax.description }}</p>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">{{ tax.type }}</span>
              </td>
              <td class="px-4 py-3 text-right font-mono font-medium text-slate-800 dark:text-slate-100">{{ tax.rate }}%</td>
              <td class="px-4 py-3 text-center">
                <span :class="tax.isActive ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium">
                  {{ tax.isActive ? 'Aktif' : 'Nonaktif' }}
                </span>
              </td>
              <td v-if="isAdmin" class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openTaxForm(tax)" class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Edit</button>
                  <button @click="confirmDeleteTax(tax)" class="text-sm text-red-500 hover:underline">Hapus</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ═══ CUSTOM SUGGESTION RULES ═══ -->
    <section>
      <div class="flex justify-between items-center mb-3">
        <div>
          <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">Aturan Saran Pajak Kustom</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">Aturan otomatis untuk menyarankan pajak saat mengisi jurnal.</p>
        </div>
        <button v-if="isAdmin && taxConfigs.length > 0" @click="openRuleForm()" class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-1.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">+ Tambah Aturan</button>
      </div>

      <div v-if="isLoadingRules" class="flex justify-center py-10">
        <svg class="w-6 h-6 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>

      <div v-else-if="suggestionRules.length === 0" class="text-center py-10 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        Belum ada aturan kustom.
        <span v-if="taxConfigs.length === 0"> Tambahkan konfigurasi pajak terlebih dahulu.</span>
      </div>

      <div v-else class="space-y-3">
        <div v-for="rule in suggestionRules" :key="rule.id"
          class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span class="font-medium text-slate-800 dark:text-slate-100 text-sm">{{ rule.taxConfig.name }}</span>
                <span class="text-sm text-slate-500 dark:text-slate-400">({{ rule.taxConfig.rate }}%)</span>
                <span :class="rule.isActive ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'"
                  class="px-1.5 py-0.5 rounded text-sm font-medium">
                  {{ rule.isActive ? 'Aktif' : 'Nonaktif' }}
                </span>
                <span class="px-1.5 py-0.5 rounded text-sm font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
                  Prioritas {{ rule.priority }}
                </span>
              </div>
              <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                <span v-if="rule.triggerContactType">Tipe kontak: <strong class="text-slate-700 dark:text-slate-300">{{ rule.triggerContactType }}</strong></span>
                <span v-if="rule.minAmount">Min. amount: <strong class="text-slate-700 dark:text-slate-300">{{ formatRp(rule.minAmount) }}</strong></span>
                <span v-if="rule.triggerKeywords?.length">Keywords: <strong class="text-slate-700 dark:text-slate-300">{{ rule.triggerKeywords.join(', ') }}</strong></span>
              </div>
              <p v-if="rule.note" class="mt-1 text-sm text-slate-400 dark:text-slate-500 italic">{{ rule.note }}</p>
            </div>
            <div v-if="isAdmin" class="flex items-center gap-2 shrink-0">
              <button @click="openRuleForm(rule)" class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Edit</button>
              <button @click="confirmDeleteRule(rule)" class="text-sm text-red-500 hover:underline">Hapus</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ MODAL: Tax Config Form ═══ -->
    <Teleport to="body">
      <div v-if="showTaxForm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showTaxForm = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md">
          <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">{{ editingTax ? 'Edit Pajak' : 'Tambah Pajak' }}</h3>
            <button @click="showTaxForm = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
          </div>
          <form @submit.prevent="saveTaxConfig" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Jenis Pajak <span class="text-red-500">*</span></label>
              <select v-model="taxForm.type" required class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" :disabled="!!editingTax">
                <option v-for="t in TAX_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Nama Deskriptif <span class="text-red-500">*</span></label>
              <input v-model="taxForm.name" type="text" required maxlength="100" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="cth: PPh Pasal 23 - Jasa" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Tarif (%) <span class="text-red-500">*</span></label>
              <input v-model.number="taxForm.rate" type="number" required min="0" max="100" step="0.0001" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="cth: 2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Deskripsi</label>
              <textarea v-model="taxForm.description" rows="2" maxlength="500" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" placeholder="Keterangan tambahan..."></textarea>
            </div>
            <div class="flex items-center gap-2">
              <input v-model="taxForm.isActive" type="checkbox" id="taxActive" class="w-4 h-4 rounded" />
              <label for="taxActive" class="text-sm text-slate-700 dark:text-slate-300">Aktif</label>
            </div>
            <div v-if="formError" class="text-sm text-red-500">{{ formError }}</div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="showTaxForm = false" class="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium py-1.5 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">Batal</button>
              <button type="submit" :disabled="isSaving" class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-1.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{{ isSaving ? 'Menyimpan...' : 'Simpan' }}</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal: Rule Form -->
      <div v-if="showRuleForm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showRuleForm = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
            <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">{{ editingRule ? 'Edit Aturan' : 'Tambah Aturan Kustom' }}</h3>
            <button @click="showRuleForm = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
          </div>
          <form @submit.prevent="saveRule" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Pajak <span class="text-red-500">*</span></label>
              <select v-model="ruleForm.taxConfigId" required class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="">-- Pilih Pajak --</option>
                <option v-for="t in taxConfigs" :key="t.id" :value="t.id">{{ t.name }} ({{ t.rate }}%)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Tipe Kontak Trigger</label>
              <select v-model="ruleForm.triggerContactType" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="">-- Semua --</option>
                <option value="CUSTOMER">Customer</option>
                <option value="VENDOR">Vendor</option>
                <option value="EMPLOYEE">Employee</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Keywords (pisahkan dengan koma)</label>
              <input v-model="ruleForm.triggerKeywordsRaw" type="text" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="cth: jasa, konsultan, sewa" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Minimum Amount (Rp)</label>
              <input v-model.number="ruleForm.minAmount" type="number" min="0" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="cth: 1000000" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Prioritas</label>
              <input v-model.number="ruleForm.priority" type="number" min="0" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="0" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Catatan / Alasan</label>
              <textarea v-model="ruleForm.note" rows="2" maxlength="500" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" placeholder="Tampil sebagai alasan saran pajak..."></textarea>
            </div>
            <div class="flex items-center gap-2">
              <input v-model="ruleForm.isActive" type="checkbox" id="ruleActive" class="w-4 h-4 rounded" />
              <label for="ruleActive" class="text-sm text-slate-700 dark:text-slate-300">Aktif</label>
            </div>
            <div v-if="formError" class="text-sm text-red-500">{{ formError }}</div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="showRuleForm = false" class="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium py-1.5 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">Batal</button>
              <button type="submit" :disabled="isSaving" class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-1.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{{ isSaving ? 'Menyimpan...' : 'Simpan' }}</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Confirm Delete -->
      <div v-if="showConfirmDelete" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6">
          <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">Konfirmasi Hapus</h3>
          <p class="text-sm text-slate-600 dark:text-slate-400 mb-5">{{ deleteConfirmMsg }}</p>
          <div class="flex justify-end gap-3">
            <button @click="showConfirmDelete = false" class="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium py-1.5 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">Batal</button>
            <button @click="executeDelete" :disabled="isSaving" class="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1.5 px-4 rounded-lg transition-colors disabled:opacity-50">{{ isSaving ? 'Menghapus...' : 'Hapus' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { BusinessService } from '@/services/business.service'
import { useBusinessStore } from '@/stores/business'
import type { TaxConfig, TaxSuggestionRule } from '@/types/business'

const businessStore = useBusinessStore()
const isAdmin = computed(() => ['OWNER', 'ADMIN'].includes(businessStore.myRole ?? ''))

const taxConfigs = ref<TaxConfig[]>([])
const suggestionRules = ref<TaxSuggestionRule[]>([])
const isLoadingTax = ref(false)
const isLoadingRules = ref(false)
const isSaving = ref(false)
const errorMsg = ref('')
const formError = ref('')

// ── Tax Form ──────────────────────────────────────────────────────────────────
const showTaxForm = ref(false)
const editingTax = ref<TaxConfig | null>(null)
const taxForm = reactive({ type: 'PPH_23' as string, name: '', rate: 0, isActive: true, description: '' })

const TAX_TYPES = [
  { value: 'PPN', label: 'PPN — Pajak Pertambahan Nilai' },
  { value: 'PPH_21', label: 'PPh 21 — Penghasilan orang pribadi' },
  { value: 'PPH_22', label: 'PPh 22 — Impor / pengadaan' },
  { value: 'PPH_23', label: 'PPh 23 — Jasa / sewa / royalti ke badan' },
  { value: 'PPH_4_2', label: 'PPh 4(2) — Final: sewa tanah/bangunan/konstruksi' },
  { value: 'PPH_15', label: 'PPh 15 — Pelayaran / penerbangan' },
]

function openTaxForm(tax?: TaxConfig) {
  editingTax.value = tax ?? null
  formError.value = ''
  if (tax) {
    Object.assign(taxForm, { type: tax.type, name: tax.name, rate: parseFloat(tax.rate), isActive: tax.isActive, description: tax.description ?? '' })
  } else {
    Object.assign(taxForm, { type: 'PPH_23', name: '', rate: 0, isActive: true, description: '' })
  }
  showTaxForm.value = true
}

async function saveTaxConfig() {
  formError.value = ''
  isSaving.value = true
  try {
    if (editingTax.value) {
      const updated = await BusinessService.updateTaxConfig(editingTax.value.id, {
        name: taxForm.name, rate: taxForm.rate, isActive: taxForm.isActive, description: taxForm.description || undefined,
      })
      const idx = taxConfigs.value.findIndex(t => t.id === editingTax.value!.id)
      if (idx !== -1) taxConfigs.value[idx] = updated
    } else {
      const created = await BusinessService.createTaxConfig({
        type: taxForm.type as any, name: taxForm.name, rate: taxForm.rate,
        isActive: taxForm.isActive, description: taxForm.description || undefined,
      })
      taxConfigs.value.push(created)
    }
    showTaxForm.value = false
  } catch (e: any) {
    formError.value = Array.isArray(e.response?.data?.message) ? e.response.data.message.join(', ') : (e.response?.data?.message ?? 'Terjadi kesalahan.')
  } finally {
    isSaving.value = false
  }
}

// ── Rule Form ─────────────────────────────────────────────────────────────────
const showRuleForm = ref(false)
const editingRule = ref<TaxSuggestionRule | null>(null)
const ruleForm = reactive({ taxConfigId: '', triggerContactType: '', triggerKeywordsRaw: '', minAmount: undefined as number | undefined, priority: 0, note: '', isActive: true })

function openRuleForm(rule?: TaxSuggestionRule) {
  editingRule.value = rule ?? null
  formError.value = ''
  if (rule) {
    Object.assign(ruleForm, {
      taxConfigId: rule.taxConfigId,
      triggerContactType: rule.triggerContactType ?? '',
      triggerKeywordsRaw: rule.triggerKeywords?.join(', ') ?? '',
      minAmount: rule.minAmount ? parseFloat(rule.minAmount) : undefined,
      priority: rule.priority,
      note: rule.note ?? '',
      isActive: rule.isActive,
    })
  } else {
    Object.assign(ruleForm, { taxConfigId: '', triggerContactType: '', triggerKeywordsRaw: '', minAmount: undefined, priority: 0, note: '', isActive: true })
  }
  showRuleForm.value = true
}

async function saveRule() {
  formError.value = ''
  if (!ruleForm.taxConfigId) { formError.value = 'Pilih jenis pajak.'; return }
  isSaving.value = true
  const keywords = ruleForm.triggerKeywordsRaw.split(',').map(k => k.trim()).filter(Boolean)
  try {
    const payload: any = {
      taxConfigId: ruleForm.taxConfigId,
      triggerContactType: ruleForm.triggerContactType || undefined,
      triggerKeywords: keywords.length ? keywords : undefined,
      minAmount: ruleForm.minAmount || undefined,
      priority: ruleForm.priority,
      note: ruleForm.note || undefined,
      isActive: ruleForm.isActive,
    }
    if (editingRule.value) {
      const updated = await BusinessService.updateTaxSuggestionRule(editingRule.value.id, payload)
      const idx = suggestionRules.value.findIndex(r => r.id === editingRule.value!.id)
      if (idx !== -1) suggestionRules.value[idx] = updated
    } else {
      const created = await BusinessService.createTaxSuggestionRule(payload)
      suggestionRules.value.push(created)
    }
    showRuleForm.value = false
  } catch (e: any) {
    formError.value = Array.isArray(e.response?.data?.message) ? e.response.data.message.join(', ') : (e.response?.data?.message ?? 'Terjadi kesalahan.')
  } finally {
    isSaving.value = false
  }
}

// ── Delete ─────────────────────────────────────────────────────────────────────
const showConfirmDelete = ref(false)
const deleteConfirmMsg = ref('')
let deleteTarget: { type: 'tax' | 'rule'; id: string } | null = null

function confirmDeleteTax(tax: TaxConfig) {
  deleteTarget = { type: 'tax', id: tax.id }
  deleteConfirmMsg.value = `Hapus pajak "${tax.name}"? Aturan kustom yang menggunakan pajak ini juga akan dihapus.`
  showConfirmDelete.value = true
}

function confirmDeleteRule(rule: TaxSuggestionRule) {
  deleteTarget = { type: 'rule', id: rule.id }
  deleteConfirmMsg.value = `Hapus aturan kustom untuk "${rule.taxConfig.name}"?`
  showConfirmDelete.value = true
}

async function executeDelete() {
  if (!deleteTarget) return
  isSaving.value = true
  try {
    if (deleteTarget.type === 'tax') {
      await BusinessService.deleteTaxConfig(deleteTarget.id)
      taxConfigs.value = taxConfigs.value.filter(t => t.id !== deleteTarget!.id)
      suggestionRules.value = suggestionRules.value.filter(r => r.taxConfigId !== deleteTarget!.id)
    } else {
      await BusinessService.deleteTaxSuggestionRule(deleteTarget.id)
      suggestionRules.value = suggestionRules.value.filter(r => r.id !== deleteTarget!.id)
    }
    showConfirmDelete.value = false
  } catch (e: any) {
    errorMsg.value = e.response?.data?.message ?? 'Gagal menghapus.'
    showConfirmDelete.value = false
  } finally {
    isSaving.value = false
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatRp(val: string | number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val))
}

onMounted(async () => {
  await businessStore.fetchMembers()
  isLoadingTax.value = true
  isLoadingRules.value = true
  try {
    const [tax, rules] = await Promise.all([BusinessService.getTaxConfigs(), BusinessService.getTaxSuggestionRules()])
    taxConfigs.value = tax
    suggestionRules.value = rules
  } catch {
    errorMsg.value = 'Gagal memuat konfigurasi pajak.'
  } finally {
    isLoadingTax.value = false
    isLoadingRules.value = false
  }
})
</script>

