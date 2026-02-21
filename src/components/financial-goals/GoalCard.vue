<template>
  <div
    class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex justify-between flex-col"
    @click="$emit('click')"
  >
    <div class="p-6">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="font-bold text-lg text-slate-900 dark:text-white line-clamp-1">
            {{ goal.name }}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Target: {{ formatDate(goal.targetDate) || 'No deadline' }}
          </p>
        </div>
        <span
          :class="[
            'px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
            statusClasses,
          ]"
        >
          {{ goal.status }}
        </span>
      </div>

      <div class="space-y-4">
        <!-- Progress Bar -->
        <div>
          <div class="flex flex-col mb-2">
            <span class="text-3xl font-extrabold text-slate-900 dark:text-white">
              {{ formatCurrency(goal.currentSaved) }}
            </span>
            <div class="flex justify-between items-center mt-1">
              <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
                dari {{ formatCurrency(goal.targetAmount) }}
              </span>
              <span
                v-if="goal.remainingAmount > 0"
                class="text-xs font-bold text-indigo-600 dark:text-indigo-400"
              >
                Kurang {{ formatCurrency(goal.remainingAmount) }}
              </span>
            </div>
          </div>

          <div
            class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner font-bold"
          >
            <div
              class="h-full rounded-full transition-all duration-700 ease-out"
              :class="progressColor"
              :style="{ width: `${Math.min(goal.progressPercentage, 100)}%` }"
            ></div>
          </div>

          <div class="flex justify-between mt-2">
            <span class="text-xs font-bold text-slate-600 dark:text-slate-300">
              {{ Number(goal.progressPercentage).toFixed(1).replace('.0', '') }}% Tercapai
            </span>
            <span
              v-if="goal.status === 'COMPLETED' || goal.progressPercentage >= 100"
              class="text-xs font-bold text-green-600"
            >
              Target Selesai!
            </span>
          </div>
        </div>

        <div
          v-if="goal.description"
          class="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 italic border-l-2 border-slate-200 dark:border-slate-700 pl-2 mt-2"
        >
          "{{ goal.description }}"
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div
      class="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center"
    >
      <span class="text-xs text-slate-400 dark:text-slate-500">
        Dibuat {{ formatDateRelative(goal.createdAt) }}
      </span>
      <div class="flex space-x-1">
        <div class="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
        <div class="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
        <div class="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FinancialGoal } from '@/types/financialGoals'

const props = defineProps<{
  goal: FinancialGoal
}>()

defineEmits(['click'])

const statusClasses = computed(() => {
  switch (props.goal.status) {
    case 'ACTIVE':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
    case 'COMPLETED':
      return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
    case 'CANCELLED':
      return 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300'
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300'
  }
})

const progressColor = computed(() => {
  if (props.goal.status === 'COMPLETED') return 'bg-green-500'
  if (props.goal.progressPercentage >= 100) return 'bg-green-500'
  if (props.goal.progressPercentage >= 75) return 'bg-indigo-500'
  if (props.goal.progressPercentage >= 25) return 'bg-blue-500'
  return 'bg-slate-400 text-white'
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) return null
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const formatDateRelative = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'hari ini'
  if (diffDays === 1) return 'kemarin'
  if (diffDays < 7) return `${diffDays} hari lalu`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`
  return `${Math.floor(diffDays / 30)} bulan lalu`
}
</script>
