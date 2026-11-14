<template>
  <div class="transaction-workflow">
    <header class="transaction-page-heading"><RouterLink :to="historyLocation" class="transaction-back" :aria-disabled="saving || undefined" @click="saving && $event.preventDefault()"><AppIcon name="arrow" />Riwayat transaksi</RouterLink><span class="shell-overline">SETIAP TRANSAKSI, LEBIH TERTATA</span><h1>Catat transaksi baru.</h1><p>Catat dana masuk, pengeluaran, atau transfer antar akunmu.</p></header>
    <div v-if="loading" class="transaction-state" role="status"><span class="transaction-spinner" aria-hidden="true"></span><h2>Menyiapkan formulir...</h2><p>Memuat akun dan kategori keuanganmu.</p></div>
    <div v-else-if="loadError" class="transaction-state" role="alert"><AppIcon name="help" /><h2>Formulir belum siap.</h2><p>{{ loadError }}</p><button type="button" class="transaction-button" @click="loadOptions">Coba lagi</button></div>
    <div v-else-if="!accountStore.allAccounts.length" class="transaction-state"><AppIcon name="wallet" /><h2>Tambahkan akun terlebih dahulu.</h2><p>Transaksi membutuhkan akun untuk mencatat perubahan saldo.</p><RouterLink :to="{ name: 'account-create' }" class="transaction-button is-primary"><AppIcon name="plus" />Tambah akun</RouterLink></div>
    <div v-else class="transaction-editor-layout">
      <form class="transaction-form-panel" :aria-busy="saving" @submit.prevent="submit">
        <div v-if="error" ref="errorBox" class="transaction-error" role="alert" tabindex="-1"><AppIcon name="help" /><span>{{ error }}</span></div>
        <fieldset :disabled="saving">
          <legend class="transaction-section-title">01 <span>Detail transaksi</span></legend>
          <div class="transaction-type-options" role="group" aria-label="Jenis transaksi"><button v-for="option in types" :key="option.value" type="button" :aria-pressed="draft.type === option.value" :class="{ 'is-selected': draft.type === option.value }" @click="draft.type = option.value"><AppIcon :name="option.icon" />{{ option.label }}</button></div>
          <div class="transaction-field transaction-amount"><label for="new-amount">Nominal transaksi <span aria-hidden="true">*</span></label><div><span>IDR</span><CurrencyInput id="new-amount" v-model="draft.amount" :options="{ currency: 'IDR' }" required placeholder="0" /></div></div>
          <div class="transaction-fields-grid">
            <AppSelect v-if="draft.type !== 'INCOME'" id="new-source" v-model="draft.sourceAccountId" :options="sourceOptions" label="Dari akun" placeholder="Pilih akun sumber" required searchable :disabled="saving" />
            <AppSelect v-if="draft.type !== 'EXPENSE'" id="new-destination" v-model="draft.destinationAccountId" :options="destinationOptions" label="Ke akun" placeholder="Pilih akun tujuan" required searchable :disabled="saving" />
            <AppSelect v-if="draft.type !== 'TRANSFER'" id="new-category" v-model="draft.categoryId" :options="categoryOptions" label="Kategori" placeholder="Pilih kategori" required searchable :disabled="saving" />
          </div>
          <p v-if="draft.type !== 'TRANSFER' && !categoryOptions.length" class="transaction-hint">Belum ada kategori {{ draft.type === 'INCOME' ? 'pemasukan' : 'pengeluaran' }}. <RouterLink :to="{ name: 'categories-list' }">Kelola kategori ↗</RouterLink></p>
          <p v-if="draft.type === 'TRANSFER' && accountStore.allAccounts.length < 2" class="transaction-hint">Transfer membutuhkan dua akun berbeda. <RouterLink :to="{ name: 'account-create' }">Tambah akun ↗</RouterLink></p>
          <div class="transaction-fields-grid"><div class="transaction-field"><label for="new-date">Tanggal transaksi <span aria-hidden="true">*</span></label><AppDatePicker id="new-date" v-model="draft.date" /></div><div class="transaction-field"><label for="new-description">Catatan <span>(opsional)</span></label><input id="new-description" v-model="draft.description" type="text" placeholder="Contoh: Belanja mingguan" /></div></div>
        </fieldset>
        <section class="transaction-form-section"><h2 class="transaction-section-title">02 <span>Jadwal &amp; lampiran</span></h2>
          <fieldset :disabled="saving">
            <legend class="shell-sr-only">Jadwal dan lampiran opsional</legend>
            <label class="transaction-recurring-toggle" for="new-recurring"><input id="new-recurring" v-model="draft.recurring" type="checkbox" /><span><strong>Jadikan transaksi berulang</strong><small>Buat jadwal otomatis mulai tanggal yang dipilih.</small></span></label>
            <div v-if="draft.recurring" class="transaction-recurring-fields"><AppSelect id="new-interval" v-model="draft.interval" :options="intervalOptions" label="Ulangi setiap" placeholder="Pilih interval" required :disabled="saving" /><div class="transaction-field"><label for="new-end-date">Berakhir pada <span>(opsional)</span></label><input id="new-end-date" v-model="draft.endDate" type="date" :min="draft.date" /></div></div>
            <div class="transaction-attachment-field"><span class="transaction-field-label">Lampiran <small>(opsional)</small></span>
              <p v-if="draft.recurring" class="transaction-hint">Lampiran tersedia untuk transaksi satu kali. Hapus lampiran yang dipilih jika ingin membuat jadwal berulang.</p>
              <label v-else for="new-attachment" class="transaction-upload" :class="{ 'is-dragging': dragging }" @dragover.prevent="dragging = true" @dragleave.prevent="dragging = false" @drop.prevent="dropFile"><AppIcon name="attachment" /><strong>Pilih file atau seret ke sini</strong><span>JPG, PNG, PDF · Maksimal 5 MB</span><input id="new-attachment" ref="fileInput" type="file" accept="image/jpeg,image/png,application/pdf" @change="chooseFile" /></label>
              <div v-if="file" class="transaction-selected-file"><img v-if="previewUrl" :src="previewUrl" alt="Pratinjau lampiran yang dipilih" /><AppIcon v-else name="file" /><span><strong>{{ file.name }}</strong><small>{{ (file.size / 1024 / 1024).toFixed(2) }} MB</small></span><button type="button" class="transaction-icon-button is-danger" aria-label="Hapus lampiran dari formulir" @click="removeFile"><AppIcon name="trash" /></button></div>
            </div>
          </fieldset>
        </section>
        <footer class="transaction-form-actions"><button type="button" class="transaction-button" :disabled="saving" @click="router.push(historyLocation)">Batal</button><button type="submit" class="transaction-button is-primary" :disabled="saving"><span v-if="saving" class="transaction-spinner" aria-hidden="true"></span><AppIcon v-else name="plus" />{{ saving ? 'Menyimpan...' : draft.recurring ? 'Simpan jadwal' : 'Simpan transaksi' }}</button></footer>
      </form>
      <aside class="transaction-summary-panel"><span class="shell-overline">SEBELUM DISIMPAN</span><h2>Ringkasan catatanmu</h2><div class="transaction-summary-amount" :class="`is-${draft.type.toLowerCase()}`"><AppIcon :name="selectedType.icon" /><span>{{ selectedType.label }}</span><strong>{{ accountMoney(draft.amount ?? 0, 'IDR') }}</strong></div><dl><div v-if="draft.type !== 'INCOME'"><dt>Dari akun</dt><dd>{{ accountLabel(draft.sourceAccountId) }}</dd></div><div v-if="draft.type !== 'EXPENSE'"><dt>Ke akun</dt><dd>{{ accountLabel(draft.destinationAccountId) }}</dd></div><div v-if="draft.type !== 'TRANSFER'"><dt>Kategori</dt><dd>{{ categoryOptions.find((option) => option.value === draft.categoryId)?.label || 'Belum dipilih' }}</dd></div><div><dt>{{ draft.recurring ? 'Mulai jadwal' : 'Tanggal' }}</dt><dd>{{ transactionDateLabel(draft.date) }}</dd></div><div><dt>Pencatatan</dt><dd>{{ draft.recurring ? 'Berulang' : 'Sekali' }}</dd></div></dl><p class="transaction-summary-note">{{ draft.recurring ? 'Catatan ini membuat jadwal transaksi berulang.' : 'Saldo akun diperbarui setelah transaksi berhasil disimpan.' }}</p></aside>
    </div>
    <ConfirmationModal v-model:isOpen="showSuccess" :title="draft.recurring ? 'Jadwal tersimpan.' : 'Transaksi tersimpan.'" :message="draft.recurring ? 'Jadwal transaksi berulang berhasil dibuat.' : 'Catatan transaksi dan saldo akun sudah diperbarui.'" iconType="success" confirmButtonText="Lihat riwayat" cancelButtonText="Catat lagi" @confirm="goToHistory" @cancel="resetForm" />
  </div>
</template>
<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/common/AppIcon.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import AppDatePicker from '@/components/common/AppDatePicker.vue'
import CurrencyInput from '@/components/common/CurrencyInput.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import { useTransactionStore } from '@/stores/transactions'
import { useAccountStore } from '@/stores/accounts'
import { useCategoryStore } from '@/stores/categories'
import { FrontendTransactionType } from '@/types/enums'
import { RecurringInterval } from '@/types/transaction'
import { dateKey } from '@/utils/dateRange'
import { accountMoney } from '@/utils/accountList'
import { buildNewTransaction, transactionCategoryOptions, transactionDateLabel, validateAttachment, type TransactionDraft } from '@/utils/transactionForm'
import '@/assets/transaction-workflow.css'

const route = useRoute(), router = useRouter()
const transactionStore = useTransactionStore(), accountStore = useAccountStore(), categoryStore = useCategoryStore()
const historyLocation = computed(() => ({ name: 'transactions-list', query: route.query }))
const loading = ref(true), loadError = ref(''), saving = ref(false), error = ref(''), showSuccess = ref(false)
const errorBox = ref<HTMLElement | null>(null), fileInput = ref<HTMLInputElement | null>(null)
const draft = reactive<TransactionDraft>({ type: FrontendTransactionType.EXPENSE, amount: null, date: dateKey(new Date()), description: '', sourceAccountId: '', destinationAccountId: '', categoryId: '', recurring: false, interval: null, endDate: '' })
const types = [{ value: FrontendTransactionType.INCOME, label: 'Pemasukan', icon: 'plus' }, { value: FrontendTransactionType.EXPENSE, label: 'Pengeluaran', icon: 'arrow' }, { value: FrontendTransactionType.TRANSFER, label: 'Transfer', icon: 'transfer' }]
const selectedType = computed(() => types.find((option) => option.value === draft.type) || types[1]!)
const intervalOptions = [{ value: RecurringInterval.DAILY, label: 'Hari' }, { value: RecurringInterval.WEEKLY, label: 'Minggu' }, { value: RecurringInterval.MONTHLY, label: 'Bulan' }, { value: RecurringInterval.YEARLY, label: 'Tahun' }]
const categoryOptions = computed(() => transactionCategoryOptions(categoryStore.allCategories, draft.type))
const sourceOptions = computed(() => accountStore.allAccounts.map((account) => ({ value: account.id, label: account.accountName, description: account.currency, disabled: draft.type === 'TRANSFER' && account.id === draft.destinationAccountId })))
const destinationOptions = computed(() => accountStore.allAccounts.map((account) => ({ value: account.id, label: account.accountName, description: account.currency, disabled: draft.type === 'TRANSFER' && account.id === draft.sourceAccountId })))
const accountLabel = (id: string) => accountStore.allAccounts.find((account) => account.id === id)?.accountName || 'Belum dipilih'
const file = ref<File | null>(null), previewUrl = ref(''), dragging = ref(false)
const removeFile = () => { if (previewUrl.value) URL.revokeObjectURL(previewUrl.value); previewUrl.value = ''; file.value = null; if (fileInput.value) fileInput.value.value = '' }
const useFile = (selected?: File) => {
  if (!selected || saving.value) return
  const message = validateAttachment(selected)
  if (message) { error.value = message; return }
  removeFile(); file.value = selected; error.value = ''
  if (selected.type.startsWith('image/')) previewUrl.value = URL.createObjectURL(selected)
}
const chooseFile = (event: Event) => { const input = event.target as HTMLInputElement; useFile(input.files?.[0]); input.value = '' }
const dropFile = (event: DragEvent) => { dragging.value = false; useFile(event.dataTransfer?.files[0]) }
const loadOptions = async () => {
  loading.value = true; loadError.value = ''
  const results = await Promise.allSettled([accountStore.fetchAccounts(), categoryStore.fetchCategories({ hierarchical: 'true' })])
  if (results.some((result) => result.status === 'rejected') || accountStore.error || categoryStore.categoryError) loadError.value = accountStore.error || categoryStore.categoryError || 'Akun dan kategori belum berhasil dimuat.'
  loading.value = false
}
watch(() => draft.type, () => { draft.sourceAccountId = ''; draft.destinationAccountId = ''; draft.categoryId = ''; error.value = '' })
watch(() => draft.recurring, (enabled) => { if (!enabled) { draft.interval = null; draft.endDate = '' } })
const resetForm = () => { showSuccess.value = false; draft.amount = null; draft.description = ''; draft.sourceAccountId = ''; draft.destinationAccountId = ''; draft.categoryId = ''; draft.recurring = false; draft.interval = null; draft.endDate = ''; draft.date = dateKey(new Date()); error.value = ''; removeFile(); nextTick(() => document.getElementById('new-amount')?.focus()) }
const goToHistory = () => { showSuccess.value = false; router.push(historyLocation.value) }
const submit = async () => {
  if (saving.value || loading.value || showSuccess.value) return
  error.value = ''
  try {
    const transaction = buildNewTransaction(draft, accountStore.allAccounts, categoryStore.allCategories, file.value)
    saving.value = true
    if (transaction.type === FrontendTransactionType.INCOME) await transactionStore.createIncomeTransaction(transaction.payload)
    else if (transaction.type === FrontendTransactionType.EXPENSE) await transactionStore.createExpenseTransaction(transaction.payload)
    else await transactionStore.createTransferTransaction(transaction.payload)
    showSuccess.value = true
  } catch (failure: unknown) {
    error.value = (typeof failure === 'string' ? failure : failure instanceof Error ? failure.message : '') || transactionStore.transactionError || 'Transaksi belum berhasil disimpan.'
    await nextTick(); errorBox.value?.focus()
  } finally { saving.value = false }
}
onMounted(loadOptions)
onUnmounted(removeFile)
</script>
