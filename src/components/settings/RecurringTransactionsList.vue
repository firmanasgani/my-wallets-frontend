<template>
  <div class="space-y-6">
    <div class="flex items-center">
      <button
        @click="$emit('back')"
        class="mr-4 p-2 rounded-full hover:bg-slate-100 text-slate-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
      </button>
      <h2 class="text-xl font-bold text-slate-900">Daftar Transaksi Berulang</h2>
    </div>

    <div class="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
      <div class="p-6">
        <div v-if="isLoadingRecurring" class="flex justify-center py-4">
          <p class="text-slate-500">Memuat data...</p>
        </div>
        <div v-else-if="recurringTransactions.length === 0" class="text-center py-4">
          <div
            class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 mb-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 class="text-sm font-medium text-slate-900">Belum ada transaksi berulang</h3>
          <p class="mt-1 text-sm text-slate-500">Anda belum mengatur jadwal transaksi otomatis.</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="rt in recurringTransactions"
            :key="rt.id"
            class="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-indigo-200 transition-colors"
          >
            <div>
              <div class="flex items-center gap-2">
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-medium uppercase"
                  :class="{
                    'bg-green-100 text-green-800': rt.transactionType === 'INCOME',
                    'bg-red-100 text-red-800': rt.transactionType === 'EXPENSE',
                    'bg-blue-100 text-blue-800': rt.transactionType === 'TRANSFER',
                  }"
                >
                  {{ rt.transactionType }}
                </span>
                <span class="text-sm font-medium text-slate-900">
                  {{ formatCurrency(rt.amount) }}
                </span>
                <span class="text-xs text-slate-500"> / {{ getIntervalLabel(rt.interval) }} </span>
              </div>
              <p class="text-sm text-slate-600 mt-1 font-medium">
                {{ rt.description || 'Tanpa deskripsi' }}
              </p>
              <div class="flex items-center gap-4 mt-2 text-xs text-slate-500">
                <div class="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Mulai: {{ formatDate(rt.startDate) }}
                </div>
                <div class="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Berikutnya: {{ formatDate(rt.nextRunDate) }}
                </div>
              </div>
            </div>
            <button
              @click="confirmDeleteRecurring(rt.id)"
              class="ml-4 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Hapus Transaksi Berulang"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useTransactionStore } from '@/stores/transactions'
import { RecurringInterval } from '@/types/transaction'

defineEmits(['back'])

const transactionStore = useTransactionStore()

const recurringTransactions = computed(() => transactionStore.recurringTransactions)
const isLoadingRecurring = ref(false)

const fetchRecurring = async () => {
  isLoadingRecurring.value = true
  await transactionStore.fetchRecurringTransactions()
  isLoadingRecurring.value = false
}

onMounted(() => {
  fetchRecurring()
})

const confirmDeleteRecurring = async (id: string) => {
  if (confirm('Apakah Anda yakin ingin menghapus transaksi berulang ini?')) {
    try {
      await transactionStore.deleteRecurringTransaction(id)
    } catch (error) {
      alert('Gagal menghapus transaksi berulang.')
    }
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const getIntervalLabel = (interval: RecurringInterval) => {
  const map: Record<string, string> = {
    DAILY: 'Harian',
    WEEKLY: 'Mingguan',
    MONTHLY: 'Bulanan',
    YEARLY: 'Tahunan',
  }
  return map[interval] || interval
}
</script>
