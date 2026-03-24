<template>
  <div
    v-if="isFreePlan"
    class="w-full bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700/40 print:hidden overflow-hidden"
  >
    <div class="relative flex items-center py-1.5 text-xs text-amber-700 dark:text-amber-400">
      <!-- Fade edges -->
      <div class="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-amber-50 dark:from-amber-900/20 to-transparent z-10 pointer-events-none"></div>
      <div class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-amber-50 dark:from-amber-900/20 to-transparent z-10 pointer-events-none"></div>

      <div class="marquee-track flex items-center gap-2 whitespace-nowrap">
        <template v-for="_ in 3" :key="_">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 flex-shrink-0 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v1H3a1 1 0 00-.894 1.447l3 6A1 1 0 006 17h8a1 1 0 00.894-1.553l-3-6A1 1 0 0011 9V8a1 1 0 112 0v1h-1a1 1 0 000 2h1.5a1 1 0 00.5-.134V8a4 4 0 00-4-6z" />
          </svg>
          <span>
            Support pengembang dengan memberikan kopi di
            <a
              href="https://saweria.co/firmanasgani"
              target="_blank"
              rel="noopener noreferrer"
              class="font-semibold underline underline-offset-2 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
            >saweria.co/firmanasgani</a>
            &nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp;
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isFreePlan = computed(() => authStore.currentUser?.subscriptionPlan === 'FREE')
</script>

<style scoped>
.marquee-track {
  display: inline-flex;
  animation: marquee 22s linear infinite;
}

@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-33.333%); }
}

.marquee-track:hover {
  animation-play-state: paused;
}
</style>
