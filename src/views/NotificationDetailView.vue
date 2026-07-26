<template>
  <div class="max-w-2xl mx-auto">
    <button
      @click="router.push({ name: 'notifications-list' })"
      class="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Kembali ke notifikasi
    </button>

    <LoadingSpinner v-if="isLoading" text="Memuat notifikasi..." class="py-10" />

    <p v-else-if="!notification" class="text-center text-sm text-slate-400 dark:text-slate-500 py-10">
      Notifikasi tidak ditemukan.
    </p>

    <div
      v-else
      class="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 p-6"
    >
      <span
        class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 ring-1 ring-inset ring-emerald-600/20"
      >
        {{ typeLabel(notification.type) }}
      </span>

      <h1 class="mt-3 text-xl font-bold text-slate-900 dark:text-white">{{ notification.title }}</h1>
      <p class="mt-1 text-xs text-slate-400 dark:text-slate-500">{{ formatDate(notification.createdAt) }}</p>

      <p class="mt-4 text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
        {{ notification.body }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import notificationService, { type AppNotification, type NotificationType } from '@/services/notificationService'
import { useNotificationsStore } from '@/stores/notifications'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const notificationsStore = useNotificationsStore()

const notification = ref<AppNotification | null>(null)
const isLoading = ref(false)

const TYPE_LABELS: Record<NotificationType, string> = {
  PAYMENT_SUCCESS: 'Pembayaran Berhasil',
  PAYMENT_FAILED: 'Pembayaran Gagal',
  PAYMENT_PENDING_REVIEW: 'Pembayaran Menunggu Review',
  SUBSCRIPTION_ACTIVATED: 'Langganan Aktif',
  SUBSCRIPTION_EXPIRING: 'Langganan Akan Berakhir',
  SUBSCRIPTION_EXPIRED: 'Langganan Berakhir',
  SUBSCRIPTION_CANCELLED: 'Langganan Dibatalkan',
  CHAT_MESSAGE: 'Pesan Chat',
  ACCOUNT_STATUS: 'Status Akun',
  PROMOTION: 'Promosi',
  USER_REGISTERED: 'Pengguna Baru',
  SYSTEM: 'Sistem',
}

const typeLabel = (type: NotificationType) => TYPE_LABELS[type] ?? type

const formatDate = (value: string) =>
  new Date(value).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

onMounted(async () => {
  const id = route.params.id as string
  isLoading.value = true
  try {
    notification.value = await notificationService.getOne(id)
    if (notification.value && !notification.value.isRead) {
      await notificationsStore.markRead(id)
      notification.value.isRead = true
    }
  } finally {
    isLoading.value = false
  }
})
</script>
