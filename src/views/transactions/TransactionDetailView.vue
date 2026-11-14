<template>
  <div class="transaction-workflow">
    <header class="transaction-page-heading"><RouterLink :to="historyLocation" class="transaction-back" :aria-disabled="busy || undefined" @click="busy && $event.preventDefault()"><AppIcon name="arrow" />Riwayat transaksi</RouterLink><span class="shell-overline">CERITA DI BALIK CATATANMU</span><h1>{{ isEditing ? 'Edit transaksi.' : 'Detail transaksi.' }}</h1><p>{{ isEditing ? 'Perbarui tanggal, kategori, dan catatan transaksi.' : 'Lihat rincian, akun terkait, dan bukti transaksi dalam satu tempat.' }}</p></header>
    <div v-if="loading" class="transaction-state" role="status"><span class="transaction-spinner" aria-hidden="true"></span><h2>Memuat detail transaksi...</h2></div>
    <div v-else-if="!transaction" class="transaction-state" role="alert"><AppIcon name="help" /><h2>Transaksi belum dapat ditampilkan.</h2><p>{{ loadError || 'Transaksi tidak ditemukan atau kamu tidak memiliki akses.' }}</p><button type="button" class="transaction-button" @click="loadTransaction">Coba lagi</button><RouterLink :to="historyLocation" class="transaction-button is-primary">Kembali ke riwayat</RouterLink></div>
    <template v-else>
      <section class="transaction-detail-hero" :class="`is-${transaction.transactionType.toLowerCase()}`" aria-labelledby="transaction-amount-title"><div class="transaction-detail-symbol"><AppIcon :name="typeIcon" /></div><div><span id="transaction-amount-title">{{ typeLabel }}</span><strong>{{ transaction.transactionType === 'TRANSFER' ? '' : transaction.transactionType === 'INCOME' ? '+' : '−' }}{{ accountMoney(transaction.amount, currency) }}</strong><time :datetime="transaction.transactionDate">{{ transactionDateLabel(transaction.transactionDate) }}</time></div><span v-if="transaction.isRecurring" class="transaction-detail-badge">Transaksi berulang</span></section>
      <div class="transaction-detail-layout">
        <div class="transaction-detail-main">
          <section v-if="!isEditing" class="transaction-detail-panel" aria-labelledby="information-heading"><h2 id="information-heading">Informasi transaksi</h2><dl class="transaction-information"><div><dt>Catatan</dt><dd class="transaction-description">{{ transaction.description || 'Tanpa catatan' }}</dd></div><div v-if="transaction.transactionType !== 'TRANSFER'"><dt>Kategori</dt><dd class="transaction-category-display"><CategoryBadge v-if="transaction.category" :color="transaction.category.color" :icon="transaction.category.icon" />{{ transaction.category?.categoryName || 'Tanpa kategori' }}</dd></div><div><dt>Jenis transaksi</dt><dd>{{ typeLabel }}</dd></div></dl></section>
          <form v-else class="transaction-detail-panel" :aria-busy="saving" @submit.prevent="saveChanges">
            <h2>Perbarui catatan</h2><p class="transaction-hint">Jenis, nominal, dan akun transaksi tetap.</p>
            <div v-if="actionError" ref="errorBox" class="transaction-error" role="alert" tabindex="-1">{{ actionError }}</div>
            <fieldset :disabled="saving"><legend class="shell-sr-only">Detail yang bisa diperbarui</legend>
              <div class="transaction-field"><label for="edit-date">Tanggal transaksi</label><AppDatePicker id="edit-date" v-model="editDraft.date" /></div>
              <div v-if="transaction.transactionType !== 'TRANSFER'" class="transaction-field"><AppSelect id="edit-category" v-model="editDraft.categoryId" :options="categoryOptions" label="Kategori" placeholder="Pilih kategori" searchable :disabled="saving || categoryLoading" :loading="categoryLoading" /><p v-if="categoryError" class="transaction-hint">{{ categoryError }} <button type="button" class="transaction-text-button" @click="loadCategories">Coba lagi</button></p></div>
              <div class="transaction-field"><label for="edit-description">Catatan <span>(opsional)</span></label><textarea id="edit-description" v-model="editDraft.description" rows="3" placeholder="Tambahkan catatan transaksi"></textarea></div>
            </fieldset>
            <footer class="transaction-form-actions"><button type="button" class="transaction-button" :disabled="saving" @click="router.push(detailLocation)">Batal</button><button type="submit" class="transaction-button is-primary" :disabled="saving"><span v-if="saving" class="transaction-spinner" aria-hidden="true"></span>{{ saving ? 'Menyimpan...' : 'Simpan perubahan' }}</button></footer>
          </form>
          <section class="transaction-detail-panel" aria-labelledby="accounts-heading"><h2 id="accounts-heading">Akun terkait</h2><div class="transaction-linked-accounts">
            <div v-if="transaction.sourceAccount" class="transaction-linked-account"><AppIcon name="wallet" /><div><span>Dari akun</span><RouterLink :to="{ name: 'account-detail', params: { id: transaction.sourceAccount.id } }">{{ transaction.sourceAccount.accountName }} <span aria-hidden="true">↗</span></RouterLink><small v-if="transaction.sourceAccount.bank">{{ transaction.sourceAccount.bank.name }}</small></div></div>
            <AppIcon v-if="transaction.sourceAccount && transaction.destinationAccount" name="arrow" class="transaction-account-arrow" />
            <div v-if="transaction.destinationAccount" class="transaction-linked-account"><AppIcon name="wallet" /><div><span>Ke akun</span><RouterLink :to="{ name: 'account-detail', params: { id: transaction.destinationAccount.id } }">{{ transaction.destinationAccount.accountName }} <span aria-hidden="true">↗</span></RouterLink><small v-if="transaction.destinationAccount.bank">{{ transaction.destinationAccount.bank.name }}</small></div></div>
          </div></section>
        </div>
        <aside class="transaction-detail-sidebar">
          <section class="transaction-detail-panel"><h2>Lampiran</h2><template v-if="attachmentUrl"><a :href="attachmentUrl" target="_blank" rel="noopener noreferrer" class="transaction-attachment-link"><img v-if="isImage" :src="attachmentUrl" alt="Bukti lampiran transaksi" /><span v-else class="transaction-document-placeholder"><AppIcon name="file" />Dokumen transaksi</span><span>Buka lampiran <AppIcon name="arrow" /></span></a></template><div v-else class="transaction-no-attachment"><AppIcon name="attachment" /><p>Tidak ada lampiran.</p></div></section>
          <section class="transaction-detail-panel"><h2>Riwayat pencatatan</h2><dl class="transaction-information"><div><dt>Dibuat pada</dt><dd>{{ transactionDateLabel(transaction.createdAt, true) }}</dd></div><div><dt>Terakhir diperbarui</dt><dd>{{ transactionDateLabel(transaction.updatedAt, true) }}</dd></div><div><dt>ID transaksi</dt><dd class="transaction-record-id">{{ transaction.id }}</dd></div></dl></section>
        </aside>
      </div>
      <footer v-if="!isEditing" class="transaction-detail-actions print:hidden"><div><RouterLink :to="editLocation" class="transaction-button is-primary"><AppIcon name="edit" />Edit transaksi</RouterLink><button type="button" class="transaction-button" :disabled="exporting || busy" @click="exportPdf"><AppIcon name="download" />{{ exporting ? 'Mengekspor...' : 'Ekspor PDF' }}</button></div><button type="button" class="transaction-button is-danger" :disabled="busy" @click="showDelete = true"><AppIcon name="trash" />Hapus transaksi</button></footer>
    </template>
    <ConfirmationModal v-model:isOpen="showDelete" title="Hapus transaksi?" :message="`Hapus ${typeLabel.toLowerCase()} ${transaction ? accountMoney(transaction.amount, currency) : ''}${transaction?.description ? ` (${transaction.description})` : ''}? Tindakan ini tidak dapat dibatalkan dan saldo akun terkait akan disesuaikan kembali.`" confirmButtonText="Hapus transaksi" iconType="danger" :isConfirming="deleting" @confirm="deleteTransaction" />
  </div>
</template>
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/common/AppIcon.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import AppDatePicker from '@/components/common/AppDatePicker.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import CategoryBadge from '@/components/categories/CategoryBadge.vue'
import { useTransactionStore } from '@/stores/transactions'
import { useCategoryStore } from '@/stores/categories'
import { useToastStore } from '@/stores/toast'
import type { Transaction } from '@/types/transaction'
import type { SelectOption } from '@/types/select'
import { accountMoney } from '@/utils/accountList'
import { buildTransactionUpdate, transactionCategoryOptions, transactionDateLabel } from '@/utils/transactionForm'
import '@/assets/categories.css'
import '@/assets/transaction-workflow.css'

const route = useRoute(), router = useRouter()
const transactionStore = useTransactionStore(), categoryStore = useCategoryStore(), toastStore = useToastStore()
const id = computed(() => typeof route.params.id === 'string' ? route.params.id : '')
const historyLocation = computed(() => ({ name: 'transactions-list', query: route.query }))
const detailLocation = computed(() => ({ name: 'transaction-detail', params: { id: id.value }, query: route.query }))
const editLocation = computed(() => ({ name: 'transaction-edit', params: { id: id.value }, query: route.query }))
const isEditing = computed(() => route.name === 'transaction-edit')
const transaction = ref<Transaction | null>(null)
const loading = ref(true), loadError = ref(''), actionError = ref(''), saving = ref(false), deleting = ref(false), exporting = ref(false), showDelete = ref(false)
const busy = computed(() => saving.value || deleting.value)
const categoryLoading = ref(false), categoryError = ref('')
const editDraft = reactive({ description: '', categoryId: '', date: '' })
const errorBox = ref<HTMLElement | null>(null)
const typeLabel = computed(() => transaction.value?.transactionType === 'INCOME' ? 'Pemasukan' : transaction.value?.transactionType === 'EXPENSE' ? 'Pengeluaran' : 'Transfer')
const typeIcon = computed(() => transaction.value?.transactionType === 'INCOME' ? 'plus' : transaction.value?.transactionType === 'EXPENSE' ? 'arrow' : 'transfer')
const currency = 'IDR'
const categoryOptions = computed<SelectOption<string>[]>(() => {
  if (!transaction.value) return []
  const options = transactionCategoryOptions(categoryStore.allCategories, transaction.value.transactionType)
  const original = transaction.value.category
  if (original && !options.some((option) => option.value === original.id)) options.unshift({ value: original.id, label: original.categoryName, group: 'Kategori saat ini' })
  return options
})
const attachmentUrl = computed(() => {
  if (!transaction.value?.attachmentUrl) return ''
  try { const url = new URL(transaction.value.attachmentUrl, window.location.origin); return ['http:', 'https:'].includes(url.protocol) ? url.href : '' } catch { return '' }
})
const isImage = computed(() => /\.(?:jpe?g|png|gif|webp)(?:[?#]|$)/i.test(transaction.value?.attachmentPath || attachmentUrl.value))
let active = true, version = 0
const prepareEdit = () => { if (transaction.value) Object.assign(editDraft, { description: transaction.value.description || '', categoryId: transaction.value.categoryId || transaction.value.category?.id || '', date: transaction.value.transactionDate.slice(0, 10) }); actionError.value = '' }
const loadCategories = async () => {
  categoryLoading.value = true; categoryError.value = ''
  try { await categoryStore.fetchCategories({ hierarchical: 'true' }); categoryError.value = categoryStore.categoryError || '' }
  catch { categoryError.value = 'Pilihan kategori belum berhasil dimuat.' }
  finally { categoryLoading.value = false }
}
const loadTransaction = async () => {
  const request = ++version
  transaction.value = null; loading.value = true; loadError.value = ''; showDelete.value = false
  if (!id.value) { loadError.value = 'ID transaksi tidak valid.'; loading.value = false; return }
  try {
    const data = await transactionStore.fetchTransactionById(id.value)
    if (!active || request !== version) return
    transaction.value = data
    if (!data) loadError.value = transactionStore.transactionError || 'Transaksi tidak ditemukan.'
    if (isEditing.value) prepareEdit()
  } catch (failure: unknown) { if (active && request === version) loadError.value = failure instanceof Error ? failure.message : 'Detail transaksi belum berhasil dimuat.' }
  finally { if (active && request === version) loading.value = false }
}
const saveChanges = async () => {
  if (!transaction.value || busy.value) return
  const currentId = transaction.value.id
  actionError.value = ''
  try {
    const payload = buildTransactionUpdate(transaction.value, editDraft, categoryStore.allCategories)
    saving.value = true
    if (Object.keys(payload).length) {
      const updated = await transactionStore.updateTransactionDetails(currentId, payload)
      if (!active || id.value !== currentId) return
      transaction.value = { ...transaction.value!, ...updated,
        attachmentUrl: updated.attachmentUrl ?? transaction.value?.attachmentUrl,
        sourceAccount: updated.sourceAccount ? { ...transaction.value?.sourceAccount, ...updated.sourceAccount } : updated.sourceAccount === undefined ? transaction.value?.sourceAccount : updated.sourceAccount,
        destinationAccount: updated.destinationAccount ? { ...transaction.value?.destinationAccount, ...updated.destinationAccount } : updated.destinationAccount === undefined ? transaction.value?.destinationAccount : updated.destinationAccount,
      }
      toastStore.show('Perubahan transaksi berhasil disimpan.')
    }
    if (active && id.value === currentId) await router.push(detailLocation.value)
  } catch (failure: unknown) {
    if (active && id.value === currentId) { actionError.value = (failure instanceof Error ? failure.message : '') || transactionStore.transactionError || 'Perubahan belum berhasil disimpan.'; await nextTick(); errorBox.value?.focus() }
  } finally { saving.value = false }
}
const deleteTransaction = async () => {
  if (!transaction.value || busy.value) return
  const currentId = transaction.value.id
  deleting.value = true
  try { await transactionStore.deleteTransaction(currentId); if (active && id.value === currentId) { toastStore.show('Transaksi berhasil dihapus.'); await router.push(historyLocation.value) } }
  catch (failure: unknown) { toastStore.show(transactionStore.transactionError || (failure instanceof Error ? failure.message : 'Transaksi belum dapat dihapus.'), 'error') }
  finally { deleting.value = false; showDelete.value = false }
}
const exportPdf = async () => {
  if (!transaction.value || exporting.value || busy.value) return
  const row = transaction.value
  exporting.value = true
  try { const { default: ExportService } = await import('@/services/exportService'); ExportService.exportTransactionsToPDF([row], 'Detail transaksi') }
  catch { toastStore.show('Ekspor belum berhasil. Silakan coba lagi.', 'error') }
  finally { exporting.value = false }
}
watch(id, loadTransaction, { immediate: true })
watch(isEditing, (editing) => { if (editing) { prepareEdit(); loadCategories() } }, { immediate: true })
onBeforeUnmount(() => { active = false; version++ })
</script>
