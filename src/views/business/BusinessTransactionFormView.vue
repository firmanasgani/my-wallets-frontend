<template>
  <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
      <RouterLink
        :to="{ name: 'business-transactions' }"
        class="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </RouterLink>
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Jurnal Baru</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Input jurnal compound double-entry secara manual.</p>
      </div>
    </div>

    <!-- Error -->
    <div
      v-if="errorMsg"
      class="mb-4 rounded-lg bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800"
    >
      <p class="text-sm text-red-700 dark:text-red-300">{{ errorMsg }}</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-5">
      <!-- Card: Detail -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Detail Jurnal</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal</label>
            <input
              v-model="form.transactionDate"
              type="date"
              required
              class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Keterangan Jurnal</label>
            <input
              v-model="form.description"
              type="text"
              required
              placeholder="Contoh: Gaji Maret 2026"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <!-- Card: Baris Jurnal -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Baris Jurnal</h2>
        <JournalLinesEditor ref="linesEditor" :coa-grouped="coaGrouped" :contacts="contacts" />
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3">
        <RouterLink
          :to="{ name: 'business-transactions' }"
          class="px-5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          Batal
        </RouterLink>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBusinessTransactionsStore } from '@/stores/businessTransactions'
import { useBusinessStore } from '@/stores/business'
import { useContactsStore } from '@/stores/contacts'
import JournalLinesEditor from '@/components/business/JournalLinesEditor.vue'

const router = useRouter()
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

onMounted(async () => {
  await Promise.all([
    Object.keys(businessStore.chartOfAccounts).length ? Promise.resolve() : businessStore.fetchChartOfAccounts(),
    contactsStore.contacts.length ? Promise.resolve() : contactsStore.fetchContacts(),
  ])
})

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
    router.push({ name: 'business-transactions' })
  } catch (err: any) {
    const msg = err.response?.data?.message
    errorMsg.value = Array.isArray(msg) ? msg.join(', ') : (msg || 'Gagal menyimpan jurnal.')
  } finally {
    isSubmitting.value = false
  }
}
</script>
