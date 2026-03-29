<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
    <div class="p-6 sm:p-8 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/80">
      <h2 class="text-xl font-semibold text-slate-800 dark:text-slate-200">
        {{ !initialData ? 'Daftarkan Perusahaan' : 'Profil Perusahaan' }}
      </h2>
      <button
        v-if="initialData && !isEditing && !viewerMode"
        @click="startEditing"
        class="inline-flex items-center px-3 py-1.5 border border-slate-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
      >
        <svg class="-ml-0.5 mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Edit Profil
      </button>
    </div>

    <div v-if="isDemo" class="p-6 sm:p-8">
      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">
              Fitur edit profil perusahaan tidak tersedia untuk akun demo.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Mode Edit (Form) -->
    <div v-if="isEditing" class="p-6 sm:p-8">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="companyName" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1"
              >Nama Perusahaan <span class="text-red-500">*</span></label
            >
            <input
              type="text"
              id="companyName"
              v-model="formData.name"
              required
              class="border border-gray-300 rounded-lg block w-full px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:text-slate-200 dark:bg-slate-900 transition-colors"
              placeholder="Contoh: PT. Maju Bersama"
            />
          </div>

          <div>
            <label for="npwp" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1"
              >NPWP (Opsional)</label
            >
            <input
              type="text"
              id="npwp"
              v-model="formData.npwp"
              class="border border-gray-300 rounded-lg block w-full px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:text-slate-200 dark:bg-slate-900 transition-colors"
              placeholder="00.000.000.0-000.000"
            />
          </div>

          <div>
            <label for="phone" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1"
              >Nomor Telepon (Opsional)</label
            >
            <input
              type="text"
              id="phone"
              v-model="formData.phone"
              class="border border-gray-300 rounded-lg block w-full px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:text-slate-200 dark:bg-slate-900 transition-colors"
              placeholder="08123456789"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1"
              >Email (Opsional)</label
            >
            <input
              type="email"
              id="email"
              v-model="formData.email"
              class="border border-gray-300 rounded-lg block w-full px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:text-slate-200 dark:bg-slate-900 transition-colors"
              placeholder="info@perusahaan.com"
            />
          </div>

          <div>
            <label for="currency" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1"
              >Mata Uang Dasar</label
            >
            <input
              type="text"
              id="currency"
              readonly="true"
              v-model="formData.currency"
              maxlength="5"
              class="border border-gray-300 rounded-lg block w-full px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:text-slate-200 dark:bg-slate-900 transition-colors"
              placeholder="IDR"
            />
          </div>

          <div class="md:col-span-2">
            <label for="address" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1"
              >Alamat Perusahaan (Opsional)</label
            >
            <textarea
              id="address"
              v-model="formData.address"
              rows="3"
              class="border border-gray-300 rounded-lg block w-full px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:text-slate-200 dark:bg-slate-900 transition-colors"
              placeholder="Alamat lengkap..."
            ></textarea>
          </div>
        </div>

        <div class="mt-8 border-t dark:border-slate-700 pt-6">
          <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Pengaturan Pajak (PPN)</h3>

          <div class="flex items-center mb-4">
            <input
              id="taxEnabled"
              type="checkbox"
              v-model="formData.taxEnabled"
              class="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-slate-900 dark:border-slate-600"
            />
            <label for="taxEnabled" class="ml-2 text-sm font-medium text-slate-700 dark:text-slate-200"
              >Aktifkan Hitung Otomatis Pajak</label
            >
          </div>

          <div v-if="formData.taxEnabled">
            <label for="taxRate" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1"
              >Persentase Pajak (%)</label
            >
            <input
              type="number"
              id="taxRate"
              v-model="formData.taxRate"
              min="0"
              max="100"
              step="0.01"
              class="border border-gray-300 rounded-lg block w-full sm:w-1/3 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:text-slate-200 dark:bg-slate-900 transition-colors"
            />
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-6 border-t dark:border-slate-700 mt-8">
          <button
            v-if="initialData"
            type="button"
            @click="cancelEditing"
            class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700 rounded-lg shadow-sm transition-colors duration-200"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-5 py-2 text-sm font-medium text-white bg-[#2E8B57] hover:bg-[#236B43] rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed flex items-center"
          >
            <LoadingSpinner v-if="isSubmitting" :visible="true" size="xs" color="text-white" class="mr-2" />
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Mode Read-Only (View) -->
    <div v-else class="p-6 sm:p-8">
      <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
        <div class="sm:col-span-1">
          <dt class="text-sm font-medium text-slate-500 dark:text-slate-400">Nama Perusahaan</dt>
          <dd class="mt-1 text-sm text-slate-900 dark:text-white font-semibold">{{ initialData?.name }}</dd>
        </div>
        <div class="sm:col-span-1">
          <dt class="text-sm font-medium text-slate-500 dark:text-slate-400">Mata Uang</dt>
          <dd class="mt-1 text-sm text-slate-900 dark:text-white">{{ initialData?.currency || '-' }}</dd>
        </div>
        <div class="sm:col-span-1">
          <dt class="text-sm font-medium text-slate-500 dark:text-slate-400">Email</dt>
          <dd class="mt-1 text-sm text-slate-900 dark:text-white">{{ initialData?.email || '-' }}</dd>
        </div>
        <div class="sm:col-span-1">
          <dt class="text-sm font-medium text-slate-500 dark:text-slate-400">Nomor Telepon</dt>
          <dd class="mt-1 text-sm text-slate-900 dark:text-white">{{ initialData?.phone || '-' }}</dd>
        </div>
        <div class="sm:col-span-1">
          <dt class="text-sm font-medium text-slate-500 dark:text-slate-400">NPWP</dt>
          <dd class="mt-1 text-sm text-slate-900 dark:text-white">{{ initialData?.npwp || '-' }}</dd>
        </div>
        <div class="sm:col-span-1">
          <dt class="text-sm font-medium text-slate-500 dark:text-slate-400">Pengaturan Pajak</dt>
          <dd class="mt-1 text-sm text-slate-900 dark:text-white">
            <span v-if="initialData?.taxEnabled" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              Aktif ({{ initialData?.taxRate }}%)
            </span>
            <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
              Nonaktif
            </span>
          </dd>
        </div>
        <div class="sm:col-span-2 border-t dark:border-slate-700 pt-6 mt-2">
          <dt class="text-sm font-medium text-slate-500 dark:text-slate-400">Alamat Lengkap</dt>
          <dd class="mt-1 text-sm text-slate-900 dark:text-white whitespace-pre-line">{{ initialData?.address || '-' }}</dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import type { CompanyPayload, Company } from '@/types/business'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useAuthStore } from '@/stores/auth';

const props = defineProps<{
  initialData?: Company | null
  isSubmitting?: boolean
  defaultEditing?: boolean
  isDemoAccount?: boolean
  viewerMode?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', payload: CompanyPayload): void
  (e: 'cancel'): void
}>()

const isDemo = ref(props.isDemoAccount !== undefined ? props.isDemoAccount : false)

const isEditing = ref(props.defaultEditing !== undefined ? props.defaultEditing : !props.initialData)

// Reset edit state when initialData changes meaning a submit succeeded
watch(() => props.initialData, (newVal, oldVal) => {
  if (newVal && (!oldVal || newVal.updatedAt !== oldVal.updatedAt)) {
    isEditing.value = false
    isDemo.value = false
  }
})

const formData = reactive<CompanyPayload>({
  name: props.initialData?.name || '',
  npwp: props.initialData?.npwp || '',
  address: props.initialData?.address || '',
  phone: props.initialData?.phone || '',
  email: props.initialData?.email || '',
  taxEnabled: props.initialData?.taxEnabled ?? true,
  taxRate: props.initialData?.taxRate ?? 11,
  currency: props.initialData?.currency || 'IDR',
})

const resetFormData = () => {
  formData.name = props.initialData?.name || ''
  formData.npwp = props.initialData?.npwp || ''
  formData.address = props.initialData?.address || ''
  formData.phone = props.initialData?.phone || ''
  formData.email = props.initialData?.email || ''
  formData.taxEnabled = props.initialData?.taxEnabled ?? true
  formData.taxRate = props.initialData?.taxRate ?? 11
  formData.currency = props.initialData?.currency || 'IDR'
}

watch(
  () => props.initialData,
  () => {
    resetFormData()
  },
  { deep: true }
)

const userProfileEmail = computed(() => {
  const authStore = useAuthStore()
  return authStore.currentUser?.email || null
})
const startEditing = () => {
  if(userProfileEmail.value === 'demo@firmanasgani.id'){
    isDemo.value = true
    return
  }
  resetFormData()
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
  resetFormData()
  emit('cancel')
}

const handleSubmit = () => {
  emit('submit', { ...formData })
}

// Expose internal state in case parent needs it
defineExpose({
  isEditing
})
</script>
