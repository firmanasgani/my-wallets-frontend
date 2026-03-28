<template>
  <div>
    <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Workspace</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

      <!-- Personal Card -->
      <button @click="selectPersonal" :class="cardClass(wsStore.mode === 'personal')">
        <div class="flex items-start justify-between gap-3">
          <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span v-if="wsStore.mode === 'personal'" class="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">Aktif</span>
        </div>
        <div class="mt-3 text-left">
          <p class="font-semibold text-slate-800 dark:text-slate-100">Keuangan Pribadi</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pengeluaran, tabungan & anggaran</p>
        </div>
        <div class="mt-3 flex flex-wrap gap-1.5">
          <span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">Free</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">Premium</span>
        </div>
      </button>

      <!-- Business Card -->
      <button @click="selectBusiness" :class="cardClass(wsStore.mode === 'business' && isBusinessPlan)">
        <div class="flex items-start justify-between gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span v-if="wsStore.mode === 'business' && isBusinessPlan" class="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">Aktif</span>
          <span v-else-if="!isBusinessPlan" class="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Terkunci
          </span>
        </div>
        <div class="mt-3 text-left">
          <p class="font-semibold text-slate-800 dark:text-slate-100">Bisnis</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Invoice, akuntansi & manajemen perusahaan</p>
        </div>
        <div class="mt-3">
          <span v-if="!isBusinessPlan" class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Upgrade ke Business →
          </span>
          <span v-else class="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">Business</span>
        </div>
      </button>
    </div>

    <PricingModal :is-open="upgradeOpen" :business-only="true" @update:is-open="upgradeOpen = $event" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkspaceStore } from '@/stores/workspace'
import { useAuthStore } from '@/stores/auth'
import PricingModal from '@/components/common/PricingModal.vue'

const wsStore = useWorkspaceStore()
const authStore = useAuthStore()
const router = useRouter()

const upgradeOpen = ref(false)
const isBusinessPlan = computed(() => authStore.currentUser?.subscriptionPlan?.startsWith('BUSINESS') ?? false)

const cardClass = (active: boolean) => [
  'group text-left w-full rounded-xl border-2 p-5 transition-all',
  active
    ? 'border-emerald-500 bg-indigo-50 dark:bg-emerald-900/20'
    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-300 dark:hover:border-[#2E8B57]',
]

function selectPersonal() {
  wsStore.setMode('personal')
  router.push({ name: 'personal-dashboard' })
}

function selectBusiness() {
  if (!isBusinessPlan.value) {
    upgradeOpen.value = true
    return
  }
  wsStore.setMode('business')
  router.push({ name: 'business-invoices' })
}
</script>
