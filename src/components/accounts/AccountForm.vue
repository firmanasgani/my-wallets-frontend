<template>
  <div class="money-accounts account-form-page">
    <header class="account-form-heading">
      <RouterLink :to="{ name: 'accounts-list' }" class="account-form-back" :aria-disabled="submitting || undefined" @click="blockWhileSaving"><AppIcon name="arrow" />Daftar akun</RouterLink>
      <span class="shell-overline">{{ isEdit ? 'RAPIKAN DETAIL AKUNMU' : 'RUANG BARU UNTUK KEUANGANMU' }}</span>
      <h1>{{ isEdit ? 'Edit akun.' : 'Tambah akun baru.' }}</h1>
      <p>{{ isEdit ? 'Perbarui nama dan nomor akun agar catatan tetap mudah dikenali.' : 'Hubungkan catatanmu dengan rekening, dompet digital, atau uang tunai.' }}</p>
    </header>
    <div class="account-form-layout">
      <form class="account-editor" :aria-busy="submitting" @submit.prevent="submit">
        <div v-if="localError || error" ref="errorBox" class="account-form-error" role="alert" tabindex="-1"><AppIcon name="help" /><span>{{ localError || error }}</span></div>
        <fieldset :disabled="submitting">
          <legend class="account-form-legend"><span>01</span>Identitas akun</legend>
          <p class="account-section-copy">Gunakan nama yang mudah kamu kenali.</p>
          <div class="account-field">
            <label for="account-name">Nama akun <span aria-hidden="true">*</span></label>
            <input id="account-name" v-model="draft.accountName" name="accountName" type="text" autocomplete="off" required placeholder="Contoh: Tabungan harian, Dompet pribadi" />
          </div>
          <div v-if="!isEdit" class="account-field">
            <AppSelect id="account-type" v-model="draft.accountType" :options="typeOptions" label="Jenis akun" required :disabled="submitting" />
          </div>
          <div v-if="!isEdit && draft.accountType === FrontendAccountType.BANK" class="account-field">
            <AppSelect id="account-bank" v-model="draft.bankId" :options="bankOptions" label="Bank" placeholder="Pilih bank rekeningmu" searchable required
              :disabled="submitting || bankStore.isLoadingBanks" :loading="bankStore.isLoadingBanks" :helper-text="bankHelper" />
            <button v-if="bankStore.bankError || (!bankStore.isLoadingBanks && !bankOptions.length)" type="button" class="accounts-reset" :disabled="submitting" @click="loadBanks">Muat ulang daftar bank</button>
          </div>
          <div class="account-field">
            <label for="account-number">{{ numberLabel }} <span class="account-optional">(opsional)</span></label>
            <input id="account-number" v-model="draft.accountNumber" name="accountNumber" type="text" autocomplete="off" :placeholder="numberPlaceholder" aria-describedby="account-number-hint" />
            <p id="account-number-hint" class="account-field-hint">Nomor ini membantu membedakan akun. Tidak harus diisi.</p>
          </div>
        </fieldset>

        <section v-if="!isEdit" class="account-form-section">
        <fieldset :disabled="submitting">
          <legend class="account-form-legend"><span>02</span>Saldo pembuka</legend>
          <p class="account-section-copy">Masukkan saldo sebelum mulai mencatat transaksi di Moneytory.</p>
          <div class="account-field">
            <label for="initial-balance">Saldo awal <span class="account-optional">(opsional)</span></label>
            <div class="account-amount-input"><span aria-hidden="true">IDR</span><CurrencyInput id="initial-balance" v-model="draft.initialBalance" :options="{ currency: 'IDR' }" aria-describedby="initial-balance-hint" /></div>
            <p id="initial-balance-hint" class="account-field-hint">Biarkan kosong jika ingin mulai dari nol.</p>
          </div>
          <div class="account-readonly-note"><AppIcon name="lock" /><p>Mata uang akun baru menggunakan <strong>IDR · Rupiah Indonesia</strong>.</p></div>
        </fieldset>
        </section>

        <section v-else class="account-form-section" aria-labelledby="account-fixed-heading">
          <h2 id="account-fixed-heading" class="account-form-legend"><span>02</span>Informasi tetap</h2>
          <p class="account-section-copy">Jenis akun, bank, mata uang, dan saldo tidak diubah dari halaman ini.</p>
          <dl class="account-fixed-details">
            <div><dt>Jenis akun</dt><dd>{{ typeInfo.label }}</dd></div>
            <div v-if="draft.accountType === FrontendAccountType.BANK"><dt>Bank</dt><dd>{{ account?.bank?.name || 'Bank tidak tersedia' }}</dd></div>
            <div><dt>Mata uang</dt><dd>{{ draft.currency }}</dd></div>
            <div><dt>Saldo awal</dt><dd>{{ showBalance ? accountMoney(account?.initialBalance ?? 0, draft.currency) : '••••••••' }}</dd></div>
            <div><dt>Saldo saat ini</dt><dd>{{ showBalance ? accountMoney(account?.currentBalance ?? 0, draft.currency) : '••••••••' }}</dd></div>
          </dl>
          <p class="account-field-hint">Saldo saat ini mengikuti transaksi pada akun ini.</p>
        </section>

        <footer class="account-form-actions">
          <button type="button" class="accounts-button" :disabled="submitting" @click="router.push({ name: 'accounts-list' })">Batal</button>
          <button type="submit" class="accounts-button is-primary" :disabled="submitting || (!isEdit && draft.accountType === FrontendAccountType.BANK && bankStore.isLoadingBanks)">
            <span v-if="submitting" class="account-form-spinner" aria-hidden="true"></span><AppIcon v-else name="plus" />
            {{ submitting ? 'Menyimpan...' : isEdit ? 'Simpan perubahan' : 'Simpan akun' }}
          </button>
        </footer>
      </form>

      <aside class="account-form-preview" aria-labelledby="preview-heading">
        <div class="account-preview-heading"><h2 id="preview-heading">Pratinjau akun</h2><button v-if="isEdit" type="button" class="accounts-icon-button" :aria-label="showBalance ? 'Sembunyikan saldo' : 'Tampilkan saldo'" :aria-pressed="!showBalance" @click="showBalance = !showBalance"><AppIcon :name="showBalance ? 'eyeOff' : 'eye'" /></button></div>
        <div class="account-card" :class="`is-${draft.accountType.toLowerCase()}`">
          <div class="account-card-main">
            <div class="account-card-top"><span class="account-card-icon"><AppIcon :name="typeInfo.icon" /></span><span class="account-type-badge">{{ typeInfo.label }}</span></div>
            <h3>{{ draft.accountName.trim() || 'Nama akunmu' }}</h3><p class="account-provider">{{ bankName || typeInfo.label }}</p>
            <div class="account-card-balance"><span>{{ isEdit ? 'Saldo saat ini' : 'Saldo awal' }} · {{ draft.currency }}</span><strong>{{ isEdit && !showBalance ? '••••••••' : accountMoney(isEdit ? account?.currentBalance : draft.initialBalance, draft.currency) }}</strong></div>
            <div class="account-card-number"><span>{{ draft.accountNumber.trim() ? `•••• ${draft.accountNumber.trim().slice(-4)}` : 'Tanpa nomor akun' }}</span><AppIcon name="wallet" /></div>
          </div>
        </div>
        <div class="account-form-tip"><AppIcon name="book" /><p>{{ isEdit ? 'Nama dan nomor yang diperbarui akan tampil pada daftar serta detail akun.' : 'Gunakan akun terpisah untuk tabungan, belanja harian, dan dompet digital agar pencatatan lebih teratur.' }}</p></div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AppIcon from '@/components/common/AppIcon.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import CurrencyInput from '@/components/common/CurrencyInput.vue'
import { useBankStore } from '@/stores/banks'
import { FrontendAccountType } from '@/types/enums'
import type { Account, CreateAccountPayload, UpdateAccountPayload } from '@/types/accounts'
import type { SelectOption } from '@/types/select'
import { accountMoney, accountTypes } from '@/utils/accountList'
import { buildAccountCreate, buildAccountUpdate, type AccountDraft } from '@/utils/accountForm'
import '@/assets/accounts.css'
import '@/assets/account-form.css'

const props = withDefaults(defineProps<{ mode: 'create' | 'edit'; account?: Account | null; submitting?: boolean; error?: string }>(), { submitting: false, error: '' })
const emit = defineEmits<{ create: [payload: CreateAccountPayload]; update: [payload: UpdateAccountPayload] }>()
const router = useRouter()
const bankStore = useBankStore()
const isEdit = computed(() => props.mode === 'edit')
const localError = ref('')
const errorBox = ref<HTMLElement | null>(null)
const draft = reactive<AccountDraft>({ accountName: '', accountType: FrontendAccountType.BANK, bankId: null, initialBalance: 0, currency: 'IDR', accountNumber: '' })
const typeOptions: SelectOption<FrontendAccountType>[] = accountTypes.map(({ value, label }) => ({ value, label }))
const typeInfo = computed(() => accountTypes.find(({ value }) => value === draft.accountType) || { label: 'Akun', icon: 'wallet' })
const bankOptions = computed<SelectOption<string | null>[]>(() => bankStore.allBanks.map((bank) => ({ value: bank.id, label: bank.name })))
const bankName = computed(() => draft.accountType !== FrontendAccountType.BANK ? '' : isEdit.value ? props.account?.bank?.name : bankStore.allBanks.find((bank) => bank.id === draft.bankId)?.name)
const bankHelper = computed(() => bankStore.bankError || (bankStore.isLoadingBanks ? 'Memuat daftar bank...' : !bankOptions.value.length ? 'Daftar bank belum tersedia.' : 'Ketik nama bank untuk mencari.'))
const numberLabel = computed(() => draft.accountType === FrontendAccountType.E_WALLET ? 'Nomor telepon / akun' : draft.accountType === FrontendAccountType.CREDIT_CARD ? 'Nomor kartu / akun' : 'Nomor akun / rekening')
const numberPlaceholder = computed(() => draft.accountType === FrontendAccountType.E_WALLET ? 'Nomor yang terhubung ke dompet digital' : 'Nomor rekening atau pengenal akun')
const readBalancePreference = () => { try { return localStorage.getItem('show_balance') === 'true' } catch { return false } }
const showBalance = ref(readBalancePreference())
watch(showBalance, (value) => { try { localStorage.setItem('show_balance', String(value)) } catch { /* Keep session preference. */ } })
watch(() => props.account, (account) => {
  if (!account) return
  Object.assign(draft, { accountName: account.accountName, accountType: account.accountType, bankId: account.bankId || null,
    initialBalance: Number(account.initialBalance), currency: account.currency || 'IDR', accountNumber: account.accountNumber || '' })
  localError.value = ''
}, { immediate: true })
const loadBanks = async () => {
  if (isEdit.value || bankStore.isLoadingBanks) return
  try { await bankStore.fetchBanks() } catch { localError.value = 'Daftar bank belum berhasil dimuat. Silakan coba lagi.' }
}
watch(() => draft.accountType, (type) => {
  if (isEdit.value) return
  draft.bankId = null
  localError.value = ''
  if (type === FrontendAccountType.BANK && !bankStore.allBanks.length) loadBanks()
})
const blockWhileSaving = (event: MouseEvent) => { if (props.submitting) event.preventDefault() }
const submit = async () => {
  if (props.submitting) return
  localError.value = ''
  try {
    if (isEdit.value) emit('update', buildAccountUpdate(draft))
    else emit('create', buildAccountCreate(draft))
  } catch (error: unknown) {
    localError.value = error instanceof Error ? error.message : 'Periksa kembali data akun.'
    await nextTick()
    errorBox.value?.focus()
  }
}
onMounted(() => { if (!isEdit.value && draft.accountType === FrontendAccountType.BANK && (!bankStore.allBanks.length || bankStore.bankError)) loadBanks() })
</script>
