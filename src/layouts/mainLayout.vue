// src/layouts/MainLayout.vue
<template>
  <div v-if="authStore.isAuthenticated" class="flex h-screen bg-slate-100">
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
      <nav class="flex-grow">
        <ul class="space-y-1">
          <li>
            <RouterLink :to="{ name: 'dashboard' }" :class="navLinkClasses('dashboard')">
              Dashboard
            </RouterLink>
          </li>
          <li>
            <RouterLink
              :to="{ name: 'accounts-list' }"
              :class="navLinkClasses(['accounts-list', 'account-create', 'account-edit'])"
            >
              Akun
            </RouterLink>
          </li>
          <li>
            <RouterLink
              :to="{ name: 'categories-list' }"
              :class="navLinkClasses('categories-list')"
            >
              Kategori
            </RouterLink>
          </li>
          <li>
            <RouterLink
              :to="{ name: 'transactions-list' }"
              :class="navLinkClasses('transactions-list')"
            >
              Transaksi
            </RouterLink>
          </li>
        </ul>
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
      <header class="bg-white shadow-sm print:hidden">
        <div class="mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div class="flex items-center">
            <button
              @click="toggleMobileSidebar"
              class="md:hidden mr-3 text-slate-600 hover:text-slate-800 focus:outline-none"
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
            <h1 class="text-lg font-semibold text-slate-700 hidden sm:block">
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
              <div
                class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold ring-1 ring-indigo-700"
              >
                {{ authStore.currentUser?.username?.charAt(0).toUpperCase() || 'U' }}
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
                class="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
                tabindex="-1"
                ref="profileDropdownRef"
              >
                <div class="px-4 py-3 border-b border-slate-200">
                  <p class="text-sm text-slate-700">Masuk sebagai</p>
                  <p
                    class="text-sm font-medium text-slate-900 truncate"
                    :title="authStore.currentUser?.fullName || authStore.currentUser?.username"
                  >
                    {{ authStore.currentUser?.fullName || authStore.currentUser?.username }}
                  </p>
                  <p class="text-xs text-slate-500 truncate" :title="authStore.currentUser?.email">
                    {{ authStore.currentUser?.email }}
                  </p>
                </div>
                <RouterLink
                  :to="{ name: 'profile' }"
                  @click="closeProfileDropdown"
                  class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full text-left"
                  role="menuitem"
                  tabindex="-1"
                >
                  Profil Saya
                </RouterLink>
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
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

      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-4 sm:p-6 lg:p-8">
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
              <nav class="mt-5 px-2 space-y-1">
                <RouterLink
                  :to="{ name: 'dashboard' }"
                  @click="closeMobileSidebar"
                  :class="navLinkClassesMobile('dashboard')"
                >
                  Dashboard
                </RouterLink>
                <RouterLink
                  :to="{ name: 'accounts-list' }"
                  @click="closeMobileSidebar"
                  :class="navLinkClassesMobile(['accounts-list', 'account-create', 'account-edit'])"
                >
                  Akun
                </RouterLink>
                <RouterLink
                  :to="{ name: 'categories-list' }"
                  @click="closeMobileSidebar"
                  :class="navLinkClassesMobile('categories-list')"
                >
                  Kategori
                </RouterLink>
                <RouterLink
                  :to="{ name: 'transactions-list' }"
                  @click="closeMobileSidebar"
                  :class="navLinkClassesMobile('transactions-list')"
                >
                  Transaksi
                </RouterLink>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter as vueUseRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = vueUseRouter()

const isProfileDropdownOpen = ref(false)
const isMobileSidebarOpen = ref(false)
const profileDropdownRef = ref<HTMLElement | null>(null) // Ref untuk elemen dropdown

const currentRouteTitle = computed(() => {
  if (route.meta && route.meta.title) {
    return route.meta.title as string
  }
  if (route.name) {
    const nameStr = String(route.name)
    // Hapus -list, -create, -edit dari nama rute untuk judul yang lebih umum
    const cleanedName = nameStr.replace(/-list|-create|-edit/gi, '')
    return cleanedName.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }
  return 'MyWallets App'
})

const navLinkBaseClasses = 'flex items-center py-2.5 px-4 rounded-md transition-colors'
const navLinkActiveClass = 'bg-indigo-500 text-white'
const navLinkInactiveClass = 'text-slate-300 hover:bg-slate-700 hover:text-white'

const navLinkClasses = (routeNameOrNames: string | string[]) => {
  const currentRouteName = route.name?.toString() || ''
  const isActive = Array.isArray(routeNameOrNames)
    ? routeNameOrNames.some((name) => currentRouteName.startsWith(name.replace('-list', ''))) // Cek jika nama rute saat ini diawali dengan salah satu nama (tanpa -list)
    : currentRouteName.startsWith(routeNameOrNames.replace('-list', ''))
  return `${navLinkBaseClasses} ${isActive ? navLinkActiveClass : navLinkInactiveClass}`
}

const navLinkClassesMobile = (routeNameOrNames: string | string[]) => {
  // Sama dengan desktop atau bisa dibedakan jika perlu
  return navLinkClasses(routeNameOrNames)
}

const toggleProfileDropdown = () => (isProfileDropdownOpen.value = !isProfileDropdownOpen.value)
const closeProfileDropdown = () => (isProfileDropdownOpen.value = false)

const toggleMobileSidebar = () => (isMobileSidebarOpen.value = !isMobileSidebarOpen.value)
const closeMobileSidebar = () => (isMobileSidebarOpen.value = false)

const handleLogout = async () => {
  closeProfileDropdown()
  closeMobileSidebar()
  await authStore.logout()
}

// Menutup dropdown jika klik di luar elemen dropdown
const handleClickOutsideDropdown = (event: MouseEvent) => {
  if (profileDropdownRef.value && !profileDropdownRef.value.contains(event.target as Node)) {
    // Juga cek apakah target klik adalah tombol toggle-nya, jika ya jangan tutup
    const toggleButton = document.getElementById('user-menu-button')
    if (toggleButton && toggleButton.contains(event.target as Node)) {
      return
    }
    isProfileDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutsideDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutsideDropdown)
})
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
