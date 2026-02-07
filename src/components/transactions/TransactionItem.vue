<template>
  <RouterLink
    :to="{ name: 'transaction-detail', params: { id: transaction.id } }"
    class="block px-4 py-4 sm:px-6 hover:bg-slate-50 transition-colors"
  >
    <div class="flex items-center space-x-4">
      <div class="flex-shrink-0">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm flex-shrink-0"
          :style="{
            backgroundColor: (transaction.category?.color || defaultCategoryColor) + '20',
            color: transaction.category?.color || defaultCategoryColor,
          }"
          :title="transaction.category?.categoryName || transaction.transactionType"
        >
          <span v-if="transaction.transactionType === 'TRANSFER'">
            <i class="fa-solid fa-right-left text-sm"></i>
          </span>
          <span v-else-if="transaction.category?.icon">
            <i :class="['fa-solid', `fa-${transaction.category.icon}`, 'text-sm']"></i>
          </span>
          <span v-else class="text-sm font-bold">
            {{
              transaction.category?.categoryName?.charAt(0).toUpperCase() ||
              transaction.transactionType.charAt(0)
            }}
          </span>
        </div>
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <p
            class="text-sm font-medium text-indigo-600 truncate"
            :title="transaction.category?.categoryName || transaction.transactionType"
          >
            {{
              transaction.category?.categoryName || transaction.transactionType.replace('_', ' ')
            }}
          </p>
          <!-- Attachment Indicator -->
          <i
            v-if="transaction.attachmentPath"
            class="fa-solid fa-paperclip text-[10px] text-slate-400"
            title="Ada lampiran"
          ></i>
        </div>
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

      <div class="text-right flex flex-col items-end">
        <p :class="['text-sm font-semibold whitespace-nowrap', amountColorClass]">
          {{ showAmount ? formatCurrency(transaction.amount, 'IDR') : '••••••••' }}
        </p>
        <i class="fa-solid fa-chevron-right text-[10px] text-slate-300 mt-1"></i>
      </div>
    </div>
  </RouterLink>
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
  attachmentPath?: string | null
}

const props = withDefaults(
  defineProps<{
    transaction: Transaction
    showAmount?: boolean
  }>(),
  {
    showAmount: true,
  },
)

const emit = defineEmits(['edit', 'delete'])

const defaultCategoryColor = '#94a3b8' // slate-500

const amountColorClass = computed(() => {
  switch (props.transaction.transactionType) {
    case 'INCOME':
      return 'text-green-600'
    case 'EXPENSE':
      return 'text-red-600'
    case 'TRANSFER':
      return 'text-slate-600'
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
    month: 'short',
    day: 'numeric',
  })
}
</script>
