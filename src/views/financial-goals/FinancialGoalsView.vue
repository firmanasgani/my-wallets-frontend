<template>
  <div class="money-goals">
    <header class="goals-heading"><div><span class="shell-overline">IMPIAN BESAR, LANGKAH KECIL</span><h1>Beri tujuan pada tabunganmu.</h1><p>Rencanakan target, sisihkan dana, dan lihat setiap langkahmu mendekat.</p></div><button type="button" class="goal-button is-primary" @click="openCreate"><AppIcon name="plus" />Buat goal</button></header>
    <section class="goals-toolbar" aria-label="Filter goal"><div class="goals-search"><label for="goal-search">Cari goal</label><div><AppIcon name="search" /><input id="goal-search" v-model="search" type="search" placeholder="Nama atau catatan goal..." /></div></div><AppSelect id="goals-status" v-model="status" :options="statusOptions" label="Status" /><AppSelect id="goals-sort" v-model="sort" :options="sortOptions" label="Urutkan" /></section>
    <div v-if="loading" class="goal-state" role="status"><span class="goal-spinner" aria-hidden="true"></span><h2>Menyiapkan rencana keuanganmu...</h2></div>
    <div v-else-if="loadError" class="goal-state" role="alert"><AppIcon name="help" /><h2>Goal belum berhasil dimuat.</h2><p>{{ loadError }}</p><button type="button" class="goal-button" @click="loadGoals">Coba lagi</button></div>
    <template v-else>
      <section class="goals-summary" aria-label="Ringkasan seluruh goal"><article class="goals-summary-card is-lilac"><span><AppIcon name="target" />Tujuan terencana</span><strong>{{ rows.length }} goal</strong><p>{{ activeCount }} aktif menunggu langkah berikutnya</p></article><article class="goals-summary-card is-sun"><span><AppIcon name="wallet" />Total dana teralokasi</span><strong>{{ accountMoney(totalSaved, 'IDR') }}</strong><p>Seluruh goal, tanpa memindahkan saldo akun</p></article><article class="goals-summary-card is-mint"><span><AppIcon name="check" />Goal selesai</span><strong>{{ completedCount }} goal</strong><p>Ditandai selesai pada status goal</p></article></section>
      <div class="goals-section-heading"><div><span class="shell-overline">TUJUAN PILIHANMU</span><h2>Setiap impian punya ruang.</h2></div><span class="goals-count" role="status">{{ visibleRows.length }} dari {{ rows.length }} goal</span></div>
      <div v-if="!visibleRows.length" class="goal-state"><AppIcon :name="rows.length ? 'search' : 'target'" /><h2>{{ rows.length ? 'Belum ada yang cocok.' : 'Mulai dari tujuan yang berarti.' }}</h2><p>{{ rows.length ? 'Coba kata kunci atau status lainnya.' : 'Dana darurat, rumah pertama, atau perjalanan impian. Tentukan goal pertamamu.' }}</p><button v-if="rows.length" type="button" class="goal-button" @click="search = ''; status = ''">Reset pencarian</button><button v-else type="button" class="goal-button is-primary" @click="openCreate"><AppIcon name="plus" />Buat goal pertama</button></div>
      <div v-else class="goals-grid"><GoalCard v-for="goal in visibleRows" :key="goal.id" :goal="goal" :query="listQuery" @edit="openEdit" @delete="deleteGoal = $event" /></div>
    </template>
    <AddGoalModal v-if="showEditor" :is-open="showEditor" :goal="editingGoal" @close="showEditor = false" @success="saved" />
    <GoalDeleteModal v-if="deleteGoal" :is-open="!!deleteGoal" :goal="deleteGoal" :query="listQuery" @close="deleteGoal = null" @deleted="loadGoals" />
  </div>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/common/AppIcon.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import GoalCard from '@/components/financial-goals/GoalCard.vue'
import AddGoalModal from '@/components/financial-goals/AddGoalModal.vue'
import GoalDeleteModal from '@/components/financial-goals/GoalDeleteModal.vue'
import { useFinancialGoalStore } from '@/stores/financialGoals'
import { useToastStore } from '@/stores/toast'
import { accountMoney } from '@/utils/accountList'
import { filterGoals, goalNumber, goalStatusOptions } from '@/utils/financialGoals'
import type { FinancialGoal } from '@/types/financialGoals'
import '@/assets/financial-goals.css'
const store = useFinancialGoalStore(), toast = useToastStore(), route = useRoute(), router = useRouter()
const queryValue = (key: string) => typeof route.query[key] === 'string' ? route.query[key] as string : ''
const search = computed({ get: () => queryValue('search'), set: (value: string) => { void router.replace({ query: { ...route.query, search: value || undefined } }) } })
const status = computed({ get: () => goalStatusOptions.some((option) => option.value === queryValue('status')) ? queryValue('status') : '', set: (value: string) => { void router.replace({ query: { ...route.query, status: value || undefined } }) } })
const sort = computed({ get: () => ['newest', 'deadline', 'progress'].includes(queryValue('sort')) ? queryValue('sort') : 'newest', set: (value: string) => { void router.replace({ query: { ...route.query, sort: value } }) } })
const listQuery = computed(() => ({ ...route.query }))
const statusOptions = [{ value: '', label: 'Semua status' }, ...goalStatusOptions]
const sortOptions = [{ value: 'newest', label: 'Terbaru' }, { value: 'deadline', label: 'Tanggal target terdekat' }, { value: 'progress', label: 'Progres tertinggi' }]
const rows = ref<FinancialGoal[]>([]), loading = ref(true), loadError = ref('')
const visibleRows = computed(() => filterGoals(rows.value, search.value, status.value, sort.value))
const totalSaved = computed(() => rows.value.reduce((sum, goal) => sum + goalNumber(goal.currentSaved), 0))
const activeCount = computed(() => rows.value.filter((goal) => goal.status === 'ACTIVE').length)
const completedCount = computed(() => rows.value.filter((goal) => goal.status === 'COMPLETED').length)
const showEditor = ref(false), editingGoal = ref<FinancialGoal | null>(null), deleteGoal = ref<FinancialGoal | null>(null)
const openCreate = () => { editingGoal.value = null; showEditor.value = true }
const openEdit = (goal: FinancialGoal) => { editingGoal.value = goal; showEditor.value = true }
const saved = async () => { showEditor.value = false; toast.show(editingGoal.value ? 'Goal berhasil diperbarui.' : 'Goal berhasil dibuat.'); await loadGoals() }
let active = true, request = 0
const loadGoals = async () => {
  const version = ++request
  loading.value = true; loadError.value = ''
  try { const data = await store.fetchGoals(); if (!active || version !== request) return; if (data) rows.value = data; else loadError.value = store.errorMessage || 'Silakan coba lagi.' }
  catch { if (active && version === request) loadError.value = 'Silakan coba lagi.' }
  finally { if (active && version === request) loading.value = false }
}
onMounted(loadGoals)
onBeforeUnmount(() => { active = false; request++ })
</script>
