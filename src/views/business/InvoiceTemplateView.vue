<template>
  <div class="invoice-detail-page template-editor">
    <!-- Header -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div class="flex items-start gap-3">
        <RouterLink
          :to="{ name: 'business-invoices' }"
          class="mt-1 p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Kembali ke daftar invoice"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </RouterLink>
        <div>
          <span class="text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400">PENGATURAN INVOICE</span>
          <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Template invoice</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Atur tampilan invoice yang dikirim lewat email dan diunduh sebagai PDF. Perubahan berlaku untuk semua invoice setelah disimpan.
          </p>
        </div>
      </div>

      <div v-if="canEdit" class="flex items-center gap-2 shrink-0">
        <span v-if="isDirty" class="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 mr-1">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Belum disimpan
        </span>
        <button
          type="button"
          @click="isResetModalOpen = true"
          :disabled="isSaving || (!template?.isCustomized && !isDirty)"
          class="px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
        >
          Reset ke default
        </button>
        <button
          type="button"
          @click="handleSave"
          :disabled="isSaving || !isDirty || !isValid"
          class="px-4 py-2 text-sm font-semibold bg-[#2E8B57] hover:bg-[#236B43] text-white rounded-lg shadow-sm disabled:opacity-50 transition-colors"
        >
          {{ isSaving ? 'Menyimpan…' : 'Simpan template' }}
        </button>
      </div>
    </div>

    <div v-if="loadError" class="mb-4 rounded-lg bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800 text-sm text-red-800 dark:text-red-300">
      {{ loadError }}
    </div>

    <div v-if="!canEdit && !isLoading" class="mb-4 rounded-lg bg-slate-50 dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300">
      Hanya Admin atau Owner yang dapat mengubah template. Anda sedang melihat pengaturan saat ini.
    </div>

    <div v-if="isLoading" class="flex justify-center p-16"><LoadingSpinner :visible="true" /></div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-[minmax(320px,400px)_1fr] gap-6 items-start">
      <!-- ───────────── Controls ───────────── -->
      <fieldset :disabled="!canEdit" class="space-y-4 min-w-0">
        <!-- Layout -->
        <section class="panel">
          <h2 class="panel-title">Tata letak</h2>
          <div class="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tata letak">
            <button
              v-for="opt in layoutOptions"
              :key="opt.value"
              type="button"
              role="radio"
              :aria-checked="form.layout === opt.value"
              @click="form.layout = opt.value"
              :class="['layout-card', form.layout === opt.value ? 'is-active' : '']"
            >
              <!-- Mini thumbnail drawn with the current colours -->
              <span class="thumb" :style="{ background: form.backgroundColor }">
                <template v-if="opt.value === 'CLASSIC'">
                  <span class="block h-[30%]" :style="{ background: form.primaryColor }"></span>
                  <span class="block h-[10%]" :style="{ background: form.accentColor }"></span>
                  <span class="thumb-row" :style="{ background: form.primaryColor }"></span>
                </template>
                <template v-else-if="opt.value === 'MODERN'">
                  <span class="block h-[5%]" :style="{ background: form.primaryColor }"></span>
                  <span class="block mx-[10%] mt-[8%] h-[8%] w-[45%] rounded-sm" :style="{ background: form.primaryColor }"></span>
                  <span class="block mx-[10%] mt-[8%] h-[16%] rounded-sm" :style="{ background: form.accentColor }"></span>
                  <span class="block mx-[10%] mt-[10%] h-[1px]" :style="{ background: form.primaryColor }"></span>
                  <span class="block ml-auto mr-[10%] mt-[12%] h-[8%] w-[35%] rounded-sm" :style="{ background: form.primaryColor }"></span>
                </template>
                <template v-else>
                  <span class="block mx-auto mt-[12%] h-[6%] w-[40%] rounded-sm" :style="{ background: form.textColor, opacity: 0.8 }"></span>
                  <span class="block mx-[10%] mt-[10%] h-[1px]" :style="{ background: form.textColor }"></span>
                  <span class="block mx-[10%] mt-[22%] h-[1px]" :style="{ background: form.textColor, opacity: 0.4 }"></span>
                  <span class="block mx-[10%] mt-[8%] h-[1px]" :style="{ background: form.textColor, opacity: 0.4 }"></span>
                  <span class="block ml-auto mr-[10%] mt-[12%] h-[2px] w-[35%]" :style="{ background: form.primaryColor }"></span>
                </template>
              </span>
              <span class="text-xs font-semibold">{{ opt.label }}</span>
            </button>
          </div>
          <p class="panel-hint">{{ layoutOptions.find((o) => o.value === form.layout)?.hint }}</p>
        </section>

        <!-- Colours -->
        <section class="panel">
          <h2 class="panel-title">Warna</h2>
          <div class="flex flex-wrap gap-2 mb-4" aria-label="Palet siap pakai">
            <button
              v-for="preset in TEMPLATE_PRESETS"
              :key="preset.name"
              type="button"
              @click="applyPreset(preset.settings)"
              :title="preset.name"
              :aria-label="`Gunakan palet ${preset.name}`"
              :class="['preset', isPresetActive(preset.settings) ? 'is-active' : '']"
            >
              <span :style="{ background: preset.settings.primaryColor }"></span>
              <span :style="{ background: preset.settings.accentColor }"></span>
            </button>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <label v-for="c in colorFields" :key="c.key" class="block">
              <span class="field-label">{{ c.label }}</span>
              <span class="color-field" :class="{ 'has-error': !isHexColor(form[c.key]) }">
                <input type="color" :value="isHexColor(form[c.key]) ? form[c.key] : '#000000'" @input="onColorPick(c.key, $event)" :aria-label="c.label" />
                <input
                  type="text"
                  :value="form[c.key]"
                  @input="onColorText(c.key, $event)"
                  maxlength="7"
                  spellcheck="false"
                  class="font-mono"
                  :aria-label="`${c.label} (hex)`"
                />
              </span>
            </label>
          </div>
          <p v-if="lowContrast" class="mt-3 flex gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16a2 2 0 001.73 3z" /></svg>
            Kontras warna teks dan latar belakang rendah ({{ contrast.toFixed(1) }}:1). Invoice bisa sulit dibaca — disarankan minimal 4.5:1.
          </p>
        </section>

        <!-- Logo -->
        <section class="panel">
          <div class="flex items-center justify-between">
            <h2 class="panel-title !mb-0">Logo</h2>
            <ToggleSwitch v-model="form.showLogo" label="Tampilkan logo" />
          </div>
          <div v-if="!hasLogo" class="mt-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/40 rounded-lg p-2.5">
            Perusahaan belum memiliki logo.
            <RouterLink :to="{ name: settingsRouteName }" class="font-semibold text-[#2E8B57] hover:underline">Unggah logo di pengaturan bisnis</RouterLink>.
          </div>
          <div :class="['mt-4 space-y-3', !form.showLogo ? 'opacity-40 pointer-events-none' : '']">
            <div>
              <span class="field-label">Posisi</span>
              <SegmentedControl v-model="form.logoPosition" :options="logoPositionOptions" label="Posisi logo" />
            </div>
            <div>
              <span class="field-label">Ukuran</span>
              <SegmentedControl v-model="form.logoSize" :options="logoSizeOptions" label="Ukuran logo" />
            </div>
          </div>
        </section>

        <!-- Typography -->
        <section class="panel">
          <h2 class="panel-title">Tipografi & judul</h2>
          <span class="field-label">Jenis huruf</span>
          <SegmentedControl v-model="form.fontFamily" :options="fontOptions" label="Jenis huruf" />
          <label class="block mt-4">
            <span class="field-label">Judul dokumen</span>
            <input v-model="form.title" maxlength="30" class="text-input uppercase" placeholder="INVOICE" />
          </label>
          <div class="flex gap-1.5 mt-2">
            <button v-for="s in titleSuggestions" :key="s" type="button" @click="form.title = s" class="chip">{{ s }}</button>
          </div>
          <p v-if="!form.title.trim()" class="mt-1 text-xs text-red-600">Judul tidak boleh kosong.</p>
        </section>

        <!-- Content toggles -->
        <section class="panel">
          <h2 class="panel-title">Konten yang ditampilkan</h2>
          <ul class="divide-y divide-slate-100 dark:divide-slate-700">
            <li v-for="tg in contentToggles" :key="tg.key" class="flex items-center justify-between gap-3 py-2.5">
              <span>
                <span class="block text-sm text-slate-700 dark:text-slate-200">{{ tg.label }}</span>
                <span v-if="tg.hint" class="block text-xs text-slate-400">{{ tg.hint }}</span>
              </span>
              <ToggleSwitch v-model="form[tg.key]" :label="tg.label" />
            </li>
          </ul>
        </section>

        <!-- Texts -->
        <section class="panel">
          <h2 class="panel-title">Teks tambahan</h2>
          <label class="block">
            <span class="field-label flex justify-between">Syarat & ketentuan <span class="font-normal text-slate-400">{{ (form.termsText ?? '').length }}/1000</span></span>
            <textarea v-model="termsModel" maxlength="1000" rows="3" class="text-input" placeholder="mis. Pembayaran paling lambat 14 hari setelah invoice diterima."></textarea>
          </label>
          <label class="block mt-3">
            <span class="field-label flex justify-between">Teks footer <span class="font-normal text-slate-400">{{ (form.footerText ?? '').length }}/300</span></span>
            <textarea v-model="footerModel" maxlength="300" rows="2" class="text-input" placeholder="mis. Terima kasih atas kerja samanya!"></textarea>
          </label>
        </section>
      </fieldset>

      <!-- ───────────── Preview ───────────── -->
      <section class="lg:sticky lg:top-4 min-w-0">
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <div class="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-700" role="tablist" aria-label="Jenis pratinjau">
              <button
                v-for="tab in previewTabs"
                :key="tab.value"
                type="button"
                role="tab"
                :aria-selected="previewMode === tab.value"
                @click="previewMode = tab.value"
                :class="['px-3 py-1.5 text-xs font-semibold rounded-md transition-colors', previewMode === tab.value ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-300']"
              >
                {{ tab.label }}
              </button>
            </div>
            <label class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              Data
              <select v-model="previewInvoiceId" class="text-xs rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 py-1 pl-2 pr-7 max-w-[220px]">
                <option value="">Contoh invoice</option>
                <option v-for="inv in recentInvoices" :key="inv.id" :value="inv.id">{{ inv.invoiceNumber }} · {{ inv.clientName }}</option>
              </select>
            </label>
          </div>

          <div class="relative bg-slate-100 dark:bg-slate-900">
            <div v-if="previewLoading" class="absolute top-3 right-3 z-10 text-[11px] font-medium px-2 py-1 rounded-md bg-white/90 dark:bg-slate-800/90 text-slate-500 shadow-sm">Memperbarui…</div>
            <p v-if="previewError" class="absolute inset-x-0 top-0 z-10 m-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md p-2">{{ previewError }}</p>
            <iframe
              v-if="previewMode === 'PDF' && pdfUrl"
              :src="pdfUrl"
              title="Pratinjau PDF invoice"
              class="w-full h-[78vh] min-h-[560px] border-0"
            ></iframe>
            <iframe
              v-else-if="previewMode === 'EMAIL'"
              :srcdoc="emailHtml"
              sandbox=""
              title="Pratinjau email invoice"
              class="w-full h-[78vh] min-h-[560px] border-0 bg-white"
            ></iframe>
          </div>
          <p class="px-4 py-2.5 text-[11px] text-slate-400 border-t border-slate-200 dark:border-slate-700">
            {{ previewMode === 'PDF' ? 'PDF yang diunduh dari halaman detail invoice.' : 'Email yang diterima pelanggan — logo disematkan langsung di email.' }}
          </p>
        </div>
      </section>
    </div>

    <ConfirmationModal
      :is-open="isResetModalOpen"
      title="Reset template"
      message="Kembalikan semua pengaturan template ke tampilan default? Tindakan ini langsung tersimpan."
      confirm-button-text="Ya, reset"
      :is-confirming="isSaving"
      @update:is-open="isResetModalOpen = $event"
      @confirm="handleReset"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onBeforeUnmount, onMounted, reactive, ref, watch, type PropType } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { useBusinessStore } from '@/stores/business'
import { useToastStore } from '@/stores/toast'
import { BusinessService } from '@/services/business.service'
import { renderInvoicePdf } from '@/services/invoicePdf'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import {
  DEFAULT_INVOICE_TEMPLATE,
  TEMPLATE_PRESETS,
  buildSampleInvoice,
  contrastRatio,
  isHexColor,
  loadCompanyLogo,
  pickTemplateSettings,
  type LoadedLogo,
} from '@/utils/invoiceTemplate'
import type {
  Invoice,
  InvoiceFontFamily,
  InvoiceLogoPosition,
  InvoiceLogoSize,
  InvoiceTemplate,
  InvoiceTemplateLayout,
  InvoiceTemplateSettings,
} from '@/types/business'
import '@/assets/invoices.css'

// ── Small local UI primitives ────────────────────────────────────────────────
const ToggleSwitch = defineComponent({
  props: { modelValue: { type: Boolean, required: true }, label: { type: String, required: true } },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h(
        'button',
        {
          type: 'button',
          role: 'switch',
          'aria-checked': props.modelValue,
          'aria-label': props.label,
          onClick: () => emit('update:modelValue', !props.modelValue),
          class: [
            'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50',
            props.modelValue ? 'bg-[#2E8B57]' : 'bg-slate-300 dark:bg-slate-600',
          ],
        },
        [h('span', { class: ['inline-block h-4 w-4 rounded-full bg-white shadow transition-transform', props.modelValue ? 'translate-x-[18px]' : 'translate-x-0.5'] })],
      )
  },
})

const SegmentedControl = defineComponent({
  props: {
    modelValue: { type: String, required: true },
    options: { type: Array as PropType<{ value: string; label: string; sample?: string }[]>, required: true },
    label: { type: String, required: true },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h(
        'div',
        { class: 'grid gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-700/60', style: { gridTemplateColumns: `repeat(${props.options.length}, minmax(0,1fr))` }, role: 'radiogroup', 'aria-label': props.label },
        props.options.map((o) =>
          h(
            'button',
            {
              type: 'button',
              role: 'radio',
              'aria-checked': props.modelValue === o.value,
              onClick: () => emit('update:modelValue', o.value),
              class: [
                'px-2 py-1.5 text-xs font-medium rounded-md transition-colors',
                props.modelValue === o.value ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-300 hover:text-slate-800',
              ],
              style: o.sample ? { fontFamily: o.sample } : undefined,
            },
            o.label,
          ),
        ),
      )
  },
})

// ── State ────────────────────────────────────────────────────────────────────
const router = useRouter()
const businessStore = useBusinessStore()
const toast = useToastStore()

const template = ref<InvoiceTemplate | null>(null)
const form = reactive<InvoiceTemplateSettings>({ ...DEFAULT_INVOICE_TEMPLATE })
const savedSnapshot = ref(JSON.stringify(DEFAULT_INVOICE_TEMPLATE))
const isLoading = ref(true)
const isSaving = ref(false)
const isResetModalOpen = ref(false)
const loadError = ref('')

const canEdit = computed(() => ['ADMIN', 'OWNER'].includes(businessStore.myRole ?? ''))
const hasLogo = computed(() => !!businessStore.currentCompany?.logoUrl)
const settingsRouteName = computed(() => (router.hasRoute('business-settings') ? 'business-settings' : 'business-invoices'))

const isDirty = computed(() => JSON.stringify(pickTemplateSettings(form)) !== savedSnapshot.value)
const isValid = computed(
  () => !!form.title.trim() && [form.primaryColor, form.accentColor, form.backgroundColor, form.textColor].every(isHexColor),
)
const contrast = computed(() => (isHexColor(form.textColor) && isHexColor(form.backgroundColor) ? contrastRatio(form.textColor, form.backgroundColor) : 21))
const lowContrast = computed(() => contrast.value < 4.5)

// Nullable text fields bound to textareas
const termsModel = computed({ get: () => form.termsText ?? '', set: (v: string) => (form.termsText = v || null) })
const footerModel = computed({ get: () => form.footerText ?? '', set: (v: string) => (form.footerText = v || null) })

// ── Options ──────────────────────────────────────────────────────────────────
const layoutOptions: { value: InvoiceTemplateLayout; label: string; hint: string }[] = [
  { value: 'CLASSIC', label: 'Klasik', hint: 'Header berwarna penuh — tegas dan mudah dikenali.' },
  { value: 'MODERN', label: 'Modern', hint: 'Garis aksen di atas, judul besar berwarna, total disorot.' },
  { value: 'MINIMAL', label: 'Minimal', hint: 'Tanpa blok warna — bersih, hemat tinta saat dicetak.' },
]
const colorFields: { key: 'primaryColor' | 'accentColor' | 'backgroundColor' | 'textColor'; label: string }[] = [
  { key: 'primaryColor', label: 'Warna utama' },
  { key: 'accentColor', label: 'Warna aksen' },
  { key: 'backgroundColor', label: 'Latar belakang' },
  { key: 'textColor', label: 'Warna teks' },
]
const logoPositionOptions: { value: InvoiceLogoPosition; label: string }[] = [
  { value: 'LEFT', label: 'Kiri' },
  { value: 'CENTER', label: 'Tengah' },
  { value: 'RIGHT', label: 'Kanan' },
]
const logoSizeOptions: { value: InvoiceLogoSize; label: string }[] = [
  { value: 'SMALL', label: 'Kecil' },
  { value: 'MEDIUM', label: 'Sedang' },
  { value: 'LARGE', label: 'Besar' },
]
const fontOptions: { value: InvoiceFontFamily; label: string; sample: string }[] = [
  { value: 'SANS', label: 'Sans', sample: 'Helvetica, Arial, sans-serif' },
  { value: 'SERIF', label: 'Serif', sample: "Georgia, 'Times New Roman', serif" },
  { value: 'MONO', label: 'Mono', sample: "'Courier New', monospace" },
]
const titleSuggestions = ['INVOICE', 'FAKTUR', 'TAGIHAN']
const contentToggles: { key: keyof Pick<InvoiceTemplateSettings, 'showCompanyAddress' | 'showCompanyContact' | 'showNpwp' | 'showStatusBadge' | 'showItemDiscount' | 'showItemTax' | 'showBankAccount' | 'showNotes'>; label: string; hint?: string }[] = [
  { key: 'showCompanyAddress', label: 'Alamat perusahaan' },
  { key: 'showCompanyContact', label: 'Telepon & email perusahaan' },
  { key: 'showNpwp', label: 'NPWP perusahaan' },
  { key: 'showStatusBadge', label: 'Label status', hint: 'Terkirim, Lunas, Terlambat, dll.' },
  { key: 'showItemDiscount', label: 'Kolom diskon', hint: 'Hanya muncul jika ada item berdiskon.' },
  { key: 'showItemTax', label: 'Kolom PPN per item' },
  { key: 'showBankAccount', label: 'Rekening tujuan transfer' },
  { key: 'showNotes', label: 'Catatan invoice' },
]
const previewTabs = [
  { value: 'PDF' as const, label: 'PDF' },
  { value: 'EMAIL' as const, label: 'Email' },
]

// ── Colour handlers ─────────────────────────────────────────────────────────
type ColorKey = (typeof colorFields)[number]['key']
const onColorPick = (key: ColorKey, e: Event) => {
  form[key] = (e.target as HTMLInputElement).value.toUpperCase()
}
const onColorText = (key: ColorKey, e: Event) => {
  let v = (e.target as HTMLInputElement).value.trim()
  if (v && !v.startsWith('#')) v = `#${v}`
  form[key] = v.toUpperCase()
}
const applyPreset = (preset: Partial<InvoiceTemplateSettings>) => Object.assign(form, preset)
const isPresetActive = (preset: Partial<InvoiceTemplateSettings>) =>
  preset.primaryColor === form.primaryColor && preset.accentColor === form.accentColor && preset.backgroundColor === form.backgroundColor

// ── Preview ─────────────────────────────────────────────────────────────────
const previewMode = ref<'PDF' | 'EMAIL'>('PDF')
const previewInvoiceId = ref('')
const recentInvoices = ref<Invoice[]>([])
const previewInvoiceCache = new Map<string, Invoice>()
const logo = ref<LoadedLogo | null>(null)
const pdfUrl = ref('')
const emailHtml = ref('')
const previewLoading = ref(false)
const previewError = ref('')
let pdfTimer: ReturnType<typeof setTimeout> | undefined
let emailTimer: ReturnType<typeof setTimeout> | undefined
let emailRequestSeq = 0

async function getPreviewInvoice(): Promise<Invoice> {
  const id = previewInvoiceId.value
  if (!id) return buildSampleInvoice(businessStore.currentCompany)
  if (!previewInvoiceCache.has(id)) previewInvoiceCache.set(id, await BusinessService.getInvoiceById(id))
  return previewInvoiceCache.get(id)!
}

async function refreshPdf() {
  if (!isValid.value) return
  try {
    const invoice = await getPreviewInvoice()
    const doc = renderInvoicePdf(invoice, businessStore.currentCompany, { template: { ...form }, logo: logo.value })
    const url = String(doc.output('bloburl'))
    if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value.split('#')[0]!)
    pdfUrl.value = `${url}#toolbar=0&navpanes=0&view=FitH`
    previewError.value = ''
  } catch {
    previewError.value = 'Pratinjau PDF belum bisa dibuat.'
  }
}

async function refreshEmail() {
  if (!isValid.value) return
  const seq = ++emailRequestSeq
  previewLoading.value = true
  try {
    const html = await BusinessService.previewInvoiceTemplateEmail({
      ...pickTemplateSettings(form),
      ...(previewInvoiceId.value ? { invoiceId: previewInvoiceId.value } : {}),
    })
    if (seq === emailRequestSeq) {
      emailHtml.value = html
      previewError.value = ''
    }
  } catch {
    if (seq === emailRequestSeq) previewError.value = 'Pratinjau email belum bisa dimuat.'
  } finally {
    if (seq === emailRequestSeq) previewLoading.value = false
  }
}

function schedulePreview() {
  if (previewMode.value === 'PDF') {
    clearTimeout(pdfTimer)
    pdfTimer = setTimeout(refreshPdf, 300)
  } else {
    clearTimeout(emailTimer)
    emailTimer = setTimeout(refreshEmail, 500)
  }
}

watch(() => JSON.stringify(form), schedulePreview)
watch([previewMode, previewInvoiceId], schedulePreview)

// ── Load / save ─────────────────────────────────────────────────────────────
function applyTemplate(t: InvoiceTemplate) {
  template.value = t
  const settings = pickTemplateSettings(t)
  Object.assign(form, settings)
  savedSnapshot.value = JSON.stringify(settings)
}

onMounted(async () => {
  try {
    const [t] = await Promise.all([
      BusinessService.getInvoiceTemplate(),
      businessStore.currentCompany ? Promise.resolve() : businessStore.fetchMyCompany().catch(() => {}),
      businessStore.members.length ? Promise.resolve() : businessStore.fetchMembers().catch(() => {}),
    ])
    applyTemplate(t)
  } catch {
    loadError.value = 'Template belum berhasil dimuat. Menampilkan pengaturan default.'
  } finally {
    isLoading.value = false
  }
  logo.value = await loadCompanyLogo(businessStore.currentCompany)
  BusinessService.getInvoices({ limit: 15 })
    .then((r) => (recentInvoices.value = r.data))
    .catch(() => {})
  refreshPdf()
})

watch(logo, () => previewMode.value === 'PDF' && refreshPdf())

onBeforeUnmount(() => {
  clearTimeout(pdfTimer)
  clearTimeout(emailTimer)
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value.split('#')[0]!)
})

async function handleSave() {
  if (!isValid.value) return
  isSaving.value = true
  try {
    applyTemplate(await BusinessService.updateInvoiceTemplate(pickTemplateSettings(form)))
    toast.show('Template invoice tersimpan', 'success')
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
    toast.show(Array.isArray(msg) ? msg.join(', ') : msg || 'Template belum berhasil disimpan.', 'error')
  } finally {
    isSaving.value = false
  }
}

async function handleReset() {
  isSaving.value = true
  try {
    applyTemplate(await BusinessService.resetInvoiceTemplate())
    toast.show('Template dikembalikan ke default', 'success')
  } catch {
    toast.show('Template belum berhasil direset.', 'error')
  } finally {
    isSaving.value = false
    isResetModalOpen.value = false
  }
}

onBeforeRouteLeave(() => {
  if (isDirty.value && canEdit.value) {
    return window.confirm('Perubahan template belum disimpan. Tinggalkan halaman?')
  }
})
</script>

<style scoped>
@reference '../../assets/main.css';

.template-editor { width: min(100%, 1320px); }
.panel { @apply bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4; }
.panel-title { @apply text-sm font-bold text-slate-800 dark:text-slate-100 mb-3; }
.panel-hint { @apply mt-2 text-xs text-slate-500 dark:text-slate-400; }
.field-label { @apply block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5; }
.text-input { @apply w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:border-[#2E8B57] focus:ring-1 focus:ring-[#2E8B57] outline-none; }
.chip { @apply px-2 py-0.5 text-[11px] font-semibold rounded-md border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:border-[#2E8B57] hover:text-[#2E8B57]; }
.layout-card { @apply flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 transition-colors hover:border-slate-300; }
.layout-card.is-active { @apply border-[#2E8B57] text-[#2E8B57] bg-emerald-50/60 dark:bg-emerald-900/20; }
.thumb { @apply block w-full aspect-[3/4] rounded overflow-hidden border border-slate-200 dark:border-slate-600 relative; }
.thumb-row { @apply block mx-[10%] mt-[18%] h-[7%] rounded-sm; }
.preset { @apply inline-flex h-8 w-12 rounded-lg overflow-hidden border-2 border-transparent ring-1 ring-slate-200 dark:ring-slate-600 transition-all hover:scale-105; }
.preset > span { @apply flex-1; }
.preset.is-active { @apply border-slate-900 dark:border-white ring-0; }
.color-field { @apply flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-1.5 py-1; }
.color-field.has-error { @apply border-red-400; }
.color-field input[type='color'] { @apply h-7 w-7 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0; }
.color-field input[type='text'] { @apply w-full min-w-0 bg-transparent text-xs uppercase text-slate-700 dark:text-slate-200 outline-none; }
fieldset:disabled { @apply opacity-80; }
</style>
