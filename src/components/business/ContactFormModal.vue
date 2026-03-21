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
      class="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
      @click.self="$emit('close')"
    >
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="isOpen"
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 dark:border-slate-700 my-6 flex flex-col max-h-[calc(100vh-3rem)]"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {{ isEdit ? 'Edit Kontak' : 'Tambah Kontak' }}
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Lengkapi informasi kontak perusahaan
              </p>
            </div>
            <button
              @click="$emit('close')"
              class="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="px-6 py-5 space-y-5 overflow-y-auto flex-1">

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
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
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
                class="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              />
            </div>

            <!-- Email & Phone -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="email@example.com"
                  class="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Telepon</label>
                <input
                  v-model="form.phone"
                  type="text"
                  placeholder="08xxxxxxxxxx"
                  class="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
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
                class="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              />
            </div>

            <!-- Bank Info -->
            <div class="rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                @click="showBankSection = !showBankSection"
                class="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Informasi Bank</span>
                  <span class="text-xs text-slate-400 dark:text-slate-500">(opsional)</span>
                </div>
                <svg
                  :class="['w-4 h-4 text-slate-400 transition-transform duration-200', showBankSection ? 'rotate-180' : '']"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div v-show="showBankSection" class="px-4 pt-3 pb-4 space-y-3 border-t border-slate-200 dark:border-slate-700">
                <!-- Bank Name (SearchableSelect) -->
                <div>
                  <SearchableSelect
                    v-model="form.bankName"
                    :options="bankOptions"
                    label="Nama Bank"
                    placeholder="Ketik untuk mencari bank..."
                    :disabled="bankStore.isLoadingBanks"
                    :helper-text="bankStore.isLoadingBanks ? 'Memuat daftar bank...' : ''"
                    input-id="contact-bank-name"
                  />
                </div>
                <!-- Account Number & Holder -->
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">No. Rekening</label>
                    <input
                      v-model="form.bankAccountNumber"
                      type="text"
                      placeholder="Nomor rekening"
                      class="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Atas Nama</label>
                    <input
                      v-model="form.bankAccountHolder"
                      type="text"
                      placeholder="Nama pemilik rekening"
                      class="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Notes — improved textarea -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Catatan</label>
              <div class="relative">
                <textarea
                  v-model="form.notes"
                  rows="3"
                  maxlength="500"
                  placeholder="Catatan tambahan tentang kontak ini..."
                  class="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow resize-none"
                ></textarea>
                <span class="absolute bottom-2 right-3 text-xs text-slate-400 dark:text-slate-500 pointer-events-none">
                  {{ form.notes.length }}/500
                </span>
              </div>
            </div>

            <!-- Error -->
            <div v-if="errorMsg" class="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-900/30 p-3 border border-red-200 dark:border-red-800">
              <svg class="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-red-700 dark:text-red-300">{{ errorMsg }}</p>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-1">
              <button
                type="button"
                @click="$emit('close')"
                :disabled="isSubmitting"
                class="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                <svg v-if="isSubmitting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                {{ isEdit ? 'Simpan Perubahan' : 'Tambah Kontak' }}
              </button>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useContactsStore } from '@/stores/contacts'
import { useBankStore } from '@/stores/banks'
import SearchableSelect from '@/components/common/SearchableSelect.vue'
import type { Contact, ContactType } from '@/types/business'

const props = defineProps<{
  isOpen: boolean
  contact?: Contact | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const contactsStore = useContactsStore()
const bankStore = useBankStore()

const isEdit = ref(false)
const isSubmitting = ref(false)
const errorMsg = ref('')
const showBankSection = ref(false)

const contactTypes = [
  { value: 'CUSTOMER', label: 'Customer', icon: '🧑‍💼' },
  { value: 'VENDOR', label: 'Vendor', icon: '🏭' },
  { value: 'EMPLOYEE', label: 'Karyawan', icon: '👷' },
]

// Bank options: value = bank name (string), bukan id
const bankOptions = computed(() =>
  bankStore.allBanks.map((b) => ({ value: b.name, label: b.name })),
)

const defaultForm = () => ({
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

const form = ref(defaultForm())

onMounted(() => {
  if (bankStore.banks.length === 0) {
    bankStore.fetchBanks()
  }
})

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      errorMsg.value = ''
      if (props.contact) {
        isEdit.value = true
        showBankSection.value = !!(props.contact.bankName || props.contact.bankAccountNumber)
        form.value = {
          type: props.contact.type,
          name: props.contact.name,
          email: props.contact.email || '',
          phone: props.contact.phone || '',
          address: props.contact.address || '',
          bankName: props.contact.bankName,
          bankAccountNumber: props.contact.bankAccountNumber || '',
          bankAccountHolder: props.contact.bankAccountHolder || '',
          notes: props.contact.notes || '',
        }
      } else {
        isEdit.value = false
        showBankSection.value = false
        form.value = defaultForm()
      }
    }
  },
)

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
    if (isEdit.value && props.contact) {
      await contactsStore.updateContact(props.contact.id, payload)
    } else {
      await contactsStore.createContact(payload)
    }
    emit('saved')
    emit('close')
  } catch (err: any) {
    const msg = err.response?.data?.message
    errorMsg.value = Array.isArray(msg) ? msg.join(', ') : (msg || 'Gagal menyimpan kontak.')
  } finally {
    isSubmitting.value = false
  }
}
</script>
