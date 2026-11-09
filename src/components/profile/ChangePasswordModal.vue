<template>
  <AppDialog :is-open="isOpen" title="Perbarui kata sandimu." description="Gunakan kata sandi saat ini untuk menyimpan kata sandi yang baru." eyebrow="KEAMANAN AKUN" :busy="saving" @close="closeModal">
    <form class="profile-password-form" :aria-busy="saving" @submit.prevent="handleSubmit">
      <div v-if="submissionError" ref="errorBox" class="profile-error" role="alert" tabindex="-1"><AppIcon name="warning" />{{ submissionError }}</div>
      <fieldset :disabled="saving"><legend class="shell-sr-only">Perubahan kata sandi</legend><PasswordField id="profile-current-password" v-model="formData.currentPassword" label="Kata sandi saat ini" autocomplete="current-password" required autofocus :disabled="saving" /><PasswordField id="profile-new-password" v-model="formData.newPassword" label="Kata sandi baru" autocomplete="new-password" required :minlength="6" described-by="profile-password-hint" :disabled="saving" /><p id="profile-password-hint" class="profile-hint">Minimal 6 karakter dan berbeda dari kata sandi saat ini.</p><PasswordField id="profile-confirm-password" v-model="formData.confirmNewPassword" label="Konfirmasi kata sandi baru" autocomplete="new-password" required :disabled="saving" :described-by="mismatch ? 'profile-password-mismatch' : undefined" /><p v-if="mismatch" id="profile-password-mismatch" class="profile-field-error" role="status">Konfirmasi kata sandi belum cocok.</p></fieldset>
      <footer class="profile-dialog-actions"><button type="button" class="profile-button" :disabled="saving" @click="closeModal">Batal</button><button type="submit" class="profile-button is-primary" :disabled="saving"><span v-if="saving" class="profile-spinner" aria-hidden="true"></span><AppIcon v-else name="lock" />{{ saving ? 'Menyimpan...' : 'Simpan kata sandi' }}</button></footer>
    </form>
  </AppDialog>
</template>
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppDialog from '@/components/common/AppDialog.vue'
import PasswordField from '@/components/common/PasswordField.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { buildPasswordPayload, profileError, type PasswordDraft } from '@/utils/profile'
import '@/assets/profile.css'
const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ 'update:isOpen': [value: boolean]; 'password-changed-successfully': [] }>()
const authStore = useAuthStore()
const formData = reactive<PasswordDraft>({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
const saving = ref(false), submissionError = ref(''), errorBox = ref<HTMLElement | null>(null)
const mismatch = computed(() => !!formData.confirmNewPassword && formData.confirmNewPassword !== formData.newPassword)
const reset = () => { formData.currentPassword = ''; formData.newPassword = ''; formData.confirmNewPassword = ''; submissionError.value = '' }
const closeModal = () => { if (!saving.value) { reset(); emit('update:isOpen', false) } }
const handleSubmit = async () => {
  if (saving.value || !props.isOpen) return
  submissionError.value = ''
  try {
    const payload = buildPasswordPayload(formData)
    saving.value = true
    await authStore.changePassword(payload)
    reset(); emit('password-changed-successfully'); emit('update:isOpen', false)
  } catch (failure: unknown) { submissionError.value = profileError(failure, 'Kata sandi belum berhasil diubah.'); await nextTick(); errorBox.value?.focus() }
  finally { saving.value = false }
}
watch(() => props.isOpen, reset, { immediate: true })
onBeforeUnmount(reset)
</script>
