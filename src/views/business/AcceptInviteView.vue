<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-8 text-center">
      <!-- Loading state -->
      <div v-if="state === 'loading'" class="space-y-4">
        <LoadingSpinner :visible="true" size="lg" />
        <p class="text-slate-600 dark:text-slate-400">Memproses undangan Anda...</p>
      </div>

      <!-- Success state -->
      <div v-else-if="state === 'success'" class="space-y-4">
        <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Berhasil Bergabung!</h1>
        <p class="text-slate-600 dark:text-slate-400">{{ successData?.message }}</p>
        <div class="bg-slate-50 dark:bg-slate-700/50 rounded-md p-3 text-left space-y-1">
          <p class="text-sm text-slate-600 dark:text-slate-400">
            <span class="font-medium">Perusahaan:</span> {{ successData?.companyName }}
          </p>
          <p class="text-sm text-slate-600 dark:text-slate-400">
            <span class="font-medium">Role:</span> {{ successData?.role }}
          </p>
        </div>
        <button
          @click="goToDashboard"
          class="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
        >
          Ke Dashboard
        </button>
      </div>

      <!-- Error state -->
      <div v-else-if="state === 'error'" class="space-y-4">
        <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Undangan Gagal</h1>
        <p class="text-slate-600 dark:text-slate-400">{{ errorMsg }}</p>
        <button
          @click="goToDashboard"
          class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          Ke Dashboard
        </button>
      </div>

      <!-- No token state -->
      <div v-else class="space-y-4">
        <div class="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Link Tidak Valid</h1>
        <p class="text-slate-600 dark:text-slate-400">Link undangan tidak ditemukan atau sudah tidak valid.</p>
        <button
          @click="goToDashboard"
          class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          Ke Dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBusinessStore } from '@/stores/business'
import { BusinessService } from '@/services/business.service'
import type { AcceptInviteResponse } from '@/types/business'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

type State = 'loading' | 'success' | 'error' | 'no-token'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const businessStore = useBusinessStore()

const state = ref<State>('loading')
const errorMsg = ref('')
const successData = ref<AcceptInviteResponse | null>(null)

onMounted(async () => {
  const token = route.query.token as string | undefined

  if (!token) {
    state.value = 'no-token'
    return
  }

  // Jika belum login, simpan token di sessionStorage lalu redirect ke login
  if (!authStore.isAuthenticated) {
    sessionStorage.setItem('inviteToken', token)
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  await processAccept(token)
})

async function processAccept(token: string) {
  state.value = 'loading'
  try {
    const result = await BusinessService.acceptInvite(token)
    successData.value = result
    state.value = 'success'
    // Refresh company context
    await businessStore.fetchMyCompany()
  } catch (err: any) {
    state.value = 'error'
    const status = err.response?.status
    const msg = err.response?.data?.message
    if (status === 400 && msg?.includes('expired')) {
      errorMsg.value = 'Link undangan sudah kedaluwarsa (lebih dari 30 menit). Minta pengirim untuk mengundang ulang.'
    } else if (status === 400) {
      errorMsg.value = msg || 'Undangan sudah tidak berlaku.'
    } else if (status === 403) {
      errorMsg.value = 'Link undangan ini bukan untuk akun Anda.'
    } else if (status === 404) {
      errorMsg.value = 'Token undangan tidak ditemukan atau tidak valid.'
    } else {
      errorMsg.value = msg || 'Terjadi kesalahan. Silakan coba lagi.'
    }
  }
}

function goToDashboard() {
  router.push({ name: 'dashboard' })
}
</script>
