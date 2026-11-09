<template>
  <div class="money-budgets">
    <header class="budget-heading"><div><RouterLink :to="backLocation" class="budget-back" :aria-disabled="saving || undefined" @click="saving && $event.preventDefault()"><AppIcon name="arrow" />Pengaturan anggaran</RouterLink><span class="shell-overline">RUANG UNTUK RENCANAMU</span><h1>{{ isEditing ? 'Sesuaikan rencanamu.' : 'Buat ruang untuk prioritas.' }}</h1><p>{{ isEditing ? 'Perbarui nominal dan catatan anggaran bulananmu.' : 'Tentukan kategori, periode, dan nominal yang ingin kamu rencanakan.' }}</p></div></header>
    <div v-if="loading" class="budget-state" role="status"><span class="budget-spinner" aria-hidden="true"></span><h2>Menyiapkan formulir...</h2></div>
    <div v-else-if="loadError" class="budget-state" role="alert"><AppIcon name="help" /><h2>Formulir belum dapat ditampilkan.</h2><p>{{ loadError }}</p><button type="button" class="budget-button" @click="loadForm">Coba lagi</button><RouterLink :to="backLocation" class="budget-button">Kembali ke anggaran</RouterLink></div>
    <div v-else class="budget-editor-layout">
      <form class="budget-form-panel" :aria-busy="saving" @submit.prevent="submitForm">
        <div v-if="error" ref="errorBox" class="budget-error" role="alert" tabindex="-1"><AppIcon name="warning" /><span>{{ error }}</span></div>
        <fieldset :disabled="saving"><legend class="budget-section-title">01 <span>Periode &amp; kategori</span></legend>
          <BudgetPeriodPicker id="form-period" v-model:year="draft.year" v-model:month="draft.month" :disabled="isEditing || saving" />
          <AppSelect id="budget-category" v-model="draft.categoryId" :options="categoryOptions" label="Kategori anggaran" placeholder="Pilih kategori" searchable required :disabled="isEditing || saving" />
          <p v-if="isEditing" class="budget-hint">Kategori dan periode tetap. Kamu bisa mengubah nominal serta catatan.</p>
          <p v-else-if="!categoryOptions.length" class="budget-hint">Belum ada kategori. <RouterLink :to="{ name: 'categories-list' }">Tambahkan kategori ↗</RouterLink> sebelum membuat anggaran.</p>
          <div class="budget-form-divider"></div>
          <h2 class="budget-section-title">02 <span>Nominal &amp; catatan</span></h2>
          <div class="budget-field budget-amount-field"><label for="budget-amount">{{ isIncome ? 'Target pemasukan' : 'Batas pengeluaran' }}</label><div><span>IDR</span><CurrencyInput id="budget-amount" v-model="draft.amount" required placeholder="0" :options="{ currency: 'IDR' }" aria-describedby="budget-amount-hint" /></div><p id="budget-amount-hint" class="budget-hint">{{ isIncome ? 'Jumlah pemasukan yang ingin kamu capai pada periode ini.' : 'Jumlah pengeluaran yang kamu rencanakan pada periode ini.' }}</p></div>
          <div class="budget-field"><label for="budget-description">Catatan <span>(opsional)</span></label><textarea id="budget-description" v-model="draft.description" rows="4" placeholder="Contoh: Belanja kebutuhan rumah bulan ini"></textarea></div>
        </fieldset>
        <footer class="budget-form-actions"><button type="button" class="budget-button" :disabled="saving" @click="router.push(backLocation)">Batal</button><button type="submit" class="budget-button is-primary" :disabled="saving || !categoryOptions.length"><span v-if="saving" class="budget-spinner" aria-hidden="true"></span><AppIcon v-else name="check" />{{ saving ? 'Menyimpan...' : isEditing ? 'Simpan perubahan' : 'Simpan anggaran' }}</button></footer>
      </form>
      <aside class="budget-plan-preview"><span class="shell-overline">RENCANA PILIHANMU</span><h2>{{ selectedCategory?.categoryName || 'Satu langkah lebih terarah.' }}</h2><div class="budget-preview-value" :class="isIncome ? 'is-mint' : 'is-sun'"><AppIcon :name="isIncome ? 'target' : 'wallet'" /><span>{{ isIncome ? 'Target pemasukan' : 'Batas pengeluaran' }}</span><strong>{{ accountMoney(draft.amount ?? 0, 'IDR') }}</strong></div><dl><div><dt>Periode anggaran</dt><dd>{{ budgetPeriodLabel(draft.year, draft.month) }}</dd></div><div><dt>Kategori</dt><dd>{{ selectedCategory?.categoryName || 'Belum dipilih' }}</dd></div><div><dt>Jenis rencana</dt><dd>{{ selectedCategory ? isIncome ? 'Pemasukan' : 'Pengeluaran' : 'Belum dipilih' }}</dd></div></dl><p><AppIcon name="info" />Anggaran tidak mengubah saldo akun. Realisasi mengikuti transaksi pada kategori dan periode yang dipilih.</p></aside>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import BudgetPeriodPicker from '@/components/budgets/BudgetPeriodPicker.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import CurrencyInput from '@/components/common/CurrencyInput.vue'
import { useBudgetStore } from '@/stores/budget'
import { useCategoryStore } from '@/stores/categories'
import { useToastStore } from '@/stores/toast'
import { flattenCategories } from '@/utils/categoryTree'
import { budgetCategoryOptions, budgetPeriod, budgetPeriodLabel, buildBudgetPayload } from '@/utils/budget'
import { accountMoney } from '@/utils/accountList'
import type { Budget } from '@/types/budget'
import '@/assets/budgets.css'

const route = useRoute(), router = useRouter(), store = useBudgetStore(), categoryStore = useCategoryStore(), toast = useToastStore()
const isEditing = computed(() => route.name === 'budget-edit')
const budgetId = computed(() => typeof route.params.id === 'string' ? route.params.id : '')
const draft = reactive({ ...budgetPeriod(route.query.year, route.query.month), categoryId: '', amount: null as number | null, description: '' })
const original = ref<Budget | null>(null)
const loading = ref(true), saving = ref(false), loadError = ref(''), error = ref(''), errorBox = ref<HTMLElement | null>(null)
const categories = computed(() => {
  const items = flattenCategories(categoryStore.allCategories)
  if (original.value?.category && !items.some((item) => item.id === original.value?.categoryId)) items.push(original.value.category)
  return items
})
const categoryOptions = computed(() => budgetCategoryOptions(categories.value))
const selectedCategory = computed(() => categories.value.find((category) => category.id === draft.categoryId))
const isIncome = computed(() => selectedCategory.value?.categoryType === 'INCOME')
const backLocation = computed(() => ({ name: 'budget-setup', query: { ...route.query, year: String(draft.year), month: String(draft.month) } }))
let active = true, request = 0
const loadForm = async () => {
  const version = ++request
  loading.value = true; loadError.value = ''; error.value = ''; original.value = null
  Object.assign(draft, { ...budgetPeriod(route.query.year, route.query.month), categoryId: '', amount: null, description: '' })
  try {
    if (isEditing.value && !budgetId.value) throw new Error('ID anggaran tidak valid.')
    const [budget] = await Promise.all([isEditing.value ? store.fetchBudgetById(budgetId.value) : Promise.resolve(null), categoryStore.fetchCategories({ hierarchical: 'true' })])
    if (!active || version !== request) return
    if (categoryStore.categoryError) throw new Error(categoryStore.categoryError)
    if (isEditing.value && !budget) throw new Error('Anggaran tidak ditemukan.')
    if (budget) { original.value = budget; Object.assign(draft, { year: budget.year, month: budget.month, categoryId: budget.categoryId, amount: Number(budget.amount), description: budget.description || '' }) }
  } catch { if (active && version === request) loadError.value = 'Anggaran atau kategori belum berhasil dimuat. Periksa koneksi dan pastikan anggaran masih tersedia.' }
  finally { if (active && version === request) loading.value = false }
}
const submitForm = async () => {
  if (saving.value || loading.value || loadError.value) return
  const version = request
  error.value = ''
  try {
    const payload = buildBudgetPayload(draft, categories.value)
    saving.value = true
    if (isEditing.value) {
      if (!original.value) throw new Error('Anggaran tidak ditemukan.')
      await store.updateBudget(original.value.id, { amount: payload.amount, description: payload.description })
    } else await store.createBudget(payload)
    if (active && version === request) { toast.show(isEditing.value ? 'Anggaran berhasil diperbarui.' : 'Anggaran berhasil dibuat.'); await router.push(backLocation.value) }
  } catch (failure: unknown) {
    if (!active || version !== request) return
    error.value = (failure instanceof Error && !('response' in failure) ? failure.message : '') || store.budgetError || 'Anggaran belum berhasil disimpan.'
    await nextTick(); errorBox.value?.focus()
  } finally { saving.value = false }
}
watch([isEditing, budgetId], loadForm, { immediate: true })
onBeforeUnmount(() => { active = false; request++ })
</script>
