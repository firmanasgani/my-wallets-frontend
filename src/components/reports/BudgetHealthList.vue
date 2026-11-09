<template>
  <div v-if="data.length" class="analysis-budget-scroll" role="region" aria-label="Realisasi anggaran pengeluaran" tabindex="0">
    <table class="analysis-budget-table"><thead><tr><th scope="col">Kategori</th><th scope="col">Anggaran</th><th scope="col">Terpakai</th><th scope="col">Selisih</th><th scope="col">Status</th></tr></thead><tbody><tr v-for="item in rows" :key="item.id"><th scope="row"><div class="analysis-budget-category"><CategoryBadge :color="item.category?.color" :icon="item.category?.icon" />{{ item.category?.categoryName || 'Kategori tidak tersedia' }}</div></th><td>{{ accountMoney(item.amount, 'IDR') }}</td><td>{{ accountMoney(item.spent, 'IDR') }}</td><td>{{ accountMoney(item.progress.remaining, 'IDR') }}</td><td><span class="analysis-status" :class="`is-${item.progress.tone}`">{{ item.progress.status }}</span></td></tr></tbody></table>
  </div>
  <div v-else class="analysis-empty is-compact"><AppIcon name="target" /><h3>Belum ada anggaran pengeluaran.</h3><p>Tentukan batas per kategori untuk memantau realisasinya.</p></div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/common/AppIcon.vue'
import CategoryBadge from '@/components/categories/CategoryBadge.vue'
import { accountMoney } from '@/utils/accountList'
import { budgetProgress } from '@/utils/budget'
import type { BudgetReportItem } from '@/types/budget'
const props = defineProps<{ data: BudgetReportItem[] }>()
const rows = computed(() => props.data.map((item) => ({ ...item, progress: budgetProgress(item) })).sort((a, b) => b.progress.percentage - a.progress.percentage))
</script>
