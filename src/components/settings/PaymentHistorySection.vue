<template>
  <div class="settings-subpage">
    <header class="settings-subpage-heading"><div><button type="button" class="settings-back" @click="$emit('back')"><AppIcon name="arrow" />Pengaturan umum</button><span class="shell-overline">JEJAK LANGGANANMU</span><h2>Riwayat pembayaran.</h2><p>Pantau status pembelian paket dan lanjutkan pembayaran yang tertunda.</p></div><button type="button" class="settings-button" :disabled="loading || !!resumingOrderId" @click="loadRows"><AppIcon name="refresh" />Muat ulang</button></header>
    <section class="settings-payment-filters" aria-label="Filter riwayat pembayaran"><div class="settings-search"><label for="payment-search">Cari pembayaran</label><div><AppIcon name="search" /><input id="payment-search" v-model="search" type="search" placeholder="Nomor pesanan atau paket..." /></div></div><AppSelect id="payment-status" v-model="status" :options="statusOptions" label="Status pembayaran" /><DateRangePicker :start-date="range?.startDate" :end-date="range?.endDate" label="Tanggal dibuat" @apply="range = $event" /><button v-if="range" type="button" class="settings-text-button" @click="range = null">Semua tanggal</button></section>
    <div v-if="actionError" class="settings-action-error" role="alert"><AppIcon name="warning" />{{ actionError }}</div>
    <p v-if="resumingOrderId" class="settings-hint" role="status">Pembayaran sedang dibuka. Selesaikan atau tutup jendela pembayaran sebelum melanjutkan pesanan lain.</p>
    <div v-if="loading" class="settings-state" role="status"><span class="settings-spinner" aria-hidden="true"></span><h3>Memuat riwayat pembayaran...</h3></div>
    <div v-else-if="loadError" class="settings-state" role="alert"><AppIcon name="help" /><h3>Riwayat belum berhasil dimuat.</h3><p>{{ loadError }}</p><button type="button" class="settings-button" @click="loadRows">Coba lagi</button></div>
    <template v-else>
      <section class="settings-summary" aria-label="Ringkasan seluruh pembayaran"><article class="is-mint"><span>Total pembayaran berhasil</span><strong>{{ accountMoney(totalPaid, 'IDR') }}</strong><p>Dari {{ successfulCount }} pesanan berhasil</p></article><article class="is-sun"><span>Menunggu pembayaran</span><strong>{{ pendingCount }} pesanan</strong><p>Status seluruh riwayat, sebelum filter</p></article></section>
      <div class="settings-result-heading"><h3>Daftar pembayaran</h3><span class="settings-chip" role="status">{{ visibleRows.length }} dari {{ rows.length }} pesanan</span></div>
      <div v-if="!visibleRows.length" class="settings-state"><AppIcon :name="rows.length ? 'search' : 'credit'" /><h3>{{ rows.length ? 'Belum ada yang cocok.' : 'Belum ada riwayat pembayaran.' }}</h3><p>{{ rows.length ? 'Coba kata kunci, status, atau tanggal lainnya.' : 'Pembelian paket langganan akan tercatat di halaman ini.' }}</p><button v-if="rows.length" type="button" class="settings-button" @click="search = ''; status = ''; range = null">Reset pencarian</button><RouterLink v-else :to="{ name: 'subscription-checkout', query: { action: 'upgrade' } }" class="settings-button">Lihat pilihan paket</RouterLink></div>
      <div v-else class="settings-payment-table-wrap" role="region" aria-label="Daftar pembayaran langganan" tabindex="0"><table class="settings-payment-table"><thead><tr><th scope="col">Paket & pesanan</th><th scope="col">Nominal</th><th scope="col">Status</th><th scope="col">Tanggal</th><th scope="col"><span class="shell-sr-only">Tindakan</span></th></tr></thead><tbody><tr v-for="item in visibleRows" :key="item.id"><th scope="row"><strong>{{ item.plan?.name || settingsPlanName(item.planCode) }}</strong><span class="settings-order-id">{{ item.orderId }}</span><small v-if="item.method">{{ item.method === 'MANUAL_TRANSFER' ? 'Transfer manual' : 'Pembayaran online' }}</small></th><td class="settings-payment-amount">{{ accountMoney(item.amount, 'IDR') }}</td><td><span class="settings-chip" :class="`is-${paymentStatusInfo(item.status).tone}`">{{ paymentStatusInfo(item.status).label }}</span></td><td><span class="settings-small-label">Dibuat</span><time :datetime="item.createdAt">{{ transactionDateLabel(item.createdAt, true) }}</time><template v-if="item.updatedAt"><span class="settings-small-label">Diperbarui</span><time :datetime="item.updatedAt">{{ transactionDateLabel(item.updatedAt, true) }}</time></template></td><td><button v-if="canResumePayment(item)" type="button" class="settings-button" :disabled="!!resumingOrderId" @click="resumePayment(item)"><span v-if="resumingOrderId === item.orderId" class="settings-spinner" aria-hidden="true"></span><AppIcon v-else name="arrow" />{{ resumingOrderId === item.orderId ? 'Memproses...' : 'Lanjutkan bayar' }}</button><span v-else-if="item.status === 'PENDING_REVIEW'" class="settings-hint">Menunggu verifikasi pembayaran</span><span v-else-if="item.status === 'PENDING' && item.method === 'MANUAL_TRANSFER'" class="settings-hint">Selesaikan sesuai instruksi transfer</span></td></tr></tbody></table></div>
      <p class="settings-footer-note"><AppIcon name="info" />Status pembayaran mengikuti konfirmasi yang diterima sistem. Muat ulang jika status belum berubah setelah pembayaran.</p>
    </template>
  </div>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/common/AppIcon.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import DateRangePicker from '@/components/common/DateRangePicker.vue'
import { useSubscriptionStore } from '@/stores/subscriptions'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { accountMoney } from '@/utils/accountList'
import { transactionDateLabel } from '@/utils/transactionForm'
import { canResumePayment, filterPayments, paymentStatusInfo, paymentStatusOptions, settingsPlanName } from '@/utils/settings'
import type { PaymentHistory } from '@/types/subscriptions'
import type { DateRange } from '@/utils/dateRange'
defineEmits<{ back: [] }>()
const store = useSubscriptionStore(), auth = useAuthStore(), toast = useToastStore()
const rows = ref<PaymentHistory[]>([]), loading = ref(true), loadError = ref(''), actionError = ref('')
const search = ref(''), status = ref(''), range = ref<DateRange | null>(null), resumingOrderId = ref<string | null>(null)
const statusOptions = [{ value: '', label: 'Semua status' }, ...paymentStatusOptions.map((item) => ({ value: item.value, label: item.label }))]
const visibleRows = computed(() => filterPayments(rows.value, search.value, status.value, range.value))
const successfulCount = computed(() => rows.value.filter((item) => item.status === 'SUCCESS').length)
const pendingCount = computed(() => rows.value.filter((item) => item.status === 'PENDING').length)
const totalPaid = computed(() => rows.value.filter((item) => item.status === 'SUCCESS').reduce((sum, item) => sum + (Number(item.amount) || 0), 0))
let active = true, request = 0
const loadRows = async () => {
  const version = ++request
  loading.value = true; loadError.value = ''
  try { const data = await store.fetchPaymentHistory(); if (!active || version !== request) return; if (data) rows.value = data; else loadError.value = store.historyError || 'Silakan coba lagi.' }
  catch { if (active && version === request) loadError.value = 'Silakan coba lagi.' }
  finally { if (active && version === request) loading.value = false }
}
interface SnapClient { pay: (token: string, callbacks: { onSuccess: () => void; onPending: () => void; onError: () => void; onClose: () => void }) => void }
const resumePayment = async (item: PaymentHistory) => {
  if (resumingOrderId.value || !canResumePayment(item)) return
  actionError.value = ''
  const snap = (window as Window & { snap?: SnapClient }).snap
  if (!snap) { actionError.value = 'Jendela pembayaran belum siap. Muat ulang halaman dan coba lagi.'; return }
  resumingOrderId.value = item.orderId
  try {
    const token = await store.resumePayment(item.orderId)
    if (!active) return
    if (!token) throw new Error('Token pembayaran belum tersedia. Silakan coba lagi.')
    const isCurrent = () => active && resumingOrderId.value === item.orderId
    snap.pay(token, {
      onSuccess: () => { if (!isCurrent()) return; resumingOrderId.value = null; toast.show('Memperbarui status pembayaran...', 'info'); void loadRows(); void auth.fetchUserProfile().catch(() => { if (active) actionError.value = 'Informasi langganan belum berhasil diperbarui. Muat ulang halaman untuk memperbaruinya.' }) },
      onPending: () => { if (!isCurrent()) return; resumingOrderId.value = null; void loadRows() },
      onError: () => { if (!isCurrent()) return; resumingOrderId.value = null; actionError.value = 'Pembayaran belum berhasil. Periksa status pesanan sebelum mencoba lagi.' },
      onClose: () => { if (isCurrent()) resumingOrderId.value = null },
    })
  } catch (failure: unknown) { if (active) { actionError.value = failure instanceof Error ? failure.message : 'Pembayaran belum dapat dilanjutkan.'; resumingOrderId.value = null } }
}
onMounted(loadRows)
onBeforeUnmount(() => { active = false; request++ })
</script>
