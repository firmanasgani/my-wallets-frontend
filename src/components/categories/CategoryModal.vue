<template>
  <Teleport to="body">
    <dialog ref="dialog" class="money-category-modal" aria-modal="true" :aria-labelledby="`${id}-title`"
      :aria-busy="busy" tabindex="-1" @cancel.prevent="closeModal" @keydown.esc.stop.prevent="closeModal" @close="nativeClose" @click="backdropClick">
      <form @submit.prevent="submit">
        <header class="category-modal-heading"><div><span class="category-eyebrow">RAPIKAN SETIAP CATATAN</span><h2 :id="`${id}-title`">{{ isEdit ? 'Edit kategori.' : 'Kategori baru.' }}</h2><p>{{ isEdit ? 'Perbarui nama, induk, dan tampilan kategori.' : 'Beri nama dan tampilan untuk kelompok transaksimu.' }}</p></div><button type="button" class="category-icon-button" :disabled="busy" aria-label="Tutup editor kategori" @click="closeModal"><AppIcon name="close" /></button></header>
        <div class="category-modal-body">
          <div v-if="localError" ref="errorBox" class="category-form-error" role="alert" tabindex="-1">{{ localError }}</div>
          <fieldset :disabled="busy">
            <legend class="shell-sr-only">Detail kategori</legend>
            <div class="category-form-field"><label :for="`${id}-name`">Nama kategori <span aria-hidden="true">*</span></label><input :id="`${id}-name`" ref="nameInput" v-model="formData.name" type="text" required autocomplete="off" placeholder="Contoh: Belanja harian, Gaji" /></div>
            <div class="category-form-grid">
              <AppSelect :id="`${id}-type`" v-model="formData.type" :options="typeOptions" label="Jenis kategori" :disabled="busy || isEdit" required :helper-text="isEdit ? 'Jenis kategori tetap saat mengedit.' : 'Batas paket Dasar: 15 per jenis.'" />
              <AppSelect :id="`${id}-parent`" v-model="formData.parentId" :options="parentOptions" label="Induk kategori" :disabled="busy" searchable placeholder="Pilih induk" helper-text="Pilih kategori utama jika tidak ingin membuat subkategori." />
            </div>
            <div class="category-form-grid">
              <AppSelect :id="`${id}-icon`" v-model="formData.icon" :options="availableIcons" label="Ikon (opsional)" :disabled="busy" searchable />
              <div class="category-form-field"><label :for="`${id}-color`">Warna (opsional)</label><div class="category-color-input"><input type="color" :value="previewColor" :aria-label="'Pilih warna kategori'" @input="formData.color = ($event.target as HTMLInputElement).value" /><input :id="`${id}-color`" v-model="formData.color" type="text" placeholder="#a780f2" autocomplete="off" :aria-describedby="`${id}-color-hint`" /></div><p :id="`${id}-color-hint`">Gunakan kode hex, misalnya #a780f2.</p></div>
            </div>
            <div class="category-color-presets" role="group" aria-label="Pilihan warna cepat"><span>Palet Moneytory</span><button v-for="color in colors" :key="color.value" type="button" :aria-label="color.label" :aria-pressed="previewColor === color.value" :style="{ backgroundColor: color.value }" :class="{ 'is-selected': previewColor === color.value }" @click="formData.color = color.value"></button></div>
          </fieldset>
          <div class="category-live-preview"><CategoryBadge :color="previewColor" :icon="formData.icon" /><div><strong>{{ formData.name.trim() || 'Nama kategorimu' }}</strong><span>{{ formData.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran' }} · {{ parentLabel }}</span></div><small>Pratinjau</small></div>
        </div>
        <footer class="category-modal-footer"><button type="button" class="category-button" :disabled="busy" @click="closeModal">Batal</button><button type="submit" class="category-button is-primary" :disabled="busy"><span v-if="busy" class="category-spinner" aria-hidden="true"></span><AppIcon v-else name="plus" />{{ busy ? 'Menyimpan...' : isEdit ? 'Simpan perubahan' : 'Tambah kategori' }}</button></footer>
      </form>
    </dialog>
  </Teleport>
</template>
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, useId, watch } from 'vue'
import AppIcon from '@/components/common/AppIcon.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import CategoryBadge from './CategoryBadge.vue'
import { iconOptions } from '@/constants/icons'
import { useCategoryStore } from '@/stores/categories'
import { useAuthStore } from '@/stores/auth'
import { FrontendCategoryType, type Category, type CreateCategoryPayload } from '@/types/enums'
import type { SelectOption } from '@/types/select'
import { buildCategoryPayload, categoryCounts, categoryParentOptions, normalizeCategoryColor } from '@/utils/categoryTree'
import { lockModalScroll } from '@/utils/modalScrollLock'
import '@/assets/categories.css'

const props = withDefaults(defineProps<{ isOpen: boolean; categoryToEdit?: Category | null; initialType?: FrontendCategoryType }>(), {
  categoryToEdit: null, initialType: FrontendCategoryType.EXPENSE,
})
const emit = defineEmits<{ 'update:isOpen': [value: boolean]; saved: [] }>()
const categoryStore = useCategoryStore()
const authStore = useAuthStore()
const id = useId()
const dialog = ref<HTMLDialogElement | null>(null)
const nameInput = ref<HTMLInputElement | null>(null)
const errorBox = ref<HTMLElement | null>(null)
const localError = ref('')
const saving = ref(false)
const busy = computed(() => saving.value || categoryStore.isSubmittingCategory)
const isEdit = computed(() => !!props.categoryToEdit)
const formData = reactive({ name: '', type: FrontendCategoryType.EXPENSE, parentId: null as string | null, icon: '', color: '#a780f2' })
const counts = computed(() => categoryCounts(categoryStore.allCategories))
const canAddType = (type: FrontendCategoryType) => authStore.currentUser?.subscriptionPlan !== 'FREE' || (type === 'INCOME' ? counts.value.income : counts.value.expense) < 15
const typeOptions = computed<SelectOption<FrontendCategoryType>[]>(() => [
  { value: FrontendCategoryType.INCOME, label: 'Pemasukan', disabled: !isEdit.value && !canAddType(FrontendCategoryType.INCOME) },
  { value: FrontendCategoryType.EXPENSE, label: 'Pengeluaran', disabled: !isEdit.value && !canAddType(FrontendCategoryType.EXPENSE) },
])
const parentOptions = computed<SelectOption<string | null>[]>(() => [{ value: null, label: 'Kategori utama (tanpa induk)' }, ...categoryParentOptions(categoryStore.allCategories, formData.type, props.categoryToEdit?.id)])
const parentLabel = computed(() => parentOptions.value.find(({ value }) => value === formData.parentId)?.label || 'Kategori utama')
const availableIcons = computed<SelectOption<string>[]>(() => [{ value: '', label: 'Tanpa ikon khusus' }, ...[...new Set([...iconOptions, ...(formData.icon ? [formData.icon] : [])])].map((value) => ({ value, label: value.replace(/-/g, ' ') }))])
const previewColor = computed(() => normalizeCategoryColor(formData.color) || '#a780f2')
const colors = [{ value: '#a780f2', label: 'Ungu muda' }, { value: '#c8edc6', label: 'Hijau mint' }, { value: '#ffd962', label: 'Kuning' }, { value: '#f2b9c4', label: 'Merah muda' }, { value: '#5026a5', label: 'Ungu tua' }, { value: '#d9cdbb', label: 'Krem' }]
let opener: HTMLElement | null = null
let releaseScroll: (() => void) | null = null
let version = 0
let active = true
const closeDialog = () => {
  const wasOpen = dialog.value?.open
  dialog.value?.close()
  releaseScroll?.(); releaseScroll = null
  if (wasOpen) { if (opener?.isConnected) opener.focus(); else document.getElementById('category-list-heading')?.focus() }
  opener = null
}
const closeModal = () => { if (!busy.value) emit('update:isOpen', false) }
const nativeClose = () => {
  if (dialog.value?.open) return
  releaseScroll?.(); releaseScroll = null
  if (active && props.isOpen) emit('update:isOpen', false)
}
const backdropClick = (event: MouseEvent) => {
  const element = dialog.value
  if (!element || event.target !== element || busy.value) return
  const bounds = element.getBoundingClientRect()
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeModal()
}
watch(() => formData.type, () => { if (formData.parentId && !parentOptions.value.some(({ value }) => value === formData.parentId)) formData.parentId = null })
watch(busy, async (pending) => {
  if (!pending || !props.isOpen) return
  await nextTick()
  if (active && props.isOpen && busy.value) dialog.value?.focus()
})
watch(() => props.isOpen, async (open) => {
  const current = ++version
  if (!open) { closeDialog(); return }
  const category = props.categoryToEdit
  const preferred = canAddType(props.initialType) ? props.initialType : props.initialType === 'INCOME' ? FrontendCategoryType.EXPENSE : FrontendCategoryType.INCOME
  Object.assign(formData, category ? { name: category.categoryName, type: category.categoryType, parentId: category.parentCategoryId || null, icon: category.icon || '', color: category.color || '#a780f2' }
    : { name: '', type: preferred, parentId: null, icon: '', color: '#a780f2' })
  localError.value = ''
  await nextTick()
  if (!active || current !== version || !props.isOpen || !dialog.value || dialog.value.open) return
  opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  dialog.value.showModal()
  releaseScroll = lockModalScroll()
  nameInput.value?.focus()
}, { immediate: true })
const submit = async () => {
  if (busy.value || !props.isOpen) return
  localError.value = ''
  let payload: CreateCategoryPayload
  try {
    if (!isEdit.value && !canAddType(formData.type)) throw new Error('Batas 15 kategori untuk jenis ini sudah tercapai. Pilih jenis lain atau gunakan paket Premium.')
    payload = buildCategoryPayload(formData, categoryStore.allCategories, props.categoryToEdit?.id)
  } catch (error: unknown) {
    localError.value = error instanceof Error ? error.message : 'Periksa kembali detail kategori.'
    await nextTick(); errorBox.value?.focus(); return
  }
  saving.value = true
  try {
    if (props.categoryToEdit) await categoryStore.updateCategory(props.categoryToEdit.id, payload)
    else await categoryStore.createCategory(payload)
    emit('saved'); emit('update:isOpen', false)
  } catch (error: unknown) {
    localError.value = categoryStore.categoryError || (typeof error === 'string' ? error : error instanceof Error ? error.message : '') || 'Kategori belum berhasil disimpan.'
    await nextTick(); errorBox.value?.focus()
  } finally { saving.value = false }
}
onBeforeUnmount(() => { active = false; version++; closeDialog() })
</script>
