<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Goal Keuangan</h1>
        <p class="text-slate-500 dark:text-slate-400">
          Atur dan lacak target tabungan Anda dengan sistem alokasi dana.
        </p>
      </div>
      <button
        @click="openAddModal"
        class="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-5 h-5 mr-2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Tambah Goal
      </button>
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
      >
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Total Goal
        </p>
        <p class="text-3xl font-bold text-slate-900 dark:text-white mt-1">
          {{ goalStore.goals.length }}
        </p>
      </div>
      <div
        class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
      >
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Total Terkumpul
        </p>
        <p class="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
          {{ formatCurrency(totalSaved) }}
        </p>
      </div>
      <div
        class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
      >
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Goal Tercapai
        </p>
        <p class="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
          {{ completedGoalsCount }}
        </p>
      </div>
    </div>

    <!-- Goals Grid -->
    <div v-if="goalStore.isLoading" class="flex flex-col items-center justify-center py-20">
      <LoadingSpinner :visible="true" text="Memuat daftar goal..." />
    </div>

    <div
      v-else-if="goalStore.goals.length === 0"
      class="bg-white dark:bg-slate-800 rounded-xl p-12 text-center shadow-sm border border-slate-200 dark:border-slate-700"
    >
      <div
        class="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-10 h-10 text-indigo-600 dark:text-indigo-400"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"
          />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Belum Ada Goal</h3>
      <p class="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
        Anda belum membuat target finansial. Mulai rencanakan masa depan Anda sekarang!
      </p>
      <button
        @click="openAddModal"
        class="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
      >
        Buat Goal Pertama
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <GoalCard
        v-for="goal in goalStore.goals"
        :key="goal.id"
        :goal="goal"
        @click="viewDetail(goal.id)"
      />
    </div>

    <!-- Modals -->
    <AddGoalModal
      v-if="isAddModalOpen"
      :is-open="isAddModalOpen"
      @close="isAddModalOpen = false"
      @success="handleGoalCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFinancialGoalStore } from '@/stores/financialGoals'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import GoalCard from '@/components/financial-goals/GoalCard.vue'
import AddGoalModal from '@/components/financial-goals/AddGoalModal.vue'

const router = useRouter()
const goalStore = useFinancialGoalStore()

const isAddModalOpen = ref(false)

const totalSaved = computed(() => {
  return goalStore.goals.reduce((acc, goal) => acc + (goal.currentSaved || 0), 0)
})

const completedGoalsCount = computed(() => {
  return goalStore.goals.filter((g) => g.status === 'COMPLETED').length
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const openAddModal = () => {
  isAddModalOpen.value = true
}

const viewDetail = (id: string) => {
  router.push({ name: 'financial-goal-detail', params: { id } })
}

const handleGoalCreated = async () => {
  isAddModalOpen.value = false
  await goalStore.fetchGoals()
}

onMounted(async () => {
  await goalStore.fetchGoals()
})
</script>
