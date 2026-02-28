<template>
  <div
    v-if="isFreePlan"
    class="w-full bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700/40 print:hidden"
  >
    <div class="mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-center gap-2 text-xs text-amber-700 dark:text-amber-400">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
      <span class="font-medium">Iklan</span>
      <span class="text-amber-600 dark:text-amber-300">Ini iklan yang dipakai.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isFreePlan = computed(() => authStore.currentUser?.subscriptionPlan === 'FREE')
</script>
