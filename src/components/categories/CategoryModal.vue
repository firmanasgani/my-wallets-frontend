// src/components/categories/CategoryModal.vue
<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 overflow-y-auto bg-slate-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4"
      @keydown.esc="closeModal"
      tabindex="-1"
      @click.self="closeModal"
    >
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        enter-to-class="opacity-100 translate-y-0 sm:scale-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0 sm:scale-100"
        leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      >
        <div
          v-if="isOpen"
          class="bg-white rounded-lg shadow-xl transform transition-all sm:max-w-lg w-full"
          role="dialog"
          aria-modal="true"
          aria-labelledby="category-modal-title"
        >
          <form @submit.prevent="handleSubmit">
            <div class="px-4 pt-5 pb-4 sm:p-6">
              <h3 id="category-modal-title" class="text-xl font-semibold text-slate-800 mb-6">
                {{ isEditMode ? 'Edit Kategori' : 'Tambah Kategori Baru' }}
              </h3>

              <div class="space-y-4">
                <div>
                  <label for="categoryName" class="block text-sm font-medium text-slate-700 mb-1"
                    >Nama Kategori <span class="text-red-500">*</span></label
                  >
                  <input
                    type="text"
                    id="categoryName"
                    v-model="formData.categoryName"
                    required
                    class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
                    placeholder="Mis: Belanja Bulanan"
                  />
                </div>

                <div>
                  <label for="categoryType" class="block text-sm font-medium text-slate-700 mb-1"
                    >Tipe Kategori <span class="text-red-500">*</span></label
                  >
                  <select
                    id="categoryType"
                    v-model="formData.categoryType"
                    required
                    class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
                    :disabled="isEditMode && hasTransactions"
                  >
                    <option disabled value="">Pilih tipe...</option>
                    <option
                      v-for="typeOpt in categoryTypeOptions"
                      :key="typeOpt.value"
                      :value="typeOpt.value"
                    >
                      {{ typeOpt.text }}
                    </option>
                  </select>
                  <p v-if="isEditMode && hasTransactions" class="text-xs text-slate-500 mt-1">
                    Tipe kategori tidak dapat diubah jika sudah digunakan transaksi.
                  </p>
                </div>

                <div>
                  <label
                    for="parentCategoryId"
                    class="block text-sm font-medium text-slate-700 mb-1"
                    >Induk Kategori (Opsional)</label
                  >
                  <select
                    id="parentCategoryId"
                    v-model="formData.parentCategoryId"
                    class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
                  >
                    <option :value="null">-- Tidak Ada Induk (Kategori Utama) --</option>
                    <option
                      v-for="parentOpt in availableParentCategories"
                      :key="parentOpt.id"
                      :value="parentOpt.id"
                    >
                      {{ parentOpt.prefix }}{{ parentOpt.categoryName }} ({{
                        parentOpt.categoryType
                      }})
                    </option>
                  </select>
                </div>

                <div>
                  <label for="categoryIcon" class="block text-sm font-medium text-slate-700 mb-1"
                    >Ikon (Opsional)</label
                  >
                  <input
                    type="text"
                    id="categoryIcon"
                    v-model="formData.icon"
                    class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
                    placeholder="Mis: shopping-cart (nama ikon Font Awesome)"
                  />
                </div>

                <div>
                  <label for="categoryColor" class="block text-sm font-medium text-slate-700 mb-1"
                    >Warna (Opsional)</label
                  >
                  <div class="flex items-center">
                    <input
                      type="color"
                      id="categoryColorPicker"
                      v-model="formData.color"
                      class="h-10 w-10 rounded-md border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      v-model="formData.color"
                      class="input-field ml-2 flex-1"
                      placeholder="#FF0000"
                    />
                  </div>
                </div>
              </div>

              <div v-if="localError" class="mt-4 rounded-md bg-red-50 p-3">
                <p class="text-sm font-medium text-red-700">{{ localError }}</p>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                :disabled="categoryStore.isSubmittingCategory"
                class="btn-primary w-full sm:ml-3 sm:w-auto"
              >
                <LoadingSpinner
                  v-if="categoryStore.isSubmittingCategory"
                  :visible="true"
                  size="xs"
                  color="text-white"
                  class="-ml-1 mr-2"
                />
                {{
                  categoryStore.isSubmittingCategory
                    ? 'Menyimpan...'
                    : isEditMode
                      ? 'Simpan Perubahan'
                      : 'Tambah Kategori'
                }}
              </button>
              <button
                type="button"
                @click="closeModal"
                class="btn-secondary mt-3 w-full sm:mt-0 sm:w-auto"
                :disabled="categoryStore.isSubmittingCategory"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { FrontendCategoryType } from '@/types/enums'
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from '@/types/enums'
import { useCategoryStore } from '@/stores/categories'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

interface Props {
  isOpen: boolean
  categoryToEdit?: Category | null // Data kategori jika mode edit
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  categoryToEdit: null,
})

const emit = defineEmits(['update:isOpen', 'saved'])

const categoryStore = useCategoryStore()
const localError = ref<string | null>(null)

const isEditMode = computed(() => !!props.categoryToEdit && !!props.categoryToEdit.id)
// Untuk demo, kita anggap 'hasTransactions' true jika sedang edit, untuk men-disable type change
// Di aplikasi nyata, Anda perlu cara untuk mengetahui ini (misal, properti dari backend)
const hasTransactions = computed(() => isEditMode.value) // Placeholder

const categoryTypeOptions = [
  { value: FrontendCategoryType.INCOME, text: 'Pemasukan (Income)' },
  { value: FrontendCategoryType.EXPENSE, text: 'Pengeluaran (Expense)' },
]

interface FormData extends Omit<CreateCategoryPayload, 'parentCategoryId'> {
  parentCategoryId: string | null // Memperbolehkan null secara eksplisit
}

const formData = reactive<FormData>({
  categoryName: '',
  categoryType: FrontendCategoryType.EXPENSE, // Default
  parentCategoryId: null,
  icon: '',
  color: '#CBD5E1', // Default warna (slate-300)
})

// Mengisi form saat mode edit atau props.categoryToEdit berubah
watch(
  () => props.categoryToEdit,
  (newVal) => {
    if (newVal && isEditMode.value) {
      formData.categoryName = newVal.categoryName
      formData.categoryType = newVal.categoryType
      formData.parentCategoryId = newVal.parentCategoryId || null
      formData.icon = newVal.icon || ''
      formData.color = newVal.color || '#CBD5E1'
    } else {
      // Reset form untuk mode tambah
      formData.categoryName = ''
      formData.categoryType = FrontendCategoryType.EXPENSE
      formData.parentCategoryId = null
      formData.icon = ''
      formData.color = '#CBD5E1'
    }
  },
  { immediate: true },
) // immediate true agar dijalankan saat komponen pertama kali dimuat

const closeModal = () => {
  if (categoryStore.isSubmittingCategory) return
  emit('update:isOpen', false)
  localError.value = null // Reset error lokal saat modal ditutup
}

const handleSubmit = async () => {
  localError.value = null
  categoryStore.error = null // Reset error di store

  if (!formData.categoryName.trim()) {
    localError.value = 'Nama kategori wajib diisi.'
    return
  }
  if (!formData.categoryType) {
    localError.value = 'Tipe kategori wajib dipilih.'
    return
  }

  const payload: CreateCategoryPayload | UpdateCategoryPayload = {
    name: formData.categoryName,
    type: formData.categoryType,
    parentId: formData.parentCategoryId || null, // Kirim null jika tidak ada
    icon: formData.icon?.trim() || null,
    color: formData.color?.trim() || null,
  }

  try {
    if (isEditMode.value && props.categoryToEdit?.id) {
      await categoryStore.updateCategory(props.categoryToEdit.id, payload as UpdateCategoryPayload)
    } else {
      await categoryStore.createCategory(payload as CreateCategoryPayload)
    }
    emit('saved') // Emit event 'saved'
    closeModal() // Tutup modal setelah sukses
  } catch (error: any) {
    localError.value = categoryStore.error || error.message || 'Terjadi kesalahan.'
    console.error('Error saving category:', error)
  } finally {
    formData.categoryName = ''
    formData.parentCategoryId = null
    formData.icon = ''
    formData.color = '#CBD5E1'
  }
}

// Opsi untuk dropdown parent category
// Ini mengambil semua kategori dan mem-flat-kan nya dengan prefix untuk hierarki
const availableParentCategories = computed(() => {
  const flatCategories: {
    id: string
    categoryName: string
    categoryType: FrontendCategoryType
    prefix: string
  }[] = []
  function flatten(categories: Category[], level = 0) {
    for (const cat of categories) {
      // Jangan izinkan kategori menjadi parent dari dirinya sendiri atau anaknya sendiri
      if (isEditMode.value && props.categoryToEdit?.id === cat.id) continue
      // Juga, idealnya jangan izinkan anak dari kategori yang diedit menjadi parentnya.
      // Logika ini bisa lebih kompleks jika hierarki sangat dalam.

      flatCategories.push({
        id: cat.id,
        categoryName: cat.categoryName,
        categoryType: cat.categoryType,
        prefix: '- '.repeat(level),
      })
      if (cat.subCategories && cat.subCategories.length > 0) {
        flatten(cat.subCategories, level + 1)
      }
    }
  }
  flatten(categoryStore.allCategories) // Gunakan semua kategori dari store
  return flatCategories
})

// Panggil fetchCategories jika belum ada saat modal mungkin dibuka
// Ini hanya contoh, idealnya data sudah ada atau di-trigger oleh parent
onMounted(() => {
  if (categoryStore.allCategories.length === 0) {
    categoryStore.fetchCategories({ hierarchical: 'true' })
  }
})
</script>
