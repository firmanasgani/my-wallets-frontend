<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
    <!-- Card Container -->
    <div
      class="flex w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden min-h-[520px]"
    >
      <!-- Left Side (Branding) -->
      <div
        class="hidden md:flex w-1/2 bg-gradient-to-br from-blue-700 to-blue-900 p-12 flex-col justify-between relative text-white"
      >
        <div class="absolute inset-0 bg-pattern opacity-10"></div>

        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-2">
            <div class="bg-blue-500 bg-opacity-30 p-2 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span class="text-xl font-bold tracking-wider">My Wallets</span>
          </div>
        </div>

        <div class="relative z-10 space-y-6">
          <h2 class="text-xl font-semibold text-blue-100">Pulihkan Akun Anda</h2>
          <p class="text-blue-200 text-sm leading-relaxed max-w-sm">
            Masukkan alamat email yang terdaftar dan kami akan mengirimkan instruksi untuk
            mereset kata sandi Anda.
          </p>
        </div>

        <div class="relative z-10 text-xs text-blue-300">&copy; 2026 Moneytory Inc.</div>
      </div>

      <!-- Right Side (Form) -->
      <div
        class="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-white dark:bg-slate-800 relative"
      >
        <div class="max-w-md mx-auto w-full">
          <!-- Mobile Logo -->
          <div class="md:hidden flex justify-center mb-8">
            <div class="bg-blue-600 p-3 rounded-full shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <!-- Header Icon (Desktop) -->
          <div class="hidden md:flex justify-center mb-6">
            <div class="bg-blue-100 dark:bg-blue-900/40 p-4 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-10 w-10 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
          </div>

          <h1 class="text-2xl font-bold text-gray-900 dark:text-slate-100 text-center mb-1">
            Lupa Kata Sandi?
          </h1>
          <p class="text-sm text-gray-500 dark:text-slate-400 text-center mb-8">
            Masukkan email Anda untuk menerima instruksi reset kata sandi.
          </p>

          <!-- Success State -->
          <div
            v-if="step === 4"
            class="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl p-5 text-center"
          >
            <div class="flex justify-center mb-3">
              <div class="bg-green-100 dark:bg-green-800/50 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <p class="text-green-800 dark:text-green-300 font-semibold text-sm mb-1">Berhasil!</p>
            <p class="text-green-700 dark:text-green-400 text-sm">{{ successMessage }}</p>
            <RouterLink
              :to="{ name: 'login' }"
              class="inline-block mt-4 text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline"
            >
              &larr; Kembali ke halaman masuk
            </RouterLink>
          </div>

          <!-- Form Step 1: Request OTP -->
          <form v-else-if="step === 1" @submit.prevent="handleForgotPassword" class="space-y-5">
            <div
              v-if="errorMessage"
              class="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 text-sm rounded-r relative"
              role="alert"
            >
              <span class="block sm:inline">{{ errorMessage }}</span>
              <button
                type="button"
                class="absolute top-0 right-0 mt-4 mr-4 text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-200 focus:outline-none"
                @click="errorMessage = null"
                aria-label="Tutup pesan error"
              >
                <svg
                  class="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div>
              <label
                for="email"
                class="block text-sm font-bold text-blue-900 dark:text-blue-200 mb-2"
              >
                Alamat Email <span class="text-blue-600 dark:text-blue-400">*</span>
              </label>
              <input
                type="email"
                id="email"
                v-model="email"
                required
                autocomplete="email"
                class="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="nama@email.com"
                :disabled="isLoading"
              />
            </div>

            <button
              type="submit"
              class="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              :disabled="isLoading"
            >
              <span v-if="!isLoading">Kirim Kode OTP</span>
              <span v-else class="flex items-center justify-center">
                Mengirim...
              </span>
            </button>

            <div class="text-center pt-1">
              <RouterLink
                :to="{ name: 'login' }"
                class="text-sm font-medium text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:underline"
              >
                &larr; Kembali ke halaman masuk
              </RouterLink>
            </div>
          </form>

          <!-- Form Step 2: Verify OTP -->
          <form v-else-if="step === 2" @submit.prevent="handleVerifyOtp" class="space-y-5">
            <div
              v-if="errorMessage"
              class="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 text-sm rounded-r relative"
              role="alert"
            >
              <span class="block sm:inline">{{ errorMessage }}</span>
              <button
                type="button"
                class="absolute top-0 right-0 mt-4 mr-4 text-red-400 hover:text-red-600 focus:outline-none"
                @click="errorMessage = null"
              >
                Tutup
              </button>
            </div>

            <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4 text-center">
              <p class="text-sm text-blue-800 dark:text-blue-300">
                Kode OTP telah dikirim ke <strong>{{ email }}</strong>
              </p>
              <div class="mt-2 font-mono text-lg font-bold text-blue-700 dark:text-blue-400">
                {{ formattedTime }}
              </div>
              <p v-if="timeLeft === 0" class="text-xs text-red-500 mt-1">Kode OTP telah kadaluarsa</p>
            </div>

            <div>
              <label
                for="otp"
                class="block text-sm font-bold text-blue-900 dark:text-blue-200 mb-2"
              >
                Kode OTP <span class="text-blue-600 dark:text-blue-400">*</span>
              </label>
              <input
                type="text"
                id="otp"
                v-model="otp"
                required
                maxlength="6"
                class="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="000000"
                :disabled="isLoading || timeLeft === 0"
              />
            </div>

            <button
              type="submit"
              class="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="isLoading || timeLeft === 0"
            >
              <span v-if="!isLoading">Verifikasi OTP</span>
              <span v-else>Memverifikasi...</span>
            </button>

            <div class="text-center pt-2 flex flex-col space-y-3">
              <button
                v-if="timeLeft === 0"
                type="button"
                @click="handleForgotPassword"
                class="text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline disabled:opacity-50"
                :disabled="isLoading"
              >
                Kirim Ulang OTP
              </button>
              <button
                type="button"
                @click="step = 1; stopTimer()"
                class="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                :disabled="isLoading"
              >
                Ganti Email
              </button>
            </div>
          </form>

          <!-- Form Step 3: Reset Password -->
          <form v-else-if="step === 3" @submit.prevent="handleResetPassword" class="space-y-5">
            <div
              v-if="errorMessage"
              class="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 text-sm rounded-r relative"
              role="alert"
            >
              <span class="block sm:inline">{{ errorMessage }}</span>
              <button
                type="button"
                class="absolute top-0 right-0 mt-4 mr-4 text-red-400 hover:text-red-600 focus:outline-none"
                @click="errorMessage = null"
              >
                Tutup
              </button>
            </div>

            <div>
              <label for="newPassword" class="block text-sm font-bold text-blue-900 dark:text-blue-200 mb-2">
                Kata Sandi Baru <span class="text-blue-600 dark:text-blue-400">*</span>
              </label>
              <input
                type="password"
                id="newPassword"
                v-model="newPassword"
                required
                minlength="6"
                class="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Minimal 6 karakter"
                :disabled="isLoading"
              />
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-bold text-blue-900 dark:text-blue-200 mb-2">
                Konfirmasi Kata Sandi <span class="text-blue-600 dark:text-blue-400">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                v-model="confirmPassword"
                required
                minlength="6"
                class="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ketik ulang kata sandi"
                :disabled="isLoading"
              />
            </div>

            <button
              type="submit"
              class="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="isLoading"
            >
              <span v-if="!isLoading">Simpan Kata Sandi Baru</span>
              <span v-else>Menyimpan...</span>
            </button>
          </form>
        </div>

        <!-- Decorative element -->
        <div class="absolute bottom-4 right-4 hidden md:block opacity-5">
          <svg class="h-28 w-28" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import apiClient from '@/services/apiService'

const step = ref(1)
const email = ref('')
const otp = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const resetToken = ref('')

const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// Timer state
const timeLeft = ref(300) // 5 minutes in seconds
let timerInterval: ReturnType<typeof setInterval> | null = null

const formattedTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60)
  const s = timeLeft.value % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval)
  timeLeft.value = 300
  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      stopTimer()
    }
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

onUnmounted(() => {
  stopTimer()
})

const handleForgotPassword = async () => {
  if (!email.value.trim()) {
    errorMessage.value = 'Alamat email tidak boleh kosong.'
    return
  }

  isLoading.value = true
  errorMessage.value = null

  try {
    await apiClient.post('/auth/forgot-password', { email: email.value.toLowerCase().trim() })
    otp.value = '' // Reset OTP field if resending
    step.value = 2
    startTimer()
  } catch (err: any) {
    const msg = err.response?.data?.message
    if (Array.isArray(msg)) {
      errorMessage.value = msg.join(', ')
    } else if (typeof msg === 'string') {
      errorMessage.value = msg
    } else {
      errorMessage.value = 'Terjadi kesalahan. Silakan coba beberapa saat lagi.'
    }
  } finally {
    isLoading.value = false
  }
}

const handleVerifyOtp = async () => {
  if (!otp.value.trim() || otp.value.length !== 6) {
    errorMessage.value = 'Kode OTP harus 6 digit.'
    return
  }
  
  if (timeLeft.value === 0) {
    errorMessage.value = 'Kode OTP telah kadaluarsa. Silakan minta kode baru.'
    return
  }

  isLoading.value = true
  errorMessage.value = null

  try {
    const response = await apiClient.post('/auth/verify-otp', {
      email: email.value.toLowerCase().trim(),
      otp: otp.value.trim()
    })
    resetToken.value = response.data.token
    stopTimer()
    step.value = 3
  } catch (err: any) {
    const msg = err.response?.data?.message
    if (Array.isArray(msg)) {
      errorMessage.value = msg.join(', ')
    } else if (typeof msg === 'string') {
      errorMessage.value = msg
    } else {
      errorMessage.value = 'OTP tidak valid. Silakan coba lagi.'
    }
  } finally {
    isLoading.value = false
  }
}

const handleResetPassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Konfirmasi kata sandi tidak cocok.'
    return
  }
  if (newPassword.value.length < 6) {
    errorMessage.value = 'Kata sandi baru minimal 6 karakter.'
    return
  }
  
  isLoading.value = true
  errorMessage.value = null

  try {
    const response = await apiClient.post('/auth/reset-password', {
      token: resetToken.value,
      newPassword: newPassword.value
    })
    successMessage.value = response.data.message || 'Kata sandi berhasil direset. Silakan masuk dengan kata sandi baru Anda.'
    step.value = 4
  } catch (err: any) {
    const msg = err.response?.data?.message
    if (Array.isArray(msg)) {
      errorMessage.value = msg.join(', ')
    } else if (typeof msg === 'string') {
      errorMessage.value = msg
    } else {
      errorMessage.value = 'Reset kata sandi gagal. Token mungkin kadaluarsa.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.bg-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M1 6h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm0 2v10h18V8H1zM3 3h4v2H3V3zm6 0h4v2H9V3zm6 0h4v2h-4V3z'/%3E%3C/g%3E%3C/svg%3E");
}
</style>
