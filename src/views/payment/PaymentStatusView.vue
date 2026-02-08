<template>
  <div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
    <div
      class="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 text-center space-y-6"
    >
      <div
        :class="statusConfig.iconBg"
        class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <i :class="[statusConfig.icon, statusConfig.iconColor]" class="text-3xl"></i>
      </div>

      <div class="space-y-2">
        <h1 class="text-3xl font-black text-slate-900">{{ statusConfig.title }}</h1>
        <p class="text-slate-500 font-medium">
          {{ statusConfig.description }}
        </p>
      </div>

      <div v-if="orderId" class="bg-slate-50 rounded-xl p-4 flex flex-col gap-2">
        <div class="flex justify-between items-center text-sm">
          <span class="text-slate-400">Order ID</span>
          <span class="font-bold text-slate-700">{{ orderId }}</span>
        </div>
      </div>

      <div class="pt-4 space-y-3">
        <button
          @click="goToDashboard"
          class="w-full bg-indigo-600 text-white py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
        >
          Ke Dashboard
        </button>
        <button
          v-if="status !== 'finish'"
          @click="goToSettings"
          class="w-full bg-white text-slate-600 border border-slate-200 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all"
        >
          Coba Lagi
        </button>
      </div>
    </div>

    <p class="mt-8 text-slate-400 text-sm">
      &copy; 2026 MyWallets. Keamanan transaksi terjamin oleh Midtrans.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const status = computed(() => {
  const path = route.path
  if (path.includes('finish')) return 'finish'
  if (path.includes('unfinish')) return 'unfinish'
  return 'error'
})

const orderId = computed(() => route.query.order_id)

const statusConfig = computed(() => {
  switch (status.value) {
    case 'finish':
      return {
        title: 'Berhasil!',
        description: 'Pembayaran Anda telah diterima. Akun Anda sedang diperbarui.',
        icon: 'fa-solid fa-check',
        iconColor: 'text-green-600',
        iconBg: 'bg-green-100',
      }
    case 'unfinish':
      return {
        title: 'Belum Selesai',
        description:
          'Anda belum menyelesaikan proses pembayaran. Silakan cek kembali instruksi pembayaran.',
        icon: 'fa-solid fa-clock',
        iconColor: 'text-amber-600',
        iconBg: 'bg-amber-100',
      }
    default:
      return {
        title: 'Pembayaran Gagal',
        description:
          'Terjadi kesalahan saat memproses pembayaran Anda. Silakan hubungi CS jika dana terpotong.',
        icon: 'fa-solid fa-xmark',
        iconColor: 'text-red-600',
        iconBg: 'bg-red-100',
      }
  }
})

const goToDashboard = () => {
  router.push({ name: 'dashboard' })
}

const goToSettings = () => {
  router.push({ name: 'settings', query: { upgrade: 'true' } })
}

onMounted(async () => {
  if (status.value === 'finish') {
    // Polling because Midtrans webhook is async
    let attempts = 0
    const maxAttempts = 5

    const checkStatus = async () => {
      await authStore.fetchUserProfile()
      if (authStore.currentUser?.subscriptionPlan !== 'FREE') {
        // Success!
        return
      }

      if (attempts < maxAttempts) {
        attempts++
        setTimeout(checkStatus, 2000) // Retry every 2 seconds
      }
    }

    await checkStatus()
  }
})
</script>
