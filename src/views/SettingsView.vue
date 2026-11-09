<template>
  <div class="money-settings">
    <header class="settings-heading"><div><span class="shell-overline">RUANG YANG SESUAI DENGANMU</span><h1>Atur kenyamanan finansialmu.</h1><p>Kelola tampilan, langganan, dan aktivitas akun dalam satu tempat.</p></div><RouterLink :to="{ name: 'profile' }" class="settings-button"><AppIcon name="user" />Profil akun</RouterLink></header>
    <div class="settings-layout">
      <aside class="settings-sidebar"><div class="settings-account"><span class="settings-account-icon"><AppIcon name="settings" /></span><strong>{{ authStore.currentUser?.fullName || authStore.currentUser?.username || 'Akun Moneytory' }}</strong><span>{{ authStore.currentUser?.email }}</span></div><nav aria-label="Bagian pengaturan"><RouterLink v-for="section in sections" :key="section.value" :to="{ name: 'settings', query: { section: section.value === 'main' ? undefined : section.value } }" :class="{ 'is-active': currentView === section.value }" :aria-current="currentView === section.value ? 'page' : undefined"><AppIcon :name="section.icon" /><span>{{ section.label }}</span><AppIcon name="chevron" /></RouterLink></nav><p class="settings-sidebar-note">Pengaturan tampilan disimpan pada perangkat ini.</p></aside>
      <div class="settings-workspace">
        <template v-if="currentView === 'main'">
          <SettingsSection id="subscription" title="Langganan & paket" icon="credit" eyebrow="PILIH RUANG UNTUK BERTUMBUH" tone="lilac">
            <template #action><span class="settings-chip">{{ currentPlanName }}</span></template>
            <div class="settings-plan-details"><div><span class="settings-small-label">Paket saat ini</span><h3>{{ currentPlanName }}</h3><p>{{ currentPlanDescription }}</p></div><dl><div><dt>Mulai langganan</dt><dd>{{ transactionDateLabel(authStore.currentUser?.activeSubscription?.startDate) }}</dd></div><div><dt>{{ isFree ? 'Masa berlaku' : 'Berakhir pada' }}</dt><dd>{{ isFree ? 'Tanpa biaya langganan' : transactionDateLabel(authStore.currentUser?.activeSubscription?.endDate) }}</dd></div></dl></div>
            <div v-if="scheduledPlanCode" class="settings-notice"><AppIcon name="calendar" /><div><strong>Perubahan paket terjadwal</strong><p>Paket akan berubah menjadi {{ scheduledPlanName }} pada {{ transactionDateLabel(authStore.currentUser?.activeSubscription?.endDate) }}.</p></div><button type="button" class="settings-button" :disabled="isUndoing" @click="handleUndoDowngrade"><span v-if="isUndoing" class="settings-spinner" aria-hidden="true"></span>{{ isUndoing ? 'Memproses...' : 'Batalkan perubahan' }}</button></div>
            <p v-if="planActionError" class="settings-inline-error" role="alert">{{ planActionError }}</p>
            <p v-if="subscriptionStore.error" class="settings-hint" role="status">Pilihan paket belum berhasil dimuat. <button type="button" class="settings-text-button" :disabled="subscriptionStore.isLoading" @click="subscriptionStore.fetchPlans()">Coba lagi</button></p>
            <footer class="settings-section-actions"><RouterLink v-if="!isFree" :to="{ name: 'subscription-checkout', query: { action: 'renew' } }" class="settings-button is-primary"><AppIcon name="refresh" />Perpanjang paket</RouterLink><RouterLink :to="{ name: 'subscription-checkout', query: { action: 'upgrade' } }" class="settings-button" :class="{ 'is-primary': isFree }">{{ isFree ? 'Lihat pilihan paket' : 'Ganti paket' }}<AppIcon name="arrow" /></RouterLink></footer>
          </SettingsSection>
          <SettingsSection v-if="isBusiness" id="company" title="Ruang perusahaan" icon="building" description="Informasi perusahaan yang terhubung dengan akunmu.">
            <div v-if="companyLoading" class="settings-inline-state" role="status"><span class="settings-spinner" aria-hidden="true"></span>Memuat perusahaan...</div><div v-else-if="companyError" class="settings-inline-state" role="alert"><p>{{ companyError }}</p><button type="button" class="settings-button" @click="loadCompany">Coba lagi</button></div><div v-else-if="businessStore.currentCompany" class="settings-company"><div><h3>{{ businessStore.currentCompany.name }}</h3><p>{{ businessStore.currentCompany.email || businessStore.currentCompany.phone || 'Informasi kontak belum ditambahkan.' }}</p></div><span v-if="businessStore.myRole" class="settings-chip">{{ roleLabels[businessStore.myRole] || businessStore.myRole }}</span><RouterLink :to="{ name: 'business-settings' }" class="settings-text-link">Kelola perusahaan<AppIcon name="arrow" /></RouterLink></div><div v-else class="settings-company"><p>Belum ada perusahaan yang terhubung.</p><RouterLink :to="{ name: 'business-settings' }" class="settings-text-link">Pengaturan perusahaan<AppIcon name="arrow" /></RouterLink></div>
          </SettingsSection>
          <SettingsSection id="preferences" title="Tampilan & preferensi" icon="sun" description="Sesuaikan tampilan agar pencatatan terasa nyaman.">
            <div class="settings-preference-row"><div><h3>Tema tampilan</h3><p>Gunakan tampilan terang, gelap, atau ikuti pengaturan perangkat.</p></div><AppSelect id="settings-theme" :model-value="themeStore.theme" :options="themeOptions" aria-label="Tema tampilan" @update:model-value="changeTheme" /></div>
            <div class="settings-preference-row"><div><h3>Bahasa aplikasi</h3><p>Bahasa yang tersedia saat ini.</p></div><span class="settings-static-value">Bahasa Indonesia</span></div><div class="settings-preference-row"><div><h3>Mata uang utama</h3><p>Nominal utama dalam ringkasan dan pencatatan.</p></div><span class="settings-static-value">IDR · Rupiah</span></div>
          </SettingsSection>
          <SettingsSection id="activity" title="Aktivitas akun" icon="calendar" description="Jadwal otomatis dan riwayat paket langgananmu."><RouterLink :to="{ name: 'settings', query: { section: 'recurring' } }" class="settings-navigation-row"><span class="settings-row-symbol"><AppIcon name="refresh" /></span><div><h3>Transaksi berulang</h3><p>Lihat jadwal dan hentikan transaksi otomatis berikutnya.</p></div><AppIcon name="chevron" /></RouterLink><RouterLink :to="{ name: 'settings', query: { section: 'payment-history' } }" class="settings-navigation-row"><span class="settings-row-symbol"><AppIcon name="credit" /></span><div><h3>Riwayat pembayaran</h3><p>Lihat status pembelian paket dan lanjutkan pembayaran tertunda.</p></div><AppIcon name="chevron" /></RouterLink></SettingsSection>
          <SettingsSection id="data" title="Data & keamanan" icon="lock" description="Akses catatan keuangan dan pengamanan akunmu."><div class="settings-preference-row"><div><h3>Unduh data transaksi</h3><p>File CSV berisi transaksi yang tersedia untuk akunmu. Cakupan riwayat mengikuti akses paket.</p><p v-if="exporting" class="settings-hint" role="status">Menyiapkan {{ exportCount }} transaksi...</p></div><div class="settings-download-actions"><button type="button" class="settings-button" :disabled="exporting" @click="downloadCsv"><span v-if="exporting" class="settings-spinner" aria-hidden="true"></span><AppIcon v-else name="download" />{{ exporting ? 'Menyiapkan...' : 'Unduh CSV' }}</button><button v-if="exporting" type="button" class="settings-text-button" @click="cancelExport">Batalkan</button></div></div><div class="settings-preference-row"><div><h3>Kata sandi & profil</h3><p>Kelola identitas dan keamanan akun dari halaman profil.</p></div><RouterLink :to="{ name: 'profile' }" class="settings-text-link">Ke profil<AppIcon name="arrow" /></RouterLink></div></SettingsSection>
        </template>
        <RecurringTransactionsList v-else-if="currentView === 'recurring'" @back="goMain" />
        <PaymentHistorySection v-else @back="goMain" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore, type Theme } from '@/stores/theme'
import { useBusinessStore } from '@/stores/business'
import { useSubscriptionStore } from '@/stores/subscriptions'
import { useToastStore } from '@/stores/toast'
import AppIcon from '@/components/common/AppIcon.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import SettingsSection from '@/components/settings/SettingsSection.vue'
import RecurringTransactionsList from '@/components/settings/RecurringTransactionsList.vue'
import PaymentHistorySection from '@/components/settings/PaymentHistorySection.vue'
import apiClient from '@/services/apiService'
import { settingsSection, settingsPlanName, collectTransactionArchive, transactionsCsv, type TransactionArchivePage } from '@/utils/settings'
import { transactionDateLabel } from '@/utils/transactionForm'
import { dateKey } from '@/utils/dateRange'
import '@/assets/settings.css'
const authStore = useAuthStore(), themeStore = useThemeStore(), businessStore = useBusinessStore(), subscriptionStore = useSubscriptionStore(), toast = useToastStore()
const route = useRoute(), router = useRouter()
const currentView = computed(() => settingsSection(route.query.section))
const sections = [{ value: 'main', label: 'Umum & langganan', icon: 'settings' }, { value: 'recurring', label: 'Transaksi berulang', icon: 'refresh' }, { value: 'payment-history', label: 'Riwayat pembayaran', icon: 'credit' }]
const goMain = () => router.push({ name: 'settings' })
const currentPlanCode = computed(() => authStore.currentUser?.activeSubscription?.planCode || authStore.currentUser?.subscriptionPlan || 'FREE')
const isFree = computed(() => currentPlanCode.value === 'FREE')
const isBusiness = computed(() => authStore.currentUser?.subscriptionPlan?.startsWith('BUSINESS') || currentPlanCode.value.startsWith('BUSINESS'))
const currentPlanName = computed(() => settingsPlanName(currentPlanCode.value, subscriptionStore.plans, authStore.currentUser?.activeSubscription?.planName))
const currentPlanDescription = computed(() => subscriptionStore.plans.find((plan) => plan.code === currentPlanCode.value)?.description || (isFree.value ? 'Ruang awal untuk mencatat dan mengenali keuanganmu.' : 'Lihat pilihan paket untuk rincian layanan dan masa berlangganan.'))
const cancelledSchedule = ref(false)
const scheduledPlanCode = computed(() => cancelledSchedule.value ? null : authStore.currentUser?.activeSubscription?.scheduledPlanCode)
const scheduledPlanName = computed(() => settingsPlanName(scheduledPlanCode.value, subscriptionStore.plans, authStore.currentUser?.activeSubscription?.scheduledPlanName))
const isUndoing = ref(false), planActionError = ref('')
const handleUndoDowngrade = async () => {
  if (isUndoing.value || !scheduledPlanCode.value) return
  isUndoing.value = true; planActionError.value = ''
  try {
    await subscriptionStore.cancelScheduledDowngrade(); cancelledSchedule.value = true; toast.show('Perubahan paket terjadwal berhasil dibatalkan.')
    try { await authStore.fetchUserProfile() } catch { planActionError.value = 'Perubahan berhasil dibatalkan, tetapi informasi akun belum berhasil diperbarui. Muat ulang halaman untuk memperbaruinya.' }
  }
  catch (failure: unknown) { planActionError.value = failure instanceof Error ? failure.message : 'Perubahan paket belum berhasil dibatalkan.' }
  finally { isUndoing.value = false }
}
const themeOptions: { value: Theme; label: string; description: string }[] = [{ value: 'light', label: 'Terang', description: 'Kertas hangat dan warna pastel' }, { value: 'dark', label: 'Gelap', description: 'Tampilan redup untuk kenyamanan mata' }, { value: 'system', label: 'Ikuti perangkat', description: 'Beralih sesuai pengaturan sistem' }]
const changeTheme = (theme: Theme) => { themeStore.setTheme(theme); toast.show('Tema tampilan diperbarui.') }
const companyLoading = ref(false), companyError = ref('')
const roleLabels: Record<string, string> = { OWNER: 'Pemilik', ADMIN: 'Admin', STAFF: 'Staf', VIEWER: 'Pengamat' }
const loadCompany = async () => {
  companyLoading.value = true; companyError.value = ''
  try { await businessStore.fetchMyCompany(); if (businessStore.currentCompany) await businessStore.fetchMembers() }
  catch (failure: unknown) { const status = (failure as { response?: { status?: number } } | null)?.response?.status; if (status !== 404 || businessStore.currentCompany) companyError.value = 'Informasi perusahaan belum berhasil dimuat.' }
  finally { companyLoading.value = false }
}
const exporting = ref(false), exportCount = ref(0)
let exportController: AbortController | null = null
const cancelExport = () => exportController?.abort()
const downloadCsv = async () => {
  if (exporting.value) return
  const controller = new AbortController()
  exportController = controller; exporting.value = true; exportCount.value = 0
  try {
    const rows = await collectTransactionArchive(async (page) => (await apiClient.get<TransactionArchivePage>('/transactions', { params: { page, limit: 100, sortBy: 'createdAt', sortOrder: 'asc' }, signal: controller.signal })).data, (count) => { exportCount.value = count })
    if (controller.signal.aborted) return
    if (!rows.length) { toast.show('Belum ada transaksi yang tersedia untuk diekspor.', 'info'); return }
    const url = URL.createObjectURL(new Blob([transactionsCsv(rows)], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a'); link.href = url; link.download = `transaksi_moneytory_${dateKey(new Date())}.csv`; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 0)
    toast.show('Data transaksi berhasil diunduh.')
  } catch { if (!controller.signal.aborted) toast.show('Data transaksi belum berhasil diunduh. Silakan coba lagi.', 'error') }
  finally { exporting.value = false; exportController = null }
}
onMounted(async () => {
  if (route.query.upgrade === 'true') { await router.replace({ name: 'subscription-checkout', query: { action: 'upgrade' } }); return }
  if (!subscriptionStore.plans.length) void subscriptionStore.fetchPlans()
  if (isBusiness.value) void loadCompany()
})
onBeforeUnmount(cancelExport)
</script>
