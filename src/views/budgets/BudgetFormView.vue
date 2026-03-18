<template>
  <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
        {{ isEditing ? 'Edit Anggaran' : 'Buat Anggaran Baru' }}
      </h1>
      <button
        @click="goBack"
        class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 hover:cursor-pointer"
      >
        Kembali
      </button>
    </div>

    <div class="bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Period Selectors (For Create only usually, or Readonly for Edit) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="year" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tahun</label>
            <select
              id="year"
              v-model="formData.year"
              :disabled="isEditing"
              class="block w-full rounded-lg border border-slate-300 bg-white shadow-sm py-2.5 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 transition-colors disabled:bg-slate-100 dark:disabled:bg-slate-600 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
          <div>
            <label for="month" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bulan</label>
            <select
              id="month"
              v-model="formData.month"
              :disabled="isEditing"
              class="block w-full rounded-lg border border-slate-300 bg-white shadow-sm py-2.5 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 transition-colors disabled:bg-slate-100 dark:disabled:bg-slate-600 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              <option v-for="(m, index) in monthNames" :key="index" :value="index + 1">
                {{ m }}
              </option>
            </select>
          </div>
        </div>

        <!-- Category -->
        <div>
          <label for="category" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >Kategori</label
          >
          <select
            id="category"
            v-model="formData.categoryId"
            :disabled="isEditing"
            class="block w-full rounded-lg border border-slate-300 bg-white shadow-sm py-2.5 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 transition-colors disabled:bg-slate-100 dark:disabled:bg-slate-600 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            <option value="" disabled>Pilih Kategori</option>
            <optgroup label="Pengeluaran">
              <option v-for="cat in flatExpenseCategories" :key="cat.id" :value="cat.id">
                {{ cat.categoryName }} ({{ cat.parentCategoryId ? 'Sub' : 'Main' }})
              </option>
            </optgroup>
            <optgroup label="Pemasukan">
              <option v-for="cat in incomeCategories" :key="cat.id" :value="cat.id">
                {{ cat.categoryName }}
              </option>
            </optgroup>
          </select>
          <p v-if="isEditing" class="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Kategori dan periode tidak dapat diubah saat edit.
          </p>
        </div>

        <!-- Amount -->
        <div>
          <label for="amount" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >Jumlah Anggaran</label
          >
          <div class="relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-slate-500 dark:text-slate-400 sm:text-sm">Rp</span>
            </div>
            <CurrencyInput
              id="amount"
              v-model="formData.amount"
              class="block w-full rounded-lg border border-slate-300 bg-white shadow-sm py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-500 transition-colors"
              placeholder="0"
            />
          </div>
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >Deskripsi (Opsional)</label
          >
          <textarea
            id="description"
            v-model="formData.description"
            rows="3"
            class="block w-full rounded-lg border border-slate-300 bg-white shadow-sm py-2.5 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-500 transition-colors"
          ></textarea>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 dark:bg-red-900/30 p-4 rounded-md">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-300">Gagal menyimpan anggaran</h3>
              <div class="mt-2 text-sm text-red-700 dark:text-red-400">
                <p>{{ error }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Button Actions -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            @click="goBack"
            class="bg-white dark:bg-slate-700 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              v-if="isSubmitting"
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBudgetStore } from '@/stores/budget'
import { useCategoryStore } from '@/stores/categories'
import CurrencyInput from '@/components/common/CurrencyInput.vue'

const router = useRouter()
const route = useRoute()
const budgetStore = useBudgetStore()
const categoryStore = useCategoryStore()

const isEditing = computed(() => route.name === 'budget-edit')
const budgetId = computed(() => route.params.id as string)

const currentDate = new Date()
const formData = reactive({
  year: currentDate.getFullYear(),
  month: currentDate.getMonth() + 1,
  categoryId: '',
  amount: 0,
  description: '',
})

const isSubmitting = computed(() => budgetStore.isSubmittingBudget)
const error = computed(() => budgetStore.budgetError)

const monthNames = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]
const availableYears = computed(() => {
  const years = []
  const current = new Date().getFullYear()
  for (let i = current - 2; i <= current + 2; i++) {
    years.push(i)
  }
  return years
})

const flattenedCategories = computed(() => {
  const flat: any[] = []
  categoryStore.allCategories.forEach((cat) => {
    flat.push(cat) // Parent
    if (cat.subCategories && cat.subCategories.length > 0) {
      cat.subCategories.forEach((sub) => flat.push(sub))
    }
  })
  return flat
})

const incomeCategories = computed(() =>
  flattenedCategories.value.filter((c) => c.categoryType === 'INCOME'),
)
const flatExpenseCategories = computed(() =>
  flattenedCategories.value.filter((c) => c.categoryType === 'EXPENSE'),
)

onMounted(async () => {
  if (categoryStore.allCategories.length === 0) {
    await categoryStore.fetchCategories()
  }

  if (isEditing.value && budgetId.value) {
    const budget = budgetStore.allBudgets.find((b) => b.id === budgetId.value)
    if (!budget) {
    } else {
      formData.year = budget.year
      formData.month = budget.month
      formData.categoryId = budget.categoryId
      formData.amount = Number(budget.amount)
      formData.description = budget.description || ''
    }
  }
})

const goBack = () => {
  router.push({ name: 'budget-setup' })
}

const submitForm = async () => {
  if (!formData.categoryId && !isEditing.value) return

  try {
    if (isEditing.value) {
      await budgetStore.updateBudget(budgetId.value, {
        amount: formData.amount,
        description: formData.description,
      })
    } else {
      await budgetStore.createBudget({
        categoryId: formData.categoryId,
        amount: formData.amount,
        year: formData.year,
        month: formData.month,
        description: formData.description,
      })
    }
    router.push({ name: 'budget-setup' })
  } catch (e) {
    // Error handled in store helper usually, but we display via 'error' computed
    console.error('Submit error', e)
  }
}
</script>
