<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <button
        @click="$router.back()"
        class="mb-4 text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clip-rule="evenodd"
          />
        </svg>
        Kembali
      </button>
      <div>
        <h1 class="text-2xl font-bold leading-7 text-slate-900 sm:truncate">Tambah Transaksi</h1>
        <p class="mt-1 text-sm text-slate-500">Catat transaksi baru untuk melacak keuanganmu.</p>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <form @submit.prevent="handleSubmit">
        <div class="p-6 space-y-8">
          <!-- Transaction Type -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-slate-900">Tipe Transaksi</label>
            <div class="grid grid-cols-3 gap-3">
              <button
                type="button"
                v-for="typeOpt in transactionTypeOptions"
                :key="typeOpt.value"
                @click="selectedTransactionType = typeOpt.value"
                :class="[
                  'relative flex items-center justify-center py-3 px-4 text-sm font-medium rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200',
                  selectedTransactionType === typeOpt.value
                    ? 'border-transparent text-white shadow-md transform scale-105'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300',
                  selectedTransactionType === typeOpt.value &&
                  typeOpt.value === FrontendTransactionType.INCOME
                    ? 'bg-green-600 focus:ring-green-500'
                    : '',
                  selectedTransactionType === typeOpt.value &&
                  typeOpt.value === FrontendTransactionType.EXPENSE
                    ? 'bg-red-600 focus:ring-red-500'
                    : '',
                  selectedTransactionType === typeOpt.value &&
                  typeOpt.value === FrontendTransactionType.TRANSFER
                    ? 'bg-blue-600 focus:ring-blue-500'
                    : '',
                ]"
              >
                {{ typeOpt.text }}
              </button>
            </div>
          </div>

          <!-- Amount -->
          <div class="space-y-3">
            <label for="txAmount" class="block text-sm font-medium text-slate-900"
              >Jumlah Transaksi</label
            >
            <div class="relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-slate-500 sm:text-sm">Rp</span>
              </div>
              <CurrencyInput
                v-model="commonFormData.amount"
                id="txAmount"
                class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-lg border-slate-300 rounded-md py-3 placeholder:text-slate-300 font-semibold text-slate-900"
                placeholder="0"
                required
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span class="text-slate-500 sm:text-sm">IDR</span>
              </div>
            </div>
          </div>

          <!-- Account Selection -->
          <div class="space-y-6" v-if="selectedTransactionType">
            <!-- Source Account (Expense & Transfer) -->
            <div
              v-if="
                selectedTransactionType === FrontendTransactionType.EXPENSE ||
                selectedTransactionType === FrontendTransactionType.TRANSFER
              "
              class="space-y-2 w-full"
            >
              <label for="txSourceAccount" class="block text-sm font-medium text-slate-900"
                >Dari Akun</label
              >
              <div class="relative">
                <select
                  id="txSourceAccount"
                  v-model="accountFormFields.sourceAccountId"
                  required
                  class="appearance-none block w-full bg-white border border-slate-300 rounded-lg py-3 pl-4 pr-10 text-slate-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option disabled value="">Pilih akun sumber...</option>
                  <option v-for="acc in availableAccounts" :key="acc.id" :value="acc.id">
                    {{ acc.accountName }} ({{ formatCurrency(acc.currentBalance, acc.currency) }})
                  </option>
                </select>
                <div
                  class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500"
                >
                  <svg
                    class="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Destination Account (Income & Transfer) -->
            <div
              v-if="
                selectedTransactionType === FrontendTransactionType.INCOME ||
                selectedTransactionType === FrontendTransactionType.TRANSFER
              "
              class="space-y-2 w-full"
            >
              <label for="txDestinationAccount" class="block text-sm font-medium text-slate-900"
                >Ke Akun</label
              >
              <div class="relative">
                <select
                  id="txDestinationAccount"
                  v-model="accountFormFields.destinationAccountId"
                  required
                  class="appearance-none block w-full bg-white border border-slate-300 rounded-lg py-3 pl-4 pr-10 text-slate-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option disabled value="">Pilih akun tujuan...</option>
                  <option v-for="acc in availableAccounts" :key="acc.id" :value="acc.id">
                    {{ acc.accountName }} ({{ formatCurrency(acc.currentBalance, acc.currency) }})
                  </option>
                </select>
                <div
                  class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500"
                >
                  <svg
                    class="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <p
            v-if="
              selectedTransactionType === FrontendTransactionType.TRANSFER &&
              accountFormFields.sourceAccountId &&
              accountFormFields.sourceAccountId === accountFormFields.destinationAccountId
            "
            class="text-sm text-red-600 bg-red-50 p-3 rounded-md"
          >
            Akun sumber dan tujuan tidak boleh sama.
          </p>

          <!-- Category (Income & Expense) -->
          <div
            v-if="
              selectedTransactionType === FrontendTransactionType.INCOME ||
              selectedTransactionType === FrontendTransactionType.EXPENSE
            "
            class="space-y-2"
          >
            <label for="txCategory" class="block text-sm font-medium text-slate-900"
              >Kategori</label
            >
            <div class="relative">
              <select
                id="txCategory"
                v-model="accountFormFields.categoryId"
                required
                class="appearance-none block w-full bg-white border border-slate-300 rounded-lg py-3 pl-4 pr-10 text-slate-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option disabled value="">Pilih kategori...</option>
                <option v-for="cat in relevantCategories" :key="cat.id" :value="cat.id">
                  {{ cat.parentPrefix || '' }}{{ cat.categoryName }}
                </option>
              </select>
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500"
              >
                <svg
                  class="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Date -->
            <div class="space-y-2">
              <label for="txDate" class="block text-sm font-medium text-slate-900"
                >Tanggal Transaksi</label
              >
              <input
                type="date"
                id="txDate"
                v-model="commonFormData.transactionDate"
                required
                class="block w-full bg-white border border-slate-300 rounded-lg py-3 px-4 text-slate-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <!-- Description -->
            <div class="space-y-2">
              <label for="txDescription" class="block text-sm font-medium text-slate-900"
                >Deskripsi</label
              >
              <input
                type="text"
                id="txDescription"
                v-model="commonFormData.description"
                class="block w-full bg-white border border-slate-300 rounded-lg py-3 px-4 text-slate-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Contoh: Makan siang, Gaji bulan ini..."
              />
            </div>
          </div>

          <!-- Recurring Toggle -->
          <div class="bg-indigo-50 rounded-lg p-5 border border-indigo-100">
            <div class="flex items-center">
              <div class="flex items-center h-5">
                <input
                  id="isRecurring"
                  type="checkbox"
                  v-model="recurringForm.isRecurring"
                  class="focus:ring-indigo-500 h-5 w-5 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="isRecurring" class="font-medium text-indigo-900"
                  >Jadikan Transaksi Berulang?</label
                >
                <p class="text-indigo-700">Aktifkan untuk membuat jadwal otomatis.</p>
              </div>
            </div>

            <div v-if="recurringForm.isRecurring" class="mt-6 flex flex-col md:flex-row gap-4">
              <div class="flex-1">
                <label
                  for="recurringInterval"
                  class="block text-xs font-semibold text-indigo-900 uppercase tracking-wider mb-2"
                  >Setiap</label
                >
                <select
                  id="recurringInterval"
                  v-model="recurringForm.interval"
                  class="block w-full bg-white border border-indigo-200 rounded-lg py-2.5 px-3 text-indigo-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option :value="null" disabled>Pilih interval...</option>
                  <option
                    v-for="opt in recurringIntervalOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
              </div>

              <div class="flex-1">
                <label
                  for="recurringEndDate"
                  class="block text-xs font-semibold text-indigo-900 uppercase tracking-wider mb-2"
                  >Berakhir Pada (Opsional)</label
                >
                <input
                  type="date"
                  id="recurringEndDate"
                  v-model="recurringForm.endDate"
                  class="block w-full bg-white border border-indigo-200 rounded-lg py-2.5 px-3 text-indigo-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-indigo-300"
                  :min="commonFormData.transactionDate"
                />
              </div>
            </div>
          </div>

          <!-- Attachment -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-slate-900">Lampiran (Opsional)</label>
            <div
              class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg hover:border-indigo-400 transition-colors cursor-pointer relative group"
            >
              <div class="space-y-1 text-center">
                <svg
                  class="mx-auto h-12 w-12 text-slate-400 group-hover:text-indigo-500 transition-colors"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <div class="flex text-sm text-slate-600">
                  <label
                    for="file-upload"
                    class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                  >
                    <span>Upload file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      class="sr-only"
                      accept="image/*,.pdf"
                      @change="handleFileUpload"
                    />
                  </label>
                  <p class="pl-1">atau seret dan lepas</p>
                </div>
                <p class="text-xs text-slate-500">PNG, JPG, PDF hingga 5MB</p>
              </div>

              <!-- Selected File name/preview -->
              <div
                v-if="selectedFile"
                class="absolute inset-0 bg-white rounded-lg flex flex-col items-center justify-center p-4"
              >
                <div class="flex items-center gap-3 mb-3">
                  <div class="p-2 bg-indigo-50 rounded-lg">
                    <svg
                      v-if="selectedFile.type === 'application/pdf'"
                      class="w-8 h-8 text-indigo-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z"
                      />
                      <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                    </svg>
                    <img
                      v-else-if="previewUrl"
                      :src="previewUrl"
                      class="w-16 h-16 object-cover rounded shadow-sm"
                    />
                    <svg
                      v-else
                      class="w-8 h-8 text-indigo-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <div class="text-left">
                    <p class="text-sm font-medium text-slate-900 truncate max-w-[200px]">
                      {{ selectedFile.name }}
                    </p>
                    <p class="text-xs text-slate-500">
                      {{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="removeFile"
                  class="text-xs font-semibold text-red-600 hover:text-red-500"
                >
                  Hapus File
                </button>
              </div>
            </div>

            <!-- PDF Preview (if applicable and small/safe) -->
            <div
              v-if="selectedFile && selectedFile.type === 'application/pdf'"
              class="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-slate-700">Preview PDF</span>
                <a
                  :href="previewUrl || undefined"
                  target="_blank"
                  class="text-xs text-indigo-600 hover:text-indigo-500 font-semibold"
                  >Buka di tab baru</a
                >
              </div>
              <div
                class="aspect-auto h-40 bg-slate-200 rounded flex items-center justify-center text-slate-500 overflow-hidden"
              >
                <iframe
                  v-if="previewUrl"
                  :src="previewUrl"
                  class="w-full h-full pointer-events-none scale-110 origin-top"
                ></iframe>
              </div>
            </div>
          </div>

          <!-- Errors -->
          <div v-if="submissionError" class="rounded-md bg-red-50 p-4 border border-red-100">
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
                <h3 class="text-sm font-medium text-red-800">Terdapat kesalahan</h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>{{ submissionError }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          class="bg-slate-50 px-6 py-4 flex items-center justify-end border-t border-slate-200 gap-3"
        >
          <button
            type="button"
            @click="$router.back()"
            class="px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            :disabled="isSubmittingForm"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="isSubmittingForm"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        </div>
      </form>
    </div>

    <!-- Success Modal -->
    <ConfirmationModal
      v-model:isOpen="isSuccessModalOpen"
      title="Transaksi Berhasil"
      message="Transaksi Anda telah berhasil dicatat."
      confirmButtonText="Lihat Daftar Transaksi"
      cancelButtonText="Tambah Lagi"
      iconType="success"
      confirmButtonClass="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
      @confirm="router.push({ name: 'transactions-list' })"
      @cancel="resetForm"
    >
      <template #icon>
        <svg
          class="h-6 w-6 text-green-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </template>
    </ConfirmationModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { FrontendTransactionType, FrontendCategoryType } from '@/types/enums'
import type { Category } from '@/types/enums'
import { RecurringInterval } from '@/types/transaction'
import type {
  CreateIncomePayload,
  CreateExpensePayload,
  CreateTransferPayload,
} from '@/types/transaction'
import { useTransactionStore } from '@/stores/transactions'
import { useAccountStore } from '@/stores/accounts'
import { useCategoryStore } from '@/stores/categories'
import { useRouter } from 'vue-router'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import CurrencyInput from '@/components/common/CurrencyInput.vue'

import ConfirmationModal from '@/components/common/ConfirmationModal.vue'

const router = useRouter()
const transactionStore = useTransactionStore()
const accountStore = useAccountStore()
const categoryStore = useCategoryStore()

const isSuccessModalOpen = ref(false)
const selectedTransactionType = ref<FrontendTransactionType>(FrontendTransactionType.EXPENSE) // Default to Expense

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

const recurringForm = reactive({
  isRecurring: false,
  interval: null as RecurringInterval | null,
  endDate: '',
})

const recurringIntervalOptions = [
  { value: RecurringInterval.DAILY, label: 'Harian' },
  { value: RecurringInterval.WEEKLY, label: 'Mingguan' },
  { value: RecurringInterval.MONTHLY, label: 'Bulanan' },
  { value: RecurringInterval.YEARLY, label: 'Tahunan' },
]

const submissionError = ref<string | null>(null)
const isSubmittingForm = computed(() => transactionStore.isSubmittingTransaction) // Gunakan state dari store

// Attachment logic
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // Validation
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
  if (!allowedTypes.includes(file.type)) {
    submissionError.value = 'Hanya file PDF dan gambar yang diperbolehkan.'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    submissionError.value = 'Ukuran file maksimal adalah 5MB.'
    return
  }

  selectedFile.value = file
  submissionError.value = null

  // Create preview
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)
}

const removeFile = () => {
  selectedFile.value = null
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
}

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
  // We keep amount and date, but reset accounts/category on type change to avoid invalid state
  accountFormFields.sourceAccountId = ''
  accountFormFields.destinationAccountId = ''
  accountFormFields.categoryId = ''
  submissionError.value = null
})

watch(
  () => recurringForm.isRecurring,
  (newVal) => {
    if (!newVal) {
      recurringForm.interval = null
      recurringForm.endDate = ''
    }
  },
)

onMounted(() => {
  if (accountStore.accounts.length === 0) accountStore.fetchAccounts()
  if (categoryStore.categories.length === 0) categoryStore.fetchCategories({ hierarchical: 'true' })
})

const resetForm = () => {
  commonFormData.amount = null
  commonFormData.description = ''
  accountFormFields.sourceAccountId = ''
  accountFormFields.destinationAccountId = ''
  accountFormFields.categoryId = ''
  recurringForm.isRecurring = false
  recurringForm.interval = null
  recurringForm.endDate = ''
  submissionError.value = null
  removeFile()
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
    amount: commonFormData.amount as number,
    transactionDate: commonFormData.transactionDate || new Date().toISOString().split('T')[0],
    description: commonFormData.description?.trim() || null,
    isRecurring: recurringForm.isRecurring,
    interval: recurringForm.isRecurring ? recurringForm.interval : null,
    recurringStartDate: recurringForm.isRecurring
      ? commonFormData.transactionDate || new Date().toISOString().split('T')[0]
      : null,
    recurringEndDate:
      recurringForm.isRecurring && recurringForm.endDate ? recurringForm.endDate : null,
    attachment: selectedFile.value,
  }

  if (recurringForm.isRecurring && !recurringForm.interval) {
    submissionError.value = 'Interval ulangan wajib dipilih untuk transaksi berulang.'
    return
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

    // Success
    isSuccessModalOpen.value = true
  } catch (error: any) {
    submissionError.value =
      transactionStore.transactionError || error.message || 'Gagal menyimpan transaksi.'
    console.error('Submit transaction error:', error)
  }
}
</script>
