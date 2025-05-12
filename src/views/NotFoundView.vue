<template>
  <div class="flex flex-col items-center justify-center min-h-screen text-center px-6">
    <h1 class="text-6xl font-bold text-indigo-600">404</h1>
    <p class="text-2xl text-gray-700 mt-4">Oops! Halaman tidak ditemukan.</p>
    <p class="text-gray-500 mt-2">
      Halaman yang Anda cari mungkin telah dihapus atau tidak pernah ada.
    </p>
    <RouterLink
      to="/"
      class="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg"
    >
      Kembali ke Home
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
