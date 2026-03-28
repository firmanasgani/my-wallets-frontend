<template>
  <ul class="space-y-1">
    <li>
      <RouterLink :to="{ name: 'dashboard' }" @click="emit('navigate')" :class="link('dashboard')">
        Workspace
      </RouterLink>
    </li>
    <li>
      <RouterLink :to="{ name: 'personal-dashboard' }" @click="emit('navigate')" :class="link('personal-dashboard')">
        Dashboard
      </RouterLink>
    </li>

    <!-- Master Data -->
    <li>
      <button @click="masterOpen = !masterOpen" :class="dropbtn(isMasterActive)">
        Master Data
        <svg :class="['h-4 w-4 transition-transform', masterOpen ? 'rotate-180' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div v-show="masterOpen" class="pl-4 space-y-1 mt-1">
        <RouterLink :to="{ name: 'accounts-list' }" @click="emit('navigate')" :class="link(['accounts-list', 'account-create', 'account-edit'])">Akun</RouterLink>
        <RouterLink :to="{ name: 'categories-list' }" @click="emit('navigate')" :class="link('categories-list')">Kategori</RouterLink>
      </div>
    </li>

    <li>
      <RouterLink :to="{ name: 'transactions-list' }" @click="emit('navigate')" :class="link('transactions-list')">
        Transaksi
      </RouterLink>
    </li>

    <!-- Budget (premium only) -->
    <li v-if="!isFreePlan">
      <button @click="budgetOpen = !budgetOpen" :class="dropbtn(isBudgetActive)">
        Budget
        <svg :class="['h-4 w-4 transition-transform', budgetOpen ? 'rotate-180' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div v-show="budgetOpen" class="pl-4 space-y-1 mt-1">
        <RouterLink :to="{ name: 'budget-setup' }" @click="emit('navigate')" :class="link('budget-setup')">Setup</RouterLink>
        <RouterLink :to="{ name: 'budget-report' }" @click="emit('navigate')" :class="link('budget-report')">Laporan</RouterLink>
      </div>
    </li>

    <!-- Analisis (premium only) -->
    <li v-if="!isFreePlan">
      <button @click="analysisOpen = !analysisOpen" :class="dropbtn(isAnalysisActive)">
        Analisis & Target
        <svg :class="['h-4 w-4 transition-transform', analysisOpen ? 'rotate-180' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div v-show="analysisOpen" class="pl-4 space-y-1 mt-1">
        <RouterLink :to="{ name: 'spending-analysis' }" @click="emit('navigate')" :class="link('spending-analysis')">Spending Analysis</RouterLink>
        <RouterLink :to="{ name: 'financial-goals-list' }" @click="emit('navigate')" :class="link(['financial-goals-list', 'financial-goal-detail'])">Financial Goals</RouterLink>
      </div>
    </li>

    <!-- Bantuan & Sistem -->
    <li>
      <button @click="systemOpen = !systemOpen" :class="dropbtn(isSystemActive)">
        Bantuan & Sistem
        <svg :class="['h-4 w-4 transition-transform', systemOpen ? 'rotate-180' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div v-show="systemOpen" class="pl-4 space-y-1 mt-1">
        <RouterLink :to="{ name: 'settings' }" @click="emit('navigate')" :class="link('settings')">Pengaturan</RouterLink>
        <RouterLink :to="{ name: 'how-to' }" @click="emit('navigate')" :class="link('how-to')">Cara Penggunaan</RouterLink>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits<{ navigate: [] }>()

const route = useRoute()
const authStore = useAuthStore()

const isFreePlan = computed(() => authStore.currentUser?.subscriptionPlan === 'FREE')

const masterOpen = ref(false)
const budgetOpen = ref(false)
const analysisOpen = ref(false)
const systemOpen = ref(false)

const isMasterActive = computed(() => {
  const n = route.name?.toString() || ''
  return n.includes('account') || n.includes('categorie')
})
const isBudgetActive = computed(() => route.name?.toString().startsWith('budget') ?? false)
const isAnalysisActive = computed(() => {
  const n = route.name?.toString() || ''
  return n.includes('analysis') || n.includes('goal')
})
const isSystemActive = computed(() => {
  const n = route.name?.toString() || ''
  return n.includes('settings') || n.includes('how-to')
})

watch(isMasterActive, (v) => { if (v) masterOpen.value = true }, { immediate: true })
watch(isBudgetActive, (v) => { if (v) budgetOpen.value = true }, { immediate: true })
watch(isAnalysisActive, (v) => { if (v) analysisOpen.value = true }, { immediate: true })
watch(isSystemActive, (v) => { if (v) systemOpen.value = true }, { immediate: true })

const BASE = 'flex items-center py-2.5 px-4 rounded-md transition-colors'
const ACTIVE = 'bg-[#2E8B57] text-white'
const INACTIVE = 'text-slate-300 hover:bg-[#236B43] hover:text-white'

const link = (names: string | string[]) => {
  const cur = route.name?.toString() || ''
  const active = Array.isArray(names)
    ? names.some((n) => cur.startsWith(n.replace('-list', '')))
    : cur.startsWith(names.replace('-list', ''))
  return `${BASE} ${active ? ACTIVE : INACTIVE}`
}

const dropbtn = (active: boolean) =>
  `${BASE} w-full justify-between ${active ? 'bg-[#236B43] text-white' : 'text-slate-300 hover:bg-[#236B43] hover:text-white'}`
</script>
