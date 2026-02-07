<template>
  <div
    v-if="insights && insights.length > 0"
    class="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100"
  >
    <h3 class="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 text-indigo-600"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clip-rule="evenodd"
        />
      </svg>
      Insights & Recommendations
    </h3>
    <div class="space-y-3">
      <div
        v-for="(insight, index) in insights"
        :key="index"
        :class="['p-3 rounded-lg border-l-4 shadow-sm bg-white', getInsightColor(insight.type)]"
      >
        <div class="flex justify-between items-start">
          <div>
            <h4 class="font-bold text-gray-800 text-sm">{{ insight.title }}</h4>
            <div
              class="text-xs text-gray-600 mt-1 insight-message"
              v-html="formatMessage(insight.message)"
            ></div>
          </div>
          <span
            v-if="insight.action"
            class="text-xs font-semibold text-blue-600 cursor-pointer hover:underline whitespace-nowrap ml-2"
          >
            {{ insight.action }} &rarr;
          </span>
        </div>
      </div>
    </div>
  </div>
  <div
    v-else
    class="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center h-full"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-10 w-10 text-gray-300 mb-2"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
      />
    </svg>
    <p class="text-gray-500 font-medium">No insights available for this period yet.</p>
    <p class="text-xs text-gray-400">Keep tracking to get smart recommendations!</p>
  </div>
</template>

<script setup lang="ts">
import type { Insight } from '@/types/reports'

defineProps<{
  insights: Insight[]
}>()

const getInsightColor = (type: string) => {
  switch (type) {
    case 'DANGER':
      return 'border-red-500'
    case 'WARNING':
      return 'border-amber-400'
    case 'TIP':
      return 'border-green-400'
    case 'INFO':
      return 'border-blue-400'
    default:
      return 'border-gray-300'
  }
}

const formatMessage = (message: string) => {
  if (!message) return ''
  // Basic markdown-like bold converter: **text** -> <strong>text</strong>
  return message.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
}
</script>

<style scoped>
.insight-message :deep(strong) {
  font-weight: 700;
  color: #111827; /* gray-900 */
}
</style>
