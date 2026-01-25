// src/components/transactions/AddTransactionModal.vue
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
        >
          <form @submit.prevent="handleSubmit">
            <div class="px-4 pt-5 pb-4 sm:p-6">
              <h3 class="text-xl font-semibold text-slate-800 mb-1">Tambah Transaksi Baru</h3>
              <p class="text-sm text-slate-500 mb-6">Pilih tipe dan isi detail transaksi.</p>

              <div class="mb-6">
                <label class="block text-sm font-medium text-slate-700 mb-1"
                  >Tipe Transaksi <span class="text-red-500">*</span></label
                >
                <div class="flex space-x-2 rounded-md p-1 bg-slate-100">
                  <button
                    type="button"
                    v-for="typeOpt in transactionTypeOptions"
                    :key="typeOpt.value"
                    @click="selectedTransactionType = typeOpt.value"
                    :class="[
                      'w-full rounded-md py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 focus:ring-indigo-500 transition-colors',
                      selectedTransactionType === typeOpt.value
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-700 hover:bg-slate-200',
                    ]"
                  >
                    {{ typeOpt.text }}
                  </button>
                </div>
              </div>

              <div v-if="selectedTransactionType" class="space-y-4">
                <div>
                  <label for="txAmount" class="block text-sm font-medium text-slate-700 mb-1"
                    >Jumlah <span class="text-red-500">*</span></label
                  >
                  <input
                    type="number"
                    id="txAmount"
                    v-model.number="commonFormData.amount"
                    required
                    min="0.01"
                    step="any"
                    class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
                    placeholder="0.00"
                  />
                </div>

                <div
                  v-if="
                    selectedTransactionType === FrontendTransactionType.EXPENSE ||
                    selectedTransactionType === FrontendTransactionType.TRANSFER
                  "
                >
                  <label for="txSourceAccount" class="block text-sm font-medium text-slate-700 mb-1"
                    >Dari Akun <span class="text-red-500">*</span></label
                  >
                  <select
                    id="txSourceAccount"
                    v-model="accountFormFields.sourceAccountId"
                    required
                    class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
                  >
                    <option disabled value="">Pilih akun sumber...</option>
                    <option v-for="acc in availableAccounts" :key="acc.id" :value="acc.id">
                      {{ acc.accountName }} ({{ formatCurrency(acc.currentBalance, acc.currency) }})
                    </option>
                  </select>
                </div>

                <div
                  v-if="
                    selectedTransactionType === FrontendTransactionType.INCOME ||
                    selectedTransactionType === FrontendTransactionType.TRANSFER
                  "
                >
                  <label
                    for="txDestinationAccount"
                    class="block text-sm font-medium text-slate-700 mb-1"
                    >Ke Akun <span class="text-red-500">*</span></label
                  >
                  <select
                    id="txDestinationAccount"
                    v-model="accountFormFields.destinationAccountId"
                    required
                    class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
                  >
                    <option disabled value="">Pilih akun tujuan...</option>
                    <option v-for="acc in availableAccounts" :key="acc.id" :value="acc.id">
                      {{ acc.accountName }} ({{ formatCurrency(acc.currentBalance, acc.currency) }})
                    </option>
                  </select>
                </div>

                <p
                  v-if="
                    selectedTransactionType === FrontendTransactionType.TRANSFER &&
                    accountFormFields.sourceAccountId &&
                    accountFormFields.sourceAccountId === accountFormFields.destinationAccountId
                  "
                  class="text-xs text-red-500 -mt-2"
                >
                  Akun sumber dan tujuan tidak boleh sama.
                </p>

                <div
                  v-if="
                    selectedTransactionType === FrontendTransactionType.INCOME ||
                    selectedTransactionType === FrontendTransactionType.EXPENSE
                  "
                >
                  <label for="txCategory" class="block text-sm font-medium text-slate-700 mb-1"
                    >Kategori <span class="text-red-500">*</span></label
                  >
                  <select
                    id="txCategory"
                    v-model="accountFormFields.categoryId"
                    required
                    class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
                  >
                    <option disabled value="">Pilih kategori...</option>
                    <option v-for="cat in relevantCategories" :key="cat.id" :value="cat.id">
                      {{ cat.parentPrefix || '' }}{{ cat.categoryName }}
                    </option>
                  </select>
                </div>

                <div>
                  <label for="txDate" class="block text-sm font-medium text-slate-700 mb-1"
                    >Tanggal Transaksi <span class="text-red-500">*</span></label
                  >
                  <input
                    type="date"
                    id="txDate"
                    v-model="commonFormData.transactionDate"
                    required
                    class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
                  />
                </div>

                <div>
                  <label for="txDescription" class="block text-sm font-medium text-slate-700 mb-1"
                    >Deskripsi (Opsional)</label
                  >
                  <textarea
                    id="txDescription"
                    v-model="commonFormData.description"
                    rows="3"
                    class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
                    placeholder="Catatan tambahan..."
                  ></textarea>
                </div>
              </div>

              <div v-if="submissionError" class="mt-4 rounded-md bg-red-50 p-3">
                <p class="text-sm font-medium text-red-700">{{ submissionError }}</p>
              </div>
            </div>

            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                :disabled="isSubmittingForm"
                class="inline-flex justify-center items-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm transition-colors"
              >
                <LoadingSpinner
                  v-if="isSubmittingForm"
                  :visible="true"
                  size="xs"
                  color="text-white"
                  class="-ml-1 mr-2"
                />
                {{ isSubmittingForm ? 'Menyimpan...' : 'Simpan Transaksi' }}
              </button>
              <button
                type="button"
                @click="closeModal"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                :disabled="isSubmittingForm"
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
import { FrontendTransactionType, FrontendCategoryType } from '@/types/enums'
import type { Category } from '@/types/enums'
import type {
  CreateIncomePayload,
  CreateExpensePayload,
  CreateTransferPayload,
} from '@/types/transaction'
import { useTransactionStore } from '@/stores/transactions'
import { useAccountStore } from '@/stores/accounts'
import { useCategoryStore } from '@/stores/categories'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

interface Props {
  isOpen: boolean
}
const props = defineProps<Props>()
const emit = defineEmits(['update:isOpen', 'transaction-saved'])

const transactionStore = useTransactionStore()
const accountStore = useAccountStore()
const categoryStore = useCategoryStore()

const selectedTransactionType = ref<FrontendTransactionType | null>(null)

const transactionTypeOptions = [
  { value: FrontendTransactionType.INCOME, text: 'Pemasukan' },
  { value: FrontendTransactionType.EXPENSE, text: 'Pengeluaran' },
  { value: FrontendTransactionType.TRANSFER, text: 'Transfer' },
]

const commonFormData = reactive({
  amount: null as number | null,
  transactionDate: new Date().toISOString().split('T')[0], // Default ke hari ini YYYY-MM-DD
  description: '',
})

// Pisahkan field yang spesifik per tipe transaksi
const accountFormFields = reactive({
  sourceAccountId: '',
  destinationAccountId: '',
  categoryId: '',
})

const submissionError = ref<string | null>(null)
const isSubmittingForm = computed(() => transactionStore.isSubmittingTransaction) // Gunakan state dari store

// Computed properties untuk dropdown
const availableAccounts = computed(() => accountStore.allAccounts)
const relevantCategories = computed(() => {
  const allCats: { id: string; categoryName: string; parentPrefix?: string }[] = []
  function flatten(items: Category[], prefix = '') {
    items.forEach((item) => {
      // Hanya tampilkan kategori yang sesuai dengan tipe transaksi yang dipilih
      if (
        selectedTransactionType.value === FrontendTransactionType.INCOME &&
        item.categoryType === FrontendCategoryType.INCOME
      ) {
        allCats.push({ id: item.id, categoryName: item.categoryName, parentPrefix: prefix })
      } else if (
        selectedTransactionType.value === FrontendTransactionType.EXPENSE &&
        item.categoryType === FrontendCategoryType.EXPENSE
      ) {
        allCats.push({ id: item.id, categoryName: item.categoryName, parentPrefix: prefix })
      }
      if (item.subCategories && item.subCategories.length > 0) {
        flatten(item.subCategories, prefix + '- ')
      }
    })
  }
  flatten(categoryStore.allCategories) // Asumsi categoryStore.allCategories sudah hierarkis atau flat
  return allCats
})

const formatCurrency = (
  value: number | string | null | undefined,
  currency: string = 'IDR',
): string => {
  if (value === null || value === undefined) return formatCurrency(0, currency)
  const numericValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numericValue)) return 'N/A'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(numericValue)
}

watch(selectedTransactionType, () => {
  commonFormData.amount = null
  accountFormFields.sourceAccountId = ''
  accountFormFields.destinationAccountId = ''
  accountFormFields.categoryId = ''
  submissionError.value = null
})

onMounted(() => {
  if (accountStore.accounts.length === 0) accountStore.fetchAccounts()
  if (categoryStore.categories.length === 0) categoryStore.fetchCategories({ hierarchical: 'true' })
})

const closeModal = () => {
  if (isSubmittingForm.value) return
  emit('update:isOpen', false)
  selectedTransactionType.value = null
}

const handleSubmit = async () => {
  submissionError.value = null
  if (!selectedTransactionType.value || !commonFormData.amount) {
    submissionError.value = 'Tipe transaksi dan jumlah wajib diisi.'
    return
  }
  if (commonFormData.amount <= 0) {
    submissionError.value = 'Jumlah transaksi harus lebih besar dari 0.'
    return
  }

  const basePayload = {
    amount: commonFormData.amount,
    transactionDate: commonFormData.transactionDate || new Date().toISOString().split('T')[0],
    description: commonFormData.description?.trim() || null,
  }

  try {
    if (selectedTransactionType.value === FrontendTransactionType.INCOME) {
      if (!accountFormFields.destinationAccountId || !accountFormFields.categoryId) {
        submissionError.value = 'Akun tujuan dan kategori wajib diisi untuk pemasukan.'
        return
      }
      const payload: CreateIncomePayload = {
        ...basePayload,
        destinationAccountId: accountFormFields.destinationAccountId,
        categoryId: accountFormFields.categoryId,
      }
      await transactionStore.createIncomeTransaction(payload)
    } else if (selectedTransactionType.value === FrontendTransactionType.EXPENSE) {
      if (!accountFormFields.sourceAccountId || !accountFormFields.categoryId) {
        submissionError.value = 'Akun sumber dan kategori wajib diisi untuk pengeluaran.'
        return
      }
      const payload: CreateExpensePayload = {
        ...basePayload,
        sourceAccountId: accountFormFields.sourceAccountId,
        categoryId: accountFormFields.categoryId,
      }
      await transactionStore.createExpenseTransaction(payload)
    } else if (selectedTransactionType.value === FrontendTransactionType.TRANSFER) {
      if (!accountFormFields.sourceAccountId || !accountFormFields.destinationAccountId) {
        submissionError.value = 'Akun sumber dan tujuan wajib diisi untuk transfer.'
        return
      }
      if (accountFormFields.sourceAccountId === accountFormFields.destinationAccountId) {
        submissionError.value = 'Akun sumber dan tujuan tidak boleh sama untuk transfer.'
        return
      }
      const payload: CreateTransferPayload = {
        ...basePayload,
        sourceAccountId: accountFormFields.sourceAccountId,
        destinationAccountId: accountFormFields.destinationAccountId,
      }
      await transactionStore.createTransferTransaction(payload)
    }
    emit('transaction-saved')
    closeModal()
  } catch (error: any) {
    submissionError.value =
      transactionStore.transactionError || error.message || 'Gagal menyimpan transaksi.'
    console.error('Submit transaction error:', error)
  }
}
</script>

<style scoped></style>
