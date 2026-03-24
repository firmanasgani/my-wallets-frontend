<template>
  <ul class="space-y-1">
    <li>
      <RouterLink :to="{ name: 'dashboard' }" @click="emit('navigate')" :class="link('dashboard')">Workspace</RouterLink>
    </li>
    <li>
      <RouterLink :to="{ name: 'business-kpi' }" @click="emit('navigate')" :class="link('business-kpi')">KPI Dashboard</RouterLink>
    </li>
    <li>
      <RouterLink :to="{ name: 'business-settings' }" @click="emit('navigate')" :class="link('business-settings')">Profil Perusahaan</RouterLink>
    </li>
    <li>
      <RouterLink :to="{ name: 'business-coa' }" @click="emit('navigate')" :class="link('business-coa')">Chart of Accounts</RouterLink>
    </li>
    <li>
      <RouterLink :to="{ name: 'business-members' }" @click="emit('navigate')" :class="link('business-members')">Manajemen Member</RouterLink>
    </li>
    <li>
      <RouterLink :to="{ name: 'business-contacts' }" @click="emit('navigate')" :class="link('business-contacts')">Kontak</RouterLink>
    </li>
    <li>
      <RouterLink :to="{ name: 'business-invoices' }" @click="emit('navigate')" :class="link(['business-invoices', 'invoice-create', 'invoice-detail', 'invoice-edit'])">Invoice</RouterLink>
    </li>
    <li>
      <RouterLink :to="{ name: 'business-bank-accounts' }" @click="emit('navigate')" :class="link('business-bank-accounts')">Rekening</RouterLink>
    </li>
    <li>
      <RouterLink :to="{ name: 'business-transactions' }" @click="emit('navigate')" :class="link('business-transactions')">Transaksi</RouterLink>
    </li>

    <!-- Laporan Keuangan -->
    <li class="pt-2 mt-2 border-t border-slate-700">
      <button @click="reportsOpen = !reportsOpen" :class="dropbtn(isReportsActive)">
        Laporan Keuangan
        <svg :class="['h-4 w-4 transition-transform', reportsOpen ? 'rotate-180' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div v-show="reportsOpen" class="pl-4 space-y-1 mt-1">
        <RouterLink :to="{ name: 'business-report-pl' }" @click="emit('navigate')" :class="link('business-report-pl')">Laba Rugi</RouterLink>
        <RouterLink :to="{ name: 'business-report-bs' }" @click="emit('navigate')" :class="link('business-report-bs')">Neraca</RouterLink>
        <RouterLink :to="{ name: 'business-report-cf' }" @click="emit('navigate')" :class="link('business-report-cf')">Arus Kas</RouterLink>
        <RouterLink :to="{ name: 'business-report-journal' }" @click="emit('navigate')" :class="link('business-report-journal')">Jurnal Umum</RouterLink>
      </div>
    </li>

    <!-- Bantuan -->
    <li class="pt-2 mt-2 border-t border-slate-700">
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

const emit = defineEmits<{ navigate: [] }>()

const route = useRoute()

const systemOpen = ref(false)
const isSystemActive = computed(() => {
  const n = route.name?.toString() || ''
  return n.includes('settings') || n.includes('how-to')
})
watch(isSystemActive, (v) => { if (v) systemOpen.value = true }, { immediate: true })

const reportsOpen = ref(false)
const isReportsActive = computed(() => {
  const n = route.name?.toString() || ''
  return n.startsWith('business-report')
})
watch(isReportsActive, (v) => { if (v) reportsOpen.value = true }, { immediate: true })

const BASE = 'flex items-center py-2.5 px-4 rounded-md transition-colors'
const ACTIVE = 'bg-indigo-500 text-white'
const INACTIVE = 'text-slate-300 hover:bg-slate-700 hover:text-white'

const link = (names: string | string[]) => {
  const cur = route.name?.toString() || ''
  const active = Array.isArray(names)
    ? names.some((n) => cur.startsWith(n.replace('-list', '')))
    : cur.startsWith(names.replace('-list', ''))
  return `${BASE} ${active ? ACTIVE : INACTIVE}`
}

const dropbtn = (active: boolean) =>
  `${BASE} w-full justify-between ${active ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`
</script>
