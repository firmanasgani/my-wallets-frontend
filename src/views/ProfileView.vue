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
            class="input-field"
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
          <p class="text-xs text-slate-500 mt-1">Username tidak dapat diubah (contoh batasan).</p>
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
          <p class="text-xs text-slate-500 mt-1">Email tidak dapat diubah (contoh batasan).</p>
        </div>

        <div class="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            :disabled="isSubmittingProfile"
            class="btn-primary disabled:opacity-60"
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

    <!-- <section aria-labelledby="security-heading" class="bg-white shadow-lg rounded-xl p-6">
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
    </section> -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useAuthStore } from '@/stores/auth' // Akan digunakan nanti

// Placeholder untuk data profil, nanti akan diambil dari authStore
interface ProfileData {
  fullName: string
  username: string
  email: string
  profilePictureUrl?: string | null // URL gambar profil yang sudah ada
}

const profileData = reactive<ProfileData>({
  fullName: '',
  username: '',
  email: '',
  profilePictureUrl: null, // atau URL gambar default: '/img/default-avatar.png'
})

const profileImagePreview = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null) // Ref untuk input file

const isSubmittingProfile = ref(false)
const authStore = useAuthStore() // Akan di-uncomment nanti

onMounted(() => {
  // Nanti: Isi profileData dari authStore.currentUser
  if (authStore.currentUser) {
    profileData.fullName = authStore.currentUser.fullName || ''
    profileData.username = authStore.currentUser.username
    profileData.email = authStore.currentUser.email
    // profileData.profilePictureUrl = authStore.currentUser.profilePictureUrl; // Jika ada
    if (profileData.profilePictureUrl) {
      profileImagePreview.value = profileData.profilePictureUrl
    }
  }

  // Untuk demo, jika ada profilePictureUrl di dummy data, set preview
  if (profileData.profilePictureUrl) {
    profileImagePreview.value = profileData.profilePictureUrl
  } else {
    // Jika tidak ada gambar, tampilkan inisial (sudah dihandle di template)
  }
})

const triggerFileInput = () => {
  fileInputRef.value?.click() // Memicu klik pada input file yang tersembunyi
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // Validasi ukuran dan tipe file bisa ditambahkan di sini
    // Misalnya:
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      alert('Ukuran file terlalu besar! Maksimal 2MB.')
      target.value = '' // Reset input file
      return
    }
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      alert('Tipe file tidak didukung! Hanya JPG, PNG, GIF.')
      target.value = ''
      return
    }

    // Buat preview gambar
    const reader = new FileReader()
    reader.onload = (e) => {
      profileImagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)

    // Nanti, simpan `file` ini di state untuk diupload saat `handleUpdateProfile`
    // selectedFile.value = file;
    console.log('File dipilih:', file)
  }
}

const handleUpdateProfile = async () => {
  isSubmittingProfile.value = true
  console.log('Memperbarui profil dengan data:', JSON.parse(JSON.stringify(profileData)))
  // Nanti:
  // const payload = { fullName: profileData.fullName }; // Hanya field yang bisa diubah
  // await authStore.updateUserProfile(payload);
  // Jika ada file gambar baru (dari selectedFile.value), upload juga:
  // await authStore.uploadProfilePicture(selectedFile.value);

  setTimeout(() => {
    // Simulasi
    alert('Profil (placeholder) berhasil diperbarui!')
    isSubmittingProfile.value = false
  }, 1500)
}

const openChangePasswordModal = () => {
  alert('Buka modal ubah password (implementasi nanti)')
}
</script>

<style scoped></style>
