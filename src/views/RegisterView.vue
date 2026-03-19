<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
    <!-- Card Container -->
    <div
      class="flex w-full max-w-5xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden min-h-[550px]"
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
          <h1 class="text-4xl font-extrabold leading-tight">Create an Account</h1>

          <h2 class="text-xl font-semibold text-blue-100">Start Your Financial Journey</h2>

          <p class="text-blue-200 text-sm leading-relaxed max-w-sm">
            Create an account to track expenses, manage budgets, and gain insights into your
            financial health.
          </p>
        </div>

        <div class="relative z-10 text-xs text-blue-300">&copy; 2026 My Wallets Inc.</div>
      </div>

      <!-- Right Side (Register Form) -->
      <div
        class="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-white dark:bg-slate-800 relative overflow-y-auto max-h-[90vh]"
      >
        <div class="max-w-md mx-auto w-full py-4">
          <!-- Mobile Logo -->
          <div class="md:hidden flex justify-center mb-6">
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08-.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <h2 class="text-2xl font-bold text-gray-800 dark:text-white text-center mb-6">Buat Akun Baru</h2>

          <!-- Invite Success Panel -->
          <div
            v-if="registrationSuccess"
            class="flex flex-col items-center gap-4 py-8 text-center"
          >
            <div class="bg-green-100 dark:bg-green-900/30 rounded-full p-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800 dark:text-white">Akun Berhasil Dibuat!</h3>
            <p class="text-sm text-gray-600 dark:text-slate-300 max-w-xs">
              Hubungi admin yang mengundangmu untuk mengirim ulang undangan ke
              <span class="font-semibold text-blue-700 dark:text-blue-400">{{ formData.email }}</span>.
              Setelah undangan dikirim, cek emailmu untuk menerima akses ke company.
            </p>
            <button
              @click="router.push({ name: 'login' })"
              class="mt-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-6 rounded-lg transition-all"
            >
              Masuk ke Akun
            </button>
          </div>

          <!-- Error Message -->
          <div
            v-if="!registrationSuccess && (authStore.authError || clientSideError)"
            class="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 text-blue-700 dark:text-blue-300 p-3 text-sm rounded-r relative shadow-sm mb-4"
            role="alert"
          >
            <span class="block sm:inline">{{ authStore.authError || clientSideError }}</span>
            <svg
              class="absolute top-0 right-0 mt-3 mr-3 h-4 w-4 cursor-pointer text-blue-400 hover:text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              @click="clearErrors"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </div>

          <form v-if="!registrationSuccess" @submit.prevent="handleRegister" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Full Name -->
            <div>
              <label for="fullName" class="block text-sm font-bold text-blue-900 dark:text-blue-200 mb-1"
                >Nama Lengkap (Opsional)</label
              >
              <input
                type="text"
                id="fullName"
                v-model="formData.fullName"
                class="block w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Contoh: Budi Santoso"
              />
            </div>

            <!-- Username -->
            <div>
              <label for="username" class="block text-sm font-bold text-blue-900 dark:text-blue-200 mb-1"
                >Username <span class="text-blue-600 dark:text-blue-400">*</span></label
              >
              <input
                type="text"
                id="username"
                v-model="formData.username"
                required
                class="block w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Username unik"
              />
            </div>

            <!-- Email -->
            <div class="md:col-span-2">
              <label for="email" class="block text-sm font-bold text-blue-900 dark:text-blue-200 mb-1"
                >Email <span class="text-blue-600 dark:text-blue-400">*</span></label
              >
              <input
                type="email"
                id="email"
                v-model="formData.email"
                required
                :readonly="emailReadonly"
                :class="[
                  'block w-full px-4 py-2.5 rounded-lg border text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
                  emailReadonly
                    ? 'border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-600 cursor-not-allowed'
                    : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700',
                ]"
                placeholder="nama@email.com"
              />
              <p v-if="emailReadonly" class="mt-1 text-xs text-gray-500 dark:text-slate-400">
                Email ini ditetapkan dari undangan dan tidak dapat diubah.
              </p>
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-bold text-blue-900 dark:text-blue-200 mb-1"
                >Kata Sandi <span class="text-blue-600 dark:text-blue-400">*</span></label
              >
              <div class="relative">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  v-model="formData.password"
                  @input="checkPassword"
                  required
                  class="block w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                  placeholder="Min. 8 karakter"
                />
                <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="text-gray-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
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
              <div class="mt-2 text-xs text-gray-600 dark:text-slate-400 space-y-1" v-if="formData.password">
                <p>Syarat Kata Sandi:</p>
                <ul class="list-disc list-inside pl-2">
                  <li
                    :class="
                      passwordCriteria.minLength ? 'text-green-600 dark:text-green-400 font-bold' : 'text-gray-500 dark:text-slate-500'
                    "
                  >
                    Min. 8 Karakter
                  </li>
                  <li
                    :class="
                      passwordCriteria.hasUpper ? 'text-green-600 dark:text-green-400 font-bold' : 'text-gray-500 dark:text-slate-500'
                    "
                  >
                    Huruf Besar (A-Z)
                  </li>
                  <li
                    :class="
                      passwordCriteria.hasNumber ? 'text-green-600 dark:text-green-400 font-bold' : 'text-gray-500 dark:text-slate-500'
                    "
                  >
                    Angka (0-9)
                  </li>
                  <li
                    :class="
                      passwordCriteria.hasSpecial ? 'text-green-600 dark:text-green-400 font-bold' : 'text-gray-500 dark:text-slate-500'
                    "
                  >
                    Karakter Spesial (!@#...)
                  </li>
                </ul>
              </div>
            </div>

            <!-- Confirm Password -->
            <div>
              <label for="confirmPassword" class="block text-sm font-bold text-blue-900 dark:text-blue-200 mb-1"
                >Konfirmasi Kata Sandi <span class="text-blue-600 dark:text-blue-400">*</span></label
              >
              <div class="relative">
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  id="confirmPassword"
                  v-model="formData.confirmPassword"
                  @input="checkMatch"
                  required
                  class="block w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                  placeholder="Ulangi kata sandi"
                />
                <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="text-gray-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
                  >
                    <svg
                      v-if="!showConfirmPassword"
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
              <div v-if="formData.confirmPassword" class="mt-2 text-xs">
                <span
                  v-if="passwordMatchStatus === 'match'"
                  class="text-green-600 dark:text-green-400 flex items-center"
                >
                  <i class="fa-solid fa-circle-check mr-1"></i> Kata sandi cocok
                </span>
                <span
                  v-else-if="passwordMatchStatus === 'mismatch'"
                  class="text-red-500 dark:text-red-400 flex items-center"
                >
                  <i class="fa-solid fa-circle-xmark mr-1"></i> Kata sandi tidak cocok
                </span>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="md:col-span-2 w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
              :disabled="authStore.authIsLoading"
            >
              <span v-if="!authStore.authIsLoading">Daftar</span>
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

            <!-- Login Link -->
            <div class="md:col-span-2 text-center mt-2">
              <p class="text-sm text-gray-500 dark:text-slate-400">
                Sudah punya akun?
                <RouterLink to="/login" class="font-bold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                  Masuk di sini
                </RouterLink>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

interface RegisterFormData {
  fullName?: string | null
  username: string
  email: string
  password: string
  confirmPassword: string
}

const formData = reactive<RegisterFormData>({
  fullName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const isInviteFlow = ref(false)
const emailReadonly = ref(false)
const registrationSuccess = ref(false)

onMounted(() => {
  const emailParam = route.query.email as string | undefined
  if (emailParam) {
    formData.email = emailParam
    emailReadonly.value = true
  }
  if (route.query.ref === 'invite') {
    isInviteFlow.value = true
  }
})

const clientSideError = ref<string | null>(null)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const passwordCriteria = reactive({
  minLength: false,
  hasUpper: false,
  hasNumber: false,
  hasSpecial: false,
})

const passwordMatchStatus = ref<'idle' | 'match' | 'mismatch'>('idle')

const checkPassword = () => {
  const p = formData.password
  passwordCriteria.minLength = p.length >= 8
  passwordCriteria.hasUpper = /[A-Z]/.test(p)
  passwordCriteria.hasNumber = /[0-9]/.test(p)
  passwordCriteria.hasSpecial = /[^A-Za-z0-9]/.test(p)

  if (formData.confirmPassword) {
    checkMatch()
  }
}

const checkMatch = () => {
  if (!formData.confirmPassword) {
    passwordMatchStatus.value = 'idle'
    return
  }
  passwordMatchStatus.value = formData.password === formData.confirmPassword ? 'match' : 'mismatch'
}

const clearErrors = () => {
  clientSideError.value = null
  authStore.error = null
}

const handleRegister = async () => {
  clientSideError.value = null
  authStore.error = null

  if (formData.password !== formData.confirmPassword) {
    clientSideError.value = 'Password dan Konfirmasi Password tidak cocok.'
    return
  }
  if (formData.password.length < 8) {
    clientSideError.value = 'Password minimal harus 8 karakter.'
    return
  }

  try {
    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName || null,
    }
    await authStore.register(payload, { skipRedirect: isInviteFlow.value })
    if (isInviteFlow.value) {
      registrationSuccess.value = true
    }
  } catch (error) {
    console.error('Component-level registration error:', error)
  }
}
</script>

<style scoped>
.bg-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M1 6h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm0 2v10h18V8H1zM3 3h4v2H3V3zm6 0h4v2H9V3zm6 0h4v2h-4V3z'/%3E%3C/g%3E%3C/svg%3E");
}
</style>
