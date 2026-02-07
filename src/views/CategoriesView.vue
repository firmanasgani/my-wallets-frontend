<template>
  <div>
    <div class="flex justify-between items-center mb-6 print:hidden">
      <h1 class="text-3xl font-semibold text-gray-800">Kelola Kategori</h1>
      <button
        @click="openCreateCategoryModal"
        :disabled="!canAddCategory"
        :title="addCategoryButtonTitle"
        class="bg-indigo-600 text-white text-sm font-medium py-1.5 px-3 rounded-lg flex items-center transition-colors"
        :class="!canAddCategory ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-4 h-4 mr-1.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
        Tambah Kategori
      </button>
    </div>

    <LoadingSpinner
      v-if="isLoading && categories.length === 0"
      :visible="true"
      text="Memuat data kategori..."
      size="lg"
      overlay
    />
    <div
      v-if="error && !isLoading"
      class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
      role="alert"
    >
      <p class="font-bold">Gagal Memuat Kategori</p>
      <p>{{ error }}</p>
    </div>
    <div
      v-if="!isLoading && categories.length === 0 && !error"
      class="text-center py-10 bg-white rounded-lg shadow-md print:hidden"
    >
      <svg
        class="mx-auto h-16 w-16 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 4.5 3.75h15A2.25 2.25 0 0 1 21.75 6v3.776"
        />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-slate-800">Belum Ada Kategori</h3>
      <p class="mt-1 text-sm text-slate-500">Anda belum membuat kategori.</p>
      <button
        @click="openCreateCategoryModal"
        :disabled="!canAddCategory"
        :title="addCategoryButtonTitle"
        class="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        :class="!canAddCategory ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'"
      >
        + Tambah Kategori Sekarang
      </button>
    </div>

    <div
      v-if="!isLoading && categories.length > 0"
      class="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8"
    >
      <StatsCard title="Total Kategori" :value="categories.length" variant="indigo">
        <template #icon>
          <svg
            class="h-6 w-6 text-current"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
            />
          </svg>
        </template>
      </StatsCard>

      <StatsCard
        title="Income"
        :value="incomeCategories.length"
        variant="green"
        :subtitle="`${categoryStore.totalIncomeParent} Kategori • ${categoryStore.totalIncomeSub} Sub Kategori`"
      >
        <template #icon>
          <svg
            class="h-6 w-6 text-current"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </template>
      </StatsCard>

      <StatsCard
        title="Expense"
        :value="expenseCategories.length"
        variant="red"
        :subtitle="`${categoryStore.totalExpenseParent} Kategori • ${categoryStore.totalExpenseSub} Sub Kategori`"
      >
        <template #icon>
          <svg
            class="h-6 w-6 text-current"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
          </svg>
        </template>
      </StatsCard>
    </div>

    <div v-if="!isLoading && categories.length > 0" class="space-y-8">
      <div>
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-slate-300">
          <h2 class="text-xl font-semibold text-slate-700">Kategori Pemasukan (Income)</h2>
          <span class="text-sm bg-green-100 text-green-800 py-1 px-3 rounded-full font-medium"
            >Total: {{ incomeCategories.length }}</span
          >
        </div>
        <div v-if="incomeCategories.length === 0" class="text-sm text-slate-500 italic pl-2">
          Belum ada kategori pemasukan.
        </div>
        <ul v-else class="space-y-1">
          <CategoryItem
            v-for="category in incomeCategories"
            :key="category.id"
            :category="category"
            :level="0"
            @edit="openEditCategoryModal"
            @delete="promptDeleteCategory"
          />
        </ul>
      </div>

      <div>
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-slate-300">
          <h2 class="text-xl font-semibold text-slate-700">Kategori Pengeluaran (Expense)</h2>
          <span class="text-sm bg-red-100 text-red-800 py-1 px-3 rounded-full font-medium"
            >Total: {{ expenseCategories.length }}</span
          >
        </div>
        <div v-if="expenseCategories.length === 0" class="text-sm text-slate-500 italic pl-2">
          Belum ada kategori pengeluaran.
        </div>
        <ul v-else class="space-y-1">
          <CategoryItem
            v-for="category in expenseCategories"
            :key="category.id"
            :category="category"
            :level="0"
            @edit="openEditCategoryModal"
            @delete="promptDeleteCategory"
          />
        </ul>
      </div>
    </div>

    <CategoryModal
      v-model:isOpen="isCategoryModalOpen"
      :categoryToEdit="categoryToEdit"
      @saved="handleCategorySaved"
    />

    <ConfirmationModal
      v-model:isOpen="isDeleteModalOpen"
      title="Konfirmasi Hapus Kategori"
      :message="`Apakah Anda yakin ingin menghapus kategori '${categoryToDelete?.categoryName || ''}'? Jika kategori ini memiliki sub-kategori, sub-kategori tersebut akan menjadi kategori utama. Transaksi yang menggunakan kategori ini akan kehilangan kategorinya. Aksi ini tidak dapat dibatalkan.`"
      confirmButtonText="Ya, Hapus"
      confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      iconType="danger"
      :isConfirming="isDeletingCategory || categoryStore.isSubmittingCategory"
      @confirm="handleConfirmDelete"
      @cancel="closeDeleteModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import StatsCard from '@/components/common/StatsCard.vue'
import CategoryItem from '@/components/categories/CategoryItem.vue'
import CategoryModal from '@/components/categories/CategoryModal.vue'
import { useCategoryStore } from '@/stores/categories'
import type { Category } from '@/types/enums'
import { useAuthStore } from '@/stores/auth'

const categoryStore = useCategoryStore()
const authStore = useAuthStore()

const categories = computed(() => categoryStore.allCategories)
const incomeCategories = computed(() => categoryStore.incomeCategories)
const expenseCategories = computed(() => categoryStore.expenseCategories)
const isLoading = computed(() => categoryStore.isLoadingCategories)
const error = computed(() => categoryStore.categoryError)

const canAddCategory = computed(() => {
  const isFree = authStore.currentUser?.subscriptionPlan === 'FREE'
  const countIncome = categoryStore.totalRecursiveIncome
  const countExpense = categoryStore.totalRecursiveExpense
  // Bisa tambah jika bukan Free, ATAU (salah satu dari Income/Expense belum mencapai 15)
  return !isFree || countIncome < 15 || countExpense < 15
})

const addCategoryButtonTitle = computed(() => {
  if (!canAddCategory.value) {
    return 'Batas kategori untuk paket FREE telah tercapai (15 Income & 15 Expense). Upgrade untuk menambah.'
  }
  return 'Tambah Kategori Baru'
})

onMounted(async () => {
  if (categoryStore.allCategories.length === 0) {
    await categoryStore.fetchCategories({ hierarchical: 'true', includeGlobal: 'false' })
  }
})

// State dan fungsi untuk Modal Tambah/Edit Kategori
const isCategoryModalOpen = ref(false)
const categoryToEdit = ref<Category | null>(null)

const openCreateCategoryModal = () => {
  categoryToEdit.value = null // Tidak ada data untuk diedit, berarti mode tambah
  isCategoryModalOpen.value = true
}

const openEditCategoryModal = (category: Category) => {
  categoryToEdit.value = { ...category } // Salin data kategori untuk diedit
  isCategoryModalOpen.value = true
}

const handleCategorySaved = () => {
  console.log('Category saved, modal should close.')
}

// State dan fungsi untuk Modal Hapus Kategori
const isDeleteModalOpen = ref(false)
const categoryToDelete = ref<Category | null>(null)
const isDeletingCategory = ref(false) // Bisa juga pakai categoryStore.isSubmittingCategory

const promptDeleteCategory = (category: Category) => {
  categoryToDelete.value = category
  isDeleteModalOpen.value = true
}

const handleConfirmDelete = async () => {
  if (!categoryToDelete.value) return
  isDeletingCategory.value = true
  try {
    await categoryStore.deleteCategory(categoryToDelete.value.id)
  } catch (error: any) {
    console.error('Gagal menghapus kategori dari view:', error)
  } finally {
    isDeletingCategory.value = false
    closeDeleteModal()
  }
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  categoryToDelete.value = null
}
</script>
