<template>
  <div class="space-y-6">
    <!-- Header & Navigation -->
    <div class="flex items-center justify-between">
      <button
        @click="goBack"
        class="inline-flex items-center text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-5 h-5 mr-1"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
        Kembali ke Daftar
      </button>
      <div class="flex space-x-2">
        <button
          @click="isEditModalOpen = true"
          class="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600"
        >
          Edit Goal
        </button>
        <button
          @click="confirmDelete"
          class="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors dark:bg-slate-800 dark:text-red-400 dark:border-red-900/30"
        >
          Hapus
        </button>
      </div>
    </div>

    <div
      v-if="goalStore.loading && !goalStore.goalDetails"
      class="flex flex-col items-center justify-center py-20"
    >
      <LoadingSpinner :visible="true" text="Memuat detail goal..." />
    </div>

    <div v-else-if="goal" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Goal Summary -->
      <div class="lg:col-span-2 space-y-6">
        <div
          class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <div class="flex justify-between items-start mb-6">
            <div>
              <h1 class="text-3xl font-bold text-slate-900 dark:text-white">{{ goal.name }}</h1>
              <p v-if="goal.description" class="text-slate-500 dark:text-slate-400 mt-2 italic">
                "{{ goal.description }}"
              </p>
            </div>
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                statusClasses,
              ]"
            >
              {{ goal.status }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
            <div class="space-y-1">
              <p
                class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Terkumpul
              </p>
              <p class="text-4xl font-black text-slate-900 dark:text-white">
                {{ formatCurrency(goal.currentSaved) }}
              </p>
            </div>
            <div class="space-y-1">
              <p
                class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Target
              </p>
              <p class="text-4xl font-black text-slate-300 dark:text-slate-600">
                {{ formatCurrency(goal.targetAmount) }}
              </p>
            </div>
          </div>

          <!-- Large Progress Bar -->
          <div class="space-y-2 mb-6">
            <div class="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300">
              <span>Progres Pencapaian</span>
              <span>{{ Number(goal.progressPercentage).toFixed(1).replace('.0', '') }}%</span>
            </div>
            <div
              class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-5 overflow-hidden shadow-inner p-0.5"
            >
              <div
                class="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                :class="progressColor"
                :style="{ width: `${Math.min(goal.progressPercentage, 100)}%` }"
              ></div>
            </div>
            <div class="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span v-if="goal.targetDate">Deadline: {{ formatDate(goal.targetDate) }}</span>
              <span v-else>Tidak ada tenggat waktu</span>
              <span v-if="goal.remainingAmount > 0"
                >Sisa: {{ formatCurrency(goal.remainingAmount) }}</span
              >
              <span v-else class="text-green-600 font-bold">Goal Tercapai!</span>
            </div>
          </div>

          <!-- Actions -->
          <div
            class="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-100 dark:border-slate-700 pt-6"
          >
            <button
              @click="isAllocateModalOpen = true"
              class="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              Nabung (Alokasi)
            </button>
            <button
              @click="isSpendModalOpen = true"
              :disabled="goal.currentSaved <= 0"
              class="flex items-center justify-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-semibold disabled:opacity-50"
            >
              Gunakan Dana
            </button>
            <button
              @click="isReleaseModalOpen = true"
              :disabled="goal.currentSaved <= 0"
              class="flex items-center justify-center px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-semibold disabled:opacity-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600"
            >
              Lepas Alokasi
            </button>
          </div>
        </div>

        <!-- Ledger History -->
        <div
          class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">Riwayat Dana</h2>
          </div>

          <div class="divide-y divide-slate-100 dark:divide-slate-700">
            <div
              v-if="goalStore.loading && !goalStore.ledgers.length"
              class="p-8 text-center text-slate-500"
            >
              Memuat riwayat...
            </div>
            <div v-else-if="goalStore.ledgers.length === 0" class="p-12 text-center">
              <p class="text-slate-500 dark:text-slate-400">
                Belum ada riwayat pergerakan dana untuk goal ini.
              </p>
            </div>

            <div
              v-for="ledger in goalStore.ledgers"
              :key="ledger.id"
              class="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between"
            >
              <div class="flex items-center space-x-4">
                <div
                  :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                    ledger.direction === 'INCOMING'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600',
                  ]"
                >
                  <svg
                    v-if="ledger.direction === 'INCOMING'"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    class="w-5 h-5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 4.5v15m0-15l-6.75 6.75M12 4.5l6.75 6.75"
                    />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    class="w-5 h-5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 19.5v-15m0 0l-6.75 6.75M12 19.5l6.75-6.75"
                    />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {{ ledgerTypeLabel(ledger.type) }}
                  </p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">
                    {{ ledger.account?.accountName || 'Unknown Akun' }} &bull;
                    {{ formatDateFull(ledger.createdAt) }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p
                  :class="[
                    'text-sm font-bold',
                    ledger.direction === 'INCOMING' ? 'text-green-600' : 'text-red-600',
                  ]"
                >
                  {{ ledger.direction === 'INCOMING' ? '+' : '-'
                  }}{{ formatCurrency(ledger.amount) }}
                </p>
                <p v-if="ledger.note" class="text-xs text-slate-500 dark:text-slate-400 italic">
                  {{ ledger.note }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Info & Tips -->
      <div class="space-y-6">
        <div class="bg-indigo-600 rounded-xl p-6 text-white shadow-md">
          <h3 class="text-lg font-bold mb-2 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-5 h-5 mr-2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m11.25 11.25.041-.02a.75.75 0 1 1 .512 1.35l-.493.17a.75.75 0 0 1-.954-.814l.036-.686Z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8.625 9.25a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l3.184-2.122a18.147 18.147 0 0 0 2.535-.549c1.556-.33 2.586-1.789 2.586-3.386V6.222c0-1.551-1.025-2.914-2.52-3.175A48.393 48.393 0 0 0 12 2.75c-1.098 0-2.19.033-3.276.098-1.567.094-2.724 1.406-2.724 2.984v7.178Z"
              />
            </svg>
            Apa itu Alokasi?
          </h3>
          <p class="text-indigo-100 text-sm leading-relaxed">
            Sistem kami menggunakan <b>soft allocation</b>. Saldo rekening Anda tetap utuh, namun
            kami "menandai" sebagian dana agar tidak terpakai untuk pengeluaran sehari-hari.
          </p>
        </div>

        <div
          class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <h3 class="font-bold text-slate-900 dark:text-white mb-4">Ringkasan Sisa</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between text-sm">
              <span class="text-slate-500 dark:text-slate-400">Masih perlu ditabung</span>
              <span class="font-bold text-slate-800 dark:text-slate-200">{{
                formatCurrency(goal.remainingAmount)
              }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-slate-500 dark:text-slate-400">Total Pengeluaran Goal</span>
              <span class="font-bold text-red-600">{{ formatCurrency(totalSpent) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AddGoalModal
      v-if="isEditModalOpen"
      :is-open="isEditModalOpen"
      :goal="goal"
      @close="isEditModalOpen = false"
      @success="handleUpdateSuccess"
    />

    <AllocateModal
      v-if="isAllocateModalOpen"
      :is-open="isAllocateModalOpen"
      :goal-id="id"
      @close="isAllocateModalOpen = false"
      @success="handleActionSuccess('Dana berhasil dialokasikan!')"
    />

    <SpendModal
      v-if="isSpendModalOpen"
      :is-open="isSpendModalOpen"
      :goal="goal"
      @close="isSpendModalOpen = false"
      @success="handleActionSuccess('Pengeluaran dana tercatat!')"
    />

    <ReleaseModal
      v-if="isReleaseModalOpen"
      :is-open="isReleaseModalOpen"
      :goal="goal"
      @close="isReleaseModalOpen = false"
      @success="handleActionSuccess('Alokasi dana berhasil dilepas!')"
    />

    <ConfirmationModal
      v-model:isOpen="isDeleteConfirmOpen"
      title="Hapus Goal"
      :message="`Apakah Anda yakin ingin menghapus goal '${goal?.name}'? Goal hanya bisa dihapus jika saldo terkumpul sudah 0.`"
      confirmButtonText="Hapus Goal"
      confirmButtonClass="bg-red-600 hover:bg-red-700"
      iconType="danger"
      :isConfirming="goalStore.submitting"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFinancialGoalStore } from '@/stores/financialGoals'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import AddGoalModal from '@/components/financial-goals/AddGoalModal.vue'
import AllocateModal from '@/components/financial-goals/AllocateModal.vue'
import SpendModal from '@/components/financial-goals/SpendModal.vue'
import ReleaseModal from '@/components/financial-goals/ReleaseModal.vue'

const route = useRoute()
const router = useRouter()
const goalStore = useFinancialGoalStore()

const id = computed(() => route.params.id as string)
const goal = computed(() => goalStore.goalDetails)

const isEditModalOpen = ref(false)
const isAllocateModalOpen = ref(false)
const isSpendModalOpen = ref(false)
const isReleaseModalOpen = ref(false)
const isDeleteConfirmOpen = ref(false)

const totalSpent = computed(() => {
  if (!goalStore.ledgers) return 0
  return goalStore.ledgers
    .filter((l) => l.type === 'SPEND')
    .reduce((acc, l) => acc + Number(l.amount), 0)
})

const statusClasses = computed(() => {
  if (!goal.value) return ''
  switch (goal.value.status) {
    case 'ACTIVE':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
    case 'COMPLETED':
      return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
    case 'CANCELLED':
      return 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300'
    default:
      return 'bg-slate-100 text-slate-700'
  }
})

const progressColor = computed(() => {
  if (!goal.value) return 'bg-slate-400'
  if (goal.value.status === 'COMPLETED' || goal.value.progressPercentage >= 100)
    return 'bg-green-500'
  if (goal.value.progressPercentage >= 75) return 'bg-indigo-500'
  if (goal.value.progressPercentage >= 25) return 'bg-blue-500'
  return 'bg-slate-400'
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const formatDateFull = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const ledgerTypeLabel = (type: string) => {
  switch (type) {
    case 'ALLOCATE':
      return 'Alokasi Tabungan'
    case 'SPEND':
      return 'Pengeluaran Goal'
    case 'RELEASE':
      return 'Pelepasan Alokasi'
    case 'ADJUST':
      return 'Koreksi Manual'
    default:
      return type
  }
}

const goBack = () => router.push({ name: 'financial-goals-list' })

const confirmDelete = () => {
  if (goal.value && goal.value.currentSaved > 0) {
    alert(
      `Goal '${goal.value.name}' masih memiliki saldo terkumpul sebesar ${formatCurrency(goal.value.currentSaved)}. Harap lepas (release) semua alokasi terlebih dahulu sebelum menghapus.`,
    )
    return
  }
  isDeleteConfirmOpen.value = true
}

const handleDelete = async () => {
  try {
    await goalStore.deleteGoal(id.value)
    goBack()
  } catch (err) {
    console.error(err)
  }
}

const handleUpdateSuccess = () => {
  isEditModalOpen.value = false
  goalStore.fetchGoalById(id.value)
}

const handleActionSuccess = (msg: string) => {
  isAllocateModalOpen.value = false
  isSpendModalOpen.value = false
  isReleaseModalOpen.value = false
  // Toast or notification could be added here
}

onMounted(() => {
  goalStore.fetchGoalById(id.value)
})

watch(id, (newId) => {
  if (newId) goalStore.fetchGoalById(newId)
})
</script>
