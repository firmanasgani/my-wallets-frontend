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
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
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
          class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">Tandai Lunas</h2>
            <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div class="px-6 py-5 space-y-4">
            <!-- Invoice Summary -->
            <div v-if="invoice" class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-500 dark:text-slate-400">Invoice</span>
                <span class="font-medium text-slate-800 dark:text-slate-200">{{ invoice.invoiceNumber }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500 dark:text-slate-400">Klien</span>
                <span class="font-medium text-slate-800 dark:text-slate-200">{{ invoice.clientName }}</span>
              </div>
              <div class="flex justify-between border-t border-slate-200 dark:border-slate-600 pt-2 mt-2">
                <span class="font-semibold text-slate-700 dark:text-slate-300">Total</span>
                <span class="font-bold text-slate-900 dark:text-white">{{ formatCurrency(invoice.totalAmount) }}</span>
              </div>
              <div v-if="amountPaid > 0" class="flex justify-between text-amber-600 dark:text-amber-400">
                <span>Sudah Dibayar</span>
                <span class="font-medium">{{ formatCurrency(invoice.amountPaid) }}</span>
              </div>
              <div v-if="amountPaid > 0" class="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold border-t border-slate-200 dark:border-slate-600 pt-2">
                <span>Sisa Tagihan</span>
                <span>{{ formatCurrency(String(remaining)) }}</span>
              </div>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <!-- COA Selector -->
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Akun Penerima Pembayaran (Kas/Bank) <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="form.paymentCoaId"
                  required
                  :disabled="isLoadingCoa"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                >
                  <option value="" disabled>-- Pilih akun kas/bank --</option>
                  <option v-for="coa in assetAccounts" :key="coa.id" :value="coa.id">
                    {{ coa.code }} — {{ coa.name }}
                  </option>
                </select>
              </div>

              <!-- Payment Date -->
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Pembayaran <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.paymentDate"
                  type="date"
                  required
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <!-- Amount (partial) -->
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Jumlah Dibayar
                  <span class="ml-1 text-xs font-normal text-slate-400">(kosongkan = bayar sisa penuh)</span>
                </label>
                <CurrencyInput
                  v-model="form.amount"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 !rounded-lg text-sm"
                  placeholder="0"
                />
              </div>

              <!-- Payment Method & Reference -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Metode</label>
                  <select
                    v-model="form.paymentMethod"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Pilih --</option>
                    <option value="Cash">Cash</option>
                    <option value="Transfer">Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Referensi</label>
                  <input
                    v-model="form.paymentReference"
                    type="text"
                    placeholder="No. bukti transfer..."
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <!-- Error -->
              <div v-if="errorMsg" class="rounded-md bg-red-50 dark:bg-red-900/30 p-3 border border-red-200 dark:border-red-800">
                <p class="text-sm text-red-700 dark:text-red-300">{{ errorMsg }}</p>
              </div>

              <!-- Actions -->
              <div class="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  @click="$emit('close')"
                  :disabled="isSubmitting"
                  class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  :disabled="isSubmitting || !form.paymentCoaId"
                  class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <svg v-if="isSubmitting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Konfirmasi Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useBusinessStore } from '@/stores/business'
import { useInvoicesStore } from '@/stores/invoices'
import CurrencyInput from '@/components/common/CurrencyInput.vue'
import type { Invoice, ChartOfAccount } from '@/types/business'

const props = defineProps<{
  isOpen: boolean
  invoice: Invoice | null
}>()

const emit = defineEmits<{
  close: []
  paid: []
}>()

const businessStore = useBusinessStore()
const invoicesStore = useInvoicesStore()

const isLoadingCoa = ref(false)
const isSubmitting = ref(false)
const errorMsg = ref('')

const form = ref({
  paymentCoaId: '',
  paymentDate: new Date().toISOString().split('T')[0],
  amount: 0,
  paymentMethod: '',
  paymentReference: '',
})

const amountPaid = computed(() => parseFloat(props.invoice?.amountPaid ?? '0'))
const remaining = computed(() => parseFloat(props.invoice?.totalAmount ?? '0') - amountPaid.value)

// Only ASSET accounts (Kas/Bank) as payment target
const assetAccounts = computed<ChartOfAccount[]>(() => {
  return businessStore.chartOfAccounts['ASSET'] || []
})

watch(
  () => props.isOpen,
  async (open) => {
    if (open) {
      errorMsg.value = ''
      form.value = {
        paymentCoaId: '',
        paymentDate: new Date().toISOString().split('T')[0],
        amount: 0,
        paymentMethod: '',
        paymentReference: '',
      }
      if (Object.keys(businessStore.chartOfAccounts).length === 0) {
        isLoadingCoa.value = true
        try {
          await businessStore.fetchChartOfAccounts()
        } finally {
          isLoadingCoa.value = false
        }
      }
    }
  },
)

const handleSubmit = async () => {
  if (!props.invoice || !form.value.paymentCoaId) return
  errorMsg.value = ''
  isSubmitting.value = true
  try {
    await invoicesStore.payInvoice(props.invoice.id, {
      paymentCoaId: form.value.paymentCoaId,
      paymentDate: form.value.paymentDate,
      amount: form.value.amount > 0 ? form.value.amount : undefined,
      paymentMethod: form.value.paymentMethod || undefined,
      paymentReference: form.value.paymentReference || undefined,
    })
    emit('paid')
  } catch (err: any) {
    const msg = err.response?.data?.message
    errorMsg.value = Array.isArray(msg) ? msg.join(', ') : (msg || 'Gagal memproses pembayaran.')
  } finally {
    isSubmitting.value = false
  }
}

const formatCurrency = (value: string) => {
  const num = parseFloat(value)
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
}
</script>
