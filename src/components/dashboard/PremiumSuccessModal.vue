<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
    >
      <!-- Background overlay -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
        @click="close"
      ></div>

      <!-- Center modal -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"
        >&#8203;</span
      >

      <div
        class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full"
      >
        <div
          class="bg-gradient-to-br from-[#2E8B57] to-[#1a5233] px-6 py-8 text-center text-white"
        >
          <div
            class="mx-auto flex items-center justify-center h-16 w-16 bg-white bg-opacity-20 rounded-full mb-4"
          >
            <i class="fa-solid fa-crown text-3xl"></i>
          </div>
          <h2 class="text-2xl font-bold mb-2">Upgrade Berhasil!</h2>
          <p class="text-emerald-100">
            Selamat, akun Anda telah diupgrade ke
            <span class="font-extrabold text-yellow-300">PREMIUM</span>.
          </p>
        </div>

        <div class="bg-white px-6 py-6">
          <h3 class="font-semibold text-gray-800 mb-4">Nikmati Benefit Premium:</h3>
          <ul class="space-y-3 mb-6">
            <li class="flex items-start">
              <i class="fa-solid fa-check-circle text-green-500 mt-1 mr-3"></i>
              <span class="text-gray-600">Kategori Pemasukan & Pengeluaran Tidak Terbatas</span>
            </li>
            <li class="flex items-start">
              <i class="fa-solid fa-check-circle text-green-500 mt-1 mr-3"></i>
              <span class="text-gray-600">Laporan Keuangan & Analisis Tren Lengkap</span>
            </li>
            <li class="flex items-start">
              <i class="fa-solid fa-check-circle text-green-500 mt-1 mr-3"></i>
              <span class="text-gray-600">Ekspor Laporan ke PDF</span>
            </li>
            <li class="flex items-start">
              <i class="fa-solid fa-check-circle text-green-500 mt-1 mr-3"></i>
              <span class="text-gray-600">Dukungan Prioritas</span>
            </li>
          </ul>

          <button
            type="button"
            class="w-full inline-flex justify-center items-center rounded-xl border border-transparent shadow-sm px-4 py-3 bg-[#2E8B57] text-base font-bold text-white hover:bg-[#236B43] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            @click="close"
          >
            Mulai Jelajahi
            <i class="fa-solid fa-arrow-right ml-2 text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
}>()

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>
