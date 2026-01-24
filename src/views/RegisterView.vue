<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100">
    <div>
      <img src="@/assets/dompet.png" alt="Logo" class="w-32 h-32" />
    </div>
    <div>
      <h2 class="text-3xl font-semibold text-center">Welcome to My Wallets</h2>
      <p class="text-lg text-gray-600 mb-4">Buat akun baru untuk melanjutkan.</p>
    </div>

    <form class="bg-white rounded-lg shadow-lg p-8 w-96" @submit.prevent="handleRegister">
      <h1 class="text-3xl font-semibold text-center mb-4">Register</h1>
      
      <!-- Error Messages -->
      <div
        v-if="authStore.authError || clientSideError"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
        role="alert"
      >
        <span class="block sm:inline text-sm">{{ authStore.authError || clientSideError }}</span>
        <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
          <svg
            class="fill-current h-6 w-6 text-red-700"
            role="button"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            @click="clearErrors"
          >
            <title>Close</title>
            <path
              d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"
            />
          </svg>
        </span>
      </div>

      <div class="space-y-4">
        <!-- Full Name Field -->
        <div>
          <label for="fullName" class="block text-sm font-medium text-gray-700">
            Nama Lengkap (Opsional)
          </label>
          <input
            type="text"
            id="fullName"
            v-model="formData.fullName"
            class="border border-gray-300 rounded-lg block w-full px-3 py-2"
            placeholder="Masukkan nama lengkap"
          />
        </div>

        <!-- Username Field -->
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">
            Username <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="username"
            v-model="formData.username"
            required
            class="border border-gray-300 rounded-lg block w-full px-3 py-2"
            placeholder="Masukkan username"
          />
        </div>

        <!-- Email Field -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">
            Email <span class="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            v-model="formData.email"
            required
            class="border border-gray-300 rounded-lg block w-full px-3 py-2"
            placeholder="Masukkan email"
          />
        </div>

        <!-- Password Field with Eye Toggle -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">
            Password <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="formData.password"
              required
              class="border border-gray-300 rounded-lg block w-full px-3 py-2 pr-10"
              placeholder="Min. 8 karakter"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              <svg
                v-if="!showPassword"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Confirm Password Field with Eye Toggle -->
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
            Konfirmasi Password <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              id="confirmPassword"
              v-model="formData.confirmPassword"
              required
              class="border border-gray-300 rounded-lg block w-full px-3 py-2 pr-10"
              placeholder="Ulangi password"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              <svg
                v-if="!showConfirmPassword"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg w-full"
          :disabled="authStore.authIsLoading"
        >
          {{ authStore.authIsLoading ? 'Memproses...' : 'Daftar' }}
        </button>
      </div>

      <p class="mt-4 text-center">
        Sudah punya akun?
        <RouterLink to="/login" class="text-blue-500 hover:text-blue-600">
          Masuk di sini
        </RouterLink>
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

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

const clientSideError = ref<string | null>(null)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

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
    await authStore.register(payload)
  } catch (error) {
    console.error('Component-level registration error:', error)
  }
}
</script>

