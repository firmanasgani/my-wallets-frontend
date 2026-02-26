<template>
  <div class="space-y-6">
    <!-- Header with Back Button -->
    <div class="flex items-center">
      <button
        @click="$emit('back')"
        class="mr-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
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
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">Histori Pembayaran</h2>
      <button
        @click="store.fetchPaymentHistory()"
        :disabled="store.isLoadingHistory"
        class="ml-auto text-sm text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 inline-block mr-1"
          :class="{ 'animate-spin': store.isLoadingHistory }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Refresh
      </button>
    </div>

    <div
      class="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
    >
      <div class="p-6">
        <!-- Loading -->
        <div v-if="store.isLoadingHistory" class="flex justify-center py-4">
          <p class="text-slate-500 dark:text-slate-400">Memuat data...</p>
        </div>

        <!-- Empty -->
        <div
          v-else-if="store.paymentHistory.length === 0 && !store.historyError"
          class="text-center py-4"
        >
          <div
            class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-700 mb-3"
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
                d="M9 14l2 2 4-4M7 5H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2h-2M7 5a2 2 0 012-2h6a2 2 0 012 2M7 5h10"
              />
            </svg>
          </div>
          <h3 class="text-sm font-medium text-slate-900 dark:text-white">
            Belum ada histori pembayaran
          </h3>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Anda belum pernah melakukan pembelian paket.
          </p>
        </div>

        <!-- Error -->
        <div v-else-if="store.historyError" class="text-center py-4">
          <p class="text-sm text-red-500">{{ store.historyError }}</p>
          <button
            @click="store.fetchPaymentHistory()"
            class="mt-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Coba Lagi
          </button>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-700">
                <th class="pb-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Order ID</th>
                <th class="pb-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Paket</th>
                <th class="pb-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jumlah</th>
                <th class="pb-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th class="pb-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dibuat</th>
                <th class="pb-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dibayar</th>
                <th class="pb-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700/50">
              <tr
                v-for="item in store.paymentHistory"
                :key="item.id"
                class="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
              >
                <td class="py-3 pr-4 font-mono text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                  {{ item.orderId }}
                </td>
                <td class="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                  {{ item.plan?.name || '—' }}
                </td>
                <td class="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                  {{ formatCurrency(item.amount) }}
                </td>
                <td class="py-3 pr-4 whitespace-nowrap">
                  <span
                    class="px-2 py-0.5 rounded-full text-xs font-medium uppercase"
                    :class="statusClass(item.status)"
                  >
                    {{ statusLabel(item.status) }}
                  </span>
                </td>
                <td class="py-3 pr-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {{ formatDate(item.createdAt) }}
                </td>
                <td class="py-3 pr-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {{ item.midtransResponse?.transaction_time ? formatDate(item.midtransResponse.transaction_time) :  '—' }}
                </td>
                <td class="py-3 whitespace-nowrap">
                  <!-- Lanjutkan Bayar (hanya PENDING) -->
                  <button
                    v-if="item.status === 'PENDING'"
                    @click="handleResume(item.orderId)"
                    :disabled="resumingOrderId === item.orderId"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700"
                  >
                    <svg
                      v-if="resumingOrderId !== item.orderId"
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
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                    <svg
                      v-else
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-3.5 w-3.5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    {{ resumingOrderId === item.orderId ? 'Memproses...' : 'Lanjutkan Bayar' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSubscriptionStore } from '../../stores/subscriptions'
import type { PaymentStatus } from '../../stores/subscriptions'

defineEmits(['back'])

const store = useSubscriptionStore()
const resumingOrderId = ref<string | null>(null)

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

const statusLabel = (status: PaymentStatus): string => {
  const map: Record<PaymentStatus, string> = {
    PENDING: 'Menunggu',
    SUCCESS: 'Berhasil',
    FAILED: 'Gagal',
    EXPIRED: 'Kadaluarsa',
  }
  return map[status] ?? status
}

const statusClass = (status: PaymentStatus): string => {
  const map: Record<PaymentStatus, string> = {
    PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    SUCCESS: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    EXPIRED: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  }
  return map[status] ?? 'bg-slate-100 text-slate-600'
}

const handleResume = async (orderId: string) => {
  resumingOrderId.value = orderId
  try {
    const snapToken = await store.resumePayment(orderId)
    // @ts-ignore
    window.snap.pay(snapToken, {
      onSuccess: () => {
        store.fetchPaymentHistory()
        resumingOrderId.value = null
      },
      onPending: () => {
        resumingOrderId.value = null
      },
      onError: () => {
        resumingOrderId.value = null
        alert('Terjadi kesalahan saat pembayaran.')
      },
      onClose: () => {
        resumingOrderId.value = null
      },
    })
  } catch (err: any) {
    alert(err.message || 'Gagal melanjutkan pembayaran.')
    resumingOrderId.value = null
  }
}

onMounted(() => {
  store.fetchPaymentHistory()
})
</script>
