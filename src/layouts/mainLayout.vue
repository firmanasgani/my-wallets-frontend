<template>
  <div v-if="authStore.isAuthenticated" class="money-shell" :class="{ 'sidebar-collapsed': isCompact }">
    <a class="shell-skip" href="#main-content">Lewati navigasi</a>
    <div v-if="isMobileSidebarOpen" class="shell-backdrop" aria-hidden="true" @click="closeMobileSidebar()"></div>

    <aside id="app-sidebar" ref="sidebarRef" class="shell-sidebar"
      :class="{ 'is-open': isMobileSidebarOpen }" :inert="isMobile && !isMobileSidebarOpen"
      :role="isMobileSidebarOpen ? 'dialog' : undefined" :aria-modal="isMobileSidebarOpen ? true : undefined"
      aria-label="Navigasi utama" @keydown="trapSidebarFocus">
      <div class="shell-sidebar-brand">
        <RouterLink :to="{ name: 'dashboard' }" class="shell-brand" aria-label="Moneytory Ledger — Workspace" @click="closeMobileSidebar()">
          <img src="/logo.png" alt="" width="36" height="36" />
          <span v-if="!isCompact">Moneytory<span class="shell-brand-subtitle">LEDGER</span></span>
        </RouterLink>
        <button v-if="isMobile" ref="sidebarCloseRef" type="button" class="shell-icon-button" aria-label="Tutup navigasi" @click="closeMobileSidebar()">
          <AppIcon name="close" />
        </button>
      </div>

      <WorkspaceSwitcher :collapsed="isCompact" @navigate="closeMobileSidebar()" @upgrade="closeMobileSidebar(false)" />
      <nav class="shell-navigation" aria-label="Menu workspace">
        <BusinessNav v-if="wsStore.mode === 'business' && isBusinessPlan" :collapsed="isCompact" @navigate="closeMobileSidebar()" />
        <PersonalNav v-else :collapsed="isCompact" @navigate="closeMobileSidebar()" />
      </nav>

      <div class="shell-sidebar-footer">
        <div v-if="!isCompact" class="shell-plan-card">
          <span class="shell-overline">PAKET SAAT INI</span>
          <div><strong>{{ planLabel }}</strong><RouterLink :to="{ name: 'settings' }" @click="closeMobileSidebar()">Kelola <span aria-hidden="true">↗</span></RouterLink></div>
        </div>
        <button v-if="!isMobile" class="shell-collapse-button" type="button"
          :aria-expanded="!sidebarCollapsed" aria-controls="app-sidebar"
          :aria-label="sidebarCollapsed ? 'Perluas sidebar' : 'Ringkas sidebar'"
          :title="sidebarCollapsed ? 'Perluas sidebar' : undefined" @click="toggleSidebar">
          <AppIcon name="panel" /><span v-if="!isCompact">Ringkas sidebar</span>
        </button>
        <button class="shell-logout" type="button" :title="isCompact ? 'Keluar' : undefined" aria-label="Keluar dari akun" @click="handleLogout">
          <AppIcon name="logout" /><span v-if="!isCompact">Keluar</span>
        </button>
      </div>
    </aside>

    <div class="shell-body" :inert="isMobileSidebarOpen">
      <header class="shell-header">
        <div class="shell-header-context">
          <button ref="sidebarToggleRef" type="button" class="shell-icon-button"
            :aria-label="isMobile ? 'Buka navigasi' : sidebarCollapsed ? 'Perluas sidebar' : 'Ringkas sidebar'"
            :aria-expanded="isMobile ? isMobileSidebarOpen : !sidebarCollapsed" aria-controls="app-sidebar" @click="toggleSidebar">
            <AppIcon :name="isMobile ? 'menu' : 'panel'" />
          </button>
          <div class="shell-breadcrumb">
            <span>{{ wsStore.mode === 'business' ? 'Workspace bisnis' : 'Workspace personal' }}</span>
            <strong>{{ currentRouteTitle }}</strong>
          </div>
        </div>
        <div class="shell-header-actions">
          <NotificationBell />
          <button type="button" class="shell-icon-button" @click="toggleTheme"
            :aria-label="themeStore.isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'"
            :title="themeStore.isDark ? 'Mode terang' : 'Mode gelap'">
            <AppIcon :name="themeStore.isDark ? 'sun' : 'moon'" />
          </button>
          <div ref="profileDropdownRef" class="shell-profile" @keydown.esc.stop="closeProfileDropdown(true)">
            <button id="user-menu-button" ref="profileToggleRef" type="button" class="shell-profile-trigger"
              :aria-expanded="isProfileDropdownOpen" aria-controls="profile-dropdown"
              aria-label="Buka menu akun" @click="isProfileDropdownOpen = !isProfileDropdownOpen">
              <img v-if="userProfilePicture" :src="userProfilePicture" alt="" class="shell-avatar" />
              <span v-else class="shell-avatar">{{ userName.charAt(0).toUpperCase() }}</span>
              <span class="shell-profile-name"><strong>{{ userName }}</strong><span>{{ planLabel }}</span></span>
              <AppIcon name="down" class="shell-profile-chevron" />
            </button>
            <div v-if="isProfileDropdownOpen" id="profile-dropdown" class="shell-profile-dropdown">
              <div class="shell-profile-info"><strong>{{ userName }}</strong><span>{{ authStore.currentUser?.email }}</span></div>
              <RouterLink :to="{ name: 'profile' }" @click="closeProfileDropdown()"><AppIcon name="user" />Profil saya</RouterLink>
              <RouterLink :to="{ name: 'settings' }" @click="closeProfileDropdown()"><AppIcon name="settings" />Pengaturan</RouterLink>
              <button type="button" @click="toggleTheme"><AppIcon :name="themeStore.isDark ? 'sun' : 'moon'" />{{ themeStore.isDark ? 'Mode terang' : 'Mode gelap' }}</button>
              <a href="https://moneytory.my.id/id/cara-penggunaan" target="_blank" rel="noopener noreferrer" @click="closeProfileDropdown()"><AppIcon name="help" />Cara penggunaan</a>
              <button type="button" @click="handleLogout"><AppIcon name="logout" />Keluar</button>
            </div>
          </div>
        </div>
      </header>
      <AdBanner />
      <main id="main-content" ref="mainRef" class="shell-main" tabindex="-1">
        <div class="shell-page"><RouterView /></div>
      </main>
    </div>
  </div>
  <RouterView v-else />
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useWorkspaceStore } from '@/stores/workspace'
import { useThemeStore } from '@/stores/theme'
import { useNotificationsStore } from '@/stores/notifications'
import { isNavigationActive, personalNavigation } from '@/constants/navigation'
import AppIcon from '@/components/common/AppIcon.vue'
import AdBanner from '@/components/common/AdBanner.vue'
import WorkspaceSwitcher from '@/components/workspace/WorkspaceSwitcher.vue'
import PersonalNav from '@/components/workspace/PersonalNav.vue'
import BusinessNav from '@/components/workspace/BusinessNav.vue'
import NotificationBell from '@/components/notifications/NotificationBell.vue'
import '@/assets/shell.css'

const authStore = useAuthStore()
const wsStore = useWorkspaceStore()
const themeStore = useThemeStore()
const notificationsStore = useNotificationsStore()
const route = useRoute()
const mobileQuery = window.matchMedia('(max-width: 959px)')
const isMobile = ref(mobileQuery.matches)
const isMobileSidebarOpen = ref(false)
const isProfileDropdownOpen = ref(false)
const sidebarRef = ref<HTMLElement | null>(null)
const sidebarCloseRef = ref<HTMLButtonElement | null>(null)
const sidebarToggleRef = ref<HTMLButtonElement | null>(null)
const profileToggleRef = ref<HTMLButtonElement | null>(null)
const profileDropdownRef = ref<HTMLElement | null>(null)
const mainRef = ref<HTMLElement | null>(null)
const SIDEBAR_KEY = 'moneytory.sidebar.collapsed'
const readSidebarPreference = () => {
  try { return localStorage.getItem(SIDEBAR_KEY) === 'true' } catch { return false }
}
const sidebarCollapsed = ref(readSidebarPreference())
const isCompact = computed(() => sidebarCollapsed.value && !isMobile.value)
const isBusinessPlan = computed(() => authStore.currentUser?.subscriptionPlan?.startsWith('BUSINESS') ?? false)
const userName = computed(() => authStore.currentUser?.fullName || authStore.currentUser?.username || 'Pengguna')
const userProfilePicture = computed(() => authStore.currentUser?.profilePictureUrl || null)
const planLabel = computed(() => {
  const plan = authStore.currentUser?.subscriptionPlan
  if (plan?.startsWith('BUSINESS')) return 'Bisnis'
  return plan === 'PREMIUM' ? 'Premium' : plan === 'FAMILY' ? 'Pro / Keluarga' : 'Dasar'
})
const currentRouteTitle = computed(() => route.meta?.title as string || 'Workspace')

// Shared pages (settings, profile, notifications) retain the selected workspace.
watch([() => route.name, isBusinessPlan], ([name]) => {
  const current = String(name || '')
  if (route.meta.requiresBusiness && isBusinessPlan.value) wsStore.setMode('business')
  else if (!isBusinessPlan.value || personalNavigation.some((group) => group.items.some(
    (item) => item.route !== 'dashboard' && isNavigationActive(item, current),
  ))) wsStore.setMode('personal')
}, { immediate: true })

const closeMobileSidebar = (restoreFocus = true) => {
  const wasOpen = isMobileSidebarOpen.value
  isMobileSidebarOpen.value = false
  if (wasOpen && restoreFocus) nextTick(() => sidebarToggleRef.value?.focus())
}
const toggleSidebar = async () => {
  if (isMobile.value) {
    if (isMobileSidebarOpen.value) { closeMobileSidebar(); return }
    isProfileDropdownOpen.value = false
    isMobileSidebarOpen.value = true
    await nextTick()
    sidebarCloseRef.value?.focus()
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value
    try { localStorage.setItem(SIDEBAR_KEY, String(sidebarCollapsed.value)) } catch { /* Keep session preference. */ }
  }
}
const closeProfileDropdown = (restoreFocus = false) => {
  isProfileDropdownOpen.value = false
  if (restoreFocus) profileToggleRef.value?.focus()
}
const toggleTheme = () => themeStore.setTheme(themeStore.isDark ? 'light' : 'dark')
const handleLogout = async () => {
  closeProfileDropdown()
  closeMobileSidebar(false)
  await authStore.logout()
}
const trapSidebarFocus = (event: KeyboardEvent) => {
  if (!isMobileSidebarOpen.value || event.key !== 'Tab' || !sidebarRef.value?.contains(event.target as Node)) return
  const elements = sidebarRef.value.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]')
  const first = elements[0]
  const last = elements[elements.length - 1]
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
}
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') { closeMobileSidebar(); closeProfileDropdown() }
}
const handleClickOutside = (event: MouseEvent) => {
  if (!profileDropdownRef.value?.contains(event.target as Node)) closeProfileDropdown()
}
const handleBreakpoint = (event: MediaQueryListEvent) => {
  isMobile.value = event.matches
  closeMobileSidebar(false)
}
watch(() => route.fullPath, async () => {
  const fromDrawer = isMobileSidebarOpen.value
  closeMobileSidebar(false)
  closeProfileDropdown()
  await nextTick()
  mainRef.value?.scrollTo({ top: 0 })
  if (fromDrawer) mainRef.value?.focus()
})
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
  mobileQuery.addEventListener('change', handleBreakpoint)
  if (authStore.isAuthenticated) {
    notificationsStore.fetchUnreadCount()
    notificationsStore.connect()
  }
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
  mobileQuery.removeEventListener('change', handleBreakpoint)
  notificationsStore.disconnect()
})
</script>
