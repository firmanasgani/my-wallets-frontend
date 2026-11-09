<template>
  <div v-if="data" class="analysis-comparison-grid">
    <article v-for="item in comparisons" :key="item.label" class="analysis-comparison-item">
      <span class="analysis-small-label">{{ item.label }}</span><div class="analysis-comparison-change"><strong>{{ item.change.percentage === null ? '—' : `${item.change.percentage > 0 ? '+' : ''}${item.change.percentage.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%` }}</strong><span class="analysis-status" :class="`is-${item.change.tone}`">{{ item.change.label }}</span></div>
      <p>{{ item.change.percentage === null ? 'Persentase belum tersedia karena nilai bulan sebelumnya nol.' : `Selisih ${accountMoney(Math.abs(item.change.difference), 'IDR')} dari bulan sebelumnya.` }}</p>
      <dl><div><dt>Bulan pilihan</dt><dd>{{ accountMoney(item.change.current, 'IDR') }}</dd></div><div><dt>Bulan sebelumnya</dt><dd>{{ accountMoney(item.change.previous, 'IDR') }}</dd></div></dl>
    </article>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { accountMoney } from '@/utils/accountList'
import { analysisComparison } from '@/utils/spendingAnalysis'
import type { PeriodComparison } from '@/types/reports'
const props = defineProps<{ data: PeriodComparison | null }>()
const comparisons = computed(() => props.data ? [{ label: 'Perubahan pemasukan', change: analysisComparison(props.data.income) }, { label: 'Perubahan pengeluaran', change: analysisComparison(props.data.expense, true) }] : [])
</script>
