<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 overflow-y-auto"
    role="dialog"
    aria-labelledby="modal-title"
    aria-modal="true"
  >
    <!-- Background overlay -->
    <div
      class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
      aria-hidden="true"
      @click="$emit('close')"
    ></div>

    <!-- Modal panel -->
    <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <div
        class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl"
      >
        <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
          <!-- Calendar Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
              Kalender Transaksi
            </h3>
            <div class="flex items-center space-x-2">
              <button
                @click="prevMonth"
                class="p-2 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <i class="fa-solid fa-chevron-left"></i>
              </button>
              <span class="text-base font-medium text-gray-900 min-w-[140px] text-center">
                {{ currentMonthName }} {{ currentYear }}
              </span>
              <button
                @click="nextMonth"
                class="p-2 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <i class="fa-solid fa-chevron-right"></i>
              </button>
            </div>
            <button
              @click="$emit('close')"
              class="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
            >
              <i class="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          <!-- Calendar Grid -->
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <!-- Weekday Headers -->
            <div class="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
              <div
                v-for="day in weekDays"
                :key="day"
                class="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide"
              >
                {{ day }}
              </div>
            </div>

            <!-- Days -->
            <div class="grid grid-cols-7 auto-rows-fr bg-gray-200 gap-px">
              <div
                v-for="(day, index) in calendarDays"
                :key="index"
                class="bg-white min-h-[100px] p-2 relative group hover:bg-gray-50 cursor-pointer transition-colors flex flex-col justify-between"
                :class="{
                  'bg-gray-50 text-gray-400': !day.isCurrentMonth,
                  'ring-2 ring-inset ring-indigo-500 z-10': isSameDate(day.date, selectedDate),
                }"
                @click="selectDate(day.date)"
              >
                <div class="flex justify-between items-start">
                  <span
                    class="text-sm font-medium"
                    :class="{
                      'text-indigo-600 font-bold': isToday(day.date),
                      'text-gray-900': day.isCurrentMonth && !isToday(day.date),
                    }"
                  >
                    {{ day.date.getDate() }}
                  </span>
                  <span v-if="getDailyCount(day.date) > 0" class="flex h-1.5 w-1.5 translate-y-1">
                    <span
                      class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"
                    ></span>
                    <span
                      class="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"
                    ></span>
                  </span>
                </div>

                <!-- Daily Summary (Income/Expense) -->
                <div class="mt-1 space-y-1">
                  <div
                    v-if="getDailySummary(day.date).income > 0"
                    class="text-[10px] leading-tight text-green-700 bg-green-50 px-1 py-0.5 rounded truncate font-medium"
                    :title="'Pemasukan: ' + formatCurrency(getDailySummary(day.date).income)"
                  >
                    +{{ formatShortCurrency(getDailySummary(day.date).income) }}
                  </div>
                  <div
                    v-if="getDailySummary(day.date).expense > 0"
                    class="text-[10px] leading-tight text-red-700 bg-red-50 px-1 py-0.5 rounded truncate font-medium"
                    :title="'Pengeluaran: ' + formatCurrency(getDailySummary(day.date).expense)"
                  >
                    -{{ formatShortCurrency(getDailySummary(day.date).expense) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Selected Date Details -->
          <div class="mt-4 border-t border-gray-200 pt-4">
            <h4 class="text-base font-semibold text-gray-800 mb-3 flex items-center">
              <i class="fa-regular fa-calendar-check mr-2 text-indigo-500"></i>
              Transaksi {{ formatDateFull(selectedDate) }}
            </h4>

            <div v-if="isLoading" class="py-4 text-center text-gray-500">
              <i class="fa-solid fa-spinner fa-spin mr-2"></i> Memuat transaksi...
            </div>

            <div
              v-else-if="selectedDateTransactions.length > 0"
              class="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar"
            >
              <div
                v-for="tx in selectedDateTransactions"
                :key="tx.id"
                class="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-100 transition-colors"
              >
                <div class="flex items-center min-w-0">
                  <div
                    class="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mr-3"
                    :class="
                      tx.transactionType === 'INCOME'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    "
                  >
                    <i
                      class="fa-solid text-xs"
                      :class="tx.transactionType === 'INCOME' ? 'fa-arrow-down' : 'fa-arrow-up'"
                    ></i>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ tx.description || tx.category?.categoryName || 'Tanpa Keterangan' }}
                    </p>
                    <p class="text-xs text-gray-500 truncate">
                      {{ tx.account?.accountName }} • {{ tx.category?.categoryName }}
                    </p>
                  </div>
                </div>
                <div class="flex-shrink-0 ml-4 text-right">
                  <p
                    class="text-sm font-semibold"
                    :class="tx.transactionType === 'INCOME' ? 'text-green-600' : 'text-red-600'"
                  >
                    {{ tx.transactionType === 'INCOME' ? '+' : '-' }}
                    {{ formatCurrency(tx.amount) }}
                  </p>
                </div>
              </div>
            </div>

            <div
              v-else
              class="py-6 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300"
            >
              <p class="text-sm">Tidak ada transaksi pada tanggal ini.</p>
            </div>
          </div>
        </div>

        <div
          class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-100"
        >
          <button
            type="button"
            class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto transition-colors"
            @click="$emit('close')"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import apiClient from '@/services/apiService'
import type { Transaction } from '@/types/transaction'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['close'])

const currentDate = ref(new Date())
const selectedDate = ref(new Date())
const transactions = ref<Transaction[]>([])
const isLoading = ref(false)
const weekDays = ['Min', 'Sen', 'Sel', 'Obs', 'Kam', 'Jum', 'Sab']

// Calendar Logic
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())
const currentMonthName = computed(() => {
  return currentDate.value.toLocaleString('id-ID', { month: 'long' })
})

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDayOfMonth = new Date(year, month, 1) // Hari pertama bulan ini
  const lastDayOfMonth = new Date(year, month + 1, 0) // Hari terakhir bulan ini

  const days = []

  // Padding days from previous month
  const startDayOfWeek = firstDayOfMonth.getDay() // 0 (Sun) - 6 (Sat)
  for (let i = startDayOfWeek; i > 0; i--) {
    const d = new Date(year, month, 1 - i)
    days.push({ date: d, isCurrentMonth: false })
  }

  // Days of current month
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const d = new Date(year, month, i)
    days.push({ date: d, isCurrentMonth: true })
  }

  // Padding days from next month to fill grid (6 rows x 7 cols = 42 cells total usually covers all)
  // But let's just fill until the end of the current week row
  const remainingCells = (7 - (days.length % 7)) % 7
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(year, month + 1, i)
    days.push({ date: d, isCurrentMonth: false })
  }

  return days
})

// Transaction Filtering
const getDailySummary = (date: Date) => {
  const dateStr = date.toISOString().split('T')[0]
  const dailyTx = transactions.value.filter((tx) => tx.transactionDate.startsWith(dateStr))

  let income = 0
  let expense = 0

  dailyTx.forEach((tx) => {
    const amt = Number(tx.amount)
    if (tx.transactionType === 'INCOME') income += amt
    else if (tx.transactionType === 'EXPENSE') expense += amt
  })

  return { income, expense }
}

const getDailyCount = (date: Date) => {
  const dateStr = date.toISOString().split('T')[0]
  return transactions.value.filter((tx) => tx.transactionDate.startsWith(dateStr)).length
}

const selectedDateTransactions = computed(() => {
  const dateStr = selectedDate.value.toISOString().split('T')[0]
  return transactions.value.filter((tx) => tx.transactionDate.startsWith(dateStr))
})

// Actions
const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

const selectDate = (date: Date) => {
  selectedDate.value = date
  // If user clicks a date not in current month view, switch view?
  // Behavior: just select it. It might be from prev/next month.
  if (date.getMonth() !== currentMonth.value) {
    currentDate.value = new Date(date.getFullYear(), date.getMonth(), 1)
  }
}

const isSameDate = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

const isToday = (date: Date) => {
  const today = new Date()
  return isSameDate(date, today)
}

// Fetch Logic
const fetchTransactionsForMonth = async () => {
  isLoading.value = true

  // Calculate the start and end of the visible grid
  const year = currentYear.value
  const month = currentMonth.value

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  // Start date of the grid (Sunday of the first week)
  const startDayOfWeek = firstDayOfMonth.getDay() // 0 (Sun)
  const gridStartDate = new Date(year, month, 1 - startDayOfWeek)

  // End date of the grid (Saturday of the last week)
  const endDayOfWeek = lastDayOfMonth.getDay() // 6 (Sat)
  const daysNeeded = 6 - endDayOfWeek // Days to fill the week
  const gridEndDate = new Date(year, month + 1, daysNeeded) // Just a rough estimate, or calculate properly
  // Actually simpler:
  // The grid logic pads until the end of the week.
  // The loop logic for next month padding was:
  // const remainingCells = (7 - (days.length % 7)) % 7
  // Let's just create a generous range. -7 days from start, +14 days from end.
  // Or just create the objects.

  const queryStartDate = gridStartDate.toISOString().split('T')[0]
  // Calculate end date properly to cover all potential grid cells
  // If last day is Saturday (6), we don't add waiting.
  // If last day is Friday (5), we add 1 day.
  // The padding logic was:
  // (7 - (daysInMonth + startPadding) % 7) % 7
  // Let's just use a safe buffer of +7 days from end of month to cover next month preview.
  const safeEndDate = new Date(year, month + 1, 14)
  const queryEndDate = safeEndDate.toISOString().split('T')[0]

  try {
    const response = await apiClient.get('/transactions', {
      params: {
        startDate: queryStartDate,
        endDate: queryEndDate,
        limit: 1000,
        page: 1,
      },
    })

    // API might return standard paginated structure
    if (response.data && Array.isArray(response.data.data)) {
      transactions.value = response.data.data
    } else {
      transactions.value = []
    }
  } catch (error) {
    console.error('Failed to fetch calendar transactions:', error)
    transactions.value = []
  } finally {
    isLoading.value = false
  }
}

// Formatting
const formatCurrency = (value: number | string) => {
  const num = Number(value)
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

const formatShortCurrency = (value: number) => {
  if (value >= 1000000) {
    // 1.5M
    return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'jt'
  } else if (value >= 1000) {
    // 500k
    return (value / 1000).toFixed(0) + 'rb'
  }
  return value.toString()
}

const formatDateFull = (date: Date) => {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Watchers
watch([currentYear, currentMonth], () => {
  fetchTransactionsForMonth()
})

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      currentDate.value = new Date() // Reset to today when opening? Or keep last state?
      // Actually, maybe better to reset if it was closed long ago, but ok to just refresh.
      selectedDate.value = new Date()
      fetchTransactionsForMonth()
    }
  },
)

// Lifecycle
onMounted(() => {
  if (props.visible) {
    fetchTransactionsForMonth()
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>
