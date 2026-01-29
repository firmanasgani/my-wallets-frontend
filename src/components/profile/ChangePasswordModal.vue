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
                  <div class="relative">
                    <input
                      :type="showCurrentPassword ? 'text' : 'password'"
                      id="currentPassword"
                      v-model="formData.currentPassword"
                      required
                      class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 pr-10"
                    />
                    <button
                      type="button"
                      @click="showCurrentPassword = !showCurrentPassword"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700 transition-colors"
                      tabindex="-1"
                    >
                      <svg
                        v-if="!showCurrentPassword"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-5 h-5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-5 h-5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <label for="newPassword" class="block text-sm font-medium text-slate-700 mb-1"
                    >Password Baru <span class="text-red-500">*</span></label
                  >
                  <div class="relative">
                    <input
                      :type="showNewPassword ? 'text' : 'password'"
                      id="newPassword"
                      v-model="formData.newPassword"
                      required
                      class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 pr-10"
                      placeholder="Minimal 6 karakter"
                    />
                    <button
                      type="button"
                      @click="showNewPassword = !showNewPassword"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700 transition-colors"
                      tabindex="-1"
                    >
                      <svg
                        v-if="!showNewPassword"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-5 h-5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-5 h-5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    </button>
                  </div>
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
                  <div class="relative">
                    <input
                      :type="showConfirmPassword ? 'text' : 'password'"
                      id="confirmNewPassword"
                      v-model="formData.confirmNewPassword"
                      required
                      class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 pr-10"
                    />
                    <button
                      type="button"
                      @click="showConfirmPassword = !showConfirmPassword"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700 transition-colors"
                      tabindex="-1"
                    >
                      <svg
                        v-if="!showConfirmPassword"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-5 h-5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-5 h-5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    </button>
                  </div>
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
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

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
  if (formData.newPassword.length < 6 && formData.newPassword.length > 0) {
    // Hanya validasi jika sudah diisi
    passwordValidation.newPassword = 'Password baru minimal 6 karakter.'
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
  // Reset password visibility toggles
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
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
    successMessage.value = 'Password berhasil diubah!'
    formData.currentPassword = '' // Kosongkan field sensitif
    formData.newPassword = ''
    formData.confirmNewPassword = ''

    // Tutup modal setelah 1.5 detik agar user bisa melihat success message
    setTimeout(() => {
      closeModal()
    }, 1500)
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
