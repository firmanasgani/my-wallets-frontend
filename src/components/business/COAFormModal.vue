<template>
  <Teleport to="body"><div v-if="isOpen" class="coa-overlay" @click.self="requestClose" @keydown.esc="requestClose"><section class="coa-modal" role="dialog" aria-modal="true" aria-labelledby="coa-title"><header class="coa-hero"><div><span>PENGATURAN PEMBUKUAN</span><h2 id="coa-title">{{ isEdit ? 'Edit akun' : 'Tambah akun' }}</h2><p>{{ isEdit ? 'Perbarui informasi akun kustom perusahaan.' : 'Tambahkan akun kustom ke bagan akun perusahaan.' }}</p></div><button type="button" aria-label="Tutup" :disabled="isSubmitting" @click="requestClose">&#10005;</button></header><form class="coa-form" @submit.prevent="handleSubmit"><div v-if="isEdit" class="code-note"><span>KODE AKUN</span><strong>{{ form.code }}</strong></div><div v-if="!isEdit" class="field"><label for="coa-code">Kode akun <span>*</span></label><input id="coa-code" v-model="form.code" type="text" placeholder="Contoh: 1-005" required /><p>Awalan kode: 1 aset, 2 kewajiban, 3 ekuitas, 4 pendapatan, 5 beban.</p></div><div class="field"><label for="coa-name">Nama akun <span>*</span></label><input id="coa-name" v-model="form.name" type="text" placeholder="Nama akun" required /></div><AppSelect id="coa-type" v-model="form.type" :options="accountTypeOptions" label="Tipe akun" required :disabled="isSubmitting" /><div class="field"><label for="coa-balance">Saldo awal</label><div class="money-input"><span>Rp</span><input id="coa-balance" v-model.number="form.openingBalance" type="number" min="0" step="any" placeholder="0" /></div><p>Isi untuk migrasi dari pembukuan lain, atau biarkan nol untuk akun baru.</p></div><div v-if="errorMsg" class="coa-error" role="alert">{{ errorMsg }}</div><footer class="coa-actions"><button type="button" class="secondary" :disabled="isSubmitting" @click="requestClose">Batal</button><button type="submit" class="primary" :disabled="isSubmitting">{{ isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan perubahan' : 'Tambah akun' }}</button></footer></form></section></div></Teleport>
</template>
<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { lockModalScroll } from '@/utils/modalScrollLock'
import { useBusinessStore } from '@/stores/business'
import AppSelect from '@/components/common/AppSelect.vue'
import type { ChartOfAccount, CoaType } from '@/types/business'

const props = defineProps<{
  isOpen: boolean
  account?: ChartOfAccount | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const accountTypeOptions: { value: CoaType; label: string }[] = [
  { value: 'ASSET', label: 'Aset (Harta)' },
  { value: 'LIABILITY', label: 'Kewajiban (Hutang)' },
  { value: 'EQUITY', label: 'Ekuitas (Modal)' },
  { value: 'REVENUE', label: 'Pendapatan' },
  { value: 'EXPENSE', label: 'Beban' },
]

const businessStore = useBusinessStore()

const isEdit = ref(false)
const isSubmitting = ref(false)
const errorMsg = ref('')

const form = ref({
  code: '',
  name: '',
  type: 'ASSET' as CoaType,
  openingBalance: 0,
})

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      errorMsg.value = ''
      if (props.account) {
        isEdit.value = true
        form.value = {
          code: props.account.code,
          name: props.account.name,
          type: props.account.type,
          openingBalance: parseFloat(props.account.openingBalance) || 0,
        }
      } else {
        isEdit.value = false
        form.value = { code: '', name: '', type: 'ASSET', openingBalance: 0 }
      }
    }
  },
)

let releaseScroll: (() => void) | null = null
let opener: HTMLElement | null = null
watch(() => props.isOpen, async (open) => {
  if (open) {
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    releaseScroll = lockModalScroll()
    await nextTick()
    document.getElementById(props.account ? 'coa-name' : 'coa-code')?.focus()
  } else {
    releaseScroll?.()
    releaseScroll = null
    opener?.focus()
    opener = null
  }
})
onBeforeUnmount(() => releaseScroll?.())
const requestClose = () => { if (!isSubmitting.value) emit('close') }

const handleSubmit = async () => {
  errorMsg.value = ''
  isSubmitting.value = true
  try {
    if (isEdit.value && props.account) {
      await businessStore.updateChartOfAccount(props.account.id, {
        name: form.value.name,
        type: form.value.type,
        openingBalance: form.value.openingBalance,
      })
    } else {
      await businessStore.createChartOfAccount({
        code: form.value.code,
        name: form.value.name,
        type: form.value.type,
        openingBalance: form.value.openingBalance,
      })
    }
    emit('saved')
    emit('close')
  } catch (err: any) {
    const msg = err.response?.data?.message
    errorMsg.value = Array.isArray(msg) ? msg.join(', ') : (msg || 'Gagal menyimpan COA.')
  } finally {
    isSubmitting.value = false
  }
}
</script>
<style scoped>
.coa-overlay { position:fixed; inset:0; z-index:50; display:flex; justify-content:center; align-items:center; padding:16px; background:rgba(24,19,35,.65); }.coa-modal { --ink:var(--shell-ink,#27231d); --muted:var(--shell-muted,#6c6256); --surface:var(--shell-surface,#fffcf5); --rule:var(--shell-rule,#e2d8c7); width:min(100%,520px); max-height:calc(100dvh - 32px); overflow:auto; border-radius:24px; background:var(--surface); color:var(--ink); box-shadow:0 24px 80px #0005; }.coa-hero { display:flex; justify-content:space-between; gap:20px; padding:28px; color:white; background:radial-gradient(circle at 100% 0%,#7756ad,transparent 60%),#3d2c60; }.coa-hero span,.code-note span { font-size:10px; font-weight:800; letter-spacing:.13em; color:#d7c9ef; }.coa-hero h2 { font-size:28px; font-weight:900; letter-spacing:-.04em; margin:7px 0; }.coa-hero p { color:#e0d5ef; font-size:13px; }.coa-hero button { flex:none; width:36px; height:36px; border-radius:50%; background:#ffffff20; }.coa-form { display:flex; flex-direction:column; gap:18px; padding:24px 28px 28px; }.field { display:flex; flex-direction:column; gap:7px; }.field label { font-size:13px; font-weight:800; }.field label span { color:#bd4038; }.field input,.field select { width:100%; min-height:44px; padding:10px 12px; border:1px solid var(--rule); border-radius:12px; background:var(--surface); color:var(--ink); font-size:14px; }.field p { color:var(--muted); font-size:12px; line-height:1.5; }.code-note { display:flex; justify-content:space-between; align-items:center; padding:13px 15px; border-radius:12px; background:var(--shell-lilac,#eee4ff); color:#31244c; }.code-note span { color:#6c5e7b; }.money-input { display:flex; align-items:center; border:1px solid var(--rule); border-radius:12px; overflow:hidden; }.money-input > span { padding:0 13px; color:var(--muted); font-size:13px; font-weight:700; }.money-input input { border:0; border-left:1px solid var(--rule); border-radius:0; }.coa-error { padding:12px; border-radius:12px; background:#fff0ee; color:#a8322b; font-size:13px; }.coa-actions { display:flex; justify-content:flex-end; gap:8px; padding-top:4px; }.coa-actions button { padding:10px 17px; border-radius:999px; font-size:13px; font-weight:800; }.coa-actions button:disabled { opacity:.5; }.secondary { border:1px solid var(--rule); }.primary { background:var(--shell-grape,#5026a5); color:white; }.coa-modal :is(button,input,select):focus-visible { outline:3px solid #9a78d5; outline-offset:3px; } @media(max-width:520px) { .coa-hero,.coa-form { padding:22px; }.coa-actions button { flex:1; } }
</style>
