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
            <RouterLink :to="{ name: 'login' }" class="text-sm font-medium hover:text-emerald-600 transition-colors">Masuk</RouterLink>
            <RouterLink :to="{ name: 'register' }" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#2E8B57] hover:bg-[#236B43] transition-colors">
              Daftar Gratis
            </RouterLink>
          </div>
        </div>
      </div>
    </nav>

    <header class="bg-[#2E8B57] py-16 text-white">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl font-extrabold mb-4">Syarat dan Ketentuan</h1>
        <p class="text-xl text-emerald-100 max-w-2xl mx-auto">
          Ketentuan Penggunaan Layanan Moneytory Ledger
        </p>
        <p class="mt-2 text-emerald-100 text-sm italic">Terakhir diperbarui: 28 Maret 2026</p>
      </div>
    </header>

    <main class="container mx-auto px-4 py-12 max-w-4xl">
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 md:p-12 shadow-sm border border-slate-100 dark:border-slate-700 prose dark:prose-invert max-w-none">
        
        <section class="mb-10">
          <h2 class="text-2xl font-bold border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">1. Penerimaan Ketentuan</h2>
          <p>Dengan mengakses atau menggunakan aplikasi Moneytory Ledger ("Layanan"), Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak menyetujui bagian mana pun dari ketentuan ini, Anda tidak diperkenankan menggunakan Layanan kami.</p>
        </section>

        <section class="mb-10">
          <h2 class="text-2xl font-bold border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">2. Deskripsi Layanan & Disclaimer Keuangan</h2>
          <p>Moneytory Ledger adalah platform manajemen keuangan yang mencakup dua segmen utama: <strong>Personal</strong> (pencatatan keuangan pribadi) dan <strong>Bisnis</strong> (akuntansi usaha dengan fitur double-entry, invoice, laporan keuangan, dan multi-pengguna). Moneytory Ledger <strong>bukanlah</strong> lembaga keuangan, penasihat investasi, atau konsultan pajak resmi.</p>
          <ul class="list-disc pl-5 space-y-2 mt-3 text-slate-600 dark:text-slate-400">
            <li>Layanan ini disediakan hanya untuk tujuan informasi, pencatatan, dan manajemen keuangan secara mandiri.</li>
            <li>Laporan keuangan yang dihasilkan (Laba Rugi, Neraca, Arus Kas) bersifat bantu dan tidak menggantikan laporan resmi yang dibuat oleh akuntan publik bersertifikat.</li>
            <li>Segala keputusan finansial, investasi, atau operasional bisnis yang Anda ambil berdasarkan data di Layanan ini adalah tanggung jawab Anda sepenuhnya.</li>
            <li>Kami menyarankan Anda berkonsultasi dengan profesional berlisensi sebelum mengambil keputusan keuangan yang signifikan.</li>
          </ul>
        </section>

        <section class="mb-10">
          <h2 class="text-2xl font-bold border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">3. Akurasi Data</h2>
          <p>Akurasi laporan dan analisis yang dihasilkan oleh Layanan bergantung sepenuhnya pada data yang Anda masukkan secara manual. Kami tidak bertanggung jawab atas kesalahan perhitungan atau analisis yang timbul akibat kesalahan input, data yang tidak lengkap, atau kelalaian pengguna.</p>
          <p class="mt-3">Khusus untuk pengguna Paket Bisnis, akurasi jurnal double-entry, Chart of Accounts, serta konfigurasi pajak (PPN) merupakan tanggung jawab penuh Administrator akun bisnis yang bersangkutan.</p>
        </section>

        <section class="mb-10">
          <h2 class="text-2xl font-bold border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">4. Akun dan Keamanan</h2>
          <p>Anda bertanggung jawab untuk menjaga kerahasiaan kredensial akun Anda (email dan kata sandi). Anda menyetujui bahwa:</p>
          <ul class="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
            <li>Memberikan informasi pendaftaran yang akurat dan terkini.</li>
            <li>Segera memberitahu kami jika terjadi penggunaan akun secara tidak sah.</li>
            <li>Kami tidak bertanggung jawab atas kerugian data atau akses akun akibat kelalaian Anda dalam menjaga keamanan perangkat atau akun.</li>
          </ul>
        </section>

        <section class="mb-10">
          <h2 class="text-2xl font-bold border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">5. Ketentuan Berlangganan</h2>
          <p>Moneytory Ledger menawarkan tiga tingkatan paket: <strong>Free</strong>, <strong>Premium</strong> (Rp 39.000/bulan), dan <strong>Bisnis</strong> (Rp 199.000/bulan). Untuk akses fitur berbayar, berlaku ketentuan berikut:</p>
          <ul class="list-disc pl-5 space-y-2 mt-3 text-slate-600 dark:text-slate-400">
            <li>Pembayaran dilakukan melalui penyedia layanan pembayaran pihak ketiga yang sah.</li>
            <li>Semua transaksi yang sudah berhasil diproses umumnya bersifat <em>non-refundable</em> (tidak dapat dikembalikan).</li>
            <li>Kami berhak mengubah biaya langganan dengan pemberitahuan sebelumnya melalui aplikasi atau email.</li>
            <li>Downgrade paket (dari Bisnis ke Premium atau Free) akan berlaku di akhir periode berlangganan aktif. Data yang telah diinput tidak akan dihapus, namun akses ke fitur eksklusif paket yang lebih tinggi akan dibatasi.</li>
          </ul>
        </section>

        <section class="mb-10">
          <h2 class="text-2xl font-bold border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">6. Ketentuan Khusus Paket Bisnis</h2>
          <p>Pengguna Paket Bisnis mendapatkan akses ke fitur akuntansi lanjutan, termasuk Chart of Accounts, jurnal double-entry, manajemen invoice, laporan keuangan (Laba Rugi, Neraca, Arus Kas), KPI Dashboard, manajemen aset &amp; penyusutan, konfigurasi pajak (PPN), serta fitur multi-pengguna dengan sistem role. Dengan menggunakan fitur ini, Anda menyetujui:</p>
          <ul class="list-disc pl-5 space-y-2 mt-3 text-slate-600 dark:text-slate-400">
            <li><strong>Administrator Akun</strong> bertanggung jawab penuh atas seluruh konfigurasi bisnis, termasuk Chart of Accounts, pengaturan pajak, dan pengelolaan member.</li>
            <li><strong>Manajemen Member:</strong> Administrator berhak mengundang, memberikan role (Admin, Kasir, Akuntan, dll.), dan mencabut akses member kapan saja. Segala tindakan yang dilakukan member di dalam akun bisnis menjadi tanggung jawab Administrator.</li>
            <li><strong>Approval Workflow:</strong> Fitur persetujuan jurnal tersedia untuk memastikan kontrol internal. Kami tidak bertanggung jawab atas jurnal yang disetujui atau ditolak akibat kesalahan prosedur internal pengguna.</li>
            <li><strong>Invoice &amp; Pembayaran:</strong> Moneytory Ledger hanya memfasilitasi pencatatan invoice dan status pembayaran. Penagihan, negosiasi, dan penyelesaian sengketa pembayaran dengan pihak klien sepenuhnya menjadi urusan pengguna.</li>
            <li><strong>Data Bisnis:</strong> Kami menjaga kerahasiaan data bisnis Anda. Data tidak akan dibagikan kepada pihak ketiga tanpa persetujuan kecuali diwajibkan oleh hukum yang berlaku.</li>
            <li>Penggunaan laporan keuangan yang dihasilkan untuk keperluan audit resmi, perpajakan, atau pelaporan ke instansi pemerintah harus diverifikasi terlebih dahulu oleh akuntan atau konsultan pajak berlisensi.</li>
          </ul>
        </section>

        <section class="mb-10">
          <h2 class="text-2xl font-bold border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">7. Batasan Tanggung Jawab</h2>
          <p>Sejauh diizinkan oleh hukum, Moneytory Ledger tidak bertanggung jawab atas kerusakan tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan menggunakan Layanan kami, termasuk namun tidak terbatas pada kerugian finansial atau hilangnya data.</p>
        </section>

        <section class="mb-10">
          <h2 class="text-2xl font-bold border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">8. Hak Kekayaan Intelektual</h2>
          <p>Semua konten, logo, desain, dan kode sistem Moneytory Ledger adalah milik sah pengembang. Anda diberikan lisensi terbatas untuk menggunakan Layanan sesuai tujuannya dan tidak diperkenankan menyalin atau mendistribusikan ulang bagian mana pun dari Layanan tanpa izin tertulis.</p>
        </section>

        <section class="mb-10">
          <h2 class="text-2xl font-bold border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">9. Kontak Person</h2>
          <p>Jika Anda memiliki keluhan, kendala teknis, atau pertanyaan mengenai ketentuan ini, silakan hubungi tim kami:</p>
          <div class="bg-emerald-50 dark:bg-slate-700/50 p-6 rounded-xl border border-emerald-100 dark:border-slate-600 flex items-center gap-4 mt-4">
            <div class="h-12 w-12 bg-[#2E8B57] rounded-full flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p class="font-bold text-slate-900 dark:text-white mb-0">Admin Moneytory Ledger</p>
              <a href="mailto:admin@firmanasgani.id" class="text-[#2E8B57] dark:text-emerald-400 font-bold hover:underline">admin@firmanasgani.id</a>
            </div>
          </div>
        </section>
      </div>

      <div class="mt-12 text-center">
        <RouterLink :to="{ name: 'home' }" class="inline-flex items-center gap-2 text-[#2E8B57] font-bold hover:text-[#236B43] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Kembali ke Beranda
        </RouterLink>
      </div>
    </main>

    <footer class="bg-slate-100 dark:bg-slate-800 py-12 text-center border-t border-slate-200 dark:border-slate-700">
      <p class="text-sm text-slate-500">&copy; 2026 Moneytory Ledger. Solusi Cerdas Kelola Keuangan.</p>
      <p class="text-xs mt-2 text-slate-400">Made with ❤️ by Firmanasgani</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { RouterLink } from 'vue-router'

const authStore = useAuthStore()
</script>

<style scoped>
.container {
  max-width: 1280px;
}
</style>
