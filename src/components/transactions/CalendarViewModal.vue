<template>
  <div v-if="visible" class="calendar-overlay" role="dialog" aria-labelledby="calendar-title" aria-modal="true" @click.self="$emit('close')" @keydown.esc="$emit('close')">
    <div class="calendar-modal">
      <header class="modal-header"><div><span class="overline">RIWAYAT KEUANGAN</span><h2 id="calendar-title">Kalender transaksi</h2><p>Lihat pemasukan dan pengeluaran berdasarkan tanggal.</p></div><button type="button" class="icon-button close-button" aria-label="Tutup kalender" @click="$emit('close')">&#10005;</button></header>
      <div class="calendar-body"><section class="calendar-main" aria-label="Kalender bulanan"><div class="month-heading"><div><span class="overline">PERIODE</span><h3>{{ currentMonthName }} {{ currentYear }}</h3></div><div class="month-controls"><button type="button" class="icon-button" aria-label="Bulan sebelumnya" @click="prevMonth">&#8592;</button><button type="button" class="today-button" @click="selectDate(new Date())">Hari ini</button><button type="button" class="icon-button" aria-label="Bulan berikutnya" @click="nextMonth">&#8594;</button></div></div>
        <div class="weekdays"><span v-for="day in weekDays" :key="day">{{ day }}</span></div><div class="days"><button v-for="day in calendarDays" :key="toLocalDateString(day.date)" type="button" class="day" :class="{ outside: !day.isCurrentMonth, selected: isSameDate(day.date, selectedDate), today: isToday(day.date) }" :aria-label="formatDateFull(day.date) + ', ' + getDailyCount(day.date) + ' transaksi'" :aria-pressed="isSameDate(day.date, selectedDate)" @click="selectDate(day.date)"><span class="day-top"><span class="day-number">{{ day.date.getDate() }}</span><span v-if="getDailyCount(day.date)" class="day-count">{{ getDailyCount(day.date) }}</span></span><span class="day-amounts"><span v-if="getDailySummary(day.date).income > 0" class="income">+{{ formatShortCurrency(getDailySummary(day.date).income) }}</span><span v-if="getDailySummary(day.date).expense > 0" class="expense">-{{ formatShortCurrency(getDailySummary(day.date).expense) }}</span></span></button></div><div class="legend"><span><i class="income-dot"></i>Pemasukan</span><span><i class="expense-dot"></i>Pengeluaran</span><span>Angka di sudut menunjukkan jumlah transaksi</span></div>
      </section><aside class="details"><div class="details-heading"><span class="overline">TANGGAL DIPILIH</span><h3>{{ formatDateFull(selectedDate) }}</h3><p v-if="!isLoading && !loadError">{{ selectedDateTransactions.length }} transaksi</p></div><div v-if="isLoading" class="detail-state" role="status">Memuat transaksi...</div><div v-else-if="loadError" class="detail-state" role="alert">Gagal memuat transaksi. <button type="button" class="retry" @click="fetchTransactionsForMonth">Coba lagi</button></div><div v-else-if="selectedDateTransactions.length" class="transaction-list"><div v-for="tx in selectedDateTransactions" :key="tx.id" class="transaction"><span class="transaction-icon" :class="tx.transactionType === 'INCOME' ? 'is-income' : 'is-expense'">{{ tx.transactionType === 'INCOME' ? '+' : '-' }}</span><div class="transaction-info"><strong>{{ tx.description || tx.category?.categoryName || 'Tanpa keterangan' }}</strong><span>{{ getAccountName(tx) }}<template v-if="tx.category?.categoryName"> &middot; {{ tx.category.categoryName }}</template></span></div><strong class="transaction-amount" :class="tx.transactionType === 'INCOME' ? 'income' : 'expense'">{{ tx.transactionType === 'INCOME' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}</strong></div></div><div v-else class="detail-state"><strong>Belum ada transaksi</strong><p>Tidak ada pemasukan atau pengeluaran pada tanggal ini.</p></div></aside></div>
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
const loadError = ref(false)
let requestId = 0
const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

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

// Helper to get local YYYY-MM-DD
const toLocalDateString = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Transaction Filtering
const getDailySummary = (date: Date) => {
  const dateStr = toLocalDateString(date)
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
  const dateStr = toLocalDateString(date)
  return transactions.value.filter((tx) => tx.transactionDate.startsWith(dateStr)).length
}

const selectedDateTransactions = computed(() => {
  const dateStr = toLocalDateString(selectedDate.value)
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

const getAccountName = (tx: Transaction) => {
  if (tx.transactionType === 'INCOME') {
    return tx.destinationAccount?.accountName || 'Unknown Account'
  }
  return tx.sourceAccount?.accountName || 'Unknown Account'
}

// Fetch Logic
const fetchTransactionsForMonth = async () => {
  const request = ++requestId
  isLoading.value = true
  loadError.value = false

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

  const queryStartDate = toLocalDateString(gridStartDate)
  // Calculate end date properly to cover all potential grid cells
  // If last day is Saturday (6), we don't add waiting.
  // If last day is Friday (5), we add 1 day.
  // The padding logic was:
  // (7 - (daysInMonth + startPadding) % 7) % 7
  // Let's just use a safe buffer of +7 days from end of month to cover next month preview.
  const safeEndDate = new Date(year, month + 1, 14)
  const queryEndDate = toLocalDateString(safeEndDate)

  try {
    const response = await apiClient.get('/transactions', {
      params: {
        startDate: queryStartDate,
        endDate: queryEndDate,
        limit: 1000,
        page: 1,
      },
    })

    if (request !== requestId) return
    // API might return standard paginated structure
    if (response.data && Array.isArray(response.data.data)) {
      // Takeout Transaction Type Transfer
      transactions.value = response.data.data.filter((tx: Transaction) => tx.transactionType !== 'TRANSFER')
    } else {
      transactions.value = []
    }
  } catch (error) {
    if (request !== requestId) return
    console.error('Failed to fetch calendar transactions:', error)
    loadError.value = true
    transactions.value = []
  } finally {
    if (request === requestId) isLoading.value = false
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
.calendar-overlay { position:fixed; inset:0; z-index:50; display:flex; align-items:center; justify-content:center; padding:20px; background:rgba(24,19,35,.65); }.calendar-modal { --ink:var(--shell-ink,#27231d); --muted:var(--shell-muted,#6c6256); --surface:var(--shell-surface,#fffcf5); --rule:var(--shell-rule,#e2d8c7); width:min(1180px,100%); max-height:calc(100dvh - 40px); overflow:auto; background:var(--surface); color:var(--ink); border-radius:24px; box-shadow:0 24px 80px #0005; }.modal-header { display:flex; justify-content:space-between; align-items:start; gap:20px; padding:26px 30px; border-bottom:1px solid var(--rule); }.overline { font-size:10px; letter-spacing:.13em; font-weight:800; color:var(--muted); }.modal-header h2 { font-size:30px; line-height:1.1; font-weight:900; letter-spacing:-.045em; margin:6px 0; }.modal-header p,.details-heading p { color:var(--muted); font-size:13px; }.calendar-body { display:grid; grid-template-columns:minmax(0,1.65fr) minmax(270px,1fr); }.calendar-main { padding:24px 30px 28px; min-width:0; }.month-heading { display:flex; justify-content:space-between; align-items:end; gap:12px; margin-bottom:20px; }.month-heading h3 { font-size:22px; font-weight:850; letter-spacing:-.03em; text-transform:capitalize; }.month-controls { display:flex; align-items:center; gap:6px; }.icon-button,.today-button { display:grid; place-items:center; border:1px solid var(--rule); background:var(--surface); color:var(--ink); border-radius:999px; height:36px; min-width:36px; font-weight:700; }.today-button { padding:0 13px; font-size:12px; }.icon-button:hover,.today-button:hover { background:var(--shell-lilac,#eee4ff); }.weekdays,.days { display:grid; grid-template-columns:repeat(7,minmax(0,1fr)); }.weekdays { padding-bottom:8px; color:var(--muted); text-align:center; font-size:11px; font-weight:800; }.days { gap:4px; }.day { min-width:0; min-height:78px; padding:8px; text-align:left; border:1px solid var(--rule); border-radius:10px; background:var(--surface); display:flex; flex-direction:column; justify-content:space-between; }.day:hover { border-color:#8b6abb; }.day.outside { opacity:.48; }.day.selected { background:var(--shell-lilac,#eee4ff); border-color:#6c42ae; color:#31244c; }.day-top { display:flex; align-items:center; justify-content:space-between; gap:2px; }.day-number { font-size:13px; font-weight:800; }.today .day-number { color:#fff; background:#5026a5; border-radius:50%; width:23px; height:23px; display:grid; place-items:center; }.day-count { font-size:10px; color:var(--muted); }.day-amounts { display:flex; flex-direction:column; font-size:10px; font-weight:700; overflow:hidden; }.income { color:#23804a; }.expense { color:#c14d49; }.legend { display:flex; flex-wrap:wrap; gap:8px 18px; margin-top:16px; color:var(--muted); font-size:11px; }.legend i { display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:6px; }.income-dot { background:#4cab70; }.expense-dot { background:#dc7771; }.details { background:var(--shell-lilac,#f2ebfa); color:#31244c; padding:26px; min-width:0; }.details-heading h3 { font-size:20px; line-height:1.25; font-weight:850; letter-spacing:-.03em; margin:7px 0; }.details-heading p,.details .overline { color:#6c5e7b; }.transaction-list { display:flex; flex-direction:column; gap:8px; margin-top:20px; max-height:430px; overflow-y:auto; }.transaction { display:flex; align-items:center; gap:10px; padding:12px; background:var(--surface); border:1px solid var(--rule); border-radius:14px; color:var(--ink); }.transaction-icon { display:grid; place-items:center; width:32px; height:32px; flex:none; border-radius:11px; font-weight:800; }.is-income { color:#237c4a; background:#ddf3e4; }.is-expense { color:#b64640; background:#ffe4df; }.transaction-info { min-width:0; flex:1; }.transaction-info strong,.transaction-info span { display:block; overflow-wrap:anywhere; }.transaction-info strong { font-size:13px; }.transaction-info span { color:var(--muted); font-size:11px; margin-top:3px; }.transaction-amount { font-size:12px; text-align:right; overflow-wrap:anywhere; }.detail-state { margin-top:20px; padding:24px 16px; text-align:center; border:1px dashed #b9a9cc; border-radius:14px; color:#6c5e7b; font-size:13px; }.detail-state strong { color:#31244c; }.detail-state p { margin-top:6px; }.retry { text-decoration:underline; font-weight:700; }.calendar-modal button:focus-visible { outline:3px solid #9a78d5; outline-offset:2px; } @media(max-width:800px) { .calendar-body { grid-template-columns:1fr; }.details { padding:22px; }.transaction-list { max-height:250px; } } @media(max-width:520px) { .calendar-overlay { padding:8px; }.calendar-modal { max-height:calc(100dvh - 16px); border-radius:18px; }.modal-header,.calendar-main { padding:20px 16px; }.modal-header h2 { font-size:25px; }.month-heading h3 { font-size:18px; }.day { min-height:55px; padding:4px; border-radius:7px; }.day-amounts { font-size:9px; }.day-count { font-size:9px; }.legend span:last-child { flex-basis:100%; } }
</style>
