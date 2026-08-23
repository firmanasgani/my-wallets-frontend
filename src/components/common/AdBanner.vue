<template>
  <!-- Active announcement takes priority and applies to every subscription plan -->
  <div
    v-if="announcement"
    class="w-full bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-700/40 print:hidden overflow-hidden"
  >
    <div class="relative flex items-center py-1.5 text-xs text-emerald-700 dark:text-emerald-300">
      <div class="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-emerald-50 dark:from-emerald-900/20 to-transparent z-10 pointer-events-none"></div>
      <div class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-emerald-50 dark:from-emerald-900/20 to-transparent z-10 pointer-events-none"></div>

      <div class="marquee-track flex items-center gap-2 whitespace-nowrap">
        <template v-for="i in 3" :key="i">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 5A1 1 0 0010 4H4a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-6a1 1 0 10-2 0v6H4V6h6a1 1 0 001-1z" />
            <path d="M13.586 3H10a1 1 0 000 2h1.586l-4.293 4.293a1 1 0 101.414 1.414L13 6.414V8a1 1 0 102 0V4a1 1 0 00-1-1z" />
          </svg>
          <span>
            <span class="font-semibold">{{ announcement.title }}</span>
            <span v-if="announcement.content"> — {{ announcement.content }}</span>
            &nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp;
          </span>
        </template>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import announcementService, { type Announcement } from '@/services/announcementService'

const announcement = ref<Announcement | null>(null)

onMounted(async () => {
  try {
    const active = await announcementService.getActive()
    announcement.value = active[0] ?? null
  } catch (error) {
    console.error('Failed to load active announcements:', error)
  }
})
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
