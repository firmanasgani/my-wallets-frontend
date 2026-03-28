<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="$emit('close')"
    >
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')" />

      <div
        class="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">Jurnal Baru</h2>
          <button
            @click="$emit('close')"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="px-6 py-5 space-y-5">
          <!-- Error -->
          <div
            v-if="errorMsg"
            class="rounded-lg bg-red-50 dark:bg-red-900/30 p-3 border border-red-200 dark:border-red-800"
          >
            <p class="text-sm text-red-700 dark:text-red-300">{{ errorMsg }}</p>
          </div>

          <!-- Header fields -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal</label>
              <input
                v-model="form.transactionDate"
                type="date"
                required
                class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Keterangan Jurnal</label>
              <input
                v-model="form.description"
                type="text"
                required
                placeholder="Contoh: Gaji Maret 2026"
                class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <!-- Lines Editor -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Baris Jurnal</label>
            <JournalLinesEditor ref="linesEditor" :coa-grouped="coaGrouped" :contacts="contacts" />
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 text-sm font-medium text-white bg-[#2E8B57] hover:bg-[#236B43] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
            >
              <svg v-if="isSubmitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan Jurnal' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useBusinessTransactionsStore } from '@/stores/businessTransactions'
import { useBusinessStore } from '@/stores/business'
import { useContactsStore } from '@/stores/contacts'
import JournalLinesEditor from './JournalLinesEditor.vue'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

const txStore = useBusinessTransactionsStore()
const businessStore = useBusinessStore()
const contactsStore = useContactsStore()

const isSubmitting = ref(false)
const errorMsg = ref('')
const linesEditor = ref<InstanceType<typeof JournalLinesEditor> | null>(null)

const form = ref({
  transactionDate: new Date().toISOString().slice(0, 10),
  description: '',
})

const coaGrouped = computed(() => businessStore.chartOfAccounts)
const contacts = computed(() => contactsStore.contacts)

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      form.value = { transactionDate: new Date().toISOString().slice(0, 10), description: '' }
      errorMsg.value = ''
      linesEditor.value?.reset()
    }
  },
)

async function handleSubmit() {
  errorMsg.value = ''

  if (!linesEditor.value) return

  const lines = linesEditor.value.toPayload()

  if (!linesEditor.value.isBalanced) {
    errorMsg.value = 'Total Debit harus sama dengan total Credit.'
    return
  }

  const hasInvalidAmount = lines.some((l) => l.amount <= 0)
  if (hasInvalidAmount) {
    errorMsg.value = 'Semua jumlah baris harus lebih dari 0.'
    return
  }

  const hasMissingCoa = lines.some((l) => !l.coaId)
  if (hasMissingCoa) {
    errorMsg.value = 'Semua baris harus memilih akun COA.'
    return
  }

  isSubmitting.value = true
  try {
    await txStore.createTransaction({
      description: form.value.description,
      transactionDate: form.value.transactionDate,
      lines,
    })
    emit('saved')
    emit('close')
  } catch (err: any) {
    const msg = err.response?.data?.message
    errorMsg.value = Array.isArray(msg) ? msg.join(', ') : (msg || 'Gagal menyimpan jurnal.')
  } finally {
    isSubmitting.value = false
  }
}
</script>
