<template>
  <div class="money-profile">
    <header class="profile-heading"><div><span class="shell-overline">AKUN YANG MENEMANI PERJALANANMU</span><h1>Ruang personalmu.</h1><p>Lihat identitas akun, perbarui foto, dan kelola keamananmu.</p></div><RouterLink :to="{ name: 'settings' }" class="profile-button"><AppIcon name="settings" />Pengaturan</RouterLink></header>
    <div v-if="loading && !user" class="profile-state" role="status"><span class="profile-spinner" aria-hidden="true"></span><h2>Memuat profilmu...</h2></div>
    <div v-else-if="!user" class="profile-state" role="alert"><AppIcon name="help" /><h2>Profil belum dapat ditampilkan.</h2><p>{{ loadError || 'Informasi akun belum tersedia.' }}</p><button type="button" class="profile-button" @click="loadProfile">Coba lagi</button></div>
    <template v-else>
      <div v-if="loadError" class="profile-notice" role="alert"><AppIcon name="warning" /><p>{{ loadError }}</p><button type="button" class="profile-button" :disabled="busy" @click="loadProfile">Muat ulang profil</button></div>
      <div v-if="isDemo" class="profile-notice" role="status"><AppIcon name="info" /><p>Akun demo menampilkan contoh profil. Perubahan foto, kata sandi, dan penghapusan akun tidak tersedia.</p></div>
      <div class="profile-layout">
        <aside class="profile-identity"><span class="shell-overline">PROFIL MONEYTORY</span><ProfileAvatar :src="photoSource" :name="user.fullName" :username="user.username" :busy="!!photoAction" large /><h2>{{ user.fullName || user.username }}</h2><span class="profile-username">@{{ user.username }}</span><p>{{ user.email }}</p><span class="profile-plan-chip"><AppIcon name="credit" />{{ planName }}</span><dl><div><dt>Bergabung sejak</dt><dd>{{ transactionDateLabel(user.createdAt) }}</dd></div><div><dt>Preferensi & langganan</dt><dd><RouterLink :to="{ name: 'settings' }">Kelola pengaturan<AppIcon name="arrow" /></RouterLink></dd></div></dl></aside>
        <div class="profile-workspace">
          <section class="profile-panel" aria-labelledby="profile-photo-title"><header class="profile-panel-heading"><span class="profile-section-symbol"><AppIcon name="user" /></span><div><span class="shell-overline">SENTUHAN PERSONAL</span><h2 id="profile-photo-title">Foto profil</h2><p>Foto membantu mengenali akunmu di Moneytory.</p></div></header><div class="profile-photo-content"><ProfileAvatar :src="photoSource" :name="user.fullName" :username="user.username" :busy="!!photoAction" /><div><input ref="fileInput" class="shell-sr-only" type="file" accept="image/jpeg,image/png,image/webp" :disabled="busy || isDemo" aria-label="Pilih foto profil" @change="handleFileChange" /><div class="profile-photo-actions"><button type="button" class="profile-button is-primary" :disabled="busy || isDemo" @click="triggerFileInput"><span v-if="photoAction === 'upload'" class="profile-spinner" aria-hidden="true"></span><AppIcon v-else name="attachment" />{{ photoAction === 'upload' ? 'Mengunggah...' : 'Pilih foto baru' }}</button><button v-if="hasPhoto" type="button" class="profile-button is-danger" :disabled="busy || isDemo" @click="openDeletePhoto"><AppIcon name="trash" />Hapus foto</button></div><p class="profile-hint">JPG, PNG, atau WebP · Maksimal 5 MB.<br />Foto langsung diunggah setelah dipilih.</p></div></div><p v-if="photoError" class="profile-field-error" role="alert">{{ photoError }}</p><p v-if="photoAction" class="profile-hint" role="status">{{ photoAction === 'upload' ? 'Menyimpan foto profil...' : 'Menghapus foto profil...' }}</p></section>
          <section class="profile-panel" aria-labelledby="profile-information-title"><header class="profile-panel-heading"><span class="profile-section-symbol"><AppIcon name="file" /></span><div><span class="shell-overline">INFORMASI AKUN</span><h2 id="profile-information-title">Identitasmu</h2><p>Nama, username, dan email mengikuti data pendaftaran.</p></div><span class="profile-readonly-badge"><AppIcon name="lock" />Hanya baca</span></header><div class="profile-account-fields"><div class="profile-field"><label for="profile-full-name">Nama lengkap</label><input id="profile-full-name" :value="user.fullName || ''" readonly placeholder="Belum diisi" autocomplete="name" /></div><div class="profile-field"><label for="profile-username">Username</label><input id="profile-username" :value="user.username" readonly autocomplete="username" /></div><div class="profile-field is-full"><label for="profile-email">Email akun</label><input id="profile-email" :value="user.email" readonly type="email" autocomplete="email" /></div></div></section>
          <section class="profile-panel" aria-labelledby="profile-security-title"><header class="profile-panel-heading"><span class="profile-section-symbol"><AppIcon name="lock" /></span><div><span class="shell-overline">AKSES YANG TETAP TERJAGA</span><h2 id="profile-security-title">Keamanan akun</h2><p>Kelola kata sandi yang digunakan untuk masuk.</p></div></header><div class="profile-action-row"><div><h3>Kata sandi akun</h3><p>Perubahan membutuhkan kata sandi yang kamu gunakan saat ini.</p></div><button type="button" class="profile-button" :disabled="busy || isDemo" @click="showPassword = true"><AppIcon name="edit" />Ubah kata sandi</button></div></section>
          <section class="profile-panel is-danger" aria-labelledby="profile-delete-title"><header class="profile-panel-heading"><span class="profile-section-symbol"><AppIcon name="trash" /></span><div><span class="shell-overline">PENGHAPUSAN PERMANEN</span><h2 id="profile-delete-title">Hapus akun</h2><p>Penghapusan akun dan data terkait tidak dapat dibatalkan.</p></div></header><div class="profile-action-row"><div><h3>Akhiri akun Moneytory</h3><p>Jika ingin menyimpan catatan transaksi, unduh CSV dari Pengaturan terlebih dahulu.</p><RouterLink :to="{ name: 'settings' }" class="profile-text-link">Ke data & pengaturan<AppIcon name="arrow" /></RouterLink></div><button type="button" class="profile-button is-danger" :disabled="busy || isDemo" @click="openDeleteAccount"><AppIcon name="trash" />Hapus akun</button></div></section>
        </div>
      </div>
    </template>
    <ChangePasswordModal v-if="showPassword" v-model:isOpen="showPassword" @password-changed-successfully="passwordChanged" />
    <ConfirmationModal v-model:isOpen="showDeletePhoto" title="Hapus foto profil?" message="Foto profil akan dihapus dan akunmu kembali menggunakan inisial. Kamu dapat mengunggah foto baru kapan saja." confirmButtonText="Hapus foto" iconType="danger" :is-confirming="photoAction === 'delete'" @confirm="deletePhoto"><template #message><p>Foto profil akan dihapus dan akunmu kembali menggunakan inisial. Kamu dapat mengunggah foto baru kapan saja.</p><p v-if="deletePhotoError" class="profile-confirm-error" role="alert">{{ deletePhotoError }}</p></template></ConfirmationModal>
    <ConfirmationModal v-model:isOpen="showDeleteAccount" title="Hapus akun secara permanen?" :message="`Akun ${user?.email || 'ini'} beserta data terkait akan dihapus secara permanen. Data yang dihapus tidak dapat dipulihkan.`" confirmButtonText="Hapus akun permanen" iconType="danger" :is-confirming="deletingAccount" @confirm="deleteAccount"><template #message><p>Akun {{ user?.email || 'ini' }} beserta data terkait akan dihapus secara permanen. Data yang dihapus tidak dapat dipulihkan.</p><p v-if="deleteAccountError" class="profile-confirm-error" role="alert">{{ deleteAccountError }}</p></template></ConfirmationModal>
  </div>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import apiClient from '@/services/apiService'
import AppIcon from '@/components/common/AppIcon.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import ChangePasswordModal from '@/components/profile/ChangePasswordModal.vue'
import ProfileAvatar from '@/components/profile/ProfileAvatar.vue'
import { accountDeletionError, isDemoProfile, profileError, validateProfilePhoto } from '@/utils/profile'
import { settingsPlanName } from '@/utils/settings'
import { transactionDateLabel } from '@/utils/transactionForm'
import '@/assets/profile.css'
const authStore = useAuthStore(), toast = useToastStore()
const user = computed(() => authStore.currentUser)
const isDemo = computed(() => isDemoProfile(user.value?.email))
const planName = computed(() => settingsPlanName(user.value?.activeSubscription?.planCode || user.value?.subscriptionPlan, [], user.value?.activeSubscription?.planName))
const loading = ref(false), loadError = ref(''), photoError = ref(''), photoAction = ref<'upload' | 'delete' | null>(null)
const previewUrl = ref(''), fileInput = ref<HTMLInputElement | null>(null)
const photoSource = computed(() => previewUrl.value || user.value?.profilePictureUrl || '')
const hasPhoto = computed(() => !!(previewUrl.value || user.value?.profilePicture || user.value?.profilePictureUrl))
const showPassword = ref(false), showDeletePhoto = ref(false), showDeleteAccount = ref(false), deletingAccount = ref(false)
const deletePhotoError = ref(''), deleteAccountError = ref('')
const busy = computed(() => loading.value || !!photoAction.value || deletingAccount.value)
let active = true
const ownedUrls = new Set<string>()
const releasePreview = (url: string) => { if (ownedUrls.delete(url)) URL.revokeObjectURL(url) }
const loadProfile = async () => {
  if (loading.value || photoAction.value || deletingAccount.value) return
  loading.value = true; loadError.value = ''
  try { await authStore.fetchUserProfile(); if (active && previewUrl.value && authStore.currentUser?.profilePictureUrl) { releasePreview(previewUrl.value); previewUrl.value = '' } }
  catch { if (active) loadError.value = 'Profil terbaru belum berhasil dimuat. Informasi yang tersedia tetap ditampilkan.' }
  finally { loading.value = false }
}
const triggerFileInput = () => { if (!busy.value && !isDemo.value) fileInput.value?.click() }
const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement, file = input.files?.[0]
  input.value = ''
  if (!file || busy.value || isDemo.value || !user.value) return
  photoError.value = ''
  try { validateProfilePhoto(file) } catch (failure) { photoError.value = profileError(failure, 'Foto belum dapat dipilih.'); return }
  const userId = user.value.id, previous = previewUrl.value, url = URL.createObjectURL(file)
  ownedUrls.add(url); previewUrl.value = url; photoAction.value = 'upload'
  try {
    const form = new FormData(); form.append('file', file)
    const response = await apiClient.patch<{ profilePicturePath?: string; user?: { profilePicture?: string | null } }>('/auth/profile-picture/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    if (authStore.currentUser?.id !== userId) return
    authStore.setUser({ ...authStore.currentUser, profilePicture: response.data.profilePicturePath || response.data.user?.profilePicture || null, profilePictureUrl: null })
    releasePreview(previous)
    if (active) toast.show('Foto profil berhasil diperbarui.')
    try {
      await authStore.fetchUserProfile()
      if (active && authStore.currentUser?.id === userId && authStore.currentUser.profilePictureUrl) { releasePreview(url); previewUrl.value = '' }
    } catch { if (active) loadError.value = 'Foto berhasil disimpan, tetapi profil terbaru belum berhasil dimuat. Muat ulang profil untuk memperbaruinya.' }
  } catch (failure: unknown) { releasePreview(url); if (active) { previewUrl.value = previous; photoError.value = profileError(failure, 'Foto belum berhasil diunggah.') } }
  finally { photoAction.value = null }
}
const openDeletePhoto = () => { if (!busy.value && !isDemo.value && hasPhoto.value) { deletePhotoError.value = ''; showDeletePhoto.value = true } }
const deletePhoto = async () => {
  if (busy.value || isDemo.value || !user.value || !hasPhoto.value) return
  const userId = user.value.id
  photoAction.value = 'delete'; deletePhotoError.value = ''
  try {
    await apiClient.delete('/auth/profile-picture')
    if (authStore.currentUser?.id !== userId) return
    authStore.setUser({ ...authStore.currentUser, profilePicture: null, profilePictureUrl: null })
    releasePreview(previewUrl.value); previewUrl.value = ''; showDeletePhoto.value = false
    if (active) toast.show('Foto profil berhasil dihapus.')
    try { await authStore.fetchUserProfile() } catch { if (active) loadError.value = 'Foto berhasil dihapus, tetapi profil terbaru belum berhasil dimuat. Muat ulang profil untuk memperbaruinya.' }
  } catch (failure: unknown) { if (active) deletePhotoError.value = profileError(failure, 'Foto belum berhasil dihapus.') }
  finally { photoAction.value = null }
}
const openDeleteAccount = () => { if (!busy.value && !isDemo.value && user.value) { deleteAccountError.value = ''; showDeleteAccount.value = true } }
const deleteAccount = async () => {
  if (busy.value || isDemo.value || !user.value) return
  deletingAccount.value = true; deleteAccountError.value = ''
  try { await authStore.deleteAccount(); showDeleteAccount.value = false }
  catch (failure: unknown) { if (active) deleteAccountError.value = accountDeletionError(failure) }
  finally { deletingAccount.value = false }
}
const passwordChanged = () => toast.show('Kata sandi berhasil diperbarui.')
onMounted(loadProfile)
onBeforeUnmount(() => { active = false; for (const url of ownedUrls) URL.revokeObjectURL(url); ownedUrls.clear() })
</script>
