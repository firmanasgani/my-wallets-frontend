<template>
  <div>
    <div class="flex justify-between items-center mb-6 print:hidden">
      <h1 class="text-3xl font-semibold text-gray-800">Kelola Kategori</h1>
      <button
        @click="openCreateCategoryModal"
        class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-1.5 px-3 rounded-lg flex items-center transition-colors"
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
        class="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        + Tambah Kategori Sekarang
      </button>
    </div>

    <div v-if="!isLoading && categories.length > 0" class="space-y-8">
      <div>
        <h2 class="text-xl font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-300">
          Kategori Pemasukan (Income)
        </h2>
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
        <h2 class="text-xl font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-300">
          Kategori Pengeluaran (Expense)
        </h2>
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
import CategoryItem from '@/components/categories/CategoryItem.vue'
import CategoryModal from '@/components/categories/CategoryModal.vue' // <-- Impor Modal Form Kategori
import { useCategoryStore } from '@/stores/categories'
import type { Category } from '@/types/enums'

const categoryStore = useCategoryStore()

const categories = computed(() => categoryStore.allCategories)
const incomeCategories = computed(() => categoryStore.incomeCategories)
const expenseCategories = computed(() => categoryStore.expenseCategories)
const isLoading = computed(() => categoryStore.isLoadingCategories)
const error = computed(() => categoryStore.categoryError)

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
