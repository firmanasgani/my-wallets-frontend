<template>
  <div class="money-categories">
    <header class="categories-heading print:hidden">
      <div><span class="shell-overline">SETIAP CATATAN PUNYA TEMPAT</span><h1>Kelola kategori.</h1><p>Kelompokkan pemasukan dan pengeluaran agar laporan lebih mudah dibaca.</p></div>
      <button type="button" class="category-button is-primary" :disabled="!canAddCategory || isLoading || !!loadError" @click="openCreate()"><AppIcon :name="canAddCategory ? 'plus' : 'lock'" />{{ canAddCategory ? 'Tambah kategori' : 'Batas kategori tercapai' }}</button>
    </header>

    <template v-if="!isLoading && !loadError">
      <aside v-if="isFree" class="categories-plan-note print:hidden"><AppIcon name="book" /><p><strong>Paket Dasar</strong> · {{ counts.income }}/15 kategori pemasukan dan {{ counts.expense }}/15 kategori pengeluaran, termasuk subkategori.<RouterLink :to="{ name: 'settings', query: { upgrade: 'true' } }">Jelajahi Premium ↗</RouterLink></p></aside>
      <div class="category-stats" role="group" aria-label="Filter jenis kategori">
        <button v-for="stat in statistics" :key="stat.type" type="button" :class="[`is-${stat.type.toLowerCase()}`, { 'is-selected': selectedFilter === stat.type }]"
          :aria-pressed="selectedFilter === stat.type" @click="selectedFilter = stat.type"><span><AppIcon :name="stat.icon" />{{ stat.label }}</span><strong>{{ stat.count }}</strong><small>{{ stat.hint }}</small></button>
      </div>

      <section class="category-browser" aria-labelledby="category-list-heading">
        <div class="category-list-heading"><div><h2 id="category-list-heading" ref="listHeading" tabindex="-1">Daftar kategori</h2><p aria-live="polite">{{ resultCount }} kategori ditampilkan, termasuk subkategori.</p></div><button v-if="search || selectedFilter !== 'ALL'" type="button" class="category-text-button print:hidden" @click="resetFilters">Reset filter</button></div>
        <div class="category-toolbar print:hidden">
          <div class="category-search"><AppIcon name="search" /><label for="category-search" class="shell-sr-only">Cari kategori</label><input id="category-search" v-model="search" type="search" placeholder="Cari kategori atau subkategori..." /></div>
          <AppSelect v-model="sortOrder" :options="sortOptions" aria-label="Urutkan kategori" />
          <div class="category-expand-actions"><button type="button" class="category-button" :disabled="!!search.trim()" @click="setExpanded(true)">Buka semua</button><button type="button" class="category-button" :disabled="!!search.trim()" @click="setExpanded(false)">Tutup semua</button></div>
        </div>
        <div v-if="!counts.total" class="category-state"><AppIcon name="tag" /><h3>Mulai dari kategori pertamamu.</h3><p>Buat kategori untuk memisahkan pemasukan, kebutuhan harian, dan rencana lainnya.</p><button type="button" class="category-button is-primary" :disabled="!canAddCategory" @click="openCreate()"><AppIcon name="plus" />Tambah kategori</button></div>
        <div v-else-if="!resultCount" class="category-state"><AppIcon name="search" /><h3>Kategori belum ditemukan.</h3><p>Coba kata kunci lain atau tampilkan semua jenis kategori.</p><button type="button" class="category-button" @click="resetFilters">Tampilkan semua kategori</button></div>
        <div v-else class="category-sections">
          <section v-for="group in visibleGroups" :key="group.type" class="category-group" :class="`is-${group.type.toLowerCase()}`" :aria-labelledby="`category-group-${group.type}`">
            <header><div><span class="category-group-icon"><AppIcon :name="group.type === 'INCOME' ? 'plus' : 'arrow'" /></span><div><h3 :id="`category-group-${group.type}`">{{ group.label }}</h3><p>{{ group.description }}</p></div></div>
              <button type="button" class="category-text-button print:hidden" :disabled="!canAddType(group.type)" @click="openCreate(group.type)"><AppIcon name="plus" />Tambah</button>
            </header>
            <ul class="category-tree"><CategoryItem v-for="category in group.items" :key="category.id" :category="category" :expand-all="expandAll" :expansion-version="expansionVersion" :searching="!!search.trim()" :disabled="isDeleting" @edit="openEdit" @delete="promptDelete" /></ul>
          </section>
        </div>
      </section>
    </template>
    <div v-else-if="isLoading" class="category-state" role="status"><span class="category-spinner" aria-hidden="true"></span><h2>Memuat kategori...</h2><p>Menyiapkan kelompok dan subkategori keuanganmu.</p></div>
    <div v-else class="category-state" role="alert"><AppIcon name="help" /><h2>Kategori belum berhasil dimuat.</h2><p>{{ loadError }}</p><button type="button" class="category-button" @click="loadCategories">Coba lagi</button></div>

    <CategoryModal v-model:isOpen="isCategoryModalOpen" :category-to-edit="categoryToEdit" :initial-type="createType" @saved="handleSaved" />
    <ConfirmationModal v-model:isOpen="isDeleteModalOpen" title="Hapus kategori?"
      :message="`Hapus kategori '${categoryToDelete?.categoryName || ''}'? Tindakan ini tidak dapat dibatalkan. Kategori yang masih digunakan oleh transaksi tidak dapat dihapus.`"
      confirmButtonText="Hapus kategori" iconType="danger" :isConfirming="isDeleting" @confirm="confirmDelete" @cancel="closeDelete" />
  </div>
</template>
<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/common/AppIcon.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import CategoryItem from '@/components/categories/CategoryItem.vue'
import CategoryModal from '@/components/categories/CategoryModal.vue'
import { useCategoryStore } from '@/stores/categories'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { FrontendCategoryType, type Category } from '@/types/enums'
import { categoryCounts, filterCategoryTree } from '@/utils/categoryTree'
import '@/assets/categories.css'

const categoryStore = useCategoryStore()
const authStore = useAuthStore()
const toastStore = useToastStore()
const selectedFilter = ref<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
const search = ref('')
const sortOrder = ref('asc')
const sortOptions = [{ value: 'asc', label: 'Nama A–Z' }, { value: 'desc', label: 'Nama Z–A' }]
const counts = computed(() => categoryCounts(categoryStore.allCategories))
const isFree = computed(() => authStore.currentUser?.subscriptionPlan === 'FREE')
const canAddType = (type: FrontendCategoryType) => !isFree.value || (type === FrontendCategoryType.INCOME ? counts.value.income : counts.value.expense) < 15
const canAddCategory = computed(() => canAddType(FrontendCategoryType.INCOME) || canAddType(FrontendCategoryType.EXPENSE))
const statistics = computed(() => [
  { type: 'ALL' as const, label: 'Semua kategori', icon: 'grid', count: counts.value.total, hint: `${counts.value.parents} utama · ${counts.value.children} subkategori` },
  { type: 'INCOME' as const, label: 'Pemasukan', icon: 'plus', count: counts.value.income, hint: 'Kelompokkan sumber pemasukanmu' },
  { type: 'EXPENSE' as const, label: 'Pengeluaran', icon: 'arrow', count: counts.value.expense, hint: 'Kenali kebutuhan dan pengeluaranmu' },
])
const filteredTree = computed(() => filterCategoryTree(categoryStore.allCategories, search.value, sortOrder.value === 'desc'))
const visibleGroups = computed(() => [
  { type: FrontendCategoryType.INCOME, label: 'Pemasukan', description: 'Sumber dana yang masuk.', items: filteredTree.value.filter((category) => category.categoryType === 'INCOME') },
  { type: FrontendCategoryType.EXPENSE, label: 'Pengeluaran', description: 'Ke mana uangmu digunakan.', items: filteredTree.value.filter((category) => category.categoryType === 'EXPENSE') },
].filter((group) => (selectedFilter.value === 'ALL' || selectedFilter.value === group.type) && group.items.length))
const resultCount = computed(() => visibleGroups.value.reduce((total, group) => total + categoryCounts(group.items).total, 0))
const expandAll = ref(false)
const expansionVersion = ref(0)
const setExpanded = (expanded: boolean) => { expandAll.value = expanded; expansionVersion.value++ }
const resetFilters = () => { search.value = ''; selectedFilter.value = 'ALL' }
const isCategoryModalOpen = ref(false)
const categoryToEdit = ref<Category | null>(null)
const createType = ref(FrontendCategoryType.EXPENSE)
const isDeleteModalOpen = ref(false)
const categoryToDelete = ref<Category | null>(null)
const isDeleting = ref(false)
const isLoading = computed(() => categoryStore.isLoadingCategories && !isCategoryModalOpen.value && !isDeleting.value)
const loadError = ref('')
const listHeading = ref<HTMLElement | null>(null)
const loadCategories = async () => {
  loadError.value = ''
  try { await categoryStore.fetchCategories({ hierarchical: 'true', includeGlobal: 'false' }); loadError.value = categoryStore.categoryError || '' }
  catch { loadError.value = 'Kategori belum berhasil dimuat. Silakan coba lagi.' }
}
const openCreate = (type?: FrontendCategoryType) => {
  if (!canAddCategory.value || isLoading.value || loadError.value || isDeleting.value) return
  const preferred = type || (selectedFilter.value === 'INCOME' ? FrontendCategoryType.INCOME : FrontendCategoryType.EXPENSE)
  createType.value = canAddType(preferred) ? preferred : preferred === FrontendCategoryType.INCOME ? FrontendCategoryType.EXPENSE : FrontendCategoryType.INCOME
  categoryToEdit.value = null
  isCategoryModalOpen.value = true
}
const openEdit = (category: Category) => { if (!isDeleting.value) { categoryToEdit.value = category; isCategoryModalOpen.value = true } }
const handleSaved = () => { loadError.value = categoryStore.categoryError || ''; toastStore.show('Kategori berhasil disimpan.') }
const promptDelete = (category: Category) => {
  if (!category.userId || isDeleting.value) return
  categoryToDelete.value = category
  isDeleteModalOpen.value = true
}
const closeDelete = () => { if (!isDeleting.value) { isDeleteModalOpen.value = false; categoryToDelete.value = null } }
const confirmDelete = async () => {
  if (!categoryToDelete.value || isDeleting.value) return
  isDeleting.value = true
  try { await categoryStore.deleteCategory(categoryToDelete.value.id); loadError.value = categoryStore.categoryError || ''; toastStore.show('Kategori berhasil dihapus.') }
  catch (error: unknown) { toastStore.show(categoryStore.categoryError || (error instanceof Error ? error.message : 'Kategori belum dapat dihapus.'), 'error') }
  finally { isDeleting.value = false; closeDelete(); await nextTick(); listHeading.value?.focus() }
}
onMounted(loadCategories)
</script>
