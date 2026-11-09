<template>
  <div class="money-goals">
    <header class="goals-heading"><div><RouterLink :to="listLocation" class="goal-back"><AppIcon name="arrow" />Daftar goal keuangan</RouterLink><span class="shell-overline">LANGKAH DEMI LANGKAH MENUJU TUJUANMU</span><h1>Rencana yang terus bertumbuh.</h1><p>Kelola alokasi, catat penggunaan, dan lihat perjalanan dana goalmu.</p></div><div v-if="goal && !loading" class="goal-heading-actions"><button type="button" class="goal-button" @click="showEditor = true"><AppIcon name="edit" />Edit goal</button><button type="button" class="goal-button is-danger" @click="showDelete = true"><AppIcon name="trash" />Hapus goal</button></div></header>
    <div v-if="loading" class="goal-state" role="status"><span class="goal-spinner" aria-hidden="true"></span><h2>Memuat perjalanan goalmu...</h2></div>
    <div v-else-if="!goal" class="goal-state" role="alert"><AppIcon name="help" /><h2>Goal belum dapat ditampilkan.</h2><p>{{ loadError || 'Goal tidak ditemukan atau kamu tidak memiliki akses.' }}</p><button type="button" class="goal-button" @click="loadGoal">Coba lagi</button><RouterLink :to="listLocation" class="goal-button is-primary">Kembali ke daftar</RouterLink></div>
    <template v-else>
      <section class="goal-detail-hero"><header><span class="goal-detail-symbol"><AppIcon name="target" /></span><div><span class="shell-overline">TUJUAN FINANSIALMU</span><h2>{{ goal.name }}</h2><p v-if="goal.description">{{ goal.description }}</p></div><span class="goal-status" :class="`is-${goal.status.toLowerCase()}`">{{ goalStatusLabel(goal.status) }}</span></header><div class="goal-detail-amounts"><div><span>Dana teralokasi</span><strong>{{ accountMoney(progress.saved, 'IDR') }}</strong></div><div><span>Target nominal</span><strong>{{ accountMoney(progress.target, 'IDR') }}</strong></div></div><div class="goal-progress-heading"><span>{{ progress.reached ? 'Target nominal tercapai' : 'Progres menuju target' }}</span><strong>{{ progress.percentage.toLocaleString('id-ID', { maximumFractionDigits: 1 }) }}%</strong></div><div class="goal-progress" role="progressbar" :aria-label="`Progres ${goal.name}`" :aria-valuenow="progress.width" :aria-valuetext="`${progress.percentage.toFixed(1)}%`" aria-valuemin="0" aria-valuemax="100"><span :style="{ width: `${progress.width}%` }"></span></div><div class="goal-detail-progress-note"><span><AppIcon name="calendar" />{{ goal.targetDate ? `Target ${transactionDateLabel(goal.targetDate)}` : 'Tanpa tanggal target' }}</span><span>{{ progress.reached ? 'Dana telah memenuhi target nominal.' : `Masih perlu ${accountMoney(progress.remaining, 'IDR')}` }}</span></div><footer class="goal-fund-actions"><button type="button" class="goal-button is-primary" :disabled="goal.status !== 'ACTIVE'" @click="fundMode = 'allocate'"><AppIcon name="plus" />Alokasikan dana</button><button type="button" class="goal-button" :disabled="progress.saved <= 0" @click="fundMode = 'spend'"><AppIcon name="wallet" />Gunakan dana</button><button type="button" class="goal-button" :disabled="progress.saved <= 0" @click="fundMode = 'release'"><AppIcon name="transfer" />Lepaskan alokasi</button></footer><p v-if="goal.status !== 'ACTIVE'" class="goal-hint">Alokasi baru hanya tersedia untuk goal berstatus Aktif.</p></section>
      <div class="goal-detail-layout">
        <section class="goal-ledger-panel" aria-labelledby="ledger-heading"><header class="goal-panel-heading"><div><span class="shell-overline">JEJAK LANGKAHMU</span><h2 id="ledger-heading">Riwayat dana</h2></div><AppSelect id="goal-ledger-type" v-model="ledgerType" :options="ledgerOptions" aria-label="Jenis pergerakan dana" /></header>
          <div v-if="!visibleLedgers.length" class="goal-ledger-empty"><AppIcon name="book" /><h3>{{ ledgers.length ? 'Belum ada riwayat jenis ini.' : 'Mulai dari alokasi pertamamu.' }}</h3><p>{{ ledgers.length ? 'Pilih jenis pergerakan lain untuk melihat riwayat.' : 'Setiap alokasi dan penggunaan dana akan tercatat di sini.' }}</p></div>
          <ol v-else class="goal-ledger-list"><li v-for="ledger in visibleLedgers" :key="ledger.id"><span class="goal-ledger-symbol" :class="ledger.direction === 'INCOMING' ? 'is-incoming' : 'is-outgoing'"><AppIcon :name="ledger.direction === 'INCOMING' ? 'plus' : 'arrow'" /></span><div class="goal-ledger-description"><h3>{{ goalLedgerLabel(ledger.type) }}</h3><div class="goal-ledger-meta"><RouterLink v-if="ledger.account?.id" :to="{ name: 'account-detail', params: { id: ledger.account.id } }">{{ ledger.account.accountName || 'Lihat akun' }}</RouterLink><span v-else>{{ ledger.account?.accountName || 'Akun tidak tersedia' }}</span><time :datetime="ledger.createdAt">{{ transactionDateLabel(ledger.createdAt, true) }}</time></div><p v-if="ledger.note">{{ ledger.note }}</p><RouterLink v-if="ledger.referenceTransactionId" :to="{ name: 'transaction-detail', params: { id: ledger.referenceTransactionId } }" class="goal-text-link">Lihat transaksi <AppIcon name="arrow" /></RouterLink></div><strong class="goal-ledger-amount">{{ ledger.direction === 'INCOMING' ? '+' : '−' }}{{ accountMoney(ledger.amount, 'IDR') }}</strong></li></ol>
          <footer class="goal-ledger-footer" role="status">{{ visibleLedgers.length }} dari {{ ledgers.length }} pergerakan dana · Terbaru lebih dulu</footer>
        </section>
        <aside class="goal-detail-sidebar"><section class="goal-info-panel is-lilac"><span class="goal-info-symbol"><AppIcon name="info" /></span><h2>Uangnya tetap di akunmu.</h2><p>Alokasi menandai dana untuk goal tanpa memindahkan saldo. Gunakan dana untuk mencatat pengeluaran, atau lepaskan alokasi agar dana tersedia kembali.</p></section><section class="goal-info-panel"><h2>Rincian perjalanan</h2><dl><div><dt>Masih perlu dialokasikan</dt><dd>{{ accountMoney(progress.remaining, 'IDR') }}</dd></div><div><dt>Total pengeluaran goal</dt><dd>{{ accountMoney(totalSpent, 'IDR') }}</dd></div><div><dt>Dibuat pada</dt><dd>{{ transactionDateLabel(goal.createdAt) }}</dd></div><div><dt>Terakhir diperbarui</dt><dd>{{ transactionDateLabel(goal.updatedAt, true) }}</dd></div></dl></section></aside>
      </div>
    </template>
    <AddGoalModal v-if="showEditor && goal" :is-open="showEditor" :goal="goal" @close="showEditor = false" @success="updated" />
    <GoalFundsModal v-if="fundMode && goal" :is-open="!!fundMode" :mode="fundMode" :goal="goal" @close="fundMode = null" @success="fundsSaved" />
    <GoalDeleteModal v-if="showDelete && goal" :is-open="showDelete" :goal="goal" :query="route.query" @close="showDelete = false" @deleted="router.push(listLocation)" />
  </div>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/common/AppIcon.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import AddGoalModal from '@/components/financial-goals/AddGoalModal.vue'
import GoalDeleteModal from '@/components/financial-goals/GoalDeleteModal.vue'
import GoalFundsModal from '@/components/financial-goals/GoalFundsModal.vue'
import { useFinancialGoalStore } from '@/stores/financialGoals'
import { useToastStore } from '@/stores/toast'
import { accountMoney } from '@/utils/accountList'
import { goalLedgerLabel, goalNumber, goalProgress, goalStatusLabel, type GoalFundMode } from '@/utils/financialGoals'
import { transactionDateLabel } from '@/utils/transactionForm'
import type { FinancialGoal } from '@/types/financialGoals'
import '@/assets/financial-goals.css'
const route = useRoute(), router = useRouter(), store = useFinancialGoalStore(), toast = useToastStore()
const id = computed(() => typeof route.params.id === 'string' ? route.params.id : '')
const listLocation = computed(() => ({ name: 'financial-goals-list', query: route.query }))
const goal = ref<FinancialGoal | null>(null), loading = ref(true), loadError = ref('')
const progress = computed(() => goal.value ? goalProgress(goal.value) : { saved: 0, target: 0, percentage: 0, width: 0, remaining: 0, reached: false })
const showEditor = ref(false), showDelete = ref(false), fundMode = ref<GoalFundMode | null>(null)
const ledgerType = ref('')
const ledgerOptions = [{ value: '', label: 'Semua pergerakan' }, ...['ALLOCATE', 'SPEND', 'RELEASE', 'ADJUST'].map((value) => ({ value, label: goalLedgerLabel(value) }))]
const ledgers = computed(() => [...(goal.value?.ledgers || [])].sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0)))
const visibleLedgers = computed(() => ledgers.value.filter((ledger) => !ledgerType.value || ledger.type === ledgerType.value))
const totalSpent = computed(() => ledgers.value.filter((ledger) => ledger.type === 'SPEND' && ledger.direction === 'OUTGOING').reduce((sum, ledger) => sum + goalNumber(ledger.amount), 0))
let active = true, request = 0
const loadGoal = async () => {
  const version = ++request
  goal.value = null; loading.value = true; loadError.value = ''
  showEditor.value = false; showDelete.value = false; fundMode.value = null
  if (!id.value) { loadError.value = 'ID goal tidak valid.'; loading.value = false; return }
  try { const data = await store.fetchGoalById(id.value); if (!active || version !== request) return; if (data) goal.value = data; else loadError.value = store.errorMessage || 'Goal tidak ditemukan.' }
  catch { if (active && version === request) loadError.value = 'Goal belum berhasil dimuat.' }
  finally { if (active && version === request) loading.value = false }
}
const updated = async () => { showEditor.value = false; toast.show('Goal berhasil diperbarui.'); await loadGoal() }
const fundsSaved = async () => { fundMode.value = null; toast.show('Perubahan dana goal berhasil dicatat.'); await loadGoal() }
watch(id, () => { ledgerType.value = ''; void loadGoal() }, { immediate: true })
onBeforeUnmount(() => { active = false; request++ })
</script>
