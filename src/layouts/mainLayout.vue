// src/layouts/MainLayout.vue
<template>
  <div v-if="authStore.isAuthenticated" class="flex h-screen bg-slate-100 dark:bg-slate-900">
    <aside
      class="w-64 bg-slate-800 text-slate-100 p-4 space-y-6 hidden md:flex md:flex-col shadow-lg print:hidden"
    >
      <div class="text-center py-4">
        <RouterLink
          :to="{ name: 'dashboard' }"
          class="text-2xl font-bold text-white hover:opacity-80 transition-opacity"
        >
          MyWallets
        </RouterLink>
      </div>
      <WorkspaceSwitcher class="mb-4" />
      <nav class="flex-grow overflow-y-auto">
        <PersonalNav v-if="wsStore.mode === 'personal'" />
        <BusinessNav v-else-if="wsStore.mode === 'business' && isBusinessPlan" />
      </nav>
      <div class="mt-auto pt-4 border-t border-slate-700">
        <button
          @click="handleLogout"
          class="flex items-center w-full py-2.5 px-4 rounded-md text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          Keluar
        </button>
      </div>
    </aside>

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="bg-white dark:bg-slate-800 shadow-sm print:hidden">
        <div class="mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div class="flex items-center">
            <button
              @click="toggleMobileSidebar"
              class="md:hidden mr-3 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
            <h1 class="text-lg font-semibold text-slate-700 dark:text-slate-200 hidden sm:block">
              {{ currentRouteTitle }}
            </h1>
          </div>

          <div class="relative">
            <button
              @click="toggleProfileDropdown"
              type="button"
              class="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              id="user-menu-button"
              aria-expanded="false"
              aria-haspopup="true"
            >
              <span class="sr-only">Buka menu pengguna</span>
              <div class="flex items-center gap-3">
                <span
                  class="hidden sm:inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset cursor-default"
                  :class="{
                    'bg-blue-50 text-blue-600 ring-blue-600/10':
                      authStore.currentUser?.subscriptionPlan === 'FREE',
                    'bg-amber-50 text-amber-700 ring-amber-600/20':
                      authStore.currentUser?.subscriptionPlan === 'PREMIUM',
                    'bg-purple-50 text-purple-700 ring-purple-600/20':
                      authStore.currentUser?.subscriptionPlan === 'FAMILY',
                    'bg-indigo-50 text-indigo-700 ring-indigo-600/20':
                      authStore.currentUser?.subscriptionPlan?.startsWith('BUSINESS'),
                  }"
                >
                  {{ authStore.currentUser?.subscriptionPlan || 'FREE' }}
                </span>
                <img
                  v-if="userProfilePicture"
                  :src="userProfilePicture"
                  alt="Foto Profil"
                  class="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div
                  v-else
                  class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold ring-1 ring-indigo-700"
                >
                  {{ authStore.currentUser?.username?.charAt(0).toUpperCase() || 'U' }}
                </div>
              </div>
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
                v-if="isProfileDropdownOpen"
                class="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg py-1 bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transition-colors"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
                tabindex="-1"
                ref="profileDropdownRef"
              >
                <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <p class="text-sm text-slate-700 dark:text-slate-300">Masuk sebagai</p>
                  <p
                    class="text-sm font-medium text-slate-900 dark:text-white truncate"
                    :title="authStore.currentUser?.fullName || authStore.currentUser?.username"
                  >
                    {{ authStore.currentUser?.fullName || authStore.currentUser?.username }}
                  </p>
                  <p
                    class="text-xs text-slate-500 dark:text-slate-400 truncate"
                    :title="authStore.currentUser?.email"
                  >
                    {{ authStore.currentUser?.email }}
                  </p>
                </div>
                <RouterLink
                  :to="{ name: 'profile' }"
                  @click="closeProfileDropdown"
                  class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"
                  role="menuitem"
                  tabindex="-1"
                >
                  Profil Saya
                </RouterLink>
                <RouterLink
                  :to="{ name: 'how-to' }"
                  @click="closeProfileDropdown"
                  class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"
                  role="menuitem"
                  tabindex="-1"
                >
                  Cara Penggunaan
                </RouterLink>
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  role="menuitem"
                  tabindex="-1"
                >
                  Keluar
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </header>

      <AdBanner />

      <main
        class="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 dark:bg-slate-900 p-4 sm:p-6 lg:p-8"
      >
        <RouterView />
      </main>
    </div>

    <Transition
      enter-active-class="transition-opacity ease-linear duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity ease-linear duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMobileSidebarOpen"
        class="fixed inset-0 flex z-40 md:hidden"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="fixed inset-0 bg-gray-600 bg-opacity-75"
          @click="closeMobileSidebar"
          aria-hidden="true"
        ></div>
        <Transition
          enter-active-class="transition ease-in-out duration-300 transform"
          enter-from-class="-translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transition ease-in-out duration-300 transform"
          leave-from-class="translate-x-0"
          leave-to-class="-translate-x-full"
        >
          <div class="relative flex-1 flex flex-col max-w-xs w-full bg-slate-800 text-slate-100">
            <div class="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                @click="closeMobileSidebar"
              >
                <span class="sr-only">Close sidebar</span>
                <svg
                  class="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div class="flex-shrink-0 flex items-center px-4">
                <RouterLink
                  :to="{ name: 'dashboard' }"
                  @click="closeMobileSidebar"
                  class="text-2xl font-bold text-white"
                >
                  MyWallets
                </RouterLink>
              </div>
              <div class="px-2 mt-4">
                <WorkspaceSwitcher />
              </div>
              <nav class="mt-3 px-2">
                <PersonalNav v-if="wsStore.mode === 'personal'" @navigate="closeMobileSidebar" />
                <BusinessNav v-else-if="wsStore.mode === 'business' && isBusinessPlan" @navigate="closeMobileSidebar" />
              </nav>
            </div>
            <div class="flex-shrink-0 flex border-t border-slate-700 p-4">
              <button @click="handleLogout" class="flex-shrink-0 group block w-full">
                <div class="flex items-center">
                  <div class="mr-3 w-5 h-5 text-slate-300 group-hover:text-red-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="size-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                      />
                    </svg>
                  </div>
                  <div class="text-sm font-medium text-slate-300 group-hover:text-red-400">
                    Keluar
                  </div>
                </div>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
  <div v-else>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useWorkspaceStore } from '@/stores/workspace'
import AdBanner from '@/components/common/AdBanner.vue'
import WorkspaceSwitcher from '@/components/workspace/WorkspaceSwitcher.vue'
import PersonalNav from '@/components/workspace/PersonalNav.vue'
import BusinessNav from '@/components/workspace/BusinessNav.vue'

const authStore = useAuthStore()
const wsStore = useWorkspaceStore()
const route = useRoute()

const isBusinessPlan = computed(() => authStore.currentUser?.subscriptionPlan?.startsWith('BUSINESS') ?? false)

const isProfileDropdownOpen = ref(false)
const isMobileSidebarOpen = ref(false)
const profileDropdownRef = ref<HTMLElement | null>(null)

// Auto-detect workspace mode from current route
watch(() => route.name, (name) => {
  const n = name?.toString() || ''
  if ((n.startsWith('business') || n.startsWith('invoice')) && isBusinessPlan.value) {
    wsStore.setMode('business')
  } else if (n && n !== 'dashboard') {
    wsStore.setMode('personal')
  }
}, { immediate: true })

const currentRouteTitle = computed(() => {
  if (route.meta?.title) return route.meta.title as string
  if (route.name) {
    const cleaned = String(route.name).replace(/-list|-create|-edit/gi, '')
    return cleaned.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }
  return 'MyWallets App'
})

const userProfilePicture = computed(() => authStore.currentUser?.profilePictureUrl ?? null)

const toggleProfileDropdown = () => (isProfileDropdownOpen.value = !isProfileDropdownOpen.value)
const closeProfileDropdown = () => (isProfileDropdownOpen.value = false)
const toggleMobileSidebar = () => (isMobileSidebarOpen.value = !isMobileSidebarOpen.value)
const closeMobileSidebar = () => (isMobileSidebarOpen.value = false)

const handleLogout = async () => {
  closeProfileDropdown()
  closeMobileSidebar()
  await authStore.logout()
}

const handleClickOutsideDropdown = (event: MouseEvent) => {
  if (profileDropdownRef.value && !profileDropdownRef.value.contains(event.target as Node)) {
    const toggleButton = document.getElementById('user-menu-button')
    if (toggleButton && toggleButton.contains(event.target as Node)) return
    isProfileDropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutsideDropdown))
onUnmounted(() => document.removeEventListener('click', handleClickOutsideDropdown))
</script>

<style scoped>
main.flex-1.overflow-x-hidden.overflow-y-auto {
  height: calc(100vh - theme('spacing.16')); /* h-16 adalah tinggi header internal */
}
/* Untuk sidebar desktop agar tidak ikut ter-scroll dengan konten utama jika konten panjang */
.md\:flex-col {
  /* Pastikan sidebar desktop bisa scroll jika menunya panjang */
  overflow-y: auto;
}
</style>
