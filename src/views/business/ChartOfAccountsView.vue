<template>
  <div class="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Chart of Accounts</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Daftar akun perkiraan akuntansi perusahaan.</p>
      </div>
      <button
        v-if="isAdmin"
        @click="openCreateModal"
        class="bg-[#2E8B57] hover:bg-[#236B43] text-white text-sm font-medium py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        Tambah COA
      </button>
    </div>

    <!-- Error -->
    <div v-if="errorMsg" class="mb-6 rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800">
      <p class="text-sm font-medium text-red-800 dark:text-red-300">{{ errorMsg }}</p>
    </div>

    <!-- Loading -->
    <div v-if="businessStore.isLoading && Object.keys(businessStore.chartOfAccounts).length === 0" class="flex justify-center p-12">
      <LoadingSpinner :visible="true" />
    </div>

    <!-- Table -->
    <COATable
      v-else
      :accounts="businessStore.chartOfAccounts"
      :is-admin="isAdmin"
      @edit="openEditModal"
      @delete="openDeleteConfirm"
    />

    <!-- COA Form Modal -->
    <COAFormModal
      :is-open="isModalOpen"
      :account="selectedAccount"
      @close="isModalOpen = false"
      @saved="onSaved"
    />

    <!-- Delete Confirmation -->
    <ConfirmationModal
      :is-open="isDeleteModalOpen"
      title="Hapus COA"
      :message="`Apakah Anda yakin ingin menghapus akun '${selectedAccount?.name}'? Tindakan ini tidak dapat dibatalkan.`"
      confirm-button-text="Ya, Hapus"
      confirm-button-class="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      :is-confirming="isDeleting"
      @update:is-open="isDeleteModalOpen = $event"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBusinessStore } from '@/stores/business'
import COATable from '@/components/business/COATable.vue'
import COAFormModal from '@/components/business/COAFormModal.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { ChartOfAccount } from '@/types/business'

const businessStore = useBusinessStore()

const errorMsg = ref('')
const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)
const selectedAccount = ref<ChartOfAccount | null>(null)

const isAdmin = computed(() => {
  const role = businessStore.myRole
  return role === 'ADMIN' || role === 'OWNER'
})

onMounted(async () => {
  try {
    await businessStore.fetchChartOfAccounts()
  } catch {
    errorMsg.value = 'Gagal memuat Chart of Accounts.'
  }
})

const openCreateModal = () => {
  selectedAccount.value = null
  isModalOpen.value = true
}

const openEditModal = (account: ChartOfAccount) => {
  selectedAccount.value = account
  isModalOpen.value = true
}

const openDeleteConfirm = (account: ChartOfAccount) => {
  selectedAccount.value = account
  isDeleteModalOpen.value = true
}

const onSaved = () => {
  errorMsg.value = ''
}

const handleDelete = async () => {
  if (!selectedAccount.value) return
  isDeleting.value = true
  try {
    await businessStore.deleteChartOfAccount(selectedAccount.value.id)
    isDeleteModalOpen.value = false
    selectedAccount.value = null
  } catch (err: any) {
    const msg = err.response?.data?.message
    errorMsg.value = msg || 'Gagal menghapus COA.'
    isDeleteModalOpen.value = false
  } finally {
    isDeleting.value = false
  }
}
</script>
