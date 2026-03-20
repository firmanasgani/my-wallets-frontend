<template>
  <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div class="mb-8 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Rekening Perusahaan</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Rekening bank yang ditampilkan di invoice sebagai tujuan transfer pembayaran.</p>
      </div>
      <button
        v-if="isAdmin"
        @click="openCreateModal"
        class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
        Tambah Rekening
      </button>
    </div>

    <!-- Success / Error -->
    <div v-if="successMsg" class="mb-4 rounded-md bg-green-50 dark:bg-green-900/30 p-4 border border-green-200 dark:border-green-800">
      <p class="text-sm font-medium text-green-800 dark:text-green-300">{{ successMsg }}</p>
    </div>
    <div v-if="errorMsg" class="mb-4 rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800">
      <p class="text-sm font-medium text-red-800 dark:text-red-300">{{ errorMsg }}</p>
    </div>

    <!-- Loading -->
    <div v-if="store.isLoading" class="flex justify-center p-12">
      <LoadingSpinner :visible="true" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="store.bankAccounts.length === 0"
      class="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-600"
    >
      <svg class="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
      <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Belum ada rekening</p>
      <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Tambahkan rekening bank agar bisa dipilih di invoice.</p>
    </div>

    <!-- Bank Account List -->
    <div v-else class="space-y-3">
      <div
        v-for="account in store.bankAccounts"
        :key="account.id"
        class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex items-start justify-between gap-4"
      >
        <div class="flex items-start gap-3 min-w-0">
          <div class="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="font-semibold text-slate-800 dark:text-slate-100">{{ account.bankName }}</p>
              <span
                v-if="account.isDefault"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
              >
                Default
              </span>
            </div>
            <p class="text-sm font-mono text-slate-600 dark:text-slate-300 mt-0.5">{{ account.accountNumber }}</p>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">a/n {{ account.accountHolder }}</p>
          </div>
        </div>

        <div v-if="isAdmin" class="flex items-center gap-2 shrink-0">
          <button
            v-if="!account.isDefault"
            @click="handleSetDefault(account.id)"
            class="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-2 py-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
            title="Jadikan default"
          >
            Set Default
          </button>
          <button
            @click="openEditModal(account)"
            class="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Edit"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            @click="openDeleteConfirm(account)"
            class="p-1.5 rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Hapus"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="isFormModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="closeFormModal"></div>
      <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md">
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 class="text-base font-semibold text-slate-800 dark:text-slate-100">
            {{ editingAccount ? 'Edit Rekening' : 'Tambah Rekening' }}
          </h2>
          <button @click="closeFormModal" class="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleFormSubmit" class="p-6 space-y-4">
          <div>
            <SearchableSelect
              v-model="form.bankName"
              :options="bankOptions"
              label="Nama Bank"
              placeholder="Ketik untuk mencari bank..."
              :required="true"
              :disabled="bankStore.isLoadingBanks"
              :helper-text="bankStore.isLoadingBanks ? 'Memuat daftar bank...' : ''"
              input-id="ba-bank-name"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Nomor Rekening <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.accountNumber"
              type="text"
              placeholder="1234567890"
              required
              class="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Nama Pemilik Rekening <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.accountHolder"
              type="text"
              placeholder="PT Nama Perusahaan"
              required
              class="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model="form.isDefault"
              type="checkbox"
              id="isDefaultCheck"
              class="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
            <label for="isDefaultCheck" class="text-sm text-slate-700 dark:text-slate-300">
              Jadikan rekening default
            </label>
          </div>

          <div v-if="formError" class="text-sm text-red-600 dark:text-red-400">{{ formError }}</div>

          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              @click="closeFormModal"
              class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <svg v-if="isSubmitting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              {{ editingAccount ? 'Simpan' : 'Tambah' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <ConfirmationModal
      :is-open="isDeleteModalOpen"
      title="Hapus Rekening"
      :message="`Hapus rekening ${deletingAccount?.bankName} - ${deletingAccount?.accountNumber}? Tindakan ini tidak dapat dibatalkan.`"
      confirm-button-text="Ya, Hapus"
      confirm-button-class="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      :is-confirming="isSubmitting"
      @update:is-open="isDeleteModalOpen = $event"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBankAccountsStore } from '@/stores/bankAccounts'
import { useBusinessStore } from '@/stores/business'
import { useBankStore } from '@/stores/banks'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import SearchableSelect from '@/components/common/SearchableSelect.vue'
import type { CompanyBankAccount } from '@/types/business'

const store = useBankAccountsStore()
const businessStore = useBusinessStore()
const bankStore = useBankStore()

const bankOptions = computed(() =>
  bankStore.allBanks.map((b) => ({ value: b.name, label: b.name })),
)

const successMsg = ref('')
const errorMsg = ref('')
const isFormModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isSubmitting = ref(false)
const formError = ref('')
const editingAccount = ref<CompanyBankAccount | null>(null)
const deletingAccount = ref<CompanyBankAccount | null>(null)

const defaultForm = () => ({ bankName: '', accountNumber: '', accountHolder: '', isDefault: false })
const form = ref(defaultForm())

const isAdmin = computed(() => {
  const role = businessStore.myRole
  return role === 'ADMIN' || role === 'OWNER'
})

onMounted(async () => {
  const fetches: Promise<any>[] = [store.fetchBankAccounts()]
  if (!bankStore.hasBanksData) fetches.push(bankStore.fetchBanks().catch(() => {}))
  if (!businessStore.members.length) fetches.push(businessStore.fetchMembers().catch(() => {}))
  await Promise.all(fetches)
})

const showSuccess = (msg: string) => {
  successMsg.value = msg
  setTimeout(() => { successMsg.value = '' }, 3000)
}

const openCreateModal = () => {
  editingAccount.value = null
  form.value = defaultForm()
  formError.value = ''
  isFormModalOpen.value = true
}

const openEditModal = (account: CompanyBankAccount) => {
  editingAccount.value = account
  form.value = {
    bankName: account.bankName,
    accountNumber: account.accountNumber,
    accountHolder: account.accountHolder,
    isDefault: account.isDefault,
  }
  formError.value = ''
  isFormModalOpen.value = true
}

const closeFormModal = () => {
  isFormModalOpen.value = false
}

const openDeleteConfirm = (account: CompanyBankAccount) => {
  deletingAccount.value = account
  isDeleteModalOpen.value = true
}

const handleFormSubmit = async () => {
  formError.value = ''
  isSubmitting.value = true
  try {
    if (editingAccount.value) {
      await store.updateBankAccount(editingAccount.value.id, form.value)
      showSuccess('Rekening berhasil diperbarui.')
    } else {
      await store.createBankAccount(form.value)
      showSuccess('Rekening berhasil ditambahkan.')
    }
    closeFormModal()
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Gagal menyimpan rekening.'
  } finally {
    isSubmitting.value = false
  }
}

const handleSetDefault = async (id: string) => {
  try {
    await store.setDefaultBankAccount(id)
    showSuccess('Rekening default berhasil diubah.')
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Gagal mengubah rekening default.'
    setTimeout(() => { errorMsg.value = '' }, 3000)
  }
}

const handleDelete = async () => {
  if (!deletingAccount.value) return
  isSubmitting.value = true
  try {
    await store.deleteBankAccount(deletingAccount.value.id)
    isDeleteModalOpen.value = false
    showSuccess('Rekening berhasil dihapus.')
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Gagal menghapus rekening.'
    isDeleteModalOpen.value = false
    setTimeout(() => { errorMsg.value = '' }, 3000)
  } finally {
    isSubmitting.value = false
  }
}
</script>
