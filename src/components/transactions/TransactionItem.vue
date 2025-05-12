<template>
  <li class="px-4 py-4 sm:px-6 hover:bg-slate-50 transition-colors">
    <div class="flex items-center space-x-4">
      <div class="flex-shrink-0">
        <span
          :class="[
            'w-10 h-10 rounded-full flex items-center justify-center text-white',
            categoryColorBackground,
          ]"
          :style="{ backgroundColor: transaction.category?.color || defaultCategoryColor }"
          :title="transaction.category?.categoryName || transaction.transactionType"
        >
          <svg
            v-if="transaction.category?.icon === 'utensils'"
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
              d="M15.362 5.214A8.252 8.252 0 0 1 12 21M6.038 7.098A8.252 8.252 0 0 1 9.75 21M12 13.5A3.375 3.375 0 0 0 15.375 10.125V9.75A3.375 3.375 0 0 0 12 6.375V5.25A3.375 3.375 0 0 0 8.625 1.875M12 6.375A3.375 3.375 0 0 0 8.625 9.75V10.125A3.375 3.375 0 0 0 12 13.5Z"
            />
          </svg>
          <svg
            v-else-if="transaction.category?.icon === 'briefcase'"
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
              d="M20.25 14.15v4.073a2.25 2.25 0 0 1-2.25 2.25h-12a2.25 2.25 0 0 1-2.25-2.25v-4.073M15.75 10.5h-7.5a2.25 2.25 0 0 0-2.25 2.25v4.073a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-4.073a2.25 2.25 0 0 0-2.25-2.25Z"
            />
          </svg>
          <svg
            v-else-if="transaction.transactionType === 'TRANSFER'"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h18m-7.5-3.75L21 12m0 0L16.5 7.5M21 12H3"
            />
          </svg>
          <span v-else class="font-bold text-lg">
            {{
              transaction.category?.categoryName?.charAt(0).toUpperCase() ||
              transaction.transactionType.charAt(0)
            }}
          </span>
        </span>
      </div>

      <div class="flex-1 min-w-0">
        <p
          class="text-sm font-medium text-indigo-600 truncate"
          :title="transaction.category?.categoryName || transaction.transactionType"
        >
          {{ transaction.category?.categoryName || transaction.transactionType.replace('_', ' ') }}
        </p>
        <p class="text-sm text-slate-700 truncate" :title="transaction.description ?? undefined">
          {{ transaction.description || 'Tidak ada deskripsi' }}
        </p>
        <p class="text-xs text-slate-500 truncate">
          {{ formatDate(transaction.transactionDate) }}
          <span v-if="transaction.transactionType === 'EXPENSE' && transaction.sourceAccount">
            · Dari: {{ transaction.sourceAccount.accountName }}
          </span>
          <span v-if="transaction.transactionType === 'INCOME' && transaction.destinationAccount">
            · Ke: {{ transaction.destinationAccount.accountName }}
          </span>
          <span v-if="transaction.transactionType === 'TRANSFER'">
            · Dari: {{ transaction.sourceAccount?.accountName }} ke
            {{ transaction.destinationAccount?.accountName }}
          </span>
        </p>
      </div>

      <div class="text-right">
        <p :class="['text-sm font-semibold whitespace-nowrap', amountColorClass]">
          {{
            transaction.transactionType === 'INCOME'
              ? '+'
              : transaction.transactionType === 'EXPENSE'
                ? '-'
                : ''
          }}
          {{ formatCurrency(transaction.amount, 'IDR') }}
        </p>
        <div class="text-xs mt-1 space-x-2 print:hidden">
          <button @click="$emit('edit', transaction)" class="text-blue-600 hover:text-blue-800">
            Edit
          </button>
          <button @click="$emit('delete', transaction)" class="text-red-600 hover:text-red-800">
            Hapus
          </button>
        </div>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Tipe untuk transaksi (sesuaikan dengan API)
interface Transaction {
  id: string
  transactionDate: string // Atau Date
  description?: string | null
  amount: number
  transactionType: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  category?: {
    id: string
    categoryName: string
    color?: string | null
    icon?: string | null
  } | null
  sourceAccount?: { id: string; accountName: string } | null
  destinationAccount?: { id: string; accountName: string } | null
}

const props = defineProps<{
  transaction: Transaction
}>()

const emit = defineEmits(['edit', 'delete'])

const defaultCategoryColor = '#94a3b8' // slate-500

const categoryColorBackground = computed(() => {
  // Jika ingin background dari warna kategori, gunakan ini,
  // tapi pastikan kontras teksnya bagus. Untuk sekarang kita pakai warna kategori di style ikon.
  // return `bg-[${props.transaction.category?.color || defaultCategoryColor}]`;
  return '' // Dihandle oleh :style pada span ikon
})

const amountColorClass = computed(() => {
  switch (props.transaction.transactionType) {
    case 'INCOME':
      return 'text-green-600'
    case 'EXPENSE':
      return 'text-red-600'
    case 'TRANSFER':
      return 'text-slate-600' // Atau warna lain untuk transfer
    default:
      return 'text-slate-800'
  }
})

const formatCurrency = (value: number, currency: string = 'IDR') => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(value)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    // year: 'numeric',
    month: 'short',
    day: 'numeric',
    // hour: '2-digit',
    // minute: '2-digit',
  })
}
</script>
