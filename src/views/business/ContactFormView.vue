<template>
  <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

    <!-- Page Header -->
    <div class="mb-6 flex items-center gap-3">
      <button
        @click="router.back()"
        class="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
          {{ isEdit ? 'Edit Kontak' : 'Tambah Kontak' }}
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Lengkapi informasi kontak perusahaan
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoadingDetail" class="flex justify-center p-16">
      <LoadingSpinner :visible="true" />
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-5">

      <!-- ── TOP GRID ──────────────────────────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

        <!-- ── INFORMASI KONTAK ──────────────────────── -->
        <section class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden h-full">
          <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-200">Informasi Kontak</h2>
          </div>

          <div class="p-5 space-y-4">
            <!-- Tipe Kontak -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Tipe Kontak <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-3 gap-2">
                <label
                  v-for="t in contactTypes"
                  :key="t.value"
                  :class="[
                    'flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-all',
                    form.type === t.value
                      ? 'border-emerald-500 bg-indigo-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500',
                  ]"
                >
                  <input type="radio" v-model="form.type" :value="t.value" class="sr-only" />
                  <span class="text-lg">{{ t.icon }}</span>
                  <span class="text-xs font-medium">{{ t.label }}</span>
                </label>
              </div>
            </div>

            <!-- Nama -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Nama <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Nama kontak / perusahaan"
                required
                class="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <!-- Email & Telepon -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="email@example.com"
                  class="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Telepon</label>
                <input
                  v-model="form.phone"
                  type="text"
                  placeholder="08xxxxxxxxxx"
                  class="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <!-- Alamat -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Alamat</label>
              <input
                v-model="form.address"
                type="text"
                placeholder="Alamat lengkap (opsional)"
                class="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </section>

        <!-- ── KOLOM KANAN: BANK + CATATAN ──────────── -->
        <div class="flex flex-col gap-5">

          <!-- Informasi Bank -->
          <section class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-200">Informasi Bank</h2>
              <span class="text-xs text-slate-400 dark:text-slate-500">(opsional)</span>
            </div>

            <div class="p-5 space-y-4">
              <!-- Nama Bank -->
              <SearchableSelect
                v-model="form.bankName"
                :options="bankOptions"
                label="Nama Bank"
                placeholder="Ketik untuk mencari bank..."
                :disabled="bankStore.isLoadingBanks"
                :helper-text="bankStore.isLoadingBanks ? 'Memuat daftar bank...' : ''"
                input-id="contact-bank-name"
              />

              <!-- No. Rekening & Atas Nama -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">No. Rekening</label>
                  <input
                    v-model="form.bankAccountNumber"
                    type="text"
                    placeholder="Nomor rekening"
                    class="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Atas Nama</label>
                  <input
                    v-model="form.bankAccountHolder"
                    type="text"
                    placeholder="Nama pemilik rekening"
                    class="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- Catatan -->
          <section class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <svg class="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-200">Catatan</h2>
              <span class="text-xs text-slate-400 dark:text-slate-500">(opsional)</span>
            </div>

            <div class="p-5">
              <div class="relative">
                <textarea
                  v-model="form.notes"
                  rows="4"
                  maxlength="500"
                  placeholder="Catatan tambahan tentang kontak ini..."
                  class="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                ></textarea>
                <span class="absolute bottom-2 right-3 text-xs text-slate-400 dark:text-slate-500 pointer-events-none">
                  {{ form.notes.length }}/500
                </span>
              </div>
            </div>
          </section>

        </div>
      </div>

      <!-- Error -->
      <div v-if="errorMsg" class="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800">
        <svg class="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm text-red-700 dark:text-red-300">{{ errorMsg }}</p>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 pb-4">
        <button
          type="button"
          @click="router.back()"
          :disabled="isSubmitting"
          class="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-5 py-2.5 text-sm font-medium text-white bg-[#2E8B57] hover:bg-[#236B43] rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <svg v-if="isSubmitting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ isEdit ? 'Simpan Perubahan' : 'Tambah Kontak' }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useContactsStore } from '@/stores/contacts'
import { useBankStore } from '@/stores/banks'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import SearchableSelect from '@/components/common/SearchableSelect.vue'
import type { ContactType } from '@/types/business'

const router = useRouter()
const route = useRoute()
const contactsStore = useContactsStore()
const bankStore = useBankStore()

const isEdit = computed(() => !!route.params.id)
const isLoadingDetail = ref(false)
const isSubmitting = ref(false)
const errorMsg = ref('')

const contactTypes = [
  { value: 'CUSTOMER', label: 'Customer', icon: '🧑‍💼' },
  { value: 'VENDOR', label: 'Vendor', icon: '🏭' },
  { value: 'EMPLOYEE', label: 'Karyawan', icon: '👷' },
]

const bankOptions = computed(() =>
  bankStore.allBanks.map((b) => ({ value: b.name, label: b.name })),
)

const form = ref({
  type: 'CUSTOMER' as ContactType,
  name: '',
  email: '',
  phone: '',
  address: '',
  bankName: null as string | null,
  bankAccountNumber: '',
  bankAccountHolder: '',
  notes: '',
})

onMounted(async () => {
  if (bankStore.banks.length === 0) {
    bankStore.fetchBanks()
  }

  if (isEdit.value) {
    isLoadingDetail.value = true
    try {
      if (!contactsStore.contacts.length) {
        await contactsStore.fetchContacts()
      }
      const contact = contactsStore.contacts.find((c) => c.id === route.params.id)
      if (contact) {
        form.value = {
          type: contact.type,
          name: contact.name,
          email: contact.email || '',
          phone: contact.phone || '',
          address: contact.address || '',
          bankName: contact.bankName ?? null,
          bankAccountNumber: contact.bankAccountNumber || '',
          bankAccountHolder: contact.bankAccountHolder || '',
          notes: contact.notes || '',
        }
      }
    } finally {
      isLoadingDetail.value = false
    }
  }
})

const handleSubmit = async () => {
  errorMsg.value = ''
  isSubmitting.value = true

  const payload = {
    type: form.value.type,
    name: form.value.name,
    email: form.value.email || undefined,
    phone: form.value.phone || undefined,
    address: form.value.address || undefined,
    bankName: form.value.bankName || undefined,
    bankAccountNumber: form.value.bankAccountNumber || undefined,
    bankAccountHolder: form.value.bankAccountHolder || undefined,
    notes: form.value.notes || undefined,
  }

  try {
    if (isEdit.value) {
      await contactsStore.updateContact(route.params.id as string, payload)
    } else {
      await contactsStore.createContact(payload)
    }
    router.push({ name: 'business-contacts' })
  } catch (err: any) {
    const msg = err.response?.data?.message
    errorMsg.value = Array.isArray(msg) ? msg.join(', ') : (msg || 'Gagal menyimpan kontak.')
  } finally {
    isSubmitting.value = false
  }
}
</script>
