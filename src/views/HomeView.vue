// src/views/HomeView.vue
<template>
  <div class="landing-page-wrapper">
    <LoadingSpinner
      v-if="isLoadingPage"
      :visible="true"
      text="Memuat halaman..."
      size="lg"
      overlay
      color="text-[#2E8B57]"
      text-color="text-slate-700"
    />

    <div v-if="!isLoadingPage" class="bg-[#F8FFFF] dark:bg-slate-900 text-slate-700 dark:text-slate-200 min-h-screen">
      <nav class="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center">
              <RouterLink :to="{ name: 'home' }" class="flex-shrink-0">
                <span class="text-2xl font-bold text-[#2E8B57]">Moneytory Ledger</span>
              </RouterLink>
            </div>
            <div class="hidden md:block">
              <div class="ml-10 flex items-baseline space-x-4">
                <a href="#features" class="nav-link">Fitur</a>
                <a href="#pricing" class="nav-link">Harga</a>
                <RouterLink :to="{ name: 'how-to' }" class="nav-link">Cara Penggunaan</RouterLink>
                <template v-if="!isAuthenticated">
                  <RouterLink :to="{ name: 'login' }" class="nav-link">Masuk</RouterLink>
                  <RouterLink
                    :to="{ name: 'register' }"
                    class="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#2E8B57] hover:bg-[#236B43] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E8B57]"
                  >
                    Daftar Gratis
                  </RouterLink>
                </template>
                <template v-else>
                  <RouterLink
                    :to="{ name: 'dashboard' }"
                    class="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#2E8B57] hover:bg-[#236B43] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E8B57]"
                  >
                    Ke Dashboard
                  </RouterLink>
                </template>
              </div>
            </div>
            <div class="-mr-2 flex md:hidden">
              <button
                @click="mobileMenuOpen = !mobileMenuOpen"
                type="button"
                class="bg-white rounded-md p-2 inline-flex items-center justify-center text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#2E8B57]"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span class="sr-only">Buka menu</span>
                <svg
                  v-if="!mobileMenuOpen"
                  class="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
                  />
                </svg>
                <svg
                  v-else
                  class="block h-6 w-6"
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
          </div>
        </div>
        <div v-if="mobileMenuOpen" class="md:hidden flex flex-col" id="mobile-menu">
          <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col p-2">
            <a href="#features" @click="mobileMenuOpen = false" class="nav-link-mobile">Fitur</a>
            <a href="#pricing" @click="mobileMenuOpen = false" class="nav-link-mobile">Harga</a>
            <RouterLink
              :to="{ name: 'how-to' }"
              @click="mobileMenuOpen = false"
              class="nav-link-mobile"
              >Cara Penggunaan</RouterLink
            >
          </div>
          <div class="pt-4 pb-3 border-t border-slate-200">
            <div class="px-2 space-y-1">
              <template v-if="!isAuthenticated">
                <RouterLink
                  :to="{ name: 'login' }"
                  @click="mobileMenuOpen = false"
                  class="block w-full text-left nav-link-mobile"
                  >Masuk</RouterLink
                >
                <RouterLink
                  :to="{ name: 'register' }"
                  @click="mobileMenuOpen = false"
                  class="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#2E8B57] hover:bg-[#236B43] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E8B57]"
                  >Daftar Gratis</RouterLink
                >
              </template>
              <template v-else>
                <RouterLink
                  :to="{ name: 'dashboard' }"
                  @click="mobileMenuOpen = false"
                  class="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#2E8B57] hover:bg-[#236B43] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E8B57]"
                  >Ke Dashboard</RouterLink
                >
              </template>
            </div>
          </div>
        </div>
      </nav>

      <section
        class="relative bg-gradient-to-br from-[#1B5E3B] via-[#2E8B57] to-[#28896E] text-white overflow-hidden"
      >
        <!-- Subtle pattern overlay -->
        <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0); background-size: 32px 32px;"></div>

        <div class="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm font-medium text-emerald-100 backdrop-blur-sm">
            <svg class="w-4 h-4 text-[#87CEEB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
            Solusi Keuangan & Akuntansi Bisnis Terpadu
          </div>

          <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            <span class="block">Satu Platform untuk</span>
            <span class="block text-[#87CEEB] mt-2">Semua Kebutuhan Finansial Anda</span>
          </h1>
          <p
            class="mt-6 max-w-lg mx-auto text-lg sm:text-xl text-emerald-100 sm:max-w-xl md:max-w-2xl"
          >
            Dari pencatatan keuangan pribadi hingga akuntansi bisnis lengkap — kelola invoice, laporan laba rugi, neraca keuangan, dan arus kas dalam satu aplikasi yang handal.
          </p>

          <!-- Stats row -->
          <div class="mt-8 flex flex-wrap justify-center gap-6 text-sm">
            <div class="flex items-center gap-1.5 text-emerald-200">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/></svg>
              Pembukuan Double-Entry
            </div>
            <div class="flex items-center gap-1.5 text-emerald-200">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
              Invoice & Pembayaran
            </div>
            <div class="flex items-center gap-1.5 text-emerald-200">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>
              Laporan Finansial Real-time
            </div>
            <div class="flex items-center gap-1.5 text-emerald-200">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>
              Multi-Workspace Tim
            </div>
          </div>

          <div
            class="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <RouterLink
              :to="{ name: 'register' }"
              class="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-semibold rounded-lg shadow-md text-[#1B5E3B] bg-white hover:bg-emerald-50 transition-colors md:py-3.5 md:text-lg md:px-10"
            >
              Mulai Gratis Sekarang
            </RouterLink>
            <RouterLink
              :to="{ name: 'login' }"
              class="w-full sm:w-auto flex items-center justify-center px-8 py-3 border-2 border-white/40 text-base font-semibold rounded-lg text-white hover:bg-white/10 hover:border-white/60 transition-colors md:py-3.5 md:text-lg md:px-10"
            >
              Sudah Punya Akun? Masuk
            </RouterLink>
          </div>
        </div>
      </section>

      <section id="features" class="py-16 sm:py-24 bg-white dark:bg-slate-800">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12 sm:mb-16">
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Semua yang Anda Butuhkan
            </h2>
            <p class="mt-4 max-w-2xl mx-auto text-xl text-slate-500">
              Fitur lengkap untuk membantu Anda mengontrol keuangan.
            </p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
            <div class="text-center">
              <div
                class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 text-[#2E8B57]"
              >
                <svg
                  class="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
              </div>
              <h3 class="mt-5 text-lg font-semibold text-slate-900">Pencatatan Mudah</h3>
              <p class="mt-2 text-base text-slate-500">
                Catat pemasukan dan pengeluaran harian Anda dengan cepat dan tanpa ribet.
              </p>
            </div>
            <div class="text-center">
              <div
                class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 text-[#2E8B57]"
              >
                <svg
                  class="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h12A2.25 2.25 0 0 0 20.25 14.25V3M3.75 14.25v-9.75h16.5v9.75L12 21l-8.25-6.75Z"
                  />
                </svg>
              </div>
              <h3 class="mt-5 text-lg font-semibold text-slate-900">Kategori Fleksibel</h3>
              <p class="mt-2 text-base text-slate-500">
                Kelompokkan transaksi Anda dengan kategori default atau buat kategori kustom.
              </p>
            </div>
            <div class="text-center">
              <div
                class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 text-[#2E8B57]"
              >
                <svg
                  class="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z"
                  />
                </svg>
              </div>
              <h3 class="mt-5 text-lg font-semibold text-slate-900">Laporan Visual</h3>
              <p class="mt-2 text-base text-slate-500">
                Pahami kondisi keuangan Anda melalui grafik dan laporan yang mudah dibaca.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" class="py-16 sm:py-24 bg-[#F8FFFF] dark:bg-slate-900">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12 sm:mb-16">
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Paket Sesuai Kebutuhan Anda
            </h2>
            <p class="mt-4 max-w-2xl mx-auto text-xl text-slate-500">
              Mulai gratis, atau pilih paket premium untuk fitur yang lebih lengkap.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            <div
              v-for="plan in pricingPlans"
              :key="plan.name"
              :class="[
                'bg-white rounded-xl shadow-xl p-6 flex flex-col transition-all duration-300 ease-in-out',
                plan.recommended ? 'ring-2 ring-[#2E8B57] scale-105' : 'hover:shadow-2xl',
              ]"
            >
              <div class="flex-grow">
                <h3 class="text-2xl font-semibold text-slate-900">{{ plan.name }}</h3>
                <p class="mt-1 text-sm text-slate-500">{{ plan.description }}</p>
                <div class="mt-4">
                  <span class="text-4xl font-extrabold text-slate-900">{{ plan.price }}</span>
                  <span v-if="plan.price !== 'Gratis'" class="text-base font-medium text-slate-500"
                    >/bulan</span
                  >
                </div>
                <ul role="list" class="mt-6 space-y-3">
                  <li v-for="feature in plan.features" :key="feature" class="flex space-x-3">
                    <svg
                      class="flex-shrink-0 h-5 w-5 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="text-sm text-slate-600">{{ feature }}</span>
                  </li>
                </ul>
              </div>
              <div class="mt-8">
                <RouterLink
                  :to="plan.cta.link"
                  :class="[
                    'w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium transition-colors',
                    plan.recommended
                      ? 'bg-[#2E8B57] text-white hover:bg-[#236B43]'
                      : 'bg-emerald-100 text-[#2E8B57] hover:bg-emerald-200',
                  ]"
                >
                  {{ plan.cta.text }}
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="py-16 sm:py-24 bg-[#1B5E3B]">
        <footer class="text-slate-400">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-center">
            <div class="text-center">
                <p class="text-xl font-bold text-white mb-4">Moneytory Ledger</p>
                <div class="mb-4 flex justify-center space-x-6">
                    <RouterLink :to="{ name: 'terms' }" class="text-sm hover:text-white transition-colors">Syarat & Ketentuan</RouterLink>
                    <RouterLink :to="{ name: 'how-to' }" class="text-sm hover:text-white transition-colors">Cara Penggunaan</RouterLink>
                    <RouterLink :to="{ name: 'business-package' }" class="text-sm hover:text-white transition-colors">Paket Bisnis</RouterLink>
                </div>
                <p class="text-sm">&copy; 2026 Moneytory Ledger. All rights reserved.</p>
                <p class="text-xs mt-2 text-emerald-400/70">Made with ❤️ by Firmanasgani</p>
            </div>
            </div>
          </div>
        </footer>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { PRICING_PLANS } from '@/enums/pricing'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)

const isLoadingPage = ref(true)
const mobileMenuOpen = ref(false)

onMounted(() => {
  setTimeout(() => {
    isLoadingPage.value = false
  }, 700)
})

const pricingPlans = ref(PRICING_PLANS.filter((p) => !p.hidden))
</script>

<style scoped>
.container {
  max-width: 1280px;
}
</style>
