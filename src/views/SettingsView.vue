<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:truncate">
        Pengaturan
      </h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Kelola preferensi dan langganan akun Anda.
      </p>
    </div>

    <div v-if="currentView === 'main'" class="space-y-6">
      <!-- Subscription Section -->
      <div
        class="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div
          class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center"
        >
          <h3 class="text-lg font-medium text-slate-900 dark:text-white">Langganan & Paket</h3>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="isFree ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-emerald-300' : isBusiness ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'"
          >
            {{ isFree ? 'Paket Free' : isBusiness ? 'Paket Business' : 'Paket Premium' }}
          </span>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <p class="text-sm text-slate-600 dark:text-slate-300 mb-2">
              Status paket Anda saat ini adalah
              <strong class="dark:text-white">{{
                authStore.currentUser?.subscriptionPlan
              }}</strong
              >.
            </p>
            <ul
              class="text-sm text-slate-500 dark:text-slate-400 list-disc list-inside space-y-1"
            >
              <li v-if="isFree">Maksimal 4 Akun Dompet/Bank</li>
              <li v-if="isFree">Maksimal 10 Kategori Anggaran (Total)</li>
              <li v-if="isFree">Laporan Terbatas</li>
              <li v-if="!isFree">Unlimited Akun & Anggaran</li>
              <li v-if="!isFree">Export Laporan PDF/Excel</li>
              <li v-if="isBusiness">Multi-user & Manajemen Member (hingga 5 member)</li>
              <li v-if="isBusiness">Chart of Accounts & Pembukuan</li>
            </ul>
          </div>

          <!-- Scheduled downgrade/cancel notice -->
          <div
            v-if="scheduledPlanCode"
            class="rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
          >
            <p class="text-sm text-amber-800 dark:text-amber-300">
              Paket Anda akan berubah menjadi <strong>{{ scheduledPlanName }}</strong> pada
              {{ formattedCurrentEndDate }}.
            </p>
            <button
              type="button"
              @click="handleUndoDowngrade"
              :disabled="isUndoing"
              class="text-sm font-semibold text-amber-800 dark:text-amber-300 underline hover:no-underline disabled:opacity-50 whitespace-nowrap"
            >
              {{ isUndoing ? 'Memproses...' : 'Batalkan Perubahan' }}
            </button>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap gap-3">
            <button
              v-if="!isFree"
              type="button"
              @click="goToCheckout('renew')"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Perpanjang
            </button>
            <button
              v-if="canUpgrade"
              type="button"
              @click="goToCheckout('upgrade')"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#2E8B57] hover:bg-[#236B43] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              {{ isFree ? 'Upgrade ke Premium' : 'Upgrade' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Company Info (business member only) -->
      <div
        v-if="isBusiness && businessStore.currentCompany"
        class="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
          <h3 class="text-lg font-medium text-slate-900 dark:text-white">Perusahaan</h3>
          <RouterLink
            :to="{ name: 'business-settings' }"
            class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
          >Lihat Detail</RouterLink>
        </div>
        <div class="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div class="flex-1">
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ businessStore.currentCompany.name }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ businessStore.currentCompany.email || businessStore.currentCompany.phone || '-' }}</p>
          </div>
          <span
            v-if="businessStore.myRole"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="{
              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300': businessStore.myRole === 'OWNER',
              'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-emerald-300': businessStore.myRole === 'ADMIN',
              'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300': businessStore.myRole === 'STAFF',
              'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400': businessStore.myRole === 'VIEWER',
            }"
          >{{ businessStore.myRole }}</span>
        </div>
      </div>

      <div
        class="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div
          class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
        >
          <h3 class="text-lg font-medium text-slate-900 dark:text-white">Pengaturan Umum</h3>
        </div>
        <div class="p-6 space-y-6">
          <div
            @click="currentView = 'recurring'"
            class="flex items-center justify-between cursor-pointer hover:bg-slate-50 -mx-6 px-6 py-2 transition-colors"
          >
            <div class="dark:text-slate-200">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                >Transaksi Berulang</label
              >
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Atur dan kelola transaksi otomatis Anda.
              </p>
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

          <div
            @click="currentView = 'payment-history'"
            class="border-t border-slate-100 dark:border-slate-700 pt-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 -mx-6 px-6 py-2 transition-colors"
          >
            <div class="dark:text-slate-200">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                >Histori Pembayaran</label
              >
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Lihat riwayat pembelian paket langganan Anda.
              </p>
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

          <div
            class="border-t border-slate-100 dark:border-slate-700 pt-6 flex items-center justify-between"
          >
            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300"
                >Tema Tampilan</label
              >
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Pilih tema terang atau gelap.
              </p>
            </div>
            <select
              :value="themeStore.theme"
              @change="onThemeChange"
              class="mt-1 block w-40 pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
              <option value="light">Terang</option>
              <option value="dark">Gelap</option>
              <option value="system">Sistem</option>
            </select>
          </div>

          <div
            class="border-t border-slate-100 dark:border-slate-700 pt-6 flex items-center justify-between"
          >
            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Bahasa</label>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Bahasa yang digunakan dalam aplikasi.
              </p>
            </div>
            <select
              class="mt-1 block w-40 pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md dark:bg-slate-700 dark:text-white"
            >
              <option>Indonesia</option>
              <option>English (Soon)</option>
            </select>
          </div>

          <div
            class="border-t border-slate-100 dark:border-slate-700 pt-6 flex items-center justify-between"
          >
            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300"
                >Mata Uang Utama</label
              >
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Mata uang default untuk transaksi.
              </p>
            </div>
            <select
              disabled
              class="mt-1 block w-40 pl-3 pr-10 py-2 text-base bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 sm:text-sm rounded-md cursor-not-allowed"
            >
              <option>IDR (Rupiah)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Data & Privacy -->
      <div
        class="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div
          class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
        >
          <h3 class="text-lg font-medium text-slate-900 dark:text-white">Data & Keamanan</h3>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-700 dark:text-slate-300"
              >Export Semua Data Transaksi (CSV)</span
            >
            <button
              class="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm font-medium"
            >
              Download
            </button>
          </div>
          <div
            class="border-t border-slate-100 dark:border-slate-700 pt-4 flex items-center justify-between"
          >
            <span class="text-sm text-slate-700 dark:text-slate-300"
              >Ubah Password & Keamanan Akun</span
            >
            <RouterLink
              :to="{ name: 'profile' }"
              class="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm font-medium"
              >Ke Profil &rarr;</RouterLink
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Recurring Transactions Sub-View -->
    <div v-else-if="currentView === 'recurring'" class="space-y-6">
      <RecurringTransactionsList @back="currentView = 'main'" />
    </div>

    <!-- Payment History Sub-View -->
    <div v-else-if="currentView === 'payment-history'" class="space-y-6">
      <PaymentHistorySection @back="currentView = 'main'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useBusinessStore } from '@/stores/business'
import { useSubscriptionStore } from '@/stores/subscriptions'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import RecurringTransactionsList from '@/components/settings/RecurringTransactionsList.vue'
import PaymentHistorySection from '@/components/settings/PaymentHistorySection.vue'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const businessStore = useBusinessStore()
const subscriptionStore = useSubscriptionStore()
const route = useRoute()
const router = useRouter()
const currentView = ref<'main' | 'recurring' | 'payment-history'>('main')
const isUndoing = ref(false)

onMounted(async () => {
  if (subscriptionStore.plans.length === 0) {
    subscriptionStore.fetchPlans()
  }
  if (route.query.upgrade === 'true') {
    router.replace({ name: 'subscription-checkout', query: { action: 'upgrade' } })
    return
  }
  if (isBusiness.value) {
    if (!businessStore.isCompanyLoaded) await businessStore.fetchMyCompany().catch(() => {})
    if (!businessStore.members.length) await businessStore.fetchMembers().catch(() => {})
  }
})

const isFree = computed(() => {
  return authStore.currentUser?.subscriptionPlan === 'FREE'
})

const isBusiness = computed(() => {
  return authStore.currentUser?.subscriptionPlan?.startsWith('BUSINESS') ?? false
})

const currentPlanCode = computed(() => authStore.currentUser?.activeSubscription?.planCode ?? 'FREE')

// The Upgrade page lets a user pick any other plan (higher or lower —
// picking lower behaves as a downgrade), so this just checks there is
// something else to switch to.
const canUpgrade = computed(() => subscriptionStore.plans.some((p) => p.code !== currentPlanCode.value))

const scheduledPlanCode = computed(() => authStore.currentUser?.activeSubscription?.scheduledPlanCode ?? null)
const scheduledPlanName = computed(() => authStore.currentUser?.activeSubscription?.scheduledPlanName ?? null)
const formattedCurrentEndDate = computed(() => {
  const endDate = authStore.currentUser?.activeSubscription?.endDate
  if (!endDate) return '-'
  return new Date(endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
})

const goToCheckout = (action: 'renew' | 'upgrade') => {
  router.push({ name: 'subscription-checkout', query: { action } })
}

const handleUndoDowngrade = async () => {
  isUndoing.value = true
  try {
    await subscriptionStore.cancelScheduledDowngrade()
    await authStore.fetchUserProfile()
  } catch (err: any) {
    alert(err.message || 'Gagal membatalkan perubahan paket.')
  } finally {
    isUndoing.value = false
  }
}

const onThemeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  themeStore.setTheme(target.value as any)
}
</script>
