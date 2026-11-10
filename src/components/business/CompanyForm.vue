<template>
  <section class="company-card"><header class="card-heading"><div><span class="card-overline">INFORMASI BISNIS</span><h2>{{ !initialData ? 'Daftarkan perusahaan' : isEditing ? 'Edit profil perusahaan' : 'Profil perusahaan' }}</h2><p>{{ isEditing ? 'Perbarui informasi yang digunakan dalam pembukuan dan dokumen.' : 'Informasi utama dan pengaturan pajak perusahaan.' }}</p></div><button v-if="initialData && !isEditing && !viewerMode" type="button" class="edit-button" @click="startEditing">Edit profil</button></header>
    <div v-if="isDemo" class="demo-notice" role="alert">Fitur edit profil perusahaan tidak tersedia untuk akun demo.</div>
    <form v-if="isEditing" class="company-form" @submit.prevent="handleSubmit"><div class="form-intro"><span class="card-overline">IDENTITAS DAN KONTAK</span><h3>Informasi perusahaan</h3><p>Kolom bertanda * wajib diisi.</p></div><div class="form-grid"><div class="field"><label for="companyName">Nama perusahaan <span>*</span></label><input id="companyName" v-model="formData.name" type="text" required placeholder="Contoh: PT. Maju Bersama" /></div><div class="field"><label for="npwp">NPWP <small>Opsional</small></label><input id="npwp" v-model="formData.npwp" type="text" placeholder="00.000.000.0-000.000" /></div><div class="field"><label for="phone">Nomor telepon <small>Opsional</small></label><input id="phone" v-model="formData.phone" type="text" placeholder="08123456789" /></div><div class="field"><label for="email">Email <small>Opsional</small></label><input id="email" v-model="formData.email" type="email" placeholder="info@perusahaan.com" /></div><div class="field"><label for="currency">Mata uang dasar</label><input id="currency" v-model="formData.currency" type="text" readonly maxlength="5" /></div><div class="field full"><label for="address">Alamat perusahaan <small>Opsional</small></label><textarea id="address" v-model="formData.address" rows="3" placeholder="Alamat lengkap..."></textarea></div></div><section class="tax-section"><div><span class="card-overline">PENGATURAN</span><h3>Pajak (PPN)</h3><p>Atur perhitungan pajak otomatis untuk perusahaan.</p></div><label class="tax-toggle" for="taxEnabled"><input id="taxEnabled" v-model="formData.taxEnabled" type="checkbox" /><span>Aktifkan hitung otomatis pajak</span></label><div v-if="formData.taxEnabled" class="field tax-rate"><label for="taxRate">Persentase pajak (%)</label><input id="taxRate" v-model="formData.taxRate" type="number" min="0" max="100" step="0.01" /></div></section><footer class="form-actions"><button v-if="initialData" type="button" class="secondary-button" :disabled="isSubmitting" @click="cancelEditing">Batal</button><button type="submit" class="primary-button" :disabled="isSubmitting"><LoadingSpinner v-if="isSubmitting" :visible="true" size="xs" color="text-white" />{{ isSubmitting ? 'Menyimpan...' : 'Simpan perubahan' }}</button></footer></form>
    <div v-else class="profile-details"><div class="details-heading"><span class="card-overline">IDENTITAS DAN KONTAK</span><h3>Informasi perusahaan</h3></div><dl class="details-grid"><div><dt>Nama perusahaan</dt><dd>{{ initialData?.name || '-' }}</dd></div><div><dt>Mata uang</dt><dd>{{ initialData?.currency || '-' }}</dd></div><div><dt>Email</dt><dd>{{ initialData?.email || '-' }}</dd></div><div><dt>Nomor telepon</dt><dd>{{ initialData?.phone || '-' }}</dd></div><div><dt>NPWP</dt><dd>{{ initialData?.npwp || '-' }}</dd></div><div><dt>Alamat lengkap</dt><dd class="address">{{ initialData?.address || '-' }}</dd></div></dl><section class="tax-summary"><div><span class="card-overline">PENGATURAN</span><h3>Pajak (PPN)</h3><p>Perhitungan pajak otomatis</p></div><span class="tax-status" :class="{ active: initialData?.taxEnabled }">{{ initialData?.taxEnabled ? 'Aktif (' + initialData.taxRate + '%)' : 'Nonaktif' }}</span></section></div>
  </section>
</template>
<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import type { CompanyPayload, Company } from '@/types/business'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useAuthStore } from '@/stores/auth';

const props = defineProps<{
  initialData?: Company | null
  isSubmitting?: boolean
  defaultEditing?: boolean
  isDemoAccount?: boolean
  viewerMode?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', payload: CompanyPayload): void
  (e: 'cancel'): void
}>()

const isDemo = ref(props.isDemoAccount !== undefined ? props.isDemoAccount : false)

const isEditing = ref(props.defaultEditing !== undefined ? props.defaultEditing : !props.initialData)

// Reset edit state when initialData changes meaning a submit succeeded
watch(() => props.initialData, (newVal, oldVal) => {
  if (newVal && (!oldVal || newVal.updatedAt !== oldVal.updatedAt)) {
    isEditing.value = false
    isDemo.value = false
  }
})

const formData = reactive<CompanyPayload>({
  name: props.initialData?.name || '',
  npwp: props.initialData?.npwp || '',
  address: props.initialData?.address || '',
  phone: props.initialData?.phone || '',
  email: props.initialData?.email || '',
  taxEnabled: props.initialData?.taxEnabled ?? true,
  taxRate: props.initialData?.taxRate ?? 11,
  currency: props.initialData?.currency || 'IDR',
})

const resetFormData = () => {
  formData.name = props.initialData?.name || ''
  formData.npwp = props.initialData?.npwp || ''
  formData.address = props.initialData?.address || ''
  formData.phone = props.initialData?.phone || ''
  formData.email = props.initialData?.email || ''
  formData.taxEnabled = props.initialData?.taxEnabled ?? true
  formData.taxRate = props.initialData?.taxRate ?? 11
  formData.currency = props.initialData?.currency || 'IDR'
}

watch(
  () => props.initialData,
  () => {
    resetFormData()
  },
  { deep: true }
)

const userProfileEmail = computed(() => {
  const authStore = useAuthStore()
  return authStore.currentUser?.email || null
})
const startEditing = () => {
  if(userProfileEmail.value === 'demo@moneytory.id'){
    isDemo.value = true
    return
  }
  resetFormData()
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
  resetFormData()
  emit('cancel')
}

const handleSubmit = () => {
  emit('submit', { ...formData })
}

// Expose internal state in case parent needs it
defineExpose({
  isEditing
})
</script>
<style scoped>
.company-card { --ink:var(--shell-ink,#27231d); --muted:var(--shell-muted,#6c6256); --surface:var(--shell-surface,#fffcf5); --rule:var(--shell-rule,#e2d8c7); background:var(--surface); color:var(--ink); border:1px solid var(--rule); border-radius:20px; overflow:hidden; }.card-heading { display:flex; justify-content:space-between; align-items:center; gap:16px; padding:24px 28px; border-bottom:1px solid var(--rule); }.card-overline { color:var(--muted); font-size:10px; font-weight:800; letter-spacing:.13em; }.card-heading h2 { font-size:21px; font-weight:850; letter-spacing:-.035em; margin:5px 0; }.card-heading p,.form-intro p,.tax-section p,.tax-summary p { color:var(--muted); font-size:13px; line-height:1.5; }.edit-button,.secondary-button,.primary-button { border-radius:999px; padding:10px 16px; font-size:13px; font-weight:800; white-space:nowrap; }.edit-button,.secondary-button { border:1px solid var(--rule); background:var(--surface); color:var(--ink); }.edit-button:hover,.secondary-button:hover { background:var(--shell-lilac,#eee4ff); }.primary-button { display:flex; gap:8px; align-items:center; justify-content:center; background:var(--ink); color:var(--surface); }.primary-button:disabled,.secondary-button:disabled { opacity:.5; }.demo-notice { margin:20px 28px 0; padding:12px 14px; border-radius:12px; background:var(--shell-sun,#fff0b6); color:var(--ink); font-size:13px; }.company-form,.profile-details { padding:26px 28px 28px; }.form-intro h3,.details-heading h3,.tax-section h3,.tax-summary h3 { font-size:16px; font-weight:800; margin:5px 0; }.form-grid,.details-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:20px; margin-top:20px; }.field { display:flex; flex-direction:column; gap:7px; min-width:0; }.field.full { grid-column:1 / -1; }.field label { font-size:12px; font-weight:800; }.field label span { color:#b8322c; }.field label small { font-weight:400; color:var(--muted); margin-left:4px; }.field input,.field textarea { width:100%; min-height:44px; padding:10px 12px; border:1px solid var(--rule); border-radius:12px; background:var(--surface); color:var(--ink); font-size:14px; }.field input[readonly] { color:var(--muted); background:var(--shell-paper,#fdf9ee); }.field textarea { resize:vertical; }.field :is(input,textarea):focus-visible,.company-card button:focus-visible { outline:3px solid var(--shell-grape,#5026a5); outline-offset:3px; }.tax-section,.tax-summary { margin-top:26px; padding:20px; border:1px solid var(--rule); border-radius:16px; background:var(--shell-paper,#fdf9ee); }.tax-toggle { display:flex; align-items:center; gap:10px; margin-top:16px; font-size:13px; font-weight:700; }.tax-toggle input { width:17px; height:17px; accent-color:var(--shell-grape,#5026a5); }.tax-rate { margin-top:16px; max-width:200px; }.form-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:24px; }.details-grid > div { min-width:0; }.details-grid dt { color:var(--muted); font-size:12px; }.details-grid dd { color:var(--ink); font-size:14px; font-weight:700; margin-top:5px; overflow-wrap:anywhere; }.address { white-space:pre-line; }.tax-summary { display:flex; justify-content:space-between; align-items:center; gap:16px; }.tax-status { flex:none; padding:6px 10px; border:1px solid var(--rule); border-radius:999px; color:var(--muted); font-size:12px; font-weight:800; }.tax-status.active { background:var(--shell-mint,#ddf4d9); color:var(--ink); } @media(max-width:560px) { .card-heading { align-items:start; flex-direction:column; }.card-heading,.company-form,.profile-details { padding:22px; }.form-grid,.details-grid { grid-template-columns:1fr; }.field.full { grid-column:auto; }.tax-summary { align-items:start; flex-direction:column; }.form-actions button { flex:1; } }
</style>
