<template>
  <section v-if="data" class="analysis-summary" aria-label="Ringkasan keuangan rentang pilihan">
    <article v-for="card in cards" :key="card.label" class="analysis-summary-card" :class="`is-${card.tone}`"><span><AppIcon :name="card.icon" />{{ card.label }}</span><strong>{{ card.value }}</strong><p>{{ card.note }}</p></article>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { accountMoney } from '@/utils/accountList'
import { analysisNumber } from '@/utils/spendingAnalysis'
import type { FinancialSummary } from '@/types/reports'
const props = defineProps<{ data: FinancialSummary | null }>()
const cards = computed(() => {
  if (!props.data) return []
  const income = analysisNumber(props.data.totalIncome), expense = analysisNumber(props.data.totalExpense), net = income - expense
  return [
    { label: 'Total pemasukan', value: accountMoney(income, 'IDR'), note: 'Dana masuk pada rentang pilihan', icon: 'plus', tone: 'mint' },
    { label: 'Total pengeluaran', value: accountMoney(expense, 'IDR'), note: 'Dana keluar pada rentang pilihan', icon: 'wallet', tone: 'sun' },
    { label: 'Arus kas bersih', value: accountMoney(net, 'IDR'), note: net >= 0 ? 'Selisih pemasukan dan pengeluaran' : 'Pengeluaran melebihi pemasukan', icon: 'transfer', tone: 'lilac' },
    { label: 'Rasio sisa dana', value: income > 0 ? `${(net / income * 100).toLocaleString('id-ID', { maximumFractionDigits: 1 })}%` : '—', note: income > 0 ? 'Sisa dana dibanding total pemasukan' : 'Belum ada pemasukan sebagai pembanding', icon: 'percent', tone: 'paper' },
  ]
})
</script>
