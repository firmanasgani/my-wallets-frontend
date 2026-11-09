<template>
  <article class="goal-card" :class="{ 'is-reached': progress.reached }">
    <header><span class="goal-card-symbol"><AppIcon name="target" /></span><span class="goal-status" :class="`is-${goal.status.toLowerCase()}`">{{ goalStatusLabel(goal.status) }}</span></header>
    <h2><RouterLink :to="location">{{ goal.name }}</RouterLink></h2><p class="goal-card-description">{{ goal.description || 'Setiap langkah kecil mendekatkanmu pada tujuan.' }}</p>
    <div class="goal-card-amount"><span>Dana teralokasi</span><strong>{{ accountMoney(progress.saved, 'IDR') }}</strong><small>dari {{ accountMoney(progress.target, 'IDR') }}</small></div>
    <div class="goal-progress-heading"><span>{{ progress.reached ? 'Target nominal tercapai' : 'Progres tabungan' }}</span><strong>{{ progress.percentage.toLocaleString('id-ID', { maximumFractionDigits: 1 }) }}%</strong></div><div class="goal-progress" role="progressbar" :aria-label="`Progres ${goal.name}`" :aria-valuenow="progress.width" :aria-valuetext="`${progress.percentage.toFixed(1)}%`" aria-valuemin="0" aria-valuemax="100"><span :style="{ width: `${progress.width}%` }"></span></div>
    <p class="goal-card-deadline"><AppIcon name="calendar" />{{ goal.targetDate ? transactionDateLabel(goal.targetDate) : 'Tanpa tanggal target' }}</p>
    <footer><RouterLink :to="location" class="goal-text-link">Lihat detail <AppIcon name="arrow" /></RouterLink><div><button type="button" class="goal-icon-button" :aria-label="`Edit goal ${goal.name}`" title="Edit goal" @click="$emit('edit', goal)"><AppIcon name="edit" /></button><button type="button" class="goal-icon-button is-danger" :aria-label="`Hapus goal ${goal.name}`" title="Hapus goal" @click="$emit('delete', goal)"><AppIcon name="trash" /></button></div></footer>
  </article>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, type LocationQueryRaw } from 'vue-router'
import AppIcon from '@/components/common/AppIcon.vue'
import { accountMoney } from '@/utils/accountList'
import { goalProgress, goalStatusLabel } from '@/utils/financialGoals'
import { transactionDateLabel } from '@/utils/transactionForm'
import type { FinancialGoal } from '@/types/financialGoals'
const props = defineProps<{ goal: FinancialGoal; query?: LocationQueryRaw }>()
defineEmits<{ edit: [goal: FinancialGoal]; delete: [goal: FinancialGoal] }>()
const progress = computed(() => goalProgress(props.goal))
const location = computed(() => ({ name: 'financial-goal-detail', params: { id: props.goal.id }, query: props.query }))
</script>
