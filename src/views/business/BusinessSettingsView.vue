<template>
  <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div class="mb-8 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Profil Perusahaan</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {{ businessStore.currentCompany ? 'Kelola informasi dan pengaturan pajak perusahaan Anda.' : 'Lengkapi profil perusahaan Anda untuk memulai pembukuan.' }}
        </p>
      </div>
    </div>

    <div v-if="successMsg" class="mb-6 rounded-md bg-green-50 dark:bg-green-900/30 p-4 border border-green-200 dark:border-green-800 transition-opacity">
      <p class="text-sm font-medium text-green-800 dark:text-green-300">{{ successMsg }}</p>
    </div>
    <div v-if="errorMsg" class="mb-6 rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800 transition-opacity">
      <p class="text-sm font-medium text-red-800 dark:text-red-300">{{ errorMsg }}</p>
    </div>

    <!-- Tampilkan loading jika sedang ambil data awal yang belum ada -->
    <div v-if="businessStore.isLoading && !businessStore.isCompanyLoaded" class="flex justify-center p-12">
      <LoadingSpinner :visible="true" />
    </div>

    <div v-else>
      <CompanyForm
        ref="companyFormRef"
        :initial-data="businessStore.currentCompany"
        :is-submitting="businessStore.isLoading"
        :default-editing="!businessStore.currentCompany"
        :viewer-mode="isViewer"
        @submit="handleSubmit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBusinessStore } from '@/stores/business'
import CompanyForm from '@/components/business/CompanyForm.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { CompanyPayload } from '@/types/business'

const businessStore = useBusinessStore()
const successMsg = ref('')
const errorMsg = ref('')
const companyFormRef = ref<InstanceType<typeof CompanyForm> | null>(null)

const isViewer = computed(() => businessStore.myRole === 'VIEWER')

onMounted(async () => {
  try {
    if (!businessStore.isCompanyLoaded) {
      await businessStore.fetchMyCompany()
    }
    if (!businessStore.members.length) {
      await businessStore.fetchMembers()
    }
  } catch (e: any) {
    if (e.response?.status !== 404) {
      errorMsg.value = 'Gagal memuat profil perusahaan.'
    }
  }
})

const handleSubmit = async (payload: CompanyPayload) => {
  successMsg.value = ''
  errorMsg.value = ''
  try {
    if (businessStore.currentCompany) {
      await businessStore.updateCompany(payload)
      successMsg.value = 'Profil perusahaan berhasil diperbarui.'
    } else {
      await businessStore.createCompany(payload)
      successMsg.value = 'Perusahaan berhasil didaftarkan.'
    }
    
    // Auto hide success message after 3 detik
    setTimeout(() => {
      successMsg.value = ''
    }, 3000)
    
    // Ensure form exits edit mode if it was in create mode
    if (companyFormRef.value?.isEditing) {
      companyFormRef.value.isEditing = false
    }
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Gagal menyimpan data. Silakan coba lagi.'
  }
}
</script>
