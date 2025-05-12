<template>
  <div class="flex items-center justify-center min-h-screen bg-slate-100 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-slate-900">Buat Akun Baru</h2>
        <p class="mt-2 text-center text-sm text-slate-600">
          Sudah punya akun?
          <RouterLink to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
            Masuk di sini
          </RouterLink>
        </p>
      </div>

      <form
        class="mt-8 space-y-6 bg-white p-6 sm:p-8 rounded-xl shadow-2xl"
        @submit.prevent="handleRegister"
      >
        <div v-if="authStore.authError" class="rounded-md bg-red-50 p-4 mb-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ authStore.authError }}</h3>
            </div>
          </div>
        </div>

        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="fullName" class="sr-only">Nama Lengkap</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              v-model="formData.fullName"
              class="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Nama Lengkap (Opsional)"
            />
          </div>
          <div>
            <label for="username" class="sr-only">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              v-model="formData.username"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Username"
            />
          </div>
          <div>
            <label for="email" class="sr-only">Alamat Email</label>
            <input
              id="email"
              name="email"
              type="email"
              v-model="formData.email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Alamat Email"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              v-model="formData.password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Password (min. 8 karakter)"
            />
          </div>
          <div>
            <label for="confirmPassword" class="sr-only">Konfirmasi Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              v-model="formData.confirmPassword"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Konfirmasi Password"
            />
          </div>
        </div>

        <p v-if="clientSideError" class="text-sm text-red-600">{{ clientSideError }}</p>

        <div>
          <button
            type="submit"
            :disabled="authStore.authIsLoading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg
                class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
            {{ authStore.authIsLoading ? 'Memproses...' : 'Daftar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue' // Hapus useRouter jika sudah dihandle store
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // Impor auth store

const authStore = useAuthStore() // Gunakan store

interface RegisterFormData {
  fullName?: string | null
  username: string
  email: string
  password: string
  confirmPassword: string
}

const formData = reactive<RegisterFormData>({
  fullName: '', // Default ke string kosong agar lebih mudah divalidasi jika perlu
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const clientSideError = ref<string | null>(null) // Untuk error validasi sisi klien

const handleRegister = async () => {
  clientSideError.value = null // Reset client-side error
  authStore.error = null // Reset server-side error dari store

  if (formData.password !== formData.confirmPassword) {
    clientSideError.value = 'Password dan Konfirmasi Password tidak cocok.'
    return
  }
  if (formData.password.length < 8) {
    clientSideError.value = 'Password minimal harus 8 karakter.'
    return
  }
  // Validasi lain di sisi klien bisa ditambahkan di sini

  try {
    // Hanya kirim field yang relevan, tanpa confirmPassword
    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName || null, // Kirim null jika kosong
    }
    await authStore.register(payload)
    // Navigasi ke login sudah dihandle di dalam action store
    // alert('Registrasi berhasil! Silakan cek email Anda (jika ada verifikasi) atau langsung login.'); // Pesan bisa dari store juga
  } catch (error) {
    // Error sudah dihandle dan disimpan di authStore.error, yang akan ditampilkan di template
    // Jika ingin log tambahan di sini:
    console.error('Component-level registration error:', error)
    // Tidak perlu set clientSideError di sini karena authStore.error akan menampilkan error dari server
  }
}
</script>
