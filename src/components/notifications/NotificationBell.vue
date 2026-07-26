<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      type="button"
      id="notification-bell-button"
      class="relative p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none"
      title="Notifikasi"
    >
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
        />
      </svg>
      <span
        v-if="notificationsStore.unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none"
      >
        {{ notificationsStore.unreadCount > 9 ? '9+' : notificationsStore.unreadCount }}
      </span>
    </button>

    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        ref="dropdownRef"
        class="origin-top-right absolute right-0 mt-2 w-80 max-w-[90vw] rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
      >
        <div
          class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between"
        >
          <p class="text-sm font-medium text-slate-900 dark:text-white">Notifikasi</p>
          <button
            v-if="notificationsStore.unreadCount > 0"
            @click="handleMarkAllRead"
            class="text-xs font-medium text-[#2E8B57] dark:text-emerald-400 hover:underline"
          >
            Tandai semua dibaca
          </button>
        </div>

        <div class="max-h-96 overflow-y-auto">
          <p
            v-if="notificationsStore.isLoading"
            class="px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500"
          >
            Memuat...
          </p>
          <p
            v-else-if="notificationsStore.latest.length === 0"
            class="px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500"
          >
            Belum ada notifikasi.
          </p>
          <button
            v-for="notification in notificationsStore.latest"
            :key="notification.id"
            @click="handleSelect(notification)"
            type="button"
            class="w-full text-left px-4 py-3 border-b border-slate-100 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700 flex gap-2.5"
          >
            <span
              class="mt-1.5 h-2 w-2 shrink-0 rounded-full"
              :class="notification.isRead ? 'bg-transparent' : 'bg-[#2E8B57] dark:bg-emerald-400'"
            ></span>
            <div class="min-w-0 flex-1">
              <p
                class="text-sm truncate"
                :class="
                  notification.isRead
                    ? 'text-slate-600 dark:text-slate-300'
                    : 'font-semibold text-slate-900 dark:text-white'
                "
              >
                {{ notification.title }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ notification.body }}</p>
              <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                {{ formatRelativeTime(notification.createdAt) }}
              </p>
            </div>
          </button>
        </div>

        <RouterLink
          :to="{ name: 'notifications-list' }"
          @click="closeDropdown"
          class="block px-4 py-2.5 text-center text-sm font-medium text-[#2E8B57] dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700 border-t border-slate-200 dark:border-slate-700"
        >
          Lihat semua
        </RouterLink>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useNotificationsStore } from '@/stores/notifications'
import type { AppNotification } from '@/services/notificationService'

const notificationsStore = useNotificationsStore()
const router = useRouter()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    notificationsStore.fetchLatest()
  }
}
const closeDropdown = () => (isOpen.value = false)

const handleSelect = async (notification: AppNotification) => {
  closeDropdown()
  if (!notification.isRead) {
    await notificationsStore.markRead(notification.id)
  }
  router.push({ name: 'notification-detail', params: { id: notification.id } })
}

const handleMarkAllRead = async () => {
  await notificationsStore.markAllRead()
}

const formatRelativeTime = (value: string) => {
  const diffMs = Date.now() - new Date(value).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} hari lalu`
  return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    const toggleButton = document.getElementById('notification-bell-button')
    if (toggleButton && toggleButton.contains(event.target as Node)) return
    closeDropdown()
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>
