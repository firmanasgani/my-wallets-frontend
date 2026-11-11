<template>
  <div class="space-y-4">
    <!-- Bank transfer / Virtual Account -->
    <div v-if="checkout.va_number" class="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-2">
      <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
        Virtual Account {{ checkout.bank ? `· ${checkout.bank.toUpperCase()}` : '' }}
      </p>
      <div class="flex items-center justify-between gap-3">
        <span class="text-xl font-mono font-bold text-slate-900 dark:text-white tracking-wide">{{ checkout.va_number }}</span>
        <button
          type="button"
          @click="copy(checkout.va_number!)"
          class="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
        >
          {{ copied ? 'Tersalin!' : 'Salin' }}
        </button>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Bayar melalui ATM, mobile banking, atau internet banking {{ checkout.bank ? checkout.bank.toUpperCase() : '' }} dengan nomor Virtual Account di atas.
      </p>
    </div>

    <!-- QRIS / GoPay / e-wallet QR code -->
    <div v-else-if="checkout.qr_string" class="rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col items-center gap-3">
      <img :src="checkout.qr_string" alt="QR code pembayaran" class="h-56 w-56 rounded-lg bg-white p-2" />
      <p class="text-xs text-slate-500 dark:text-slate-400 text-center">
        Pindai kode QR ini dengan aplikasi e-wallet atau mobile banking Anda.
      </p>
    </div>

    <!-- Convenience store payment code -->
    <div v-else-if="checkout.payment_code" class="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-2">
      <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Kode Pembayaran</p>
      <div class="flex items-center justify-between gap-3">
        <span class="text-xl font-mono font-bold text-slate-900 dark:text-white tracking-wide">{{ checkout.payment_code }}</span>
        <button
          type="button"
          @click="copy(checkout.payment_code!)"
          class="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
        >
          {{ copied ? 'Tersalin!' : 'Salin' }}
        </button>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Tunjukkan kode ini ke kasir Indomaret/Alfamart untuk menyelesaikan pembayaran.
      </p>
    </div>

    <p v-if="!checkout.va_number && !checkout.qr_string && !checkout.payment_code" class="text-sm text-slate-500 dark:text-slate-400">
      Selesaikan pembayaran melalui aplikasi yang terbuka.
    </p>

    <!-- GoPay/e-wallet app deeplink, shown alongside whichever instructions above apply -->
    <a
      v-if="checkout.deeplink_url"
      :href="checkout.deeplink_url"
      class="block w-full text-center bg-[#2E8B57] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#236B43] transition-all"
    >
      Buka Aplikasi untuk Membayar
    </a>

    <p v-if="checkout.expiry_time" class="text-center text-xs text-slate-400">
      Selesaikan sebelum {{ formatExpiry(checkout.expiry_time) }}
    </p>

    <p class="text-center text-xs text-slate-400">Order ID: {{ orderId }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { PayfestCheckout } from '@/stores/subscriptions'

const { checkout, orderId } = defineProps<{
  checkout: PayfestCheckout
  orderId: string
}>()

const copied = ref(false)

async function copy(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    // Clipboard API can be unavailable (e.g. insecure context) — the
    // value is still visible on screen for the user to copy manually.
  }
}

function formatExpiry(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
