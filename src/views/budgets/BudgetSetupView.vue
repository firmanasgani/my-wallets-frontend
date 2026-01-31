<template>
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Pengaturan Anggaran</h1>
        <div class="flex items-center flex-wrap gap-2 mt-1">
          <p class="text-sm text-slate-500">Kelola anggaran bulanan Anda di sini.</p>
        </div>
      </div>
      <div>
        <button
          @click="navigateToCreate"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5 mr-2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Buat Anggaran
        </button>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <!-- Date Filters -->
        <div class="flex flex-wrap items-center gap-4">
          <div class="relative group">
            <label for="filterYear" class="sr-only">Tahun</label>
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
            </div>
            <select
              id="filterYear"
              v-model="filterYear"
              class="pl-11 pr-10 py-2.5 block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-700 shadow-sm hover:bg-white hover:border-indigo-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 text-sm font-medium cursor-pointer appearance-none"
            >
              <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
            </select>
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-4 h-4 text-slate-400"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </div>
          </div>

          <div class="relative group">
            <label for="filterMonth" class="sr-only">Bulan</label>
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
            </div>
            <select
              id="filterMonth"
              v-model="filterMonth"
              class="pl-11 pr-10 py-2.5 block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-700 shadow-sm hover:bg-white hover:border-indigo-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 text-sm font-medium cursor-pointer appearance-none"
            >
              <option v-for="(m, index) in monthNames" :key="index" :value="index + 1">
                {{ m }}
              </option>
            </select>
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-4 h-4 text-slate-400"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Search Input -->
        <div class="relative w-full md:w-72 group">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Cari kategori budget..."
            class="pl-11 block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-700 shadow-sm hover:bg-white hover:border-indigo-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 text-sm py-2.5 placeholder:text-slate-400"
          />
        </div>
      </div>
    </div>

    <!-- Monthly Summary -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div class="flex items-center">
          <div class="p-2 bg-indigo-50 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6 text-indigo-600"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-slate-500">Total Anggaran</h3>
            <p class="text-lg font-bold text-slate-900 mt-0.5">
              {{ formatCurrency(totalMonthlyAmount) }}
            </p>
            <p class="text-xs text-slate-400 mt-0.5">
              {{ monthNames[filterMonth - 1] }} {{ filterYear }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div class="flex items-center">
          <div class="p-2 bg-pink-50 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6 text-pink-600"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
              />
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-slate-500">Jumlah Anggaran</h3>
            <p class="text-lg font-bold text-slate-900 mt-0.5">
              {{ budgetStore.allBudgets.length }} Kategori
            </p>
            <p class="text-xs text-slate-400 mt-0.5">
              {{ monthNames[filterMonth - 1] }} {{ filterYear }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Budget List -->
    <div class="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
      <div v-if="isLoading" class="p-12 flex justify-center">
        <LoadingSpinner :visible="true" text="Memuat anggaran..." />
      </div>

      <div v-else-if="budgets.length === 0" class="p-12 text-center">
        <p class="text-slate-500">Belum ada anggaran untuk periode ini.</p>
        <button
          @click="navigateToCreate"
          :disabled="!canAddBudget"
          :title="addBudgetButtonTitle"
          class="mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          :class="{ 'opacity-50 cursor-not-allowed hover:text-indigo-600': !canAddBudget }"
        >
          Buat anggaran baru
        </button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Kategori
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Nominal
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Deskripsi
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            <tr v-for="budget in budgets" :key="budget.id" class="hover:bg-slate-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    class="h-8 w-8 rounded-full flex items-center justify-center text-lg mr-3"
                    :style="{
                      backgroundColor: budget.category?.color + '20' || '#f1f5f9',
                      color: budget.category?.color || '#64748b',
                    }"
                  >
                    <!-- Icon placeholder or library implementation -->
                    <span v-if="budget.category?.icon">
                      <i :class="['fa-solid', `fa-${budget.category.icon}`]"></i>
                    </span>
                    <span v-else>📁</span>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-slate-900">
                      {{ budget.category?.categoryName }}
                    </div>
                    <div class="text-xs text-slate-500">
                      {{ budget.category?.categoryType }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-bold text-slate-900">
                  {{ formatCurrency(budget.amount) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-slate-500 truncate max-w-xs">
                  {{ budget.description || '-' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="navigateToEdit(budget.id)"
                  class="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Edit
                </button>
                <button @click="confirmDelete(budget)" class="text-red-600 hover:text-red-900">
                  Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      v-model:isOpen="isDeleteModalOpen"
      title="Hapus Anggaran"
      message="Apakah Anda yakin ingin menghapus anggaran ini? Tindakan ini tidak dapat dibatalkan."
      confirmButtonText="Hapus"
      confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      iconType="danger"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBudgetStore } from '@/stores/budget'
import LoadinSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import type { Budget } from '@/types/budget'

import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const budgetStore = useBudgetStore()
const authStore = useAuthStore()

// No Free plan validation here as route guard handles it

const currentDate = new Date()
const filterYear = ref(currentDate.getFullYear())
const filterMonth = ref(currentDate.getMonth() + 1)
// ... existing variables ...

// ...

onMounted(async () => {
  await Promise.all([fetchData(), budgetStore.fetchTotalBudgetCount()])
})

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

const searchQuery = ref('')
const budgets = computed(() => {
  const all = budgetStore.allBudgets
  if (!searchQuery.value) return all
  const lower = searchQuery.value.toLowerCase()
  return all.filter((b) => b.category?.categoryName.toLowerCase().includes(lower))
})
const isLoading = computed(() => budgetStore.isLoadingBudgets)

const totalMonthlyAmount = computed(() => {
  return budgetStore.allBudgets.reduce((sum, b) => sum + (Number(b.amount) || 0), 0)
})

const fetchData = async () => {
  await budgetStore.fetchBudgets({
    year: filterYear.value,
    month: filterMonth.value,
  })
}

const navigateToCreate = () => {
  router.push({ name: 'budget-create' })
}

const navigateToEdit = (id: string) => {
  router.push({ name: 'budget-edit', params: { id } })
}

// Delete Logic
const isDeleteModalOpen = ref(false)
const budgetToDelete = ref<Budget | null>(null)

const confirmDelete = (budget: Budget) => {
  budgetToDelete.value = budget
  isDeleteModalOpen.value = true
}

const handleDelete = async () => {
  if (budgetToDelete.value) {
    try {
      await budgetStore.deleteBudget(budgetToDelete.value.id)
      await fetchData()
    } catch (e) {
      console.error(e)
    }
  }
  isDeleteModalOpen.value = false
  budgetToDelete.value = null
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

onMounted(() => {
  fetchData()
})

watch([filterYear, filterMonth], () => {
  fetchData()
})
</script>
