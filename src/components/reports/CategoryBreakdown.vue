<template>
  <ol v-if="items.length" class="analysis-category-list">
    <li v-for="(item, index) in items" :key="item.id"><div class="analysis-category-title"><span class="analysis-category-number">{{ String(index + 1).padStart(2, '0') }}</span><h3>{{ item.categoryName }}</h3><span>{{ item.percentage.toLocaleString('id-ID', { maximumFractionDigits: 1 }) }}%</span></div><strong>{{ accountMoney(item.totalAmount, 'IDR') }}</strong><div class="analysis-category-bar" aria-hidden="true"><span :style="{ width: `${item.percentage}%`, backgroundColor: item.color }"></span></div></li>
  </ol>
  <div v-else class="analysis-empty is-compact"><AppIcon name="tag" /><h3>Belum ada pengeluaran.</h3><p>Distribusi kategori akan tampil setelah ada transaksi.</p></div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { accountMoney } from '@/utils/accountList'
import { analysisCategoryTotals } from '@/utils/spendingAnalysis'
import type { CategoryTrendAnalysis } from '@/types/reports'
const props = defineProps<{ data: CategoryTrendAnalysis | null }>()
const items = computed(() => analysisCategoryTotals(props.data))
</script>
