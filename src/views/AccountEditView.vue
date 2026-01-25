// src/views/AccountEditView.vue
<template>
  <LoadingSpinner
    v-if="isLoadingInitialData || accountStore.isFetchingDetails"
    :visible="true"
    text="Memuat data akun..."
    size="lg"
    overlay
  />
  <div
    v-else-if="!accountData && !isLoadingInitialData"
    class="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg text-center"
  >
    <h2 class="text-xl font-semibold text-red-600">Akun Tidak Ditemukan</h2>
    <p class="text-slate-600 mt-2">
      {{
        submissionError ||
        accountStore.error ||
        'Akun yang ingin Anda edit tidak dapat ditemukan atau Anda tidak memiliki akses.'
      }}
    </p>
    <RouterLink
      :to="{ name: 'accounts-list' }"
      class="mt-4 inline-block px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
    >
      Kembali ke Daftar Akun
    </RouterLink>
  </div>

  <div v-else-if="accountData" class="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg">
    <h1 class="text-2xl sm:text-3xl font-semibold text-slate-800 mb-6 border-b pb-4">
      Edit Akun: <span class="text-indigo-600">{{ originalAccountName }}</span>
    </h1>

    <form @submit.prevent="handleSubmitUpdate" class="space-y-6">
      <div>
        <label for="accountName" class="block text-sm font-medium text-slate-700 mb-1"
          >Nama Akun <span class="text-red-500">*</span></label
        >
        <input
          type="text"
          id="accountName"
          v-model="formData.accountName"
          required
          class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
        />
      </div>

      <div>
        <label for="accountType" class="block text-sm font-medium text-slate-700 mb-1"
          >Tipe Akun</label
        >
        <input
          type="text"
          :value="formatAccountTypeText(formData.accountType)"
          class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
          readonly
          disabled
        />
        <p class="text-xs text-slate-500 mt-1">Tipe akun tidak dapat diubah.</p>
      </div>

      <div v-if="formData.accountType === FrontendAccountType.BANK">
        <SearchableSelect
          v-model="selectedBankId"
          :options="bankOptions"
          label="Bank"
          placeholder="Bank tidak dapat diubah"
          :disabled="true"
          helper-text="Bank tidak dapat diubah saat mengedit akun."
          input-id="bankId"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Saldo Awal</label>
        <p class="mt-1 text-slate-800 sm:text-sm bg-slate-50 px-3 py-2 rounded-md">
          {{ formatCurrency(formData.initialBalance ?? 0, formData.currency) }}
        </p>
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Saldo Saat Ini</label>
        <p class="mt-1 text-slate-800 sm:text-sm bg-slate-50 px-3 py-2 rounded-md">
          {{ formatCurrency(formData.currentBalance ?? 0, formData.currency) }}
        </p>
      </div>

      <div>
        <label for="currency" class="block text-sm font-medium text-slate-700 mb-1"
          >Mata Uang</label
        >
        <input
          type="text"
          id="currency"
          v-model="formData.currency"
          class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
          readonly
          disabled
        />
      </div>

      <div>
        <label for="accountNumber" class="block text-sm font-medium text-slate-700 mb-1"
          >Nomor Akun/Telepon (Opsional)</label
        >
        <input
          type="text"
          id="accountNumber"
          v-model="formData.accountNumber"
          class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
        />
      </div>

      <div v-if="submissionError" class="rounded-md bg-red-50 p-3 my-4">
        <p class="text-sm font-medium text-red-700">{{ submissionError }}</p>
      </div>

      <div class="flex items-center justify-end gap-3 pt-6 border-t mt-8">
        <RouterLink
          :to="{ name: 'accounts-list' }"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Batal
        </RouterLink>
        <button
          type="submit"
          :disabled="isSubmitting || accountStore.isSubmitting"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-blue-600 flex items-center"
        >
          <LoadingSpinner
            v-if="isSubmitting || accountStore.isSubmitting"
            :visible="true"
            size="xs"
            color="text-white"
            class="mr-2"
          />
          {{ isSubmitting || accountStore.isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import SearchableSelect from '@/components/common/SearchableSelect.vue'
import { FrontendAccountType } from '@/types/enums'
import type { Bank as BankOption, Account, UpdateAccountPayload } from '@/types/accounts'
import { useBankStore } from '@/stores/banks'
import { useAccountStore } from '@/stores/accounts'

// Enum dan opsi dropdown tipe akun (bisa juga diimpor dari file terpisah)
const accountTypeOptions = [
  { value: FrontendAccountType.BANK, text: 'Rekening Bank' },
  { value: FrontendAccountType.E_WALLET, text: 'E-Wallet (Dompet Digital)' },
  { value: FrontendAccountType.CASH, text: 'Tunai (Cash)' },
  { value: FrontendAccountType.CREDIT_CARD, text: 'Kartu Kredit' },
]

const bankStore = useBankStore()
const accountStore = useAccountStore()
const router = useRouter()
const route = useRoute()

const formData = reactive<
  UpdateAccountPayload & {
    // Gabungkan dengan field yang tidak diupdate untuk tampilan
    accountType?: FrontendAccountType | ''
    bankId?: string | null
    initialBalance?: number | null
    currentBalance?: number | null
    currency?: string
  }
>({
  accountName: '',
  accountType: '', // Akan diisi dari fetch
  bankId: null, // Akan diisi dari fetch
  initialBalance: null,
  currentBalance: null,
  currency: 'IDR',
  accountNumber: null,
})

const originalAccountName = ref('')
const accountData = ref<Account | null>(null) // Untuk menyimpan data akun asli
const isLoadingInitialData = ref(true) // Loading untuk fetch data awal
const isSubmitting = ref(false) // Loading lokal untuk submit form
const submissionError = ref<string | null>(null)

const availableBanks = computed(() => bankStore.allBanks)
const isLoadingBanks = computed(() => bankStore.isLoadingBanks)

const formatCurrency = (value: number, currency: string = 'IDR') => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(value)
}

const formatAccountTypeText = (typeValue?: FrontendAccountType | '') => {
  const option = accountTypeOptions.find((opt) => opt.value === typeValue)
  return option ? option.text : 'Tidak Diketahui'
}

const selectedBankName = computed(() => {
  if (formData.accountType === FrontendAccountType.BANK && formData.bankId) {
    const bank = availableBanks.value.find((b) => b.id === formData.bankId)
    return bank ? bank.name : 'Bank tidak ditemukan'
  }
  return ''
})

// Format bank options untuk SearchableSelect
const bankOptions = computed(() => {
  return availableBanks.value.map((bank) => ({
    value: bank.id,
    label: bank.name,
  }))
})

// Computed property untuk handle bankId dengan type yang sesuai
const selectedBankId = computed({
  get: () => formData.bankId ?? null,
  set: (value) => {
    formData.bankId = value
  },
})

const fetchAccountDetails = async (accountId: string) => {
  isLoadingInitialData.value = true
  submissionError.value = null // Reset error sebelumnya
  accountStore.error = null // Reset error di store juga
  try {
    const fetchedAccount = await accountStore.fetchAccountByIdForEdit(accountId)
    if (fetchedAccount) {
      accountData.value = fetchedAccount // Simpan data asli
      originalAccountName.value = fetchedAccount.accountName

      // Isi formData dengan data yang diambil
      formData.accountName = fetchedAccount.accountName
      formData.accountType = fetchedAccount.accountType as FrontendAccountType
      formData.bankId = fetchedAccount.bankId
      formData.initialBalance = fetchedAccount.initialBalance
      formData.currentBalance = fetchedAccount.currentBalance
      formData.currency = fetchedAccount.currency
      formData.accountNumber = fetchedAccount.accountNumber

      if (fetchedAccount.accountType === FrontendAccountType.BANK && fetchedAccount.bankId) {
        // Jika tipe BANK, fetch daftar bank untuk menampilkan nama bank (meskipun field bankId-nya disabled)
        // Dan untuk memastikan bankId yang ada di formData valid jika nanti logika update bankId diaktifkan
        await bankStore.fetchBanks()
      }
    } else {
      submissionError.value = 'Akun tidak ditemukan.' // Set error lokal
      accountData.value = null
    }
  } catch (err: any) {
    console.error('Gagal mengambil detail akun:', err)
    submissionError.value = err.message || 'Gagal mengambil detail akun.'
    accountData.value = null
  } finally {
    isLoadingInitialData.value = false
  }
}

onMounted(() => {
  const accountId = route.params.id as string
  if (accountId) {
    fetchAccountDetails(accountId)
  } else {
    submissionError.value = 'ID Akun tidak valid.'
    isLoadingInitialData.value = false
    accountData.value = null
  }
})

// Watch tidak diperlukan untuk bankId karena field bankId dan accountType di-disable untuk edit
// watch(() => formData.accountType, async (newType) => { ... });

const handleSubmitUpdate = async () => {
  if (!accountData.value) return // Pastikan ada data akun yang diedit

  isSubmitting.value = true
  submissionError.value = null
  accountStore.error = null

  if (!formData.accountName?.trim()) {
    submissionError.value = 'Nama Akun wajib diisi.'
    isSubmitting.value = false
    return
  }

  // Siapkan payload hanya dengan field yang boleh diubah
  const payloadToUpdate: UpdateAccountPayload = {
    accountName: formData.accountName,
    accountNumber: formData.accountNumber || null,
    // Jika Anda mengizinkan perubahan accountType atau bankId, tambahkan di sini dengan validasi
  }

  try {
    await accountStore.updateAccount(accountData.value.id, payloadToUpdate)
    // alert('Perubahan akun berhasil disimpan!'); // Ganti dengan notifikasi yang lebih baik
    router.push({ name: 'accounts-list' })
  } catch (error: any) {
    submissionError.value = error.message || 'Gagal memperbarui akun. Silakan coba lagi.'
    console.error('Update error:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped></style>
