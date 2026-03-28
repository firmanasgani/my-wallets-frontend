<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
    <!-- Header/Nav -->
    <nav v-if="!authStore.isAuthenticated" class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm sticky top-0 z-40 transition-colors">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <RouterLink :to="{ name: 'home' }" class="flex-shrink-0">
            <span class="text-2xl font-bold text-[#2E8B57]">Moneytory Ledger</span>
          </RouterLink>
          <div class="flex items-center gap-4">
            <RouterLink :to="{ name: 'login' }" class="text-sm font-medium hover:text-[#2E8B57] transition-colors">Masuk</RouterLink>
            <RouterLink :to="{ name: 'register' }" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#2E8B57] hover:bg-[#236B43] transition-colors">
              Daftar Gratis
            </RouterLink>
          </div>
        </div>
      </div>
    </nav>

    <header class="bg-[#2E8B57] py-16 sm:py-24 text-white">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl sm:text-5xl font-extrabold mb-4">Cara Penggunaan & Fitur</h1>
        <p class="text-xl text-emerald-100 max-w-2xl mx-auto">
          Panduan lengkap untuk mengelola keuangan Anda lebih cerdas dengan Moneytory Ledger.
        </p>
      </div>
    </header>

    <main class="container mx-auto px-4 py-12 space-y-20">
      <!-- Section: Features -->
      <section id="features" class="space-y-12">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white">Fitur Moneytory Ledger</h2>
          <p class="mt-4 text-slate-500 max-w-2xl mx-auto text-lg">
            Kami menyediakan paket yang fleksibel untuk kebutuhan finansial Anda.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Free Plan -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col transition-transform hover:scale-[1.02]">
            <h3 class="text-xl font-bold mb-2">Dasar (Free)</h3>
            <p class="text-slate-500 mb-6 text-sm">Untuk kebutuhan esensial pencatatan keuangan.</p>
            <ul class="space-y-4 flex-grow mb-8">
              <li v-for="f in freeFeatures" :key="f" class="flex items-start gap-3">
                <svg class="h-5 w-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-sm">{{ f }}</span>
              </li>
            </ul>
            <RouterLink v-if="!authStore.isAuthenticated" :to="{ name: 'register' }" class="w-full py-3 bg-slate-100 dark:bg-slate-700 text-center font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              Mulai Gratis
            </RouterLink>
          </div>

          <!-- Premium Plan -->
          <div class="bg-emerald-600 text-white rounded-2xl p-8 shadow-xl flex flex-col transition-transform hover:scale-[1.02] relative">
            <div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-emerald-900 text-[10px] font-black uppercase px-3 py-1 rounded-full">POPULER</div>
            <h3 class="text-xl font-bold mb-2">Premium</h3>
            <p class="text-emerald-100 mb-6 text-sm">Fitur lengkap untuk kontrol finansial mendalam.</p>
            <ul class="space-y-4 flex-grow mb-8">
              <li v-for="f in premiumFeatures" :key="f" class="flex items-start gap-3">
                <svg class="h-5 w-5 text-emerald-300 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-sm">{{ f }}</span>
              </li>
            </ul>
            <RouterLink v-if="!authStore.isAuthenticated" :to="{ name: 'register' }" class="w-full py-3 bg-white text-emerald-600 text-center font-bold rounded-lg hover:bg-emerald-50 transition-colors shadow-lg">
              Langganan Sekarang
            </RouterLink>
          </div>

          <!-- Business Plan -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col transition-transform hover:scale-[1.02]">
            <h3 class="text-xl font-bold mb-2">Bisnis</h3>
            <p class="text-slate-500 mb-6 text-sm">Solusi akuntansi lengkap untuk usaha dan profesional.</p>
            <ul class="space-y-4 flex-grow mb-8">
              <li v-for="f in businessFeatures" :key="f" class="flex items-start gap-3">
                <svg class="h-5 w-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-sm">{{ f }}</span>
              </li>
            </ul>
            <RouterLink v-if="!authStore.isAuthenticated" :to="{ name: 'register' }" class="w-full py-3 bg-slate-100 dark:bg-slate-700 text-center font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              Pilih Bisnis
            </RouterLink>
          </div>
        </div>
      </section>

      <!-- Section: How to Use -->
      <section id="guide" class="space-y-12">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white">Cara Penggunaan</h2>
          <p class="mt-4 text-slate-500 max-w-2xl mx-auto text-lg">
            Mulai langkah sukses finansial Anda hanya dalam beberapa menit.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          <div class="flex gap-6">
            <div class="h-12 w-12 shrink-0 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xl">1</div>
            <div>
              <h4 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Buat Akun Keuangan</h4>
              <p class="text-slate-600 dark:text-slate-400">
                Tambahkan berbagai akun seperti Tabungan Bank, Dompet, atau Kartu Kredit. Ini memudahkan Anda melihat total kekayaan di satu tempat.
              </p>
            </div>
          </div>
          <div class="flex gap-6">
            <div class="h-12 w-12 shrink-0 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xl">2</div>
            <div>
              <h4 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Atur Kategori</h4>
              <p class="text-slate-600 dark:text-slate-400">
                Gunakan kategori yang tersedia atau buat kustom sesuai gaya hidup Anda agar pengeluaran lebih terorganisir.
              </p>
            </div>
          </div>
          <div class="flex gap-6">
            <div class="h-12 w-12 shrink-0 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xl">3</div>
            <div>
              <h4 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Catat Transaksi</h4>
              <p class="text-slate-600 dark:text-slate-400">
                Catat setiap uang masuk dan keluar secara rutin. Fitur transaksi berulang membantu Anda mencatat tagihan bulanan secara otomatis.
              </p>
            </div>
          </div>
          <div class="flex gap-6">
            <div class="h-12 w-12 shrink-0 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xl">4</div>
            <div>
              <h4 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Pantau Laporan</h4>
              <p class="text-slate-600 dark:text-slate-400">
                Lihat grafik perkembangan saldo dan analisis pengeluaran untuk mengevaluasi kebiasaan belanja Anda.
              </p>
            </div>
          </div>
          <div class="flex gap-6">
            <div class="h-12 w-12 shrink-0 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-xl">5</div>
            <div>
              <div class="flex items-center gap-2 mb-2">
                <h4 class="text-xl font-bold text-slate-900 dark:text-white">Budgeting</h4>
                <span class="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded font-bold">PREMIUM</span>
              </div>
              <p class="text-slate-600 dark:text-slate-400">
                Buat anggaran bulanan untuk kategori tertentu. Pantau sisa kuota belanja Anda secara real-time agar tidak overbudget.
              </p>
            </div>
          </div>
          <div class="flex gap-6">
            <div class="h-12 w-12 shrink-0 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-xl">6</div>
            <div>
              <div class="flex items-center gap-2 mb-2">
                <h4 class="text-xl font-bold text-slate-900 dark:text-white">Financial Goals</h4>
                <span class="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded font-bold">PREMIUM</span>
              </div>
              <p class="text-slate-600 dark:text-slate-400">
                Tentukan target menabung Anda (misal: Beli Laptop). Alokasikan dana dari tabungan Anda secara berkala hingga target tercapai.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Section: Premium Benefits -->
      <section id="premium-benefits" class="bg-emerald-50 dark:bg-slate-800/50 rounded-3xl p-8 sm:p-12 border border-emerald-100 dark:border-slate-700">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-6">Kenapa Pilih Premium?</h2>
            <div class="space-y-6">
              <div class="flex gap-4">
                <div class="shrink-0 h-10 w-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-bold text-lg">Alokasi Goal Keuangan</h4>
                  <p class="text-slate-600 dark:text-slate-400">Bukan sekadar mencatatkan target, tapi benar-benar menyisihkan uang (allocate) dari akun yang ada untuk tujuan spesifik.</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="shrink-0 h-10 w-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-bold text-lg">Analisis Penggunaan Anggaran</h4>
                  <p class="text-slate-600 dark:text-slate-400">Dapatkan notifikasi visual dan laporan khusus untuk membandingkan rencana anggaran vs realita pengeluaran Anda.</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="shrink-0 h-10 w-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-bold text-lg">Transaksi Berulang Otomatis</h4>
                  <p class="text-slate-600 dark:text-slate-400">Hemat waktu dengan mencatat transaksi rutin (sewa, langganan, gaji) secara otomatis setiap periode.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="relative">
            <div class="absolute -inset-4 bg-emerald-500/10 rounded-3xl blur-2xl"></div>
            <div class="relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-emerald-100 dark:border-slate-700">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-emerald-600">Premium Dashboard</span>
                  <span class="text-xs text-slate-400">Contoh UI</span>
                </div>
                <div class="h-4 bg-slate-100 dark:bg-slate-700 rounded w-1/2"></div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="h-20 bg-emerald-50 dark:bg-slate-700/50 rounded-xl p-3 flex flex-col justify-between">
                    <span class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Budget Food</span>
                    <div class="h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                      <div class="h-full bg-emerald-500 w-[75%]"></div>
                    </div>
                    <span class="text-xs font-bold text-slate-500">75% Terpakai</span>
                  </div>
                  <div class="h-20 bg-green-50 dark:bg-slate-700/50 rounded-xl p-3 flex flex-col justify-between">
                    <span class="text-[10px] text-green-500 font-bold uppercase tracking-wider">Goal: Liburan</span>
                    <div class="h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                      <div class="h-full bg-green-500 w-[40%]"></div>
                    </div>
                    <span class="text-xs font-bold text-slate-500">Rp 4.000.000</span>
                  </div>
                </div>
                <div class="h-24 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-600 flex items-center justify-center">
                  <span class="text-xs text-slate-400 text-center px-4 italic">"Visualisasi Premium memudahkan Anda tetap disiplin finansial"</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="bg-emerald-100 rounded-3xl p-12 text-center text-white overflow-hidden relative">
        <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-purple-500/20 opacity-50"></div>
        <div class="relative z-10">
          <h2 class="text-3xl font-bold mb-6 text-slate-800">Siap Mengatur Keuangan Anda?</h2>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <RouterLink v-if="!authStore.isAuthenticated" :to="{ name: 'register' }" class="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20">
              Daftar Sekarang
            </RouterLink>
            <RouterLink v-if="authStore.isAuthenticated" :to="{ name: 'dashboard' }" class="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20">
              Kembali ke Dashboard
            </RouterLink>
            <RouterLink :to="{ name: 'home' }" class="px-8 py-3 bg-white backdrop-blur-sm text-slate-900 border border-white/20 font-bold rounded-xl hover:bg-white/10 transition-colors">
              Halaman Depan
            </RouterLink>
          </div>
        </div>
      </section>
    </main>

    <footer class="bg-slate-100 dark:bg-slate-800 py-12 text-center border-t border-slate-200 dark:border-slate-700">
      <div class="mb-4 flex justify-center space-x-6">
        <RouterLink :to="{ name: 'terms' }" class="text-sm text-slate-500 hover:text-[#2E8B57] transition-colors">Syarat & Ketentuan</RouterLink>
        <RouterLink :to="{ name: 'home' }" class="text-sm text-slate-500 hover:text-[#2E8B57] transition-colors">Beranda</RouterLink>
        <router-link :to="{ name: 'business-package'}" class="text-sm text-slate-500 hover:text-[#2E8B57] transition-colors">Paket Bisnis</router-link>
      </div>
      <p class="text-sm text-slate-500">&copy; 2026 Moneytory Ledger. Solusi Cerdas Kelola Keuangan.</p>
      <p class="text-xs mt-2 text-slate-400">Made with ❤️ by Firmanasgani</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { RouterLink } from 'vue-router'

const authStore = useAuthStore()

const freeFeatures = [
  'Hingga 4 Akun Keuangan',
  'Hingga 30 Kategori Kustom',
  'Pencatatan Transaksi Manual',
  'Dashboard Ringkas',
  'Riwayat Transaksi 12 Bulan'
]

const premiumFeatures = [
  'Semua di paket Dasar',
  'Akun Keuangan Tanpa Batas',
  'Kategori Kustom Tanpa Batas',
  'Laporan & Analisis Lanjutan',
  'Transaksi Berulang Otomatis',
  'Fitur Budgeting',
  'Lacak Goal Keuangan',
  'Dukungan Prioritas'
]

const businessFeatures = [
  'Semua di paket Premium',
  'Manajemen Perusahaan',
  'Bagan Akun (Chart of Accounts)',
  'Manajemen Kontak (Pelanggan & Pemasok)',
  'Pembuatan & Pengelolaan Invoice',
  'Laporan Keuangan (Laba Rugi, Neraca, Arus Kas)',
  'Multi-user dengan Role (Owner, Admin, Staff)',
  'Manajemen Pajak (PPN)',
]
</script>

<style scoped>
.container {
  max-width: 1024px;
}
</style>
