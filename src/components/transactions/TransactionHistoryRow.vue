<template>
  <li>
    <RouterLink :to="{ name: 'transaction-detail', params: { id: transaction.id }, query: returnQuery }" class="tx-row">
      <time class="tx-row-date" :datetime="transaction.transactionDate">{{ dateLabel }}</time>
      <div class="tx-row-description">
        <span class="tx-row-icon" :style="transaction.category?.color ? { color: transaction.category.color } : undefined">
          <i v-if="transaction.category?.icon && transaction.transactionType !== 'TRANSFER'"
            :class="['fa-solid', `fa-${transaction.category.icon}`]" aria-hidden="true"></i>
          <AppIcon v-else :name="transaction.transactionType === 'TRANSFER' ? 'transfer' : 'wallet'" />
        </span>
        <span class="tx-row-copy">
          <strong>{{ transaction.description || transaction.category?.categoryName || typeLabel }}</strong>
          <span>{{ transaction.category?.categoryName || (transaction.transactionType === 'TRANSFER' ? 'Antar akun' : 'Tanpa kategori') }}
            <AppIcon v-if="transaction.attachmentPath || transaction.attachmentUrl" name="attachment" />
            <span v-if="transaction.attachmentPath || transaction.attachmentUrl" class="shell-sr-only">Ada lampiran</span>
          </span>
          <small class="tx-row-mobile-meta">{{ dateLabel }} · {{ accountLabel }}</small>
        </span>
      </div>
      <span class="tx-row-account">{{ accountLabel }}</span>
      <span class="tx-type-badge" :class="transaction.transactionType.toLowerCase()">{{ typeLabel }}</span>
      <span class="tx-row-amount" :class="transaction.transactionType.toLowerCase()">
        <span class="shell-sr-only">{{ typeLabel }}: </span>{{ signedAmount }}
      </span>
      <AppIcon name="chevron" class="tx-row-chevron" />
    </RouterLink>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, type LocationQuery } from 'vue-router'
import AppIcon from '@/components/common/AppIcon.vue'
import type { Transaction } from '@/types/transaction'

const props = defineProps<{ transaction: Transaction; returnQuery: LocationQuery }>()
const typeLabel = computed(() => ({ INCOME: 'Pemasukan', EXPENSE: 'Pengeluaran', TRANSFER: 'Transfer' })[props.transaction.transactionType])
const dateLabel = computed(() => {
  const value = props.transaction.transactionDate
  const date = new Date(value.includes('T') ? value : `${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? 'Tanggal tidak tersedia' : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
})
const accountLabel = computed(() => {
  const transaction = props.transaction
  if (transaction.transactionType === 'TRANSFER') return `${transaction.sourceAccount?.accountName || '—'} → ${transaction.destinationAccount?.accountName || '—'}`
  return (transaction.transactionType === 'INCOME' ? transaction.destinationAccount?.accountName : transaction.sourceAccount?.accountName) || 'Akun tidak tersedia'
})
const signedAmount = computed(() => {
  const prefix = props.transaction.transactionType === 'INCOME' ? '+' : props.transaction.transactionType === 'EXPENSE' ? '−' : ''
  return `${prefix}${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(props.transaction.amount))}`
})
</script>
