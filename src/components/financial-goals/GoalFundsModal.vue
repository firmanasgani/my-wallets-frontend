<template>
  <GoalDialog :is-open="isOpen" :title="content.title" :description="content.description" :busy="saving" @close="$emit('close')">
    <div v-if="loading" class="goal-dialog-state" role="status"><span class="goal-spinner" aria-hidden="true"></span>Menyiapkan akun dan kategori...</div>
    <div v-else-if="loadError" class="goal-dialog-state" role="alert"><p>{{ loadError }}</p><button type="button" class="goal-button" @click="loadOptions">Coba lagi</button></div>
    <form v-else class="goal-dialog-form" :aria-busy="saving" @submit.prevent="submit">
      <div class="goal-funds-summary"><span>{{ goal.name }}</span><strong>{{ accountMoney(goalNumber(goal.currentSaved), 'IDR') }}</strong><small>Dana goal yang teralokasi saat ini</small></div>
      <div v-if="error" ref="errorBox" class="goal-error" role="alert" tabindex="-1"><AppIcon name="warning" />{{ error }}</div>
      <fieldset :disabled="saving"><legend class="shell-sr-only">Rincian pergerakan dana goal</legend>
        <AppSelect id="goal-fund-account" v-model="draft.accountId" :options="accountOptions" :label="mode === 'spend' ? 'Bayar dari akun' : mode === 'release' ? 'Lepas alokasi dari akun' : 'Alokasikan dari akun'" searchable required :disabled="saving" placeholder="Pilih akun" />
        <p v-if="!accountOptions.length" class="goal-hint">Tambahkan akun melalui Daftar akun terlebih dahulu.</p>
        <div class="goal-field goal-amount-field"><label for="goal-fund-amount">Nominal dana</label><div><span>IDR</span><CurrencyInput id="goal-fund-amount" v-model="draft.amount" required placeholder="0" /></div><p v-if="mode === 'release'" class="goal-hint">Dapat dilepas dari akun ini: {{ accountMoney(releaseLimit, 'IDR') }}.</p><p v-else-if="mode === 'allocate'" class="goal-hint">Saldo bebas setelah alokasi ke goal lain diperiksa saat menyimpan.</p><p v-else class="goal-hint">Pengeluaran mengurangi saldo akun dan alokasi goal.</p></div>
        <template v-if="mode === 'spend'"><AppSelect id="goal-fund-category" v-model="draft.categoryId" :options="categoryOptions" label="Kategori pengeluaran" searchable required :disabled="saving" placeholder="Pilih kategori" /><p v-if="!categoryOptions.length" class="goal-hint">Tambahkan kategori pengeluaran sebelum menggunakan dana.</p><div class="goal-field"><label for="goal-fund-date">Tanggal pengeluaran</label><input id="goal-fund-date" v-model="draft.date" type="date" required /></div></template>
        <div class="goal-field"><label for="goal-fund-note">Catatan <span>(opsional)</span></label><textarea id="goal-fund-note" v-model="draft.note" rows="2" maxlength="255" placeholder="Tambahkan keterangan dana ini"></textarea></div>
      </fieldset>
      <div class="goal-form-note"><AppIcon name="info" /><p>{{ content.note }}</p></div>
      <footer class="goal-dialog-actions"><button type="button" class="goal-button" :disabled="saving" @click="$emit('close')">Batal</button><button type="submit" class="goal-button is-primary" :disabled="saving || !accountOptions.length"><span v-if="saving" class="goal-spinner" aria-hidden="true"></span>{{ saving ? 'Menyimpan...' : content.action }}</button></footer>
    </form>
  </GoalDialog>
</template>
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import GoalDialog from './GoalDialog.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import CurrencyInput from '@/components/common/CurrencyInput.vue'
import { useFinancialGoalStore } from '@/stores/financialGoals'
import { useAccountStore } from '@/stores/accounts'
import { useCategoryStore } from '@/stores/categories'
import { accountMoney } from '@/utils/accountList'
import { dateKey } from '@/utils/dateRange'
import { flattenCategories } from '@/utils/categoryTree'
import { goalNumber, releasableFromAccount, validateGoalFunds, type GoalFundMode } from '@/utils/financialGoals'
import type { FinancialGoal } from '@/types/financialGoals'
const props = defineProps<{ isOpen: boolean; goal: FinancialGoal; mode: GoalFundMode }>()
const emit = defineEmits<{ close: []; success: [] }>()
const store = useFinancialGoalStore(), accounts = useAccountStore(), categories = useCategoryStore()
const loading = ref(true), loadError = ref(''), saving = ref(false), error = ref(''), errorBox = ref<HTMLElement | null>(null)
const draft = reactive({ accountId: '', amount: null as number | null, categoryId: '', date: dateKey(new Date()), note: '' })
const content = computed(() => ({
  allocate: { title: 'Sisihkan dana untuk goal.', description: 'Tandai dana dari akunmu untuk tujuan ini.', action: 'Alokasikan dana', note: 'Alokasi menandai dana untuk goal tanpa mengubah saldo akun atau membuat transaksi pengeluaran.' },
  spend: { title: 'Gunakan dana goal.', description: 'Catat pengeluaran nyata dari dana yang sudah disiapkan.', action: 'Catat pengeluaran', note: 'Tindakan ini membuat transaksi pengeluaran dan mengurangi saldo akun serta alokasi goal.' },
  release: { title: 'Lepaskan alokasi dana.', description: 'Jadikan dana yang disisihkan tersedia kembali di akun asalnya.', action: 'Lepaskan alokasi', note: 'Saldo akun tetap. Dana yang dilepas tidak lagi dialokasikan ke goal ini.' },
})[props.mode])
const releaseLimit = computed(() => releasableFromAccount(props.goal.ledgers || [], draft.accountId))
const accountOptions = computed(() => accounts.allAccounts.map((account) => ({ value: account.id, label: account.accountName, description: props.mode === 'release' ? `Dapat dilepas ${accountMoney(releasableFromAccount(props.goal.ledgers || [], account.id), 'IDR')}` : `${account.currency} · Saldo ${accountMoney(account.currentBalance, account.currency)}`, disabled: props.mode === 'release' && releasableFromAccount(props.goal.ledgers || [], account.id) <= 0 })))
const categoryOptions = computed(() => flattenCategories(categories.allCategories).filter((category) => category.categoryType === 'EXPENSE' && category.userId !== null).map((category) => ({ value: category.id, label: category.categoryName })))
let active = true
const loadOptions = async () => {
  loading.value = true; loadError.value = ''
  const results = await Promise.allSettled([accounts.fetchAccounts(), props.mode === 'spend' ? categories.fetchCategories({ hierarchical: 'true' }) : Promise.resolve()])
  if (!active) return
  if (results.some((result) => result.status === 'rejected') || accounts.error || (props.mode === 'spend' && categories.categoryError)) loadError.value = 'Akun atau kategori belum berhasil dimuat.'
  loading.value = false
}
const submit = async () => {
  if (saving.value || loading.value || loadError.value) return
  error.value = ''
  try {
    validateGoalFunds(props.mode, props.goal, draft, accounts.allAccounts, categories.allCategories)
    saving.value = true
    const payload = { accountId: draft.accountId, amount: draft.amount!, note: draft.note.trim() || undefined }
    if (props.mode === 'allocate') await store.allocateFunds(props.goal.id, payload)
    else if (props.mode === 'release') await store.releaseFunds(props.goal.id, payload)
    else await store.spendFunds(props.goal.id, { ...payload, categoryId: draft.categoryId, transactionDate: draft.date })
    emit('success')
  } catch (failure: unknown) { error.value = failure instanceof Error ? failure.message : 'Perubahan dana belum berhasil disimpan.'; await nextTick(); errorBox.value?.focus() }
  finally { saving.value = false }
}
onMounted(loadOptions)
onBeforeUnmount(() => { active = false })
</script>
