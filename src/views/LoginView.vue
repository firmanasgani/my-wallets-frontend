<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100 p-4">
    <!-- Card Container -->
    <div
      class="flex w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[600px]"
    >
      <!-- Left Side (Branding) -->
      <div
        class="hidden md:flex w-1/2 bg-gradient-to-br from-blue-700 to-blue-900 p-12 flex-col justify-between relative text-white"
      >
        <!-- Decoration / Noise could go here -->
        <div class="absolute inset-0 bg-pattern opacity-10"></div>

        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-2">
            <!-- Simple Logo Placeholder -->
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
          <h2 class="text-xl font-semibold text-red-100">Money Tracker and Support</h2>

          <p class="text-red-200 text-sm leading-relaxed max-w-sm">
            Track your expenses and income with ease. Manage your budget and get insights into your
            financial health.
          </p>
        </div>

        <div class="relative z-10 text-xs text-red-300">&copy; 2026 Moneytory Inc.</div>
      </div>

      <!-- Right Side (Login Form) -->
      <div class="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-white relative">
        <div class="max-w-md mx-auto w-full">
          <!-- Mobile Logo (Visible only on small screens) -->
          <div class="md:hidden flex justify-center mb-8">
            <div class="bg-red-600 p-3 rounded-full shadow-lg">
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

          <!-- Icon for Desktop Right Side -->
          <div class="hidden md:flex justify-center mb-8">
            <div class="text-blue-600">
              <!-- Decorative Icon inspired by image -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-16 w-16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 002.1 9.761.75.75 0 011.7 8.657 61.35 60.35 0 0111.7 2.805z"
                />
                <path
                  d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 001.5 1.5h1.632a1.5 1.5 0 001.5-1.5v-1.515a48.224 48.224 0 011.089.444l.34.179a1.5 1.5 0 001.5 0l.34-.179a48.224 48.224 0 011.16-.474V15.5z"
                />
              </svg>
            </div>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-6">
            <div
              v-if="errorMessage"
              class="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 text-sm rounded-r relative"
              role="alert"
            >
              <span class="block sm:inline">{{ errorMessage }}</span>
              <svg
                class="absolute top-0 right-0 mt-4 mr-4 h-4 w-4 cursor-pointer text-blue-400 hover:text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                @click="errorMessage = null"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>

            <div class="space-y-5">
              <!-- Nama Field -->
              <div>
                <label for="login-field" class="block text-sm font-bold text-blue-900 mb-2"
                  >Nama</label
                >
                <input
                  type="text"
                  id="login-field"
                  v-model="loginField"
                  class="block w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Nama"
                />
              </div>

              <!-- Password Field -->
              <div>
                <label for="password" class="block text-sm font-bold text-blue-900 mb-2"
                  >Kata Sandi</label
                >
                <div class="relative">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    id="password"
                    v-model="password"
                    class="block w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                    placeholder="Kata Sandi"
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center pr-4">
                    <button
                      type="button"
                      @click="showPassword = !showPassword"
                      class="text-blue-700 hover:text-blue-900 focus:outline-none"
                    >
                      <svg
                        v-if="!showPassword"
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Login Button -->
            <button
              type="submit"
              class="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
              :disabled="isLoading"
            >
              <span v-if="!isLoading">Masuk</span>
              <span v-else class="flex items-center justify-center">
                <svg
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Memproses...
              </span>
            </button>

            <!-- Links -->
            <div class="flex flex-col space-y-3 pt-2 text-center">
              <button
                type="button"
                class="text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline"
              >
                Lupa Password?
              </button>

              <p class="text-sm text-gray-500">
                Belum punya akun?
                <RouterLink to="/register" class="font-bold text-blue-700 hover:text-blue-900">
                  Daftar disini
                </RouterLink>
              </p>
            </div>
          </form>
        </div>

        <!-- Decoration on white side -->
        <div class="absolute bottom-4 right-4 hidden md:block opacity-5">
          <svg class="h-32 w-32" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const loginField = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const handleLogin = async () => {
  if (!loginField.value.trim() || !password.value.trim()) {
    errorMessage.value = 'Nama dan Kata Sandi tidak boleh kosong.'
    isLoading.value = false
    return
  }

  isLoading.value = true
  errorMessage.value = null

  try {
    await authStore.login({
      login: loginField.value,
      password: password.value,
    })
    // Navigate done in store or router guard usually
  } catch (error: any) {
    errorMessage.value =
      error.message || 'Login gagal. Silakan cek kembali nama dan kata sandi Anda.'
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
