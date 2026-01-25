<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto bg-slate-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4"
      @keydown.esc="closeModal"
      tabindex="-1"
      @click.self="closeModal"
    >
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        enter-to-class="opacity-100 translate-y-0 sm:scale-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0 sm:scale-100"
        leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      >
        <div
          v-if="isOpen"
          class="bg-white rounded-lg shadow-xl transform transition-all sm:max-w-lg w-full overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-password-modal-title"
        >
          <div class="bg-red-600 px-4 py-3 sm:px-6">
            <h3 id="change-password-modal-title" class="text-lg font-semibold text-white">
              Ubah Password Anda
            </h3>
          </div>

          <form @submit.prevent="handleSubmit">
            <div class="px-4 pt-5 pb-4 sm:p-6">
              <div class="space-y-4">
                <div>
                  <label for="currentPassword" class="block text-sm font-medium text-slate-700 mb-1"
                    >Password Saat Ini <span class="text-red-500">*</span></label
                  >
                  <input
                    type="password"
                    id="currentPassword"
                    v-model="formData.currentPassword"
                    required
                    class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
                  />
                </div>

                <div>
                  <label for="newPassword" class="block text-sm font-medium text-slate-700 mb-1"
                    >Password Baru <span class="text-red-500">*</span></label
                  >
                  <input
                    type="password"
                    id="newPassword"
                    v-model="formData.newPassword"
                    required
                    class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
                    placeholder="Minimal 8 karakter"
                  />
                  <p
                    v-if="passwordValidation.newPassword && passwordValidation.newPassword !== true"
                    class="text-xs text-red-500 mt-1"
                  >
                    {{ passwordValidation.newPassword }}
                  </p>
                </div>

                <div>
                  <label
                    for="confirmNewPassword"
                    class="block text-sm font-medium text-slate-700 mb-1"
                    >Konfirmasi Password Baru <span class="text-red-500">*</span></label
                  >
                  <input
                    type="password"
                    id="confirmNewPassword"
                    v-model="formData.confirmNewPassword"
                    required
                    class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
                  />
                  <p
                    v-if="
                      passwordValidation.confirmNewPassword &&
                      passwordValidation.confirmNewPassword !== true
                    "
                    class="text-xs text-red-500 mt-1"
                  >
                    {{ passwordValidation.confirmNewPassword }}
                  </p>
                </div>
              </div>

              <div v-if="submissionError" class="mt-4 rounded-md bg-red-50 p-3">
                <p class="text-sm font-medium text-red-700">{{ submissionError }}</p>
              </div>
              <div v-if="successMessage" class="mt-4 rounded-md bg-green-50 p-3">
                <p class="text-sm font-medium text-green-700">{{ successMessage }}</p>
              </div>
            </div>

            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                :disabled="authStore.authIsLoading || !isFormValid"
                class="inline-flex justify-center items-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm transition-colors"
              >
                <LoadingSpinner
                  v-if="authStore.authIsLoading"
                  :visible="true"
                  size="xs"
                  color="text-white"
                  class="-ml-1 mr-2"
                />
                {{ authStore.authIsLoading ? 'Menyimpan...' : 'Simpan Password Baru' }}
              </button>
              <button
                type="button"
                @click="closeModal"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                :disabled="authStore.authIsLoading"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
// ... (Bagian script setup tetap sama seperti sebelumnya)
import { ref, reactive, computed, watch } from 'vue'
import { useAuthStore, type ChangePasswordPayload } from '@/stores/auth'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

interface Props {
  isOpen: boolean
}
const props = defineProps<Props>()
const emit = defineEmits(['update:isOpen', 'password-changed-successfully'])

const authStore = useAuthStore()

const formData = reactive<ChangePasswordPayload & { confirmNewPassword: string }>({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
})

const submissionError = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const passwordValidation = reactive({
  newPassword: true as boolean | string,
  confirmNewPassword: true as boolean | string,
})

const isFormValid = computed(() => {
  return (
    passwordValidation.newPassword === true &&
    passwordValidation.confirmNewPassword === true &&
    formData.currentPassword.length > 0 &&
    formData.newPassword.length > 0 &&
    formData.confirmNewPassword.length > 0
  )
})

const validateNewPassword = () => {
  if (
    formData.newPassword.length === 0 &&
    formData.currentPassword.length === 0 &&
    formData.confirmNewPassword.length === 0
  ) {
    // Jangan tampilkan error jika semua masih kosong
    passwordValidation.newPassword = true
    return
  }
  if (formData.newPassword.length < 8 && formData.newPassword.length > 0) {
    // Hanya validasi jika sudah diisi
    passwordValidation.newPassword = 'Password baru minimal 8 karakter.'
  } else if (formData.newPassword.length > 0 && formData.newPassword === formData.currentPassword) {
    passwordValidation.newPassword = 'Password baru tidak boleh sama dengan password saat ini.'
  } else {
    passwordValidation.newPassword = true
  }
  validateConfirmPassword()
}

const validateConfirmPassword = () => {
  if (formData.confirmNewPassword.length === 0 && formData.newPassword.length === 0) {
    passwordValidation.confirmNewPassword = true
    return
  }
  if (
    formData.newPassword !== formData.confirmNewPassword &&
    formData.confirmNewPassword.length > 0
  ) {
    passwordValidation.confirmNewPassword = 'Konfirmasi password tidak cocok dengan password baru.'
  } else {
    passwordValidation.confirmNewPassword = true
  }
}

watch(() => formData.newPassword, validateNewPassword)
watch(() => formData.confirmNewPassword, validateConfirmPassword)
watch(
  () => formData.currentPassword,
  () => {
    if (formData.newPassword.length > 0) validateNewPassword()
  },
)

const resetForm = () => {
  formData.currentPassword = ''
  formData.newPassword = ''
  formData.confirmNewPassword = ''
  submissionError.value = null
  successMessage.value = null
  passwordValidation.newPassword = true
  passwordValidation.confirmNewPassword = true
}

const closeModal = () => {
  if (authStore.authIsLoading) return
  resetForm()
  emit('update:isOpen', false)
}

const handleSubmit = async () => {
  submissionError.value = null
  successMessage.value = null
  authStore.error = null

  validateNewPassword() // Panggil validasi sekali lagi sebelum submit
  validateConfirmPassword()

  if (!isFormValid.value) {
    submissionError.value = 'Harap perbaiki error pada form sebelum menyimpan.'
    // Cari error validasi pertama dan tampilkan jika perlu
    if (typeof passwordValidation.newPassword === 'string')
      submissionError.value = passwordValidation.newPassword
    else if (typeof passwordValidation.confirmNewPassword === 'string')
      submissionError.value = passwordValidation.confirmNewPassword
    return
  }

  const payload: ChangePasswordPayload = {
    currentPassword: formData.currentPassword,
    newPassword: formData.newPassword,
  }

  try {
    await authStore.changePassword(payload)
    successMessage.value = 'Password berhasil diubah! Anda akan segera logout otomatis.'
    formData.currentPassword = '' // Kosongkan field sensitif
    formData.newPassword = ''
    formData.confirmNewPassword = ''

    setTimeout(async () => {
      closeModal()
      await authStore.logout()
    }, 2500)
  } catch (error: any) {
    submissionError.value = authStore.authError || error.message || 'Gagal mengubah password.'
  }
}

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      resetForm()
    }
  },
)
</script>

<style scoped></style>
