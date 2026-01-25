<template>
  <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
    <header>
      <h1 class="text-3xl font-semibold text-slate-800 border-b pb-4">Profil Saya</h1>
    </header>

    <section aria-labelledby="profile-picture-heading" class="bg-white shadow-lg rounded-xl p-6">
      <h2 id="profile-picture-heading" class="text-lg font-medium text-slate-900 mb-4">
        Foto Profil
      </h2>
      <div class="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <div class="flex-shrink-0">
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
        </div>
        <div class="flex-grow">
          <input
            type="file"
            ref="fileInputRef"
            @change="handleFileChange"
            class="hidden"
            accept="image/png, image/jpeg, image/gif"
          />
          <button
            type="button"
            @click="triggerFileInput"
            class="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Ubah Foto Profil
          </button>
          <p class="mt-2 text-xs text-slate-500">
            JPG, GIF atau PNG. Ukuran maksimal 2MB (placeholder).
          </p>
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
            class="input-field bg-slate-50"
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
            class="input-field bg-slate-50"
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
    <ChangePasswordModal
      v-model:isOpen="isChangePasswordModalOpen"
      @password-changed-successfully="handlePasswordChanged"
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import ChangePasswordModal from '@/components/profile/ChangePasswordModal.vue'
import { useAuthStore } from '@/stores/auth'
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
const authStore = useAuthStore()

// Success modal state
const isSuccessModalOpen = ref(false)
const successMessage = ref('')

onMounted(() => {
  if (authStore.currentUser) {
    profileData.fullName = authStore.currentUser.fullName || ''
    profileData.username = authStore.currentUser.username
    profileData.email = authStore.currentUser.email

    if (profileData.profilePictureUrl) {
      profileImagePreview.value = profileData.profilePictureUrl
    }
  }

  if (profileData.profilePictureUrl) {
    profileImagePreview.value = profileData.profilePictureUrl
  } else {
  }
})

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      alert('Ukuran file terlalu besar! Maksimal 2MB.')
      target.value = ''
      return
    }
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      alert('Tipe file tidak didukung! Hanya JPG, PNG, GIF.')
      target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      profileImagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)

    console.log('File dipilih:', file)
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

const handlePasswordChanged = () => {
  console.log('Password change process completed from modal.')
}
const isChangePasswordModalOpen = ref(false)

const openChangePasswordModal = () => {
  isChangePasswordModalOpen.value = true
}
</script>

<style scoped></style>
