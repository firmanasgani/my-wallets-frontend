<template>
  <div class="bg-[#F8FFFF] dark:bg-slate-900 text-slate-700 dark:text-slate-200 min-h-screen">
    <!-- Navbar -->
    <nav class="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-40">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <RouterLink :to="{ name: 'home' }" class="flex-shrink-0">
            <span class="text-2xl font-bold text-[#2E8B57]">Moneytory Ledger</span>
          </RouterLink>
          <div class="hidden md:flex items-center space-x-4">
            <a href="#fitur" class="text-sm font-medium text-slate-600 hover:text-[#2E8B57] transition-colors">Fitur</a>
            <a href="#cara-pakai" class="text-sm font-medium text-slate-600 hover:text-[#2E8B57] transition-colors">Cara Penggunaan</a>
            <a href="#harga" class="text-sm font-medium text-slate-600 hover:text-[#2E8B57] transition-colors">Harga</a>
            <RouterLink
              :to="{ name: 'register' }"
              class="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#2E8B57] hover:bg-[#236B43] transition-colors"
            >
              Mulai Sekarang
            </RouterLink>
          </div>
          <div class="md:hidden">
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <svg v-if="!mobileMenuOpen" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
              <svg v-else class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div v-if="mobileMenuOpen" class="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-2">
        <a href="#fitur" @click="mobileMenuOpen = false" class="block text-sm text-slate-600 hover:text-[#2E8B57] py-1">Fitur</a>
        <a href="#cara-pakai" @click="mobileMenuOpen = false" class="block text-sm text-slate-600 hover:text-[#2E8B57] py-1">Cara Penggunaan</a>
        <a href="#harga" @click="mobileMenuOpen = false" class="block text-sm text-slate-600 hover:text-[#2E8B57] py-1">Harga</a>
        <RouterLink :to="{ name: 'register' }" @click="mobileMenuOpen = false" class="block w-full text-center px-4 py-2 rounded-md text-sm font-medium text-white bg-[#2E8B57] hover:bg-[#236B43] mt-2">
          Mulai Sekarang
        </RouterLink>
      </div>
    </nav>

    <!-- Hero -->
    <section class="relative bg-gradient-to-br from-[#1B5E3B] via-[#2E8B57] to-[#28896E] text-white overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/></svg>
      </div>
      <div class="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/50 text-emerald-100 ring-1 ring-emerald-400/50 mb-6">
          Paket Bisnis — Rp 199rb/bulan
        </span>
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
          Akuntansi Lengkap<br />
          <span class="text-emerald-200">untuk Bisnis Anda</span>
        </h1>
        <p class="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-emerald-100">
          Dari pencatatan jurnal double-entry, manajemen invoice, hingga laporan keuangan profesional —
          semua dalam satu platform yang mudah digunakan.
        </p>
        <div class="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <RouterLink
            :to="{ name: 'register' }"
            class="inline-flex items-center justify-center px-8 py-3 rounded-lg text-base font-semibold text-[#2E8B57] bg-white hover:bg-emerald-50 shadow-lg transition-colors"
          >
            Mulai Sekarang
          </RouterLink>
          <a
            href="#fitur"
            class="inline-flex items-center justify-center px-8 py-3 rounded-lg text-base font-semibold text-white border-2 border-emerald-300 hover:bg-[#236B43] hover:border-emerald-500 transition-colors"
          >
            Lihat Semua Fitur
          </a>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="bg-white border-b border-slate-100">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p class="text-3xl font-extrabold text-[#2E8B57]">10+</p>
            <p class="mt-1 text-sm text-slate-500">Fitur Akuntansi</p>
          </div>
          <div>
            <p class="text-3xl font-extrabold text-[#2E8B57]">5</p>
            <p class="mt-1 text-sm text-slate-500">Role Multi-User</p>
          </div>
          <div>
            <p class="text-3xl font-extrabold text-[#2E8B57]">4</p>
            <p class="mt-1 text-sm text-slate-500">Laporan Keuangan</p>
          </div>
          <div>
            <p class="text-3xl font-extrabold text-[#2E8B57]">100%</p>
            <p class="mt-1 text-sm text-slate-500">Cloud-based</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Fitur Lengkap -->
    <section id="fitur" class="py-16 sm:py-24 bg-slate-50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-14">
          <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Semua Fitur Paket Bisnis
          </h2>
          <p class="mt-4 max-w-2xl mx-auto text-lg text-slate-500">
            Dirancang untuk UMKM, profesional, dan bisnis yang butuh solusi akuntansi nyata.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Manajemen Perusahaan -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-50 text-[#2E8B57] mb-4">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-900">Manajemen Perusahaan</h3>
            <p class="mt-2 text-sm text-slate-500 leading-relaxed">
              Kelola profil perusahaan, nama, alamat, NPWP, dan konfigurasi bisnis dari satu tempat. Dukung multi-workspace untuk keperluan yang berbeda.
            </p>
          </div>

          <!-- Chart of Accounts -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-50 text-[#2E8B57] mb-4">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-900">Bagan Akun (Chart of Accounts)</h3>
            <p class="mt-2 text-sm text-slate-500 leading-relaxed">
              Bagan akun otomatis yang sudah terstruktur sesuai standar akuntansi. Tambah, edit, atau nonaktifkan akun sesuai kebutuhan bisnis Anda.
            </p>
          </div>

          <!-- Manajemen Kontak -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-center h-12 w-12 rounded-xl bg-green-50 text-green-600 mb-4">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-900">Manajemen Kontak</h3>
            <p class="mt-2 text-sm text-slate-500 leading-relaxed">
              Simpan data pelanggan dan pemasok lengkap dengan nama, email, telepon, dan alamat. Kontak terintegrasi langsung dengan invoice dan jurnal.
            </p>
          </div>

          <!-- Invoice -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-50 text-emerald-600 mb-4">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-900">Pembuatan & Pengelolaan Invoice</h3>
            <p class="mt-2 text-sm text-slate-500 leading-relaxed">
              Buat invoice profesional dengan item, harga, pajak PPN otomatis, dan due date. Pantau status pembayaran (Draft, Terkirim, Lunas) dan ekspor ke PDF.
            </p>
          </div>

          <!-- Jurnal Double-Entry -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-center h-12 w-12 rounded-xl bg-purple-50 text-purple-600 mb-4">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-900">Jurnal Double-Entry</h3>
            <p class="mt-2 text-sm text-slate-500 leading-relaxed">
              Catat jurnal akuntansi dengan sistem debit-kredit yang seimbang. Dukung multi-baris jurnal, lampiran dokumen pendukung, dan approval workflow.
            </p>
          </div>

          <!-- Laporan Keuangan -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-center h-12 w-12 rounded-xl bg-orange-50 text-orange-600 mb-4">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-900">Laporan Keuangan Lengkap</h3>
            <p class="mt-2 text-sm text-slate-500 leading-relaxed">
              Laporan Laba Rugi, Neraca Keuangan, Arus Kas, dan Jurnal Umum yang dihasilkan otomatis dari jurnal yang sudah diinput.
            </p>
          </div>

          <!-- KPI Dashboard -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-center h-12 w-12 rounded-xl bg-teal-50 text-teal-600 mb-4">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-900">KPI Dashboard Bisnis</h3>
            <p class="mt-2 text-sm text-slate-500 leading-relaxed">
              Pantau metrik bisnis penting: total pendapatan, laba bersih, piutang, utang, dan tren periode sebelumnya — semuanya dalam satu tampilan ringkas.
            </p>
          </div>

          <!-- Multi-user & Role -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-center h-12 w-12 rounded-xl bg-pink-50 text-pink-600 mb-4">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-900">Multi-User dengan Role</h3>
            <p class="mt-2 text-sm text-slate-500 leading-relaxed">
              Undang anggota tim dengan role berbeda: Owner, Admin, Checker, Staff, dan Viewer. Setiap role memiliki hak akses yang terpisah dan terkontrol.
            </p>
          </div>

          <!-- Manajemen Pajak -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-center h-12 w-12 rounded-xl bg-yellow-50 text-yellow-600 mb-4">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-900">Manajemen Pajak (PPN)</h3>
            <p class="mt-2 text-sm text-slate-500 leading-relaxed">
              Konfigurasi tarif PPN, atur pajak per invoice, dan manfaatkan Tax Suggestion Engine yang menyarankan konfigurasi pajak otomatis berdasarkan jenis transaksi.
            </p>
          </div>

          <!-- Manajemen Aset -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-center h-12 w-12 rounded-xl bg-slate-100 text-slate-600 mb-4">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.7 7.5H3.3C2.582 7.5 2 8.082 2 8.8v9.9c0 .718.582 1.3 1.3 1.3h17.4c.718 0 1.3-.582 1.3-1.3V8.8c0-.718-.582-1.3-1.3-1.3ZM8 7.5V5.25A2.25 2.25 0 0 1 10.25 3h3.5A2.25 2.25 0 0 1 16 5.25V7.5M12 12v4m-2-2h4" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-900">Manajemen Aset</h3>
            <p class="mt-2 text-sm text-slate-500 leading-relaxed">
              Catat aset tetap perusahaan beserta nilai perolehan, tanggal pembelian, dan umur manfaat. Hitung penyusutan otomatis dengan metode garis lurus.
            </p>
          </div>

          <!-- Approval Workflow -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-50 text-[#2E8B57] mb-4">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-900">Approval Workflow Jurnal</h3>
            <p class="mt-2 text-sm text-slate-500 leading-relaxed">
              Pastikan akurasi dengan alur persetujuan bertingkat: Staff membuat jurnal → Checker memeriksa → Admin menyetujui. Bisa diaktifkan atau dinonaktifkan sesuai kebutuhan.
            </p>
          </div>

          <!-- Rekening Bank -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-center h-12 w-12 rounded-xl bg-cyan-50 text-cyan-600 mb-4">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-900">Rekening Bank Perusahaan</h3>
            <p class="mt-2 text-sm text-slate-500 leading-relaxed">
              Daftarkan rekening bank perusahaan yang tampil di invoice. Kelola beberapa rekening sekaligus untuk kemudahan pembayaran dari pelanggan.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Role & Permission -->
    <section class="py-16 sm:py-24 bg-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-14">
          <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Sistem Role Multi-User
          </h2>
          <p class="mt-4 max-w-xl mx-auto text-lg text-slate-500">
            Kontrol akses tim Anda dengan tepat. Setiap anggota mendapat hak sesuai tanggung jawabnya.
          </p>
        </div>
        <div class="max-w-3xl mx-auto space-y-3">
          <div v-for="role in roles" :key="role.name"
            class="flex items-start gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div :class="['flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg text-white font-bold text-sm', role.color]">
              {{ role.level }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h4 class="font-semibold text-slate-900">{{ role.name }}</h4>
                <span v-if="role.badge" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-[#2E8B57]">{{ role.badge }}</span>
              </div>
              <p class="mt-0.5 text-sm text-slate-500">{{ role.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Cara Penggunaan -->
    <section id="cara-pakai" class="py-16 sm:py-24 bg-slate-50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-14">
          <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Cara Memulai Paket Bisnis
          </h2>
          <p class="mt-4 max-w-xl mx-auto text-lg text-slate-500">
            Mulai dari nol hingga laporan keuangan dalam beberapa langkah mudah.
          </p>
        </div>

        <div class="max-w-4xl mx-auto space-y-12">
          <!-- Step 1 -->
          <div class="flex flex-col md:flex-row gap-6 items-start">
            <div class="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-2xl bg-[#2E8B57] text-white text-xl font-extrabold shadow-lg">1</div>
            <div>
              <h3 class="text-xl font-bold text-slate-900">Daftar & Pilih Paket Bisnis</h3>
              <p class="mt-2 text-slate-500">
                Buat akun di Moneytory Ledger, lalu upgrade ke paket Bisnis melalui menu <strong>Pengaturan → Upgrade Paket</strong>. Setelah pembayaran berhasil, fitur bisnis langsung aktif.
              </p>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="flex flex-col md:flex-row gap-6 items-start">
            <div class="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-2xl bg-[#2E8B57] text-white text-xl font-extrabold shadow-lg">2</div>
            <div>
              <h3 class="text-xl font-bold text-slate-900">Buat Profil Perusahaan</h3>
              <p class="mt-2 text-slate-500">
                Masuk ke <strong>Bisnis → Pengaturan Perusahaan</strong>. Isi nama perusahaan, alamat, dan NPWP. Sistem akan otomatis membuat Chart of Accounts standar untuk perusahaan Anda.
              </p>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="flex flex-col md:flex-row gap-6 items-start">
            <div class="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-2xl bg-[#2E8B57] text-white text-xl font-extrabold shadow-lg">3</div>
            <div>
              <h3 class="text-xl font-bold text-slate-900">Undang Anggota Tim</h3>
              <p class="mt-2 text-slate-500">
                Di menu <strong>Bisnis → Manajemen Member</strong>, undang anggota dengan email dan pilih role yang sesuai. Anggota akan menerima link undangan untuk bergabung ke workspace Anda.
              </p>
            </div>
          </div>

          <!-- Step 4 -->
          <div class="flex flex-col md:flex-row gap-6 items-start">
            <div class="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-2xl bg-[#2E8B57] text-white text-xl font-extrabold shadow-lg">4</div>
            <div>
              <h3 class="text-xl font-bold text-slate-900">Tambah Kontak & Rekening Bank</h3>
              <p class="mt-2 text-slate-500">
                Isi daftar pelanggan dan pemasok di <strong>Bisnis → Kontak</strong>. Daftarkan rekening bank perusahaan di <strong>Bisnis → Rekening Bank</strong> agar tampil otomatis di invoice.
              </p>
            </div>
          </div>

          <!-- Step 5 -->
          <div class="flex flex-col md:flex-row gap-6 items-start">
            <div class="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-2xl bg-[#2E8B57] text-white text-xl font-extrabold shadow-lg">5</div>
            <div>
              <h3 class="text-xl font-bold text-slate-900">Buat Invoice & Catat Jurnal</h3>
              <p class="mt-2 text-slate-500">
                Buat invoice untuk pelanggan di <strong>Bisnis → Invoice → Buat Invoice</strong>. Untuk transaksi lainnya, catat jurnal manual di <strong>Bisnis → Transaksi → Jurnal Baru</strong>. Sistem otomatis membuat entri double-entry.
              </p>
            </div>
          </div>

          <!-- Step 6 -->
          <div class="flex flex-col md:flex-row gap-6 items-start">
            <div class="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-2xl bg-[#2E8B57] text-white text-xl font-extrabold shadow-lg">6</div>
            <div>
              <h3 class="text-xl font-bold text-slate-900">Pantau Laporan & KPI</h3>
              <p class="mt-2 text-slate-500">
                Lihat kondisi keuangan bisnis di <strong>Bisnis → Laporan</strong> untuk Laba Rugi, Neraca, dan Arus Kas. Pantau metrik utama secara real-time di <strong>Bisnis → KPI Dashboard</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Approval Workflow Detail -->
    <section class="py-16 sm:py-20 bg-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-10">
            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900">Alur Approval Jurnal</h2>
            <p class="mt-3 text-slate-500">Aktifkan approval workflow untuk memastikan setiap jurnal telah diperiksa sebelum diposting.</p>
          </div>
          <div class="bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-100">
            <div class="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2 text-sm font-medium">
              <div class="flex flex-col items-center text-center px-4">
                <div class="h-12 w-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold mb-2">D</div>
                <span class="text-slate-700 font-semibold">DRAFT</span>
                <span class="text-xs text-slate-400 mt-1">Dibuat Staff</span>
              </div>
              <div class="text-slate-300 text-2xl hidden md:block">→</div>
              <div class="md:hidden text-slate-300 text-2xl">↓</div>
              <div class="flex flex-col items-center text-center px-4">
                <div class="h-12 w-12 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold mb-2">PC</div>
                <span class="text-slate-700 font-semibold">PENDING CHECK</span>
                <span class="text-xs text-slate-400 mt-1">Setelah di-submit</span>
              </div>
              <div class="text-slate-300 text-2xl hidden md:block">→</div>
              <div class="md:hidden text-slate-300 text-2xl">↓</div>
              <div class="flex flex-col items-center text-center px-4">
                <div class="h-12 w-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-2">PA</div>
                <span class="text-slate-700 font-semibold">PENDING APPROVAL</span>
                <span class="text-xs text-slate-400 mt-1">Setelah di-check Checker</span>
              </div>
              <div class="text-slate-300 text-2xl hidden md:block">→</div>
              <div class="md:hidden text-slate-300 text-2xl">↓</div>
              <div class="flex flex-col items-center text-center px-4">
                <div class="h-12 w-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold mb-2">✓</div>
                <span class="text-slate-700 font-semibold">APPROVED</span>
                <span class="text-xs text-slate-400 mt-1">Di-approve Admin</span>
              </div>
            </div>
            <p class="mt-6 text-center text-xs text-slate-400">Jurnal yang ditolak (Reject) kembali ke Status REJECTED dan dapat direvisi serta di-submit ulang oleh Staff.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Perbandingan Paket -->
    <section class="py-16 sm:py-24 bg-slate-50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-14">
          <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Paket Bisnis vs Paket Lain
          </h2>
          <p class="mt-4 text-lg text-slate-500">Lihat perbedaan lengkap antar paket.</p>
        </div>
        <div class="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
          <table class="min-w-full divide-y divide-slate-200 bg-white">
            <thead>
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-600 bg-slate-50">Fitur</th>
                <th class="px-6 py-4 text-center text-sm font-semibold text-slate-600 bg-slate-50">Dasar</th>
                <th class="px-6 py-4 text-center text-sm font-semibold text-slate-600 bg-slate-50">Premium</th>
                <th class="px-6 py-4 text-center text-sm font-bold text-[#2E8B57] bg-emerald-50 ring-2 ring-emerald-200">Bisnis ★</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="row in comparisonRows" :key="row.feature">
                <td class="px-6 py-3 text-sm text-slate-700">{{ row.feature }}</td>
                <td class="px-6 py-3 text-center">
                  <span v-if="row.free === true" class="text-green-500 text-lg">✓</span>
                  <span v-else-if="row.free === false" class="text-slate-300 text-lg">—</span>
                  <span v-else class="text-xs text-slate-500">{{ row.free }}</span>
                </td>
                <td class="px-6 py-3 text-center">
                  <span v-if="row.premium === true" class="text-green-500 text-lg">✓</span>
                  <span v-else-if="row.premium === false" class="text-slate-300 text-lg">—</span>
                  <span v-else class="text-xs text-slate-500">{{ row.premium }}</span>
                </td>
                <td class="px-6 py-3 text-center bg-emerald-50/50">
                  <span v-if="row.business === true" class="text-green-500 text-lg font-bold">✓</span>
                  <span v-else-if="row.business === false" class="text-slate-300 text-lg">—</span>
                  <span v-else class="text-xs text-[#2E8B57] font-medium">{{ row.business }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Harga / CTA -->
    <section id="harga" class="py-16 sm:py-24 bg-gradient-to-br from-[#2E8B57] to-[#1B5E3B] text-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Mulai Paket Bisnis Sekarang
        </h2>
        <p class="mt-4 max-w-xl mx-auto text-lg text-emerald-100">
          Hanya <strong class="text-white">Rp 297.000/bulan</strong> untuk akses penuh semua fitur akuntansi bisnis.
        </p>
        <div class="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <RouterLink
            :to="{ name: 'register' }"
            class="inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-bold text-[#2E8B57] bg-white hover:bg-emerald-50 shadow-xl transition-colors"
          >
            Daftar & Mulai Sekarang
          </RouterLink>
          <RouterLink
            :to="{ name: 'home' }"
            class="inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-semibold text-white border-2 border-emerald-300 hover:bg-[#236B43] hover:border-emerald-500 transition-colors"
          >
            Lihat Semua Paket
          </RouterLink>
        </div>
        <p class="mt-6 text-sm text-emerald-200">Tidak ada kontrak jangka panjang. Batalkan kapan saja.</p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-slate-800 py-10 text-slate-400">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="font-bold text-lg text-white mb-4">Moneytory Ledger</p>
        <div class="flex justify-center space-x-6 mb-4">
          <RouterLink :to="{ name: 'home' }" class="text-sm hover:text-white transition-colors">Beranda</RouterLink>
          <RouterLink :to="{ name: 'how-to' }" class="text-sm hover:text-white transition-colors">Cara Penggunaan</RouterLink>
          <RouterLink :to="{ name: 'terms' }" class="text-sm hover:text-white transition-colors">Syarat & Ketentuan</RouterLink>
        </div>
        <p class="text-sm">&copy; 2026 Moneytory Ledger. All rights reserved.</p>
        <p class="text-xs mt-2 text-emerald-400/70">Made with ❤️ by Firmanasgani</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const mobileMenuOpen = ref(false)

const roles = [
  {
    level: '4',
    name: 'Owner',
    badge: 'Akses Penuh',
    description: 'Akses penuh ke semua fitur, termasuk pengaturan perusahaan dan manajemen anggota.',
    color: 'bg-[#2E8B57]',
  },
  {
    level: '3',
    name: 'Admin',
    badge: null,
    description: 'Semua hak Checker + bisa menyetujui jurnal (approve), mengelola aset, dan konfigurasi pajak.',
    color: 'bg-purple-600',
  },
  {
    level: '2',
    name: 'Checker',
    badge: 'Baru',
    description: 'Semua hak Staff + bisa memeriksa (check gate pertama) dan menolak jurnal yang disubmit.',
    color: 'bg-[#2E8B57]',
  },
  {
    level: '1',
    name: 'Staff',
    badge: null,
    description: 'Membuat transaksi/jurnal, submit untuk review, dan mengupload lampiran dokumen.',
    color: 'bg-teal-600',
  },
  {
    level: '0',
    name: 'Viewer',
    badge: null,
    description: 'Hanya bisa melihat data tanpa melakukan perubahan apapun.',
    color: 'bg-slate-500',
  },
]

const comparisonRows = [
  { feature: 'Pencatatan Transaksi', free: true, premium: true, business: true },
  { feature: 'Laporan & Analisis Lanjutan', free: false, premium: true, business: true },
  { feature: 'Budgeting & Goal Keuangan', free: false, premium: true, business: true },
  { feature: 'Transaksi Berulang Otomatis', free: false, premium: true, business: true },
  { feature: 'Manajemen Perusahaan', free: false, premium: false, business: true },
  { feature: 'Chart of Accounts', free: false, premium: false, business: true },
  { feature: 'Manajemen Kontak', free: false, premium: false, business: true },
  { feature: 'Invoice & Pengelolaan Pembayaran', free: false, premium: false, business: true },
  { feature: 'Jurnal Double-Entry', free: false, premium: false, business: true },
  { feature: 'Laporan Keuangan (L/R, Neraca, Arus Kas)', free: false, premium: false, business: true },
  { feature: 'KPI Dashboard Bisnis', free: false, premium: false, business: true },
  { feature: 'Multi-user dengan Role', free: false, premium: false, business: true },
  { feature: 'Manajemen Pajak & PPN', free: false, premium: false, business: true },
  { feature: 'Manajemen Aset & Penyusutan', free: false, premium: false, business: true },
  { feature: 'Approval Workflow Jurnal', free: false, premium: false, business: true },
  { feature: 'Lampiran Dokumen Jurnal', free: false, premium: false, business: true },
  { feature: 'Harga', free: 'Gratis', premium: 'Rp 39rb/bln', business: 'Rp 297rb/bln' },
]
</script>

<style scoped>
.container {
  max-width: 1280px;
}
</style>
