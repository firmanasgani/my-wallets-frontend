<template>
  <div v-if="checkingQuota || quotaError || limitReached" class="money-accounts account-form-page">
    <header class="account-form-heading"><RouterLink :to="{ name: 'accounts-list' }" class="account-form-back"><AppIcon name="arrow" />Daftar akun</RouterLink><h1>Tambah akun baru.</h1></header>
    <section class="accounts-state" :role="quotaError ? 'alert' : 'status'">
      <template v-if="checkingQuota"><span class="accounts-spinner" aria-hidden="true"></span><h2>Menyiapkan akun baru...</h2><p>Memeriksa jumlah akun yang sudah kamu miliki.</p></template>
      <template v-else-if="quotaError"><AppIcon name="help" /><h2>Data akun belum berhasil dimuat.</h2><p>{{ quotaError }}</p><button type="button" class="accounts-button" @click="checkQuota">Coba lagi</button></template>
      <template v-else><AppIcon name="lock" /><h2>Batas akun paket Dasar tercapai.</h2><p>Kamu sudah memiliki {{ accountStore.accounts.length }} akun. Kelola akun yang ada atau pilih paket Premium untuk menambah akun.</p><RouterLink :to="{ name: 'settings', query: { upgrade: 'true' } }" class="accounts-button is-primary">Jelajahi Premium <AppIcon name="arrow" /></RouterLink></template>
    </section>
  </div>
  <AccountForm v-else mode="create" :submitting="isSubmitting" :error="submissionError" @create="createAccount" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AccountForm from '@/components/accounts/AccountForm.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { useAccountStore } from '@/stores/accounts'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { canCreateAccount } from '@/utils/accountList'
import type { CreateAccountPayload } from '@/types/accounts'
import '@/assets/accounts.css'
import '@/assets/account-form.css'

const router = useRouter()
const accountStore = useAccountStore()
const authStore = useAuthStore()
const toastStore = useToastStore()
const checkingQuota = ref(true)
const quotaError = ref('')
const isSubmitting = ref(false)
const submissionError = ref('')
const limitReached = computed(() => !isSubmitting.value && !canCreateAccount(authStore.currentUser?.subscriptionPlan, accountStore.accounts.length))
const checkQuota = async () => {
  checkingQuota.value = true
  quotaError.value = ''
  try {
    if (authStore.currentUser?.subscriptionPlan === 'FREE') {
      await accountStore.fetchAccounts()
      quotaError.value = accountStore.error || ''
    }
  } catch { quotaError.value = 'Jumlah akun belum dapat diperiksa. Silakan coba lagi.' }
  finally { checkingQuota.value = false }
}
const createAccount = async (payload: CreateAccountPayload) => {
  if (isSubmitting.value || checkingQuota.value || quotaError.value || limitReached.value) return
  isSubmitting.value = true
  submissionError.value = ''
  try {
    await accountStore.createAccount(payload)
    toastStore.show('Akun baru berhasil ditambahkan.')
    await router.push({ name: 'accounts-list' })
  } catch (error: unknown) {
    submissionError.value = (typeof error === 'string' ? error : error instanceof Error ? error.message : '') || accountStore.error || 'Akun belum berhasil disimpan. Silakan coba lagi.'
  } finally { isSubmitting.value = false }
}
onMounted(checkQuota)
</script>
