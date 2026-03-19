<template>
  <div class="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div class="mb-8 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Chart of Accounts</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Daftar akun perkiraan akuntansi perusahaan.</p>
      </div>
      <RouterLink to="/business/chart-of-accounts/create" class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-1.5 px-3 rounded-lg flex items-center transition-colors shadow-sm justify-center">Tambah COA</RouterLink>
    </div>

    <div v-if="errorMsg" class="mb-6 rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800">
      <p class="text-sm font-medium text-red-800 dark:text-red-300">{{ errorMsg }}</p>
    </div>

    <div v-if="businessStore.isLoading && Object.keys(businessStore.chartOfAccounts).length === 0" class="flex justify-center p-12">
      <LoadingSpinner :visible="true" />
    </div>

    <div v-else>
      <COATable :accounts="businessStore.chartOfAccounts" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBusinessStore } from '@/stores/business'
import COATable from '@/components/business/COATable.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const businessStore = useBusinessStore()
const errorMsg = ref('')

onMounted(async () => {
  try {
    await businessStore.fetchChartOfAccounts()
  } catch (err: any) {
    // 404 handled at API or store layer, tapi COA array default empty
    if (err.response?.status !== 404) {
      errorMsg.value = 'Gagal memuat Chart of Accounts.'
    }
  }
})
</script>
