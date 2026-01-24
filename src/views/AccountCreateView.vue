<template>
  <div class="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg">
    <h1 class="text-2xl sm:text-3xl font-semibold text-slate-800 mb-6 border-b pb-4">
      Tambah Akun Baru
    </h1>

    <form @submit.prevent="handleSubmitAccount" class="space-y-6">
      <div>
        <label for="accountName" class="block text-sm font-medium text-slate-700 mb-1"
          >Nama Akun <span class="text-red-500">*</span></label
        >
        <input
          type="text"
          id="accountName"
          v-model="formData.accountName"
          required
          class="border border-gray-300 rounded-lg block w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Contoh: BCA Tabungan, GoPay"
        />
      </div>

      <div>
        <label for="accountType" class="block text-sm font-medium text-slate-700 mb-1"
          >Tipe Akun <span class="text-red-500">*</span></label
        >
        <select
          id="accountType"
          v-model="formData.accountType"
          required
          class="border border-gray-300 rounded-lg block w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option disabled value="">Pilih tipe akun...</option>
          <option v-for="typeOpt in accountTypeOptions" :key="typeOpt.value" :value="typeOpt.value">
            {{ typeOpt.text }}
          </option>
        </select>
      </div>

      <div v-if="formData.accountType === FrontendAccountType.BANK">
        <label for="bankId" class="block text-sm font-medium text-slate-700 mb-1"
          >Pilih Bank <span class="text-red-500">*</span></label
        >
        <select
          id="bankId"
          v-model="formData.bankId"
          :required="formData.accountType === FrontendAccountType.BANK"
          class="border border-gray-300 rounded-lg block w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option disabled :value="null">Pilih bank...</option>
          <option v-for="bank in availableBanks" :key="bank.id" :value="bank.id">
            {{ bank.name }}
          </option>
        </select>
        <p
          v-if="bankStore.isLoadingBanks && formData.accountType === FrontendAccountType.BANK"
          class="text-xs text-slate-500 mt-1"
        >
          Memuat daftar bank...
        </p>
        <p
          v-if="
            !bankStore.isLoadingBanks &&
            formData.accountType === FrontendAccountType.BANK &&
            availableBanks.length === 0 &&
            !bankStore.bankError
          "
          class="text-xs text-orange-500 mt-1"
        >
          Tidak ada bank tersedia atau gagal memuat.
        </p>
        <p v-if="bankStore.bankError" class="text-xs text-red-500 mt-1">
          {{ bankStore.bankError }}
        </p>
      </div>

      <div>
        <label for="initialBalance" class="block text-sm font-medium text-slate-700 mb-1"
          >Saldo Awal (Opsional)</label
        >
        <div class="mt-1 relative rounded-md shadow-sm">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-slate-500 sm:text-sm"> {{ formData.currency || 'IDR' }} </span>
          </div>
          <input
            type="number"
            id="initialBalance"
            v-model.number="formData.initialBalance"
            min="0"
            step="any"
            class="border border-gray-300 rounded-lg block w-full pl-12 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label for="currency" class="block text-sm font-medium text-slate-700 mb-1"
          >Mata Uang (Opsional, default IDR)</label
        >
        <input
          type="text"
          id="currency"
          v-model="formData.currency"
          maxlength="5"
          class="border border-gray-300 rounded-lg block w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="IDR"
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
          class="border border-gray-300 rounded-lg block w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Untuk rekening bank atau e-wallet"
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
          :disabled="isSubmitting"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-blue-600 flex items-center"
        >
          <LoadingSpinner
            v-if="isSubmitting"
            :visible="true"
            size="xs"
            color="text-white"
            class="mr-2"
          />
          {{ isSubmitting ? 'Menyimpan...' : 'Simpan Akun' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { FrontendAccountType } from '@/types/enums'
import type { CreateAccountPayload } from '@/types/accounts'
import { useBankStore } from '@/stores/banks'
import { useAccountStore } from '@/stores/accounts'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const accountTypeOptions = [
  { value: FrontendAccountType.BANK, text: 'Rekening Bank' },
  { value: FrontendAccountType.E_WALLET, text: 'E-Wallet (Dompet Digital)' },
  { value: FrontendAccountType.CASH, text: 'Tunai (Cash)' },
  { value: FrontendAccountType.CREDIT_CARD, text: 'Kartu Kredit' },
]

const bankStore = useBankStore()
const accountStore = useAccountStore()
const router = useRouter()

const availableBanks = computed(() => bankStore.allBanks)

// Reactive form data
const formData = reactive<CreateAccountPayload>({
  accountName: '',
  accountType: FrontendAccountType.BANK,
  bankId: null,
  initialBalance: 0,
  currency: 'IDR',
  accountNumber: null,
})

const isSubmitting = ref(false)
const submissionError = ref<string | null>(null)

const fetchBanksIfNeeded = async () => {
  if (formData.accountType === FrontendAccountType.BANK && bankStore.banks.length === 0) {
    await bankStore.fetchBanks()
  }
}

onMounted(() => {
  fetchBanksIfNeeded()
})

watch(
  () => formData.accountType,
  (newType) => {
    if (newType !== FrontendAccountType.BANK) {
      formData.bankId = null
    } else {
      fetchBanksIfNeeded()
    }
  },
)

const handleSubmitAccount = async () => {
  isSubmitting.value = true
  submissionError.value = null
  accountStore.error = null

  if (!formData.accountName.trim()) {
    submissionError.value = 'Nama Akun wajib diisi.'
    isSubmitting.value = false
    return
  }
  if (!formData.accountType) {
    submissionError.value = 'Tipe Akun wajib dipilih.'
    isSubmitting.value = false
    return
  }
  if (formData.accountType === FrontendAccountType.BANK && !formData.bankId) {
    submissionError.value = 'Bank wajib dipilih untuk tipe akun BANK.'
    isSubmitting.value = false
    return
  }

  try {
    const payloadToSubmit: CreateAccountPayload = {
      accountName: formData.accountName,
      accountType: formData.accountType as FrontendAccountType,
      initialBalance: formData.initialBalance ?? 0,
      currency: formData.currency?.trim() || 'IDR',
      accountNumber: formData.accountNumber?.trim() || null,
    }
    if (formData.accountType === FrontendAccountType.BANK && formData.bankId) {
      payloadToSubmit.bankId = formData.bankId
    }

    await accountStore.createAccount(payloadToSubmit)
    router.push({ name: 'accounts-list' })
  } catch (error: any) {
    submissionError.value = error.message || 'Gagal menambahkan akun. Silakan coba lagi.'
    console.error('Submit error:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>
