<template>
  <div class="max-w-3xl mx-auto">
    <div class="mb-6 flex items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold leading-7 text-slate-900 dark:text-white">Notifikasi</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Riwayat notifikasi pembayaran, chat, dan pemberitahuan lainnya.
        </p>
      </div>
      <button
        v-if="notificationsStore.unreadCount > 0"
        @click="handleMarkAllRead"
        class="text-sm font-medium text-[#2E8B57] dark:text-emerald-400 hover:underline whitespace-nowrap"
      >
        Tandai semua dibaca
      </button>
    </div>

    <div
      class="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
    >
      <LoadingSpinner v-if="isLoading" text="Memuat notifikasi..." class="py-10" />

      <p v-else-if="items.length === 0" class="text-center text-sm text-slate-400 dark:text-slate-500 py-10">
        Belum ada notifikasi.
      </p>

      <div v-else class="divide-y divide-slate-100 dark:divide-slate-700">
        <button
          v-for="notification in items"
          :key="notification.id"
          @click="handleSelect(notification)"
          type="button"
          class="w-full text-left px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex gap-3"
        >
          <span
            class="mt-1.5 h-2 w-2 shrink-0 rounded-full"
            :class="notification.isRead ? 'bg-transparent' : 'bg-[#2E8B57] dark:bg-emerald-400'"
          ></span>
          <div class="min-w-0 flex-1">
            <p
              class="text-sm"
              :class="
                notification.isRead
                  ? 'text-slate-600 dark:text-slate-300'
                  : 'font-semibold text-slate-900 dark:text-white'
              "
            >
              {{ notification.title }}
            </p>
            <p class="text-sm text-slate-500 dark:text-slate-400 truncate">{{ notification.body }}</p>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">{{ formatDate(notification.createdAt) }}</p>
          </div>
        </button>
      </div>
    </div>

    <div v-if="meta && meta.lastPage > 1" class="mt-4 flex items-center justify-between text-sm">
      <span class="text-slate-500 dark:text-slate-400">Halaman {{ meta.page }} dari {{ meta.lastPage }}</span>
      <div class="flex gap-2">
        <button
          @click="goToPage(meta.page - 1)"
          :disabled="meta.page <= 1"
          class="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          Sebelumnya
        </button>
        <button
          @click="goToPage(meta.page + 1)"
          :disabled="meta.page >= meta.lastPage"
          class="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          Berikutnya
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import notificationService, { type AppNotification } from '@/services/notificationService'
import { useNotificationsStore } from '@/stores/notifications'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const notificationsStore = useNotificationsStore()

const items = ref<AppNotification[]>([])
const meta = ref<{ total: number; page: number; limit: number; lastPage: number } | null>(null)
const isLoading = ref(false)

const loadPage = async (page = 1) => {
  isLoading.value = true
  try {
    const response = await notificationService.list({ page, limit: 20 })
    items.value = response.data
    meta.value = response.meta
  } finally {
    isLoading.value = false
  }
}

const goToPage = (page: number) => {
  if (!meta.value || page < 1 || page > meta.value.lastPage) return
  loadPage(page)
}

const handleSelect = async (notification: AppNotification) => {
  if (!notification.isRead) {
    notification.isRead = true
    await notificationsStore.markRead(notification.id)
  }
  router.push({ name: 'notification-detail', params: { id: notification.id } })
}

const handleMarkAllRead = async () => {
  await notificationsStore.markAllRead()
  items.value = items.value.map((item) => ({ ...item, isRead: true }))
}

const formatDate = (value: string) =>
  new Date(value).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

onMounted(() => loadPage(1))
</script>
