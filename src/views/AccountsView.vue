<template>
  <div>
    <div class="flex justify-between items-center mb-6 print:hidden">
      <h1 class="text-3xl font-semibold text-gray-800">Akun Saya</h1>
      <div v-if="!isLoading && accounts && accounts.length > 0">
        <RouterLink
          v-if="canAddAccount"
          :to="{ name: 'account-create' }"
          class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-1.5 px-3 rounded-lg flex items-center transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-4 h-4 mr-1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          Tambah Akun
        </RouterLink>
        <button
          v-else
          disabled
          title="Batas akun paket FREE tercapai (Maks 4)"
          class="bg-slate-300 text-white text-sm font-medium py-1.5 px-3 rounded-lg flex items-center cursor-not-allowed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-4 h-4 mr-1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
          Limit Tercapai
        </button>
      </div>
    </div>

    <!-- Limit Alert -->
    <div
      v-if="!canAddAccount"
      class="rounded-md bg-yellow-50 p-4 border-l-4 border-yellow-400 mb-6"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-yellow-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800">Batas Akun Tercapai</h3>
          <div class="mt-2 text-sm text-yellow-700">
            <p>
              Anda telah mencapai batas maksimum 4 akun untuk paket FREE. Silakan upgrade ke Premium
              untuk menambah akun tanpa batas.
            </p>
          </div>
          <div class="mt-4">
            <div class="-mx-2 -my-1.5 flex">
              <RouterLink
                :to="{ name: 'settings' }"
                class="rounded-md bg-yellow-50 px-2 py-1.5 text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
              >
                Upgrade Sekarang &rarr;
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Account Statistics Cards -->
    <div
      v-if="!isLoading && accounts && accounts.length > 0"
      class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
    >
      <StatsCard title="Total Akun" :value="accounts.length" variant="indigo">
        <template #icon>
          <svg
            class="h-6 w-6 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
            />
          </svg>
        </template>
      </StatsCard>

      <StatsCard title="Rekening Bank" :value="accountStore.totalBanks" variant="blue">
        <template #icon>
          <svg
            class="h-6 w-6 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"
            />
          </svg>
        </template>
      </StatsCard>

      <StatsCard title="E-Wallet" :value="accountStore.totalWallets" variant="red">
        <template #icon>
          <svg
            class="h-6 w-6 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"
            />
          </svg>
        </template>
      </StatsCard>

      <StatsCard title="Kartu Kredit" :value="accountStore.totalCards" variant="yellow">
        <template #icon>
          <svg
            class="h-6 w-6 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.5 0 3.5-7.5h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0M6.75 7.5h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-5.25A2.25 2.25 0 0 0 4.5 13.5H6.75m-1.5-1.5h.75m-.75 3h.75m0-3a1.5 1.5 0 0 0-3 0m3 0V7.5"
            />
          </svg>
        </template>
      </StatsCard>
    </div>

    <LoadingSpinner
      v-if="isLoading && (!accounts || accounts.length === 0)"
      :visible="true"
      text="Memuat data akun..."
      size="lg"
      overlay
      color="text-sky-500"
      text-color="text-sky-700"
    />

    <div
      v-if="accountStore.error && !isLoading"
      class="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded relative mb-6"
      role="alert"
    >
      <strong class="font-bold">Oops! Terjadi kesalahan:</strong>
      <span class="block sm:inline">{{ accountStore.error }}</span>
    </div>

    <div
      v-if="!isLoading && accounts && accounts.length === 0 && !accountStore.error"
      class="text-center py-10 bg-white rounded-lg shadow-md print:hidden"
    >
      <svg
        class="mx-auto h-16 w-16 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          vector-effect="non-scaling-stroke"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M9.5 10.75A2.25 2.25 0 1 1 5 10.75a2.25 2.25 0 0 1 4.5 0Zm0 0H20m0 0A2.25 2.25 0 1 0 15.5 13a2.25 2.25 0 0 0 4.5 0V7.5A2.25 2.25 0 0 0 15.5 5a2.25 2.25 0 0 0-4.5 0v2.25m0 0h-5.5M9.5 10.75v8.25M16.25 13.5a2.25 2.25 0 1 1 0-4.5m0 4.5a2.25 2.25 0 1 0 0-4.5M2.75 7.5A2.25 2.25 0 0 1 5 5.25h14A2.25 2.25 0 0 1 21.25 7.5v9A2.25 2.25 0 0 1 19 18.75H5A2.25 2.25 0 0 1 2.75 16.5v-9Z"
        />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-slate-800">Anda Belum Memiliki Akun</h3>
      <p class="mt-1 text-sm text-slate-500">
        Mulai kelola keuangan Anda dengan menambahkan akun pertama.
      </p>

      <RouterLink
        :to="{ name: 'account-create' }"
        class="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        + Tambah Akun Sekarang
      </RouterLink>
    </div>

    <div
      v-if="!isLoading && accounts && accounts.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <div
        v-for="account in accounts"
        :key="account.id"
        class="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transform hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer"
        @click="viewTransactions(account.id)"
      >
        <div :class="getHeaderColorClass(account.accountType)" class="text-white px-4 py-2">
          <h3 class="text-md font-semibold truncate" :title="account.accountName">
            {{ account.accountName }}
          </h3>
        </div>

        <div class="p-4 space-y-2 flex-grow flex flex-col">
          <div class="flex items-center text-xs text-slate-500 mb-2">
            <span class="mr-1.5 w-4 h-4 text-slate-500">
              <svg
                v-if="account.accountType === 'BANK'"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-full h-full"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"
                />
              </svg>
              <svg
                v-else-if="account.accountType === 'E_WALLET'"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-full h-full"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"
                />
              </svg>
              <svg
                v-else-if="account.accountType === 'CASH'"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-full h-full"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-full h-full"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.5 0 3.5-7.5h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0M6.75 7.5h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-5.25A2.25 2.25 0 0 0 4.5 13.5H6.75m-1.5-1.5h.75m-.75 3h.75m0-3a1.5 1.5 0 0 0-3 0m3 0V7.5"
                />
              </svg>
            </span>
            <span class="capitalize">{{
              account.accountType.replace('_', ' ').toLowerCase()
            }}</span>
            <span
              v-if="account.bank?.name"
              class="ml-1 text-xs truncate"
              :title="account.bank.name"
            >
              - {{ account.bank.name }}</span
            >
          </div>
          <div class="my-2">
            <p class="text-xs text-slate-500 mb-0.5">Saldo:</p>
            <p class="text-xl font-bold text-slate-800">
              {{ formatCurrency(account.currentBalance, account.currency) }}
            </p>
          </div>
          <div v-if="account.accountNumber" class="text-xs text-slate-500 mt-auto">
            <span>No. Akun: ...{{ account.accountNumber.slice(-4) }}</span>
          </div>
          <div v-else class="mt-auto"></div>

          <div class="pt-2 border-t border-slate-200 flex justify-end space-x-2 mt-2 print:hidden">
            <button
              @click.stop="viewTransactions(account.id)"
              title="Lihat Detail Akun"
              class="p-1.5 text-slate-500 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
            <RouterLink
              :to="{ name: 'account-edit', params: { id: account.id } }"
              @click.stop
              title="Edit Akun"
              class="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                ></path>
              </svg>
            </RouterLink>
            <button
              @click.stop="promptDeleteAccount(account)"
              title="Hapus Akun"
              class="p-1.5 text-slate-500 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <ConfirmationModal
      v-model:isOpen="isDeleteModalOpen"
      title="Konfirmasi Hapus Akun"
      :message="`Apakah Anda yakin ingin menghapus akun '${accountToDelete?.accountName || ''}'? Aksi ini tidak dapat dibatalkan. Semua transaksi terkait akun ini mungkin juga akan terpengaruh atau terhapus.`"
      confirmButtonText="Ya, Hapus Akun Ini"
      confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      iconType="danger"
      :isConfirming="isDeletingAccount"
      @confirm="handleConfirmDelete"
      @cancel="closeDeleteModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import StatsCard from '@/components/common/StatsCard.vue'
import { useAccountStore } from '@/stores/accounts'
import { useAuthStore } from '@/stores/auth'
import type { Account } from '@/types/accounts'

const accountStore = useAccountStore()
const authStore = useAuthStore()
const router = useRouter()

const accounts = computed(() => accountStore.accounts)
const isLoading = computed(() => accountStore.isLoading)

const canAddAccount = computed(() => {
  const isFree = authStore.currentUser?.subscriptionPlan === 'FREE'
  return !isFree || (accounts.value && accounts.value.length < 4)
})

onMounted(async () => {
  await accountStore.fetchAccounts()
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

// Fungsi untuk mendapatkan warna header berdasarkan tipe akun
const getHeaderColorClass = (accountType: string): string => {
  switch (accountType) {
    case 'BANK':
      return 'bg-blue-600' // Rekening - Biru
    case 'CREDIT_CARD':
      return 'bg-yellow-500' // Kartu Kredit - Kuning
    case 'CASH':
      return 'bg-green-600' // Cash - Hijau
    case 'E_WALLET':
      return 'bg-red-600' // E-Wallet - Merah
    default:
      return 'bg-slate-700' // Default - Abu-abu
  }
}

const viewTransactions = (accountId: string) => {
  router.push({ name: 'account-detail', params: { id: accountId } })
}

// Logika untuk Modal Hapus
const isDeleteModalOpen = ref(false)
const accountToDelete = ref<Account | null>(null)
const isDeletingAccount = ref(false)

const promptDeleteAccount = (account: Account) => {
  accountToDelete.value = account
  isDeleteModalOpen.value = true
}

const handleConfirmDelete = async () => {
  if (!accountToDelete.value) return
  isDeletingAccount.value = true
  try {
    await accountStore.deleteAccount(accountToDelete.value.id)
  } catch (error) {
    console.error('Gagal menghapus akun di view:', error)
  } finally {
    isDeletingAccount.value = false
    closeDeleteModal()
  }
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  accountToDelete.value = null
}
</script>
