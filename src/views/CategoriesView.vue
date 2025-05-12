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
      v-if="isLoading"
      :visible="true"
      text="Memuat data kategori..."
      size="lg"
      overlay
      color="text-sky-500"
      text-color="text-sky-700"
    />

    <div
      v-if="!isLoading && categories.length === 0 && !error"
      class="text-center py-10 bg-white rounded-lg shadow-md print:hidden"
    >
      <svg
        class="mx-auto h-16 w-16 text-slate-400"
        xmlns="http://www.w3.org/2000/svg"
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
      <p class="mt-1 text-sm text-slate-500">
        Anda belum membuat kategori. Tambahkan kategori untuk mengelompokkan transaksi Anda.
      </p>
      <button
        @click="openCreateCategoryModal"
        class="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        + Tambah Kategori Sekarang
      </button>
    </div>

    <div
      v-if="error && !isLoading"
      class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
      role="alert"
    >
      <p class="font-bold">Gagal Memuat Kategori</p>
      <p>{{ error }}</p>
    </div>

    <div v-if="!isLoading && categories.length > 0" class="space-y-8">
      <div>
        <h2 class="text-xl font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-300">
          Kategori Pemasukan (Income)
        </h2>
        <div v-if="incomeCategories.length === 0" class="text-sm text-slate-500 italic">
          Belum ada kategori pemasukan.
        </div>
        <ul v-else class="space-y-2">
          <CategoryItem
            v-for="category in incomeCategories"
            :key="category.id"
            :category="category"
            :level="0"
            @edit="editCategory"
            @delete="promptDeleteCategory"
          />
        </ul>
      </div>

      <div>
        <h2 class="text-xl font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-300">
          Kategori Pengeluaran (Expense)
        </h2>
        <div v-if="expenseCategories.length === 0" class="text-sm text-slate-500 italic">
          Belum ada kategori pengeluaran.
        </div>
        <ul v-else class="space-y-2">
          <CategoryItem
            v-for="category in expenseCategories"
            :key="category.id"
            :category="category"
            :level="0"
            @edit="editCategory"
            @delete="promptDeleteCategory"
          />
        </ul>
      </div>
    </div>

    <ConfirmationModal
      v-model:isOpen="isDeleteModalOpen"
      title="Konfirmasi Hapus Kategori"
      :message="`Apakah Anda yakin ingin menghapus kategori '${categoryToDelete?.categoryName || ''}'? Jika kategori ini memiliki sub-kategori, sub-kategori tersebut akan menjadi kategori utama. Aksi ini tidak dapat dibatalkan.`"
      confirmButtonText="Ya, Hapus"
      confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      iconType="danger"
      :isConfirming="isDeletingCategory"
      @confirm="handleConfirmDelete"
      @cancel="closeDeleteModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import CategoryItem from '@/components/categories/CategoryItem.vue' // Komponen baru untuk item kategori
// import CategoryFormModal from '@/components/categories/CategoryFormModal.vue'; // Komponen baru untuk form

// Definisikan tipe untuk kategori, termasuk subKategori (sesuaikan dengan data dari API Anda)
// Anda mungkin sudah punya ini di src/types/category.ts atau src/types/index.ts
// Untuk sementara, kita gunakan any. Idealnya impor dari tipe yang sudah ada.
interface Category {
  id: string
  categoryName: string
  categoryType: 'INCOME' | 'EXPENSE' // Seharusnya enum FrontendCategoryType
  icon?: string | null
  color?: string | null
  parentCategoryId?: string | null
  subCategories?: Category[] // Untuk data hierarkis
  userId?: string | null // Untuk membedakan global/default (null) dengan user-specific
}

const isLoading = ref(true)
const categories = ref<Category[]>([]) // Akan diisi dari store
const error = ref<string | null>(null)

// --- DATA DUMMY (Ganti dengan data dari Pinia Store nanti) ---
const dummyCategories: Category[] = [
  // Income
  {
    id: 'cat-inc-1',
    categoryName: 'Gaji',
    categoryType: 'INCOME',
    userId: null,
    icon: 'briefcase',
    color: '#4CAF50',
    subCategories: [],
  },
  {
    id: 'cat-inc-2',
    categoryName: 'Bonus',
    categoryType: 'INCOME',
    userId: 'user-123',
    icon: 'gift',
    color: '#8BC34A',
    subCategories: [],
  },
  // Expense
  {
    id: 'cat-exp-1',
    categoryName: 'Makanan & Minuman',
    categoryType: 'EXPENSE',
    userId: null,
    icon: 'utensils',
    color: '#FF9800',
    subCategories: [
      {
        id: 'sub-cat-exp-1a',
        categoryName: 'Belanja Bahan',
        categoryType: 'EXPENSE',
        parentCategoryId: 'cat-exp-1',
        userId: null,
        icon: 'shopping-basket',
        color: '#FFC107',
        subCategories: [],
      },
      {
        id: 'sub-cat-exp-1b',
        categoryName: 'Makan di Luar',
        categoryType: 'EXPENSE',
        parentCategoryId: 'cat-exp-1',
        userId: 'user-123',
        icon: 'glass-cheers',
        color: '#FFA726',
        subCategories: [],
      },
    ],
  },
  {
    id: 'cat-exp-2',
    categoryName: 'Transportasi',
    categoryType: 'EXPENSE',
    userId: null,
    icon: 'car-side',
    color: '#2196F3',
    subCategories: [],
  },
  {
    id: 'cat-exp-3',
    categoryName: 'Tagihan',
    categoryType: 'EXPENSE',
    userId: 'user-123',
    icon: 'file-invoice',
    color: '#03A9F4',
    subCategories: [],
  },
]

onMounted(async () => {
  // Nanti: Panggil action dari useCategoryStore() untuk fetch kategori
  // const categoryStore = useCategoryStore();
  // await categoryStore.fetchCategories({ hierarchical: true }); // Minta data hierarkis
  // categories.value = categoryStore.categories;
  // isLoading.value = categoryStore.isLoading;
  // error.value = categoryStore.error;

  // Simulasi fetch data
  setTimeout(() => {
    // Filter hanya top-level categories untuk tampilan awal jika data dummy tidak terstruktur hierarkis dari API
    // Jika API sudah mengembalikan data hierarkis (parent dengan children), maka filter ini tidak perlu.
    // Untuk data dummy kita, semua sudah top-level atau ada di dalam children.
    categories.value = dummyCategories.filter((cat) => !cat.parentCategoryId)
    isLoading.value = false
  }, 1000)
})
// --- AKHIR DATA DUMMY ---

const incomeCategories = computed(() =>
  categories.value.filter((cat) => cat.categoryType === 'INCOME'),
)
const expenseCategories = computed(() =>
  categories.value.filter((cat) => cat.categoryType === 'EXPENSE'),
)

// --- Logika untuk Modal Tambah/Edit Kategori ---
const isCategoryModalOpen = ref(false)
const editingCategory = ref<Category | null>(null) // null untuk 'tambah', objek kategori untuk 'edit'

const openCreateCategoryModal = () => {
  editingCategory.value = null // Mode tambah
  isCategoryModalOpen.value = true
  alert('Buka modal Tambah Kategori (implementasi nanti)')
}

const editCategory = (category: Category) => {
  editingCategory.value = { ...category } // Salin objek agar tidak mutasi langsung
  isCategoryModalOpen.value = true
  alert(`Edit kategori: ${category.categoryName} (implementasi nanti)`)
}

const handleSaveCategory = (savedCategory: Category) => {
  // Nanti: Logika untuk menyimpan ke store dan update UI
  console.log('Kategori disimpan:', savedCategory)
  isCategoryModalOpen.value = false
}

// --- Logika untuk Modal Hapus Kategori ---
const isDeleteModalOpen = ref(false)
const categoryToDelete = ref<Category | null>(null)
const isDeletingCategory = ref(false)

const promptDeleteCategory = (category: Category) => {
  categoryToDelete.value = category
  isDeleteModalOpen.value = true
}

const handleConfirmDelete = async () => {
  if (!categoryToDelete.value) return
  isDeletingCategory.value = true
  // Nanti: Panggil action dari useCategoryStore() untuk hapus kategori
  // await categoryStore.deleteCategory(categoryToDelete.value.id);
  console.log(`Menghapus kategori: ${categoryToDelete.value.categoryName}`)
  setTimeout(() => {
    // Simulasi
    categories.value = categories.value.filter((c) => c.id !== categoryToDelete.value!.id)
    // Juga perlu logika untuk menghapus sub-kategori dari parent di UI jika parent dihapus,
    // atau membiarkan service backend yang menangani relasinya dan kita fetch ulang.
    alert(`Kategori '${categoryToDelete.value?.categoryName}' (placeholder) telah dihapus.`)
    isDeletingCategory.value = false
    closeDeleteModal()
  }, 1000)
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  categoryToDelete.value = null
}
</script>
