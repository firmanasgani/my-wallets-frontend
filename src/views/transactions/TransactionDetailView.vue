<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Back Button -->
    <button
      @click="$router.back()"
      class="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group"
    >
      <div
        class="p-2 bg-white rounded-lg shadow-sm border border-slate-200 group-hover:border-slate-300"
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
      </div>
      <span class="text-sm font-medium">Kembali</span>
    </button>

    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <LoadingSpinner :visible="true" size="lg" />
      <p class="mt-4 text-slate-500 animate-pulse">Memuat detail transaksi...</p>
    </div>

    <div
      v-else-if="transaction"
      class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700"
    >
      <!-- Main Card -->
      <div
        class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
      >
        <!-- Header Section -->
        <div :class="['p-8 text-center border-b border-slate-50', typeClass]">
          <div
            class="inline-flex items-center justify-center p-4 bg-white/20 backdrop-blur-md rounded-2xl mb-4 shadow-inner"
          >
            <i :class="['text-3xl text-white fa-solid', typeIcon]"></i>
          </div>
          <h2 class="text-white/80 text-sm font-semibold uppercase tracking-widest mb-1">
            {{ typeLabel }}
          </h2>
          <p class="text-4xl font-bold text-white tracking-tight">
            {{ isTransfer ? '' : isExpense ? '-' : '+' }}{{ formatCurrency(transaction.amount) }}
          </p>
          <p class="text-white/70 text-sm mt-2">{{ formatDate(transaction.transactionDate) }}</p>
        </div>

        <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          <!-- Left Column: Primary Info -->
          <div class="space-y-8">
            <section>
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Informasi Utama
              </h3>
              <div class="space-y-5">
                <!-- Description -->
                <div class="flex items-start gap-4">
                  <div class="p-2.5 bg-slate-50 rounded-xl text-slate-400">
                    <i class="fa-solid fa-align-left w-5 text-center"></i>
                  </div>
                  <div>
                    <p class="text-xs text-slate-400 font-medium mb-0.5">Deskripsi</p>
                    <p class="text-slate-900 font-semibold">
                      {{ transaction.description || 'Tidak ada deskripsi' }}
                    </p>
                  </div>
                </div>

                <!-- Category -->
                <div v-if="transaction.category" class="flex items-start gap-4">
                  <div
                    class="p-2.5 rounded-xl text-white"
                    :style="{ backgroundColor: transaction.category.color || '#6366f1' }"
                  >
                    <i
                      :class="[
                        'fa-solid w-5 text-center',
                        `fa-${transaction.category.icon || 'tag'}`,
                      ]"
                    ></i>
                  </div>
                  <div>
                    <p class="text-xs text-slate-400 font-medium mb-0.5">Kategori</p>
                    <p class="text-slate-900 font-semibold">
                      {{ transaction.category.categoryName }}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Akun Terkait
              </h3>
              <div class="space-y-5">
                <!-- Source Account -->
                <div
                  v-if="transaction.sourceAccount"
                  class="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100"
                >
                  <div
                    class="p-2.5 bg-white rounded-xl shadow-sm text-indigo-600 border border-slate-100"
                  >
                    <i class="fa-solid fa-wallet w-5 text-center"></i>
                  </div>
                  <div class="flex-1">
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-0.5">
                      {{ isTransfer ? 'Dari Akun' : isExpense ? 'Dibayar Dengan' : 'Akun' }}
                    </p>
                    <p class="text-slate-900 font-bold text-sm leading-tight">
                      {{ transaction.sourceAccount.accountName }}
                    </p>
                    <p v-if="transaction.sourceAccount.bank" class="text-xs text-slate-500 mt-1">
                      {{ transaction.sourceAccount.bank.name }}
                    </p>
                  </div>
                </div>

                <!-- Arrow for transfer -->
                <div v-if="isTransfer" class="flex justify-center -my-3 relative z-10">
                  <div
                    class="bg-white p-2 rounded-full border border-slate-100 shadow-sm text-blue-500"
                  >
                    <i class="fa-solid fa-arrow-down"></i>
                  </div>
                </div>

                <!-- Destination Account -->
                <div
                  v-if="transaction.destinationAccount"
                  class="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100"
                >
                  <div
                    class="p-2.5 bg-white rounded-xl shadow-sm text-green-600 border border-slate-100"
                  >
                    <i class="fa-solid fa-vault w-5 text-center"></i>
                  </div>
                  <div class="flex-1">
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-0.5">
                      {{ isTransfer ? 'Tujuan Ke' : 'Masuk Ke' }}
                    </p>
                    <p class="text-slate-900 font-bold text-sm leading-tight">
                      {{ transaction.destinationAccount.accountName }}
                    </p>
                    <p
                      v-if="transaction.destinationAccount.bank"
                      class="text-xs text-slate-500 mt-1"
                    >
                      {{ transaction.destinationAccount.bank.name }}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- Right Column: Meta & Attachment -->
          <div class="space-y-8">
            <section>
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Riwayat
              </h3>
              <div class="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                <div class="flex justify-between items-center text-sm">
                  <span class="text-slate-500">Dibuat pada</span>
                  <span class="text-slate-900 font-medium">{{
                    formatDateTime(transaction.createdAt)
                  }}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                  <span class="text-slate-500">Terakhir diupdate</span>
                  <span class="text-slate-900 font-medium">{{
                    formatDateTime(transaction.updatedAt)
                  }}</span>
                </div>
              </div>
            </section>

            <section>
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Lampiran
              </h3>
              <div
                v-if="transaction.attachmentUrl"
                class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all hover:shadow-lg"
              >
                <!-- Image Preview -->
                <div v-if="isImage" class="aspect-video w-full overflow-hidden">
                  <img
                    :src="transaction.attachmentUrl"
                    class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    alt="Attachment"
                  />
                </div>
                <!-- PDF / Other Placeholder -->
                <div
                  v-else
                  class="aspect-video w-full flex flex-col items-center justify-center p-8 text-slate-400 bg-white"
                >
                  <div class="p-4 bg-slate-50 rounded-2xl mb-3 shadow-inner">
                    <i class="fa-solid fa-file-pdf text-4xl text-red-500"></i>
                  </div>
                  <p class="text-sm font-bold text-slate-700">Dokumen PDF</p>
                  <p class="text-xs mt-1">Klik untuk melihat detail</p>
                </div>

                <!-- Overlay Actions -->
                <div
                  class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3"
                >
                  <a
                    :href="transaction.attachmentUrl"
                    target="_blank"
                    class="p-3 bg-white rounded-xl shadow-lg text-slate-900 hover:scale-110 transition-transform"
                  >
                    <i class="fa-solid fa-eye mr-2"></i>
                    <span class="text-sm font-bold">Lihat</span>
                  </a>
                </div>
              </div>
              <div
                v-else
                class="p-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center"
              >
                <div class="p-3 bg-slate-50 rounded-xl mb-2">
                  <i class="fa-solid fa-paperclip text-slate-300"></i>
                </div>
                <p class="text-xs text-slate-400 font-medium">Tidak ada lampiran</p>
              </div>
            </section>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="bg-slate-50 p-6 flex items-center justify-between border-t border-slate-100">
          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            ID: {{ transaction.id }}
          </p>
          <div class="flex gap-3">
            <button
              @click="exportToPDF"
              class="px-4 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
            >
              <i class="fa-solid fa-file-pdf mr-2"></i>Cetak PDF
            </button>
            <button
              @click="showDeleteConfirm = true"
              class="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <i class="fa-solid fa-trash mr-2"></i>Hapus
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 404 Case -->
    <div v-else class="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
      <div class="inline-flex p-4 bg-red-50 rounded-2xl text-red-600 mb-4">
        <i class="fa-solid fa-triangle-exclamation text-2xl"></i>
      </div>
      <h2 class="text-xl font-bold text-slate-900">Transaksi tidak ditemukan</h2>
      <p class="text-slate-500 mt-1">Kami tidak dapat menemukan transaksi yang Anda cari.</p>
      <button
        @click="$router.push({ name: 'transactions-list' })"
        class="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
      >
        Kembali ke Daftar
      </button>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      v-model:isOpen="showDeleteConfirm"
      title="Hapus Transaksi?"
      message="Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan dan saldo akun Anda akan disesuaikan kembali."
      confirmButtonText="Hapus Sekarang"
      cancelButtonText="Batal"
      iconType="danger"
      :isLoading="isDeleting"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTransactionStore } from '@/stores/transactions'
import ExportService from '@/services/exportService'
import type { Transaction } from '@/types/transaction'
import { FrontendTransactionType } from '@/types/enums'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'

const route = useRoute()
const router = useRouter()
const transactionStore = useTransactionStore()

const transaction = ref<Transaction | null>(null)
const isLoading = ref(true)
const isDeleting = ref(false)
const showDeleteConfirm = ref(false)

const isIncome = computed(
  () => transaction.value?.transactionType === FrontendTransactionType.INCOME,
)
const isExpense = computed(
  () => transaction.value?.transactionType === FrontendTransactionType.EXPENSE,
)
const isTransfer = computed(
  () => transaction.value?.transactionType === FrontendTransactionType.TRANSFER,
)

const typeLabel = computed(() => {
  if (isIncome.value) return 'Pemasukan'
  if (isExpense.value) return 'Pengeluaran'
  if (isTransfer.value) return 'Transfer'
  return 'Transaksi'
})

const typeIcon = computed(() => {
  if (isIncome.value) return 'fa-arrow-down'
  if (isExpense.value) return 'fa-arrow-up'
  if (isTransfer.value) return 'fa-right-left'
  return 'fa-circle-info'
})

const typeClass = computed(() => {
  if (isIncome.value) return 'bg-gradient-to-br from-green-500 to-emerald-600'
  if (isExpense.value) return 'bg-gradient-to-br from-rose-500 to-red-600'
  if (isTransfer.value) return 'bg-gradient-to-br from-indigo-500 to-blue-600'
  return 'bg-slate-600'
})

const isImage = computed(() => {
  if (!transaction.value?.attachmentPath) return false
  const path = transaction.value.attachmentPath.toLowerCase()
  return (
    path.endsWith('.jpg') ||
    path.endsWith('.jpeg') ||
    path.endsWith('.png') ||
    path.endsWith('.gif') ||
    path.endsWith('.webp')
  )
})

const loadTransaction = async () => {
  isLoading.value = true
  const id = route.params.id as string
  try {
    const data = await transactionStore.fetchTransactionById(id)
    transaction.value = data
  } catch (error) {
    console.error('Failed to load transaction detail:', error)
  } finally {
    isLoading.value = false
  }
}

const exportToPDF = () => {
  if (!transaction.value) return
  const title = `Detail Transaksi - ${transaction.value.description || 'Tanpa Deskripsi'}`
  ExportService.exportTransactionsToPDF([transaction.value], title)
}

const handleDelete = async () => {
  if (!transaction.value) return
  isDeleting.value = true
  try {
    await transactionStore.deleteTransaction(transaction.value.id)
    router.push({ name: 'transactions-list' })
  } catch (error) {
    console.error('Failed to delete transaction:', error)
  } finally {
    isDeleting.value = false
    showDeleteConfirm.value = false
  }
}

const formatCurrency = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return 'Rp 0'
  const numericValue = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(numericValue)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  loadTransaction()
})
</script>

<style scoped>
.animate-in {
  animation: animate-in 0.5s ease-out;
}

@keyframes animate-in {
  from {
    opacity: 0;
    transform: translateY(1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
