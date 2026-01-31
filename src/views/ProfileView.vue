<template>
  <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
    <header class="flex items-center justify-between border-b pb-4">
      <h1 class="text-3xl font-semibold text-slate-800">Profil Saya</h1>
      <span
        v-if="authStore.currentUser?.subscriptionPlan"
        :class="{
          'bg-gray-100 text-gray-800': authStore.currentUser.subscriptionPlan === 'FREE',
          'bg-amber-100 text-amber-800': authStore.currentUser.subscriptionPlan === 'PREMIUM',
          'bg-purple-100 text-purple-800': authStore.currentUser.subscriptionPlan === 'FAMILY',
        }"
        class="px-3 py-1 rounded-full text-sm font-bold tracking-wide uppercase"
      >
        {{ authStore.currentUser.subscriptionPlan }} PLAN
      </span>
    </header>

    <section aria-labelledby="profile-picture-heading" class="bg-white shadow-lg rounded-xl p-6">
      <h2 id="profile-picture-heading" class="text-lg font-medium text-slate-900 mb-4">
        Foto Profil
      </h2>
      <div class="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <div class="flex-shrink-0 relative">
          <img
            v-if="profileImagePreview"
            :src="profileImagePreview"
            alt="Preview foto profil"
            class="h-24 w-24 rounded-full object-cover ring-2 ring-offset-2 ring-indigo-500 sm:h-32 sm:w-32"
          />
          <div
            v-else
            class="h-24 w-24 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 text-4xl font-semibold sm:h-32 sm:w-32"
            title="Foto profil belum diatur"
          >
            {{
              profileData.fullName
                ? profileData.fullName.charAt(0).toUpperCase()
                : profileData.username
                  ? profileData.username.charAt(0).toUpperCase()
                  : 'U'
            }}
          </div>
          <!-- Loading spinner overlay saat upload -->
          <div
            v-if="isUploadingPicture"
            class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
          >
            <LoadingSpinner :visible="true" size="md" color="text-white" />
          </div>
        </div>
        <div class="flex-grow">
          <input
            type="file"
            ref="fileInputRef"
            @change="handleFileChange"
            class="hidden"
            accept="image/jpeg,image/png,image/webp"
          />
          <div class="flex flex-col sm:flex-row gap-3 mt-2 sm:mt-0">
            <button
              type="button"
              @click="triggerFileInput"
              :disabled="isUploadingPicture"
              class="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ isUploadingPicture ? 'Mengupload...' : 'Ubah Foto Profil' }}
            </button>
            <button
              v-if="profileImagePreview"
              type="button"
              @click="confirmDeletePicture"
              :disabled="isUploadingPicture"
              class="w-full sm:w-auto px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Hapus Foto
            </button>
          </div>
          <p class="mt-2 text-xs text-slate-500">JPEG, PNG atau WebP. Ukuran maksimal 5MB.</p>
        </div>
      </div>
    </section>

    <section aria-labelledby="user-information-heading" class="bg-white shadow-lg rounded-xl p-6">
      <h2 id="user-information-heading" class="text-lg font-medium text-slate-900 mb-1">
        Informasi Akun
      </h2>
      <p class="text-sm text-slate-500 mb-6">Perbarui informasi akun Anda di sini.</p>
      <form @submit.prevent="handleUpdateProfile" class="space-y-6">
        <div>
          <label for="fullName" class="block text-sm font-medium text-slate-700 mb-1"
            >Nama Lengkap</label
          >
          <input
            type="text"
            id="fullName"
            v-model="profileData.fullName"
            class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300"
            placeholder="Nama lengkap Anda"
          />
        </div>

        <div>
          <label for="username" class="block text-sm font-medium text-slate-700 mb-1"
            >Username</label
          >
          <input
            type="text"
            id="username"
            v-model="profileData.username"
            class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 bg-slate-50"
            placeholder="Username Anda"
            readonly
            disabled
          />
          <p class="text-xs text-slate-500 mt-1">Username tidak dapat diubah.</p>
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            id="email"
            v-model="profileData.email"
            class="input-field p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 bg-slate-50"
            placeholder="Email Anda"
            readonly
            disabled
          />
          <p class="text-xs text-slate-500 mt-1">Email tidak dapat diubah.</p>
        </div>

        <div class="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            :disabled="isSubmittingProfile"
            class="inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm transition-colors"
          >
            <LoadingSpinner
              v-if="isSubmittingProfile"
              :visible="true"
              size="xs"
              color="text-white"
              class="-ml-1 mr-2"
            />
            {{ isSubmittingProfile ? 'Menyimpan...' : 'Simpan Perubahan Profil' }}
          </button>
        </div>
      </form>
    </section>

    <section aria-labelledby="security-heading" class="bg-white shadow-lg rounded-xl p-6">
      <h2 id="security-heading" class="text-lg font-medium text-slate-900 mb-1">Keamanan</h2>
      <p class="text-sm text-slate-500 mb-6">Kelola pengaturan keamanan akun Anda.</p>
      <div>
        <button
          type="button"
          @click="openChangePasswordModal"
          class="px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Ubah Password
        </button>
      </div>
    </section>

    <section
      aria-labelledby="danger-zone-heading"
      class="bg-white shadow-lg rounded-xl p-6 border border-red-100"
    >
      <h2 id="danger-zone-heading" class="text-lg font-medium text-red-600 mb-1">Zona Bahaya</h2>
      <p class="text-sm text-slate-500 mb-6">Tindakan di sini tidak dapat dibatalkan.</p>

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 class="text-sm font-medium text-slate-900">Hapus Akun</h3>
          <p class="text-sm text-slate-500">
            Menghapus akun dan semua data Anda secara permanen. Setelah dihapus, data tidak dapat
            dipulihkan kembali.
          </p>
        </div>
        <button
          type="button"
          @click="promptDeleteAccount"
          class="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Hapus Akun
        </button>
      </div>
    </section>
    <ChangePasswordModal
      v-model:isOpen="isChangePasswordModalOpen"
      @password-changed-successfully="handlePasswordChanged"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      v-model:isOpen="isDeleteConfirmModalOpen"
      title="Hapus Foto Profil"
      message="Apakah Anda yakin ingin menghapus foto profil ini? Tindakan ini tidak dapat dibatalkan."
      confirmButtonText="Hapus"
      confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      iconType="danger"
      @confirm="handleDeletePicture"
    />

    <!-- Success Modal -->
    <ConfirmationModal
      v-model:isOpen="isSuccessModalOpen"
      title="Berhasil!"
      :message="successMessage"
      confirmButtonText="OK"
      :confirmButtonClass="'bg-green-600 hover:bg-green-700 focus:ring-green-500'"
      iconType="success"
      :closeOnOverlayClick="true"
      @confirm="closeSuccessModal"
      @cancel="closeSuccessModal"
    >
      <template #icon>
        <svg
          class="h-6 w-6 text-green-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </template>
      <template #cancelButtonText>
        <!-- Hide cancel button by providing empty slot -->
      </template>
    </ConfirmationModal>

    <!-- Error Modal -->
    <ConfirmationModal
      v-model:isOpen="isErrorModalOpen"
      title="Gagal!"
      :message="errorMessage"
      confirmButtonText="OK"
      :confirmButtonClass="'bg-red-600 hover:bg-red-700 focus:ring-red-500'"
      iconType="danger"
      :closeOnOverlayClick="true"
      @confirm="closeErrorModal"
      @cancel="closeErrorModal"
    >
      <template #icon>
        <svg
          class="h-6 w-6 text-red-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </template>
      <template #cancelButtonText>
        <!-- Hide cancel button by providing empty slot -->
      </template>
    </ConfirmationModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import ChangePasswordModal from '@/components/profile/ChangePasswordModal.vue'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/services/apiService'
interface ProfileData {
  fullName: string
  username: string
  email: string
  profilePictureUrl?: string | null
}

const profileData = reactive<ProfileData>({
  fullName: '',
  username: '',
  email: '',
  profilePictureUrl: null,
})

const profileImagePreview = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const isSubmittingProfile = ref(false)
const isUploadingPicture = ref(false) // Added this line
const authStore = useAuthStore()

// Delete modal state
const isDeleteConfirmModalOpen = ref(false)

// Success modal state
const isSuccessModalOpen = ref(false)
const successMessage = ref('')

// Error modal state (untuk upload errors)
const isErrorModalOpen = ref(false)
const errorMessage = ref('')

onMounted(() => {
  if (authStore.currentUser) {
    profileData.fullName = authStore.currentUser.fullName || ''
    profileData.username = authStore.currentUser.username
    profileData.email = authStore.currentUser.email

    // Updated logic to use authStore.currentUser.profilePictureUrl
    if (authStore.currentUser.profilePictureUrl) {
      profileImagePreview.value = authStore.currentUser.profilePictureUrl
    } else {
      profileImagePreview.value = null
    }
  }
})

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) {
    return
  }

  // Validasi ukuran file (max 5MB sesuai backend)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    errorMessage.value = 'Ukuran file terlalu besar! Maksimal 5MB.'
    isErrorModalOpen.value = true
    target.value = ''
    return
  }

  // Validasi tipe file (JPEG, PNG, WebP sesuai backend)
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    errorMessage.value = 'Tipe file tidak didukung! Hanya JPEG, PNG, dan WebP.'
    isErrorModalOpen.value = true
    target.value = ''
    return
  }

  // Preview image
  const reader = new FileReader()
  reader.onload = (e) => {
    profileImagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)

  // Upload ke backend
  await uploadProfilePicture(file)

  // Reset input
  target.value = ''
}

const uploadProfilePicture = async (file: File) => {
  isUploadingPicture.value = true

  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.patch('/auth/profile-picture/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    // Update user data dari response
    if (response.data.user) {
      authStore.setUser(response.data.user)
      await authStore.fetchUserProfile() // Fetch complete profile to get new profilePictureUrl

      if (authStore.currentUser?.profilePictureUrl) {
        profileImagePreview.value = authStore.currentUser.profilePictureUrl
        profileData.profilePictureUrl = authStore.currentUser.profilePictureUrl
      }
    }

    successMessage.value = 'Foto profil berhasil diperbarui!'
    isSuccessModalOpen.value = true
  } catch (error: any) {
    console.error('Upload profile picture failed:', error)

    // Reset preview to current user's picture or null if upload fails
    if (authStore.currentUser?.profilePictureUrl) {
      profileImagePreview.value = authStore.currentUser.profilePictureUrl
    } else {
      profileImagePreview.value = null
    }

    // Handle error dari backend
    const errorMsg = error.response?.data?.message || 'Gagal mengupload foto profil.'
    errorMessage.value = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    isErrorModalOpen.value = true
  } finally {
    isUploadingPicture.value = false
  }
}

const confirmDeletePicture = () => {
  isDeleteConfirmModalOpen.value = true
}

const handleDeletePicture = async () => {
  isDeleteConfirmModalOpen.value = false
  isUploadingPicture.value = true // Reuse uploading spinner or state

  try {
    await apiClient.delete('/auth/profile-picture')

    // Refresh profile to reflect changes
    await authStore.fetchUserProfile()

    profileImagePreview.value = null
    profileData.profilePictureUrl = null

    successMessage.value = 'Foto profil berhasil dihapus.'
    isSuccessModalOpen.value = true
  } catch (error: any) {
    console.error('Delete profile picture failed:', error)
    const errorMsg = error.response?.data?.message || 'Gagal menghapus foto profil.'
    errorMessage.value = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    isErrorModalOpen.value = true
  } finally {
    isUploadingPicture.value = false
  }
}

const handleUpdateProfile = async () => {
  isSubmittingProfile.value = true
  console.log('Memperbarui profil dengan data:', JSON.parse(JSON.stringify(profileData)))

  setTimeout(() => {
    isSubmittingProfile.value = false
    successMessage.value = 'Profil Anda berhasil diperbarui!'
    isSuccessModalOpen.value = true
  }, 1500)
}

const closeSuccessModal = () => {
  isSuccessModalOpen.value = false
  successMessage.value = ''
}

const closeErrorModal = () => {
  isErrorModalOpen.value = false
  errorMessage.value = ''
}

const handlePasswordChanged = () => {
  console.log('Password change process completed from modal.')
}
const isChangePasswordModalOpen = ref(false)

const openChangePasswordModal = () => {
  isChangePasswordModalOpen.value = true
}

const promptDeleteAccount = () => {
  alert('Fitur hapus akun bersifat permanen dan akan segera tersedia. Hubungi admin jika mendesak.')
}
</script>

<style scoped></style>
