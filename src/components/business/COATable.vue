<template>
  <div class="space-y-6">
    <div
      v-for="(accountsList, type) in accounts"
      :key="type"
      class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
    >
      <!-- Section Header -->
      <div
        @click="toggleSection(type.toString())"
        class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/80 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
      >
        <h3 class="text-md sm:text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
          <div class="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white" :class="getBadgeClass(type.toString())">
            <svg v-if="type === 'ASSET'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <svg v-else-if="type === 'LIABILITY'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <svg v-else-if="type === 'EQUITY'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <svg v-else-if="type === 'REVENUE'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            <svg v-else-if="type === 'EXPENSE'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
          </div>
          {{ formatTypeHeader(type.toString()) }}
        </h3>
        <div class="flex items-center gap-3">
          <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {{ accountsList.length }} Akun
          </span>
          <svg
            :class="{'rotate-180': expandedSections[type.toString()]}"
            class="w-5 h-5 text-slate-500 transition-transform duration-200"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <!-- Table -->
      <div v-show="expandedSections[type.toString()]" class="overflow-x-auto">
        <table class="w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead class="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700/50 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th scope="col" class="px-6 py-3 w-28">Kode</th>
              <th scope="col" class="px-6 py-3">Nama Akun</th>
              <th scope="col" class="px-6 py-3 w-44 text-right">Saldo Awal</th>
              <th scope="col" class="px-6 py-3 w-28 text-center">Tipe</th>
              <th v-if="isAdmin" scope="col" class="px-6 py-3 w-28 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="account in accountsList"
              :key="account.id"
              class="bg-white border-b dark:bg-slate-800 last:border-0 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <td class="px-6 py-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                {{ account.code }}
              </td>
              <td class="px-6 py-3 text-slate-700 dark:text-slate-200">
                {{ account.name }}
              </td>
              <td class="px-6 py-3 text-right font-mono text-slate-700 dark:text-slate-200">
                {{ formatCurrency(account.openingBalance) }}
              </td>
              <td class="px-6 py-3 text-center">
                <span v-if="account.isSystem" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  Sistem
                </span>
                <span v-else class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                  Custom
                </span>
              </td>
              <td v-if="isAdmin" class="px-6 py-3 text-center">
                <div v-if="!account.isSystem" class="flex items-center justify-center gap-2">
                  <button
                    @click.stop="$emit('edit', account)"
                    class="p-1.5 rounded-md text-slate-500 hover:text-emerald-600 hover:bg-indigo-50 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 transition-colors"
                    title="Edit COA"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  </button>
                  <button
                    @click.stop="$emit('delete', account)"
                    class="p-1.5 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                    title="Hapus COA"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
                <span v-else class="text-slate-300 dark:text-slate-600 text-xs">—</span>
              </td>
            </tr>
            <tr v-if="accountsList.length === 0">
              <td :colspan="isAdmin ? 5 : 4" class="px-6 py-8 text-center text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50">
                Belum ada akun untuk tipe ini.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="Object.keys(accounts).length === 0" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500 dark:text-slate-400">
      <div class="flex flex-col items-center justify-center">
        <svg class="w-12 h-12 mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
        <p class="text-base font-medium text-slate-700 dark:text-slate-300">Belum ada Chart of Accounts</p>
        <p class="text-sm mt-1">Data akun akan dibuat secara otomatis saat registrasi perusahaan.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import type { ChartOfAccount } from '@/types/business'

const props = defineProps<{
  accounts: Record<string, ChartOfAccount[]>
  isAdmin?: boolean
}>()

defineEmits<{
  edit: [account: ChartOfAccount]
  delete: [account: ChartOfAccount]
}>()

const expandedSections = ref<Record<string, boolean>>({})

watchEffect(() => {
  if (props.accounts) {
    for (const key of Object.keys(props.accounts)) {
      if (expandedSections.value[key] === undefined) {
        expandedSections.value[key] = true
      }
    }
  }
})

const toggleSection = (type: string) => {
  expandedSections.value[type] = !expandedSections.value[type]
}

const formatTypeHeader = (type: string) => {
  const map: Record<string, string> = {
    ASSET: 'Aset (Harta)',
    LIABILITY: 'Kewajiban (Hutang)',
    EQUITY: 'Ekuitas (Modal)',
    REVENUE: 'Pendapatan',
    EXPENSE: 'Beban (Pengeluaran)',
  }
  return map[type] || type
}

const getBadgeClass = (type: string) => {
  const map: Record<string, string> = {
    ASSET: 'bg-[#2E8B57]',
    LIABILITY: 'bg-rose-500',
    EQUITY: 'bg-purple-500',
    REVENUE: 'bg-emerald-500',
    EXPENSE: 'bg-amber-500',
  }
  return map[type] || 'bg-slate-500'
}

const formatCurrency = (value: string) => {
  const num = parseFloat(value)
  if (isNaN(num) || num === 0) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
}
</script>
