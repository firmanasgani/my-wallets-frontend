<template>
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Laporan Anggaran</h1>
        <p class="text-sm text-slate-500 mt-1">Pantau realisasi anggaran Anda.</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
        <!-- Export Buttons -->
        <div v-if="reportData.length > 0" class="flex gap-2">
          <button
            @click="exportBudget('excel')"
            class="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium py-2 px-4 rounded-lg flex items-center transition-colors shadow-sm"
            title="Download Excel"
          >
            <i class="fa-solid fa-file-excel mr-2 text-green-600"></i>
            Excel
          </button>
          <button
            @click="exportBudget('pdf')"
            class="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium py-2 px-4 rounded-lg flex items-center transition-colors shadow-sm"
            title="Download PDF"
          >
            <i class="fa-solid fa-file-pdf mr-2 text-red-600"></i>
            PDF
          </button>
        </div>

        <!-- Filters -->
        <div class="flex gap-4">
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
          </div>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="p-12 flex justify-center">
      <LoadingSpinner :visible="true" text="Memuat laporan..." />
    </div>

    <div
      v-else-if="reportData.length === 0"
      class="bg-white p-12 text-center rounded-lg shadow-sm border border-slate-200"
    >
      <p class="text-slate-500">Tidak ada data anggaran untuk periode ini.</p>
      <RouterLink
        :to="{ name: 'budget-setup' }"
        class="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium"
        >Buat anggaran sekarang</RouterLink
      >
    </div>

    <div v-else class="space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 class="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
            Total Anggaran
          </h3>
          <p class="text-2xl font-bold text-slate-900">{{ formatCurrency(totalBudget) }}</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 class="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
            Total Terpakai
          </h3>
          <p class="text-2xl font-bold text-red-600">{{ formatCurrency(totalSpent) }}</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 class="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
            Sisa Anggaran
          </h3>
          <p
            class="text-2xl font-bold"
            :class="totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'"
          >
            {{ formatCurrency(totalRemaining) }}
          </p>
        </div>
      </div>

      <!-- Detail List -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 class="text-lg font-medium text-slate-900">Rincian per Kategori</h3>
        </div>
        <ul class="divide-y divide-slate-200">
          <li v-for="item in reportData" :key="item.id" class="p-6">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center">
                <div
                  class="h-10 w-10 rounded-full flex items-center justify-center text-lg mr-3"
                  :style="{
                    backgroundColor: item.category?.color + '20' || '#f1f5f9',
                    color: item.category?.color || '#64748b',
                  }"
                >
                  <span v-if="item.category?.icon">
                    <i :class="['fa-solid', `fa-${item.category.icon}`]"></i>
                  </span>
                  <span v-else>📁</span>
                </div>
                <div>
                  <h4 class="text-sm font-bold text-slate-900">
                    {{ item.category?.categoryName }}
                  </h4>
                  <p class="text-xs text-slate-500">
                    {{ item.description || 'Tidak ada deskripsi' }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-slate-900">
                  Sisa: {{ formatCurrency(item.remaining) }}
                </p>
                <p class="text-xs text-slate-500">
                  Anggaran: {{ formatCurrency(Number(item.amount)) }}
                </p>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="relative pt-1">
              <div class="flex mb-2 items-center justify-between">
                <div>
                  <span
                    class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full"
                    :class="getBadgeClass(item.percentage)"
                  >
                    {{ item.percentage.toFixed(1) }}%
                  </span>
                </div>
                <div class="text-right">
                  <span class="text-xs font-semibold inline-block text-slate-600">
                    {{ formatCurrency(item.spent) }} terpakai
                  </span>
                </div>
              </div>
              <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-200">
                <div
                  :style="{ width: Math.min(item.percentage, 100) + '%' }"
                  class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500"
                  :class="getProgressBarClass(item.percentage)"
                ></div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useBudgetStore } from '@/stores/budget'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ExportService from '@/services/exportService'

const budgetStore = useBudgetStore()

const currentDate = new Date()
const filterYear = ref(currentDate.getFullYear())
const filterMonth = ref(currentDate.getMonth() + 1)

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

const reportData = computed(() => budgetStore.budgetReport)
const isLoading = computed(() => budgetStore.isLoadingBudgets) // Using same loading state as fetchBudgets or should separate? Store uses 'isLoading' for both. Ideally separate but acceptable.

// Aggregates
const totalBudget = computed(() =>
  reportData.value.reduce((acc, curr) => acc + Number(curr.amount), 0),
)
const totalSpent = computed(() => reportData.value.reduce((acc, curr) => acc + curr.spent, 0))
const totalRemaining = computed(() => totalBudget.value - totalSpent.value)

const fetchData = async () => {
  await budgetStore.fetchBudgetReport(filterYear.value, filterMonth.value)
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const getProgressBarClass = (percentage: number) => {
  if (percentage >= 100) return 'bg-red-500'
  if (percentage >= 80) return 'bg-yellow-500'
  return 'bg-green-500'
}

const getBadgeClass = (percentage: number) => {
  if (percentage >= 100) return 'text-red-600 bg-red-200'
  if (percentage >= 80) return 'text-yellow-600 bg-yellow-200'
  return 'text-green-600 bg-green-200'
}

const exportBudget = async (format: 'excel' | 'pdf') => {
  if (reportData.value.length === 0) return

  const periodName = `${monthNames[filterMonth.value - 1]} ${filterYear.value}`

  if (format === 'excel') {
    await ExportService.exportBudgetsToExcel(reportData.value, periodName)
  } else {
    ExportService.exportBudgetsToPDF(reportData.value, periodName)
  }
}

onMounted(() => {
  fetchData()
})

watch([filterYear, filterMonth], () => {
  fetchData()
})
</script>
