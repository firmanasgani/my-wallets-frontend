<template>
  <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div class="mb-8 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Profil Perusahaan</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {{ businessStore.currentCompany ? 'Kelola informasi dan pengaturan pajak perusahaan Anda.' : 'Lengkapi profil perusahaan Anda untuk memulai pembukuan.' }}
        </p>
      </div>
    </div>

    <div v-if="successMsg" class="mb-6 rounded-md bg-green-50 dark:bg-green-900/30 p-4 border border-green-200 dark:border-green-800 transition-opacity">
      <p class="text-sm font-medium text-green-800 dark:text-green-300">{{ successMsg }}</p>
    </div>
    <div v-if="errorMsg" class="mb-6 rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800 transition-opacity">
      <p class="text-sm font-medium text-red-800 dark:text-red-300">{{ errorMsg }}</p>
    </div>

    <!-- Tampilkan loading jika sedang ambil data awal yang belum ada -->
    <div v-if="businessStore.isLoading && !businessStore.isCompanyLoaded" class="flex justify-center p-12">
      <LoadingSpinner :visible="true" />
    </div>

    <!-- Two-column grid when company data exists, single column otherwise -->
    <div v-else>
      <!-- Grid layout: logo left, form right -->
      <div v-if="businessStore.currentCompany" class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <!-- ── Logo Column ──────────────────────────────── -->
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 h-full">
          <h2 class="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">Logo Perusahaan</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">Logo ditampilkan pada invoice PDF. Format: JPG, PNG, WebP. Maks 2MB.</p>

          <!-- Preview -->
          <div class="w-full aspect-square max-w-[160px] mx-auto rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center bg-slate-50 dark:bg-slate-700/50 overflow-hidden mb-4">
            <img
              v-if="logoPreviewUrl"
              :src="logoPreviewUrl"
              alt="Logo perusahaan"
              class="w-full h-full object-contain p-2"
            />
            <svg v-else class="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <!-- Controls -->
          <div class="space-y-2" v-if="!isViewer">
            <input
              ref="logoInputRef"
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              class="hidden"
              @change="onLogoFileSelected"
            />
            <!-- If pending file not yet uploaded -->
            <div v-if="pendingLogoFile" class="flex flex-col gap-2">
              <button
                type="button"
                @click="handleUploadLogo"
                :disabled="businessStore.isLogoUploading"
                class="w-full px-4 py-2 text-sm font-medium text-white bg-[#2E8B57] hover:bg-[#236B43] rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg v-if="businessStore.isLogoUploading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Upload Logo
              </button>
              <button
                type="button"
                @click="cancelLogoSelection"
                :disabled="businessStore.isLogoUploading"
                class="w-full px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
            </div>
            <!-- Normal state -->
            <div v-else class="flex flex-col gap-2">
              <button
                type="button"
                @click="logoInputRef?.click()"
                class="w-full px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                {{ businessStore.currentCompany?.logoUrl ? 'Ganti Logo' : 'Upload Logo' }}
              </button>
              <button
                v-if="businessStore.currentCompany?.logoUrl"
                type="button"
                @click="handleDeleteLogo"
                :disabled="businessStore.isLogoUploading"
                class="w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                Hapus Logo
              </button>
            </div>
            <p v-if="logoErrorMsg" class="text-xs text-red-600 dark:text-red-400">{{ logoErrorMsg }}</p>
          </div>
        </div>

        <!-- ── Profile Form Column ──────────────────────── -->
        <div class="lg:col-span-2">
          <CompanyForm
            ref="companyFormRef"
            :initial-data="businessStore.currentCompany"
            :is-submitting="businessStore.isLoading"
            :default-editing="false"
            :viewer-mode="isViewer"
            @submit="handleSubmit"
          />
        </div>
      </div>

      <!-- No company yet: full-width form only -->
      <CompanyForm
        v-else
        ref="companyFormRef"
        :initial-data="null"
        :is-submitting="businessStore.isLoading"
        :default-editing="true"
        :viewer-mode="isViewer"
        @submit="handleSubmit"
      />

      <!-- ── Approval Workflow Toggle (Phase 8) ─────────────────────────── -->
      <div v-if="businessStore.currentCompany" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm mt-6 border border-slate-200 dark:border-slate-700 p-6">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <h2 class="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">Approval Workflow</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Aktifkan untuk mewajibkan jurnal manual melalui alur persetujuan:
              <strong class="text-slate-700 dark:text-slate-300">DRAFT → PENDING_CHECK → PENDING_APPROVAL → APPROVED</strong>.
            </p>
            <p class="text-xs text-amber-600 dark:text-amber-400 mt-2">
              Perubahan ini hanya berlaku untuk jurnal yang dibuat setelah setting diubah.
            </p>
          </div>
          <div class="shrink-0 pt-1">
            <button
              v-if="!isViewer"
              @click="toggleApprovalWorkflow"
              :disabled="isTogglingWorkflow"
              :class="businessStore.currentCompany.requiresApprovalWorkflow
                ? 'bg-[#2E8B57]'
                : 'bg-slate-300 dark:bg-slate-600'"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <span
                :class="businessStore.currentCompany.requiresApprovalWorkflow ? 'translate-x-6' : 'translate-x-1'"
                class="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform"
              />
            </button>
            <span v-if="businessStore.currentCompany.requiresApprovalWorkflow" class="block text-xs text-emerald-600 dark:text-emerald-400 font-medium text-center mt-1">Aktif</span>
            <span v-else class="block text-xs text-slate-400 dark:text-slate-500 font-medium text-center mt-1">Nonaktif</span>
          </div>
        </div>
        <p v-if="workflowMsg" class="mt-3 text-sm text-emerald-700 dark:text-emerald-300">{{ workflowMsg }}</p>
        <p v-if="workflowError" class="mt-3 text-sm text-red-600 dark:text-red-400">{{ workflowError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBusinessStore } from '@/stores/business'
import CompanyForm from '@/components/business/CompanyForm.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { CompanyPayload } from '@/types/business'

const businessStore = useBusinessStore()
const successMsg = ref('')
const errorMsg = ref('')
const companyFormRef = ref<InstanceType<typeof CompanyForm> | null>(null)

// ── Logo state ─────────────────────────────────────────────────────────────
const logoInputRef = ref<HTMLInputElement | null>(null)
const pendingLogoFile = ref<File | null>(null)
const logoErrorMsg = ref('')

// Cache-bust key — berubah setiap kali logo di-upload/hapus agar browser tidak pakai cache lama
const logoCacheBust = ref(Date.now())

const logoPreviewUrl = computed(() => {
  if (pendingLogoFile.value) return URL.createObjectURL(pendingLogoFile.value)
  const presigned = businessStore.currentCompany?.logoPresignedUrl
  if (presigned) return presigned
  if (businessStore.currentCompany?.logoUrl) return `${import.meta.env.VITE_API_BASE_URL}/business/company/logo?t=${logoCacheBust.value}`
  return null
})

const isViewer = computed(() => businessStore.myRole === 'VIEWER')

onMounted(async () => {
  try {
    if (!businessStore.isCompanyLoaded) {
      await businessStore.fetchMyCompany()
    }
    if (!businessStore.members.length) {
      await businessStore.fetchMembers()
    }
  } catch (e: any) {
    if (e.response?.status !== 404) {
      errorMsg.value = 'Gagal memuat profil perusahaan.'
    }
  }
})

const onLogoFileSelected = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  logoErrorMsg.value = ''
  if (file.size > 2 * 1024 * 1024) {
    logoErrorMsg.value = 'Ukuran file maksimal 2MB.'
    return
  }
  pendingLogoFile.value = file
}

const cancelLogoSelection = () => {
  pendingLogoFile.value = null
  logoErrorMsg.value = ''
  if (logoInputRef.value) logoInputRef.value.value = ''
}

const handleUploadLogo = async () => {
  if (!pendingLogoFile.value) return
  logoErrorMsg.value = ''
  try {
    await businessStore.uploadLogo(pendingLogoFile.value)
    pendingLogoFile.value = null
    if (logoInputRef.value) logoInputRef.value.value = ''
    logoCacheBust.value = Date.now()
    successMsg.value = 'Logo perusahaan berhasil diperbarui.'
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (err: any) {
    logoErrorMsg.value = err.response?.data?.message || 'Gagal mengupload logo.'
  }
}

const handleDeleteLogo = async () => {
  logoErrorMsg.value = ''
  try {
    await businessStore.deleteLogo()
    logoCacheBust.value = Date.now()
    successMsg.value = 'Logo perusahaan berhasil dihapus.'
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (err: any) {
    logoErrorMsg.value = err.response?.data?.message || 'Gagal menghapus logo.'
  }
}

const handleSubmit = async (payload: CompanyPayload) => {
  successMsg.value = ''
  errorMsg.value = ''
  try {
    if (businessStore.currentCompany) {
      await businessStore.updateCompany(payload)
      successMsg.value = 'Profil perusahaan berhasil diperbarui.'
    } else {
      await businessStore.createCompany(payload)
      successMsg.value = 'Perusahaan berhasil didaftarkan.'
    }
    setTimeout(() => { successMsg.value = '' }, 3000)
    if (companyFormRef.value?.isEditing) {
      companyFormRef.value.isEditing = false
    }
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Gagal menyimpan data. Silakan coba lagi.'
  }
}

// ── Approval Workflow Toggle (Phase 8) ────────────────────────────────────────
const isTogglingWorkflow = ref(false)
const workflowMsg = ref('')
const workflowError = ref('')

const toggleApprovalWorkflow = async () => {
  if (!businessStore.currentCompany) return
  workflowMsg.value = ''
  workflowError.value = ''
  isTogglingWorkflow.value = true
  const newVal = !businessStore.currentCompany.requiresApprovalWorkflow
  try {
    await businessStore.updateCompany({ requiresApprovalWorkflow: newVal } as any)
    workflowMsg.value = newVal ? 'Approval workflow diaktifkan.' : 'Approval workflow dinonaktifkan.'
    setTimeout(() => { workflowMsg.value = '' }, 3000)
  } catch (err: any) {
    workflowError.value = err.response?.data?.message || 'Gagal mengubah pengaturan.'
  } finally {
    isTogglingWorkflow.value = false
  }
}
</script>
