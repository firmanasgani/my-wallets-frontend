<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold leading-7 text-slate-900 sm:truncate">Pengaturan</h1>
      <p class="mt-1 text-sm text-slate-500">Kelola preferensi dan langganan akun Anda.</p>
    </div>

    <div v-if="currentView === 'main'" class="space-y-6">
      <!-- Subscription Section -->
      <div class="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
        <div
          class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center"
        >
          <h3 class="text-lg font-medium text-slate-900">Langganan & Paket</h3>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="isFree ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'"
          >
            {{ isFree ? 'Paket Free' : 'Paket Premium' }}
          </span>
        </div>
        <div class="p-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p class="text-sm text-slate-600 mb-2">
                Status paket Anda saat ini adalah
                <strong>{{ authStore.currentUser?.subscriptionPlan }}</strong
                >.
              </p>
              <ul class="text-sm text-slate-500 list-disc list-inside space-y-1">
                <li v-if="isFree">Maksimal 4 Akun Dompet/Bank</li>
                <li v-if="isFree">Maksimal 10 Kategori Anggaran (Total)</li>
                <li v-if="isFree">Laporan Terbatas</li>
                <li v-if="!isFree">Unlimited Akun & Anggaran</li>
                <li v-if="!isFree">Export Laporan PDF/Excel</li>
              </ul>
            </div>
            <div v-if="isFree">
              <button
                type="button"
                @click="openPricingModal"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Upgrade ke Premium
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- General Settings (Pengaturan Umum) -->
      <div class="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 class="text-lg font-medium text-slate-900">Pengaturan Umum</h3>
        </div>
        <div class="p-6 space-y-6">
          <div
            @click="currentView = 'recurring'"
            class="flex items-center justify-between cursor-pointer hover:bg-slate-50 -mx-6 px-6 py-2 transition-colors"
          >
            <div>
              <label class="text-sm font-medium text-slate-700 cursor-pointer"
                >Transaksi Berulang</label
              >
              <p class="text-xs text-slate-500">Atur dan kelola transaksi otomatis Anda.</p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-slate-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>

          <div class="border-t border-slate-100 pt-6 flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-slate-700">Tema Tampilan</label>
              <p class="text-xs text-slate-500">Pilih tema terang atau gelap.</p>
            </div>
            <select
              class="mt-1 block w-40 pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option>Terang</option>
              <option>Gelap (Soon)</option>
              <option>Sistem</option>
            </select>
          </div>

          <div class="border-t border-slate-100 pt-6 flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-slate-700">Bahasa</label>
              <p class="text-xs text-slate-500">Bahasa yang digunakan dalam aplikasi.</p>
            </div>
            <select
              class="mt-1 block w-40 pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option>Indonesia</option>
              <option>English (Soon)</option>
            </select>
          </div>

          <div class="border-t border-slate-100 pt-6 flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-slate-700">Mata Uang Utama</label>
              <p class="text-xs text-slate-500">Mata uang default untuk transaksi.</p>
            </div>
            <select
              disabled
              class="mt-1 block w-40 pl-3 pr-10 py-2 text-base bg-slate-100 border-slate-300 text-slate-500 sm:text-sm rounded-md cursor-not-allowed"
            >
              <option>IDR (Rupiah)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Data & Privacy -->
      <div class="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 class="text-lg font-medium text-slate-900">Data & Keamanan</h3>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-700">Export Semua Data Transaksi (CSV)</span>
            <button class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              Download
            </button>
          </div>
          <div class="border-t border-slate-100 pt-4 flex items-center justify-between">
            <span class="text-sm text-slate-700">Ubah Password & Keamanan Akun</span>
            <RouterLink
              :to="{ name: 'profile' }"
              class="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >Ke Profil &rarr;</RouterLink
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Recurring Transactions Sub-View -->
    <!-- Recurring Transactions Sub-View -->
    <div v-else-if="currentView === 'recurring'" class="space-y-6">
      <RecurringTransactionsList @back="currentView = 'main'" />
    </div>

    <!-- Pricing Modal -->
    <PricingModal
      :isOpen="isPricingModalOpen"
      @update:isOpen="isPricingModalOpen = $event"
      @select-plan="handlePlanSelection"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import PricingModal from '@/components/common/PricingModal.vue'
import RecurringTransactionsList from '@/components/settings/RecurringTransactionsList.vue'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const isPricingModalOpen = ref(false)
const currentView = ref<'main' | 'recurring'>('main')

onMounted(() => {
  if (route.query.upgrade === 'true') {
    openPricingModal()
    router.replace({ query: {} }) // Clean up URL
  }
})

const isFree = computed(() => {
  return authStore.currentUser?.subscriptionPlan === 'FREE'
})

const openPricingModal = () => {
  isPricingModalOpen.value = true
}

const handlePlanSelection = async (plan: string) => {
  if (plan === 'PREMIUM') {
    // Modal has already handled payment success
    // Update local state to reflect upgrade immediately for demo
    if (authStore.currentUser) {
      const updatedUser = { ...authStore.currentUser, subscriptionPlan: 'PREMIUM' as const }
      authStore.setUser(updatedUser)
    }
  }
}
</script>
