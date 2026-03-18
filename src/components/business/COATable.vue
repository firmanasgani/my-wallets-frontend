<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
    <div class="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/80">
      <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
        Chart of Accounts
      </h3>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm text-left text-slate-500 dark:text-slate-400">
        <thead class="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300">
          <tr>
            <th scope="col" class="px-6 py-4">Kode</th>
            <th scope="col" class="px-6 py-4">Nama Akun</th>
            <th scope="col" class="px-6 py-4">Tipe Akun</th>
            <th scope="col" class="px-6 py-4">Sistem Default</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="account in accounts"
            :key="account.id"
            class="bg-white border-b dark:bg-slate-800 last:border-0 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <td class="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
              {{ account.code }}
            </td>
            <td class="px-6 py-4">
              {{ account.name }}
            </td>
            <td class="px-6 py-4">
              <span class="px-2.5 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-800/50">
                {{ formatType(account.type) }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span v-if="account.isSystem" class="flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Ya
              </span>
              <span v-else class="text-slate-400 dark:text-slate-500 font-medium">-</span>
            </td>
          </tr>
          <tr v-if="accounts.length === 0">
            <td colspan="4" class="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
              <div class="flex flex-col items-center justify-center">
                <svg class="w-10 h-10 mb-3 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                <p>Belum ada Chart of Accounts.</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChartOfAccount } from '@/types/business'

defineProps<{
  accounts: ChartOfAccount[]
}>()

const formatType = (type: string) => {
  return type
}
</script>
