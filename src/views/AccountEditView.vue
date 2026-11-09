<template>
  <div v-if="isLoading || !account" class="money-accounts account-form-page">
    <header class="account-form-heading"><RouterLink :to="{ name: 'accounts-list' }" class="account-form-back"><AppIcon name="arrow" />Daftar akun</RouterLink><h1>Edit akun.</h1></header>
    <section class="accounts-state" :role="isLoading ? 'status' : 'alert'">
      <template v-if="isLoading"><span class="accounts-spinner" aria-hidden="true"></span><h2>Memuat detail akun...</h2><p>Menyiapkan informasi yang ingin kamu perbarui.</p></template>
      <template v-else><AppIcon name="help" /><h2>Akun belum dapat ditampilkan.</h2><p>{{ loadError || 'Akun tidak ditemukan atau kamu tidak memiliki akses.' }}</p><button v-if="accountId" type="button" class="accounts-button" @click="loadAccount">Coba lagi</button><RouterLink :to="{ name: 'accounts-list' }" class="accounts-button is-primary">Kembali ke daftar akun</RouterLink></template>
    </section>
  </div>
  <AccountForm v-else mode="edit" :account="account" :submitting="isSubmitting" :error="submissionError" @update="updateAccount" />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AccountForm from '@/components/accounts/AccountForm.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { useAccountStore } from '@/stores/accounts'
import { useToastStore } from '@/stores/toast'
import type { Account, UpdateAccountPayload } from '@/types/accounts'
import '@/assets/accounts.css'
import '@/assets/account-form.css'

defineOptions({ inheritAttrs: false })
const route = useRoute()
const router = useRouter()
const accountStore = useAccountStore()
const toastStore = useToastStore()
const accountId = computed(() => typeof route.params.id === 'string' ? route.params.id : '')
const account = ref<Account | null>(null)
const isLoading = ref(true)
const loadError = ref('')
const submissionError = ref('')
const isSubmitting = ref(false)
let requestVersion = 0
let active = true
const loadAccount = async () => {
  const version = ++requestVersion
  const id = accountId.value
  isLoading.value = true
  account.value = null
  loadError.value = ''
  submissionError.value = ''
  if (!id) { loadError.value = 'ID akun tidak valid.'; isLoading.value = false; return }
  try {
    const result = await accountStore.fetchAccountByIdForEdit(id)
    if (version !== requestVersion || !active) return
    account.value = result
    if (!result) loadError.value = 'Akun tidak ditemukan.'
  } catch (error: unknown) {
    if (version === requestVersion && active) loadError.value = (error instanceof Error ? error.message : '') || 'Detail akun belum berhasil dimuat.'
  } finally { if (version === requestVersion && active) isLoading.value = false }
}
const updateAccount = async (payload: UpdateAccountPayload) => {
  if (!account.value || isSubmitting.value || account.value.id !== accountId.value) return
  const id = account.value.id
  isSubmitting.value = true
  submissionError.value = ''
  try {
    await accountStore.updateAccount(id, payload)
    if (active && id === accountId.value) { toastStore.show('Perubahan akun berhasil disimpan.'); await router.push({ name: 'accounts-list' }) }
  } catch (error: unknown) {
    if (active && id === accountId.value) submissionError.value = (typeof error === 'string' ? error : error instanceof Error ? error.message : '') || accountStore.error || 'Perubahan belum berhasil disimpan. Silakan coba lagi.'
  } finally { isSubmitting.value = false }
}
watch(accountId, loadAccount, { immediate: true })
onBeforeUnmount(() => { active = false; requestVersion++ })
</script>
