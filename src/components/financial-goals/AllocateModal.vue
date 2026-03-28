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
      class="fixed inset-0 z-[60] overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="$emit('close')"
    >
      <div
        class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl transform transition-all max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-700"
        @click.stop
      >
        <div class="px-6 py-6 text-left">
          <div class="flex items-start">
            <div
              class="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/40"
            >
              <svg
                class="h-6 w-6 text-green-600 dark:text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 4.5v15m0-15l-6.75 6.75M12 4.5l6.75 6.75"
                />
              </svg>
            </div>
            <div class="ml-4 w-full">
              <h3 class="text-xl font-bold text-slate-900 dark:text-white" id="modal-title">
                Nabung ke Goal
              </h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Pilih akun sumber dan tentukan nominal yang ingin Anda sisihkan.
              </p>

              <div class="mt-6 space-y-4">
                <!-- Account Selection -->
                <div>
                  <label
                    for="account"
                    class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >Pilih Akun Sumber</label
                  >
                  <select
                    id="account"
                    v-model="form.accountId"
                    class="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white py-2 px-3"
                  >
                    <option v-for="acc in accountStore.accounts" :key="acc.id" :value="acc.id">
                      {{ acc.accountName }} (Saldo: {{ formatCurrency(acc.currentBalance) }})
                    </option>
                  </select>
                </div>

                <!-- Amount -->
                <div>
                  <label
                    for="amount"
                    class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >Nominal Tabungan (IDR)</label
                  >
                  <CurrencyInput id="amount" v-model="form.amount" class="mt-1" />
                  <p v-if="selectedAccount" class="text-[10px] text-slate-400 mt-1">
                    Tersedia: {{ formatCurrency(selectedAccount.currentBalance) }}
                  </p>
                </div>

                <!-- Note -->
                <div>
                  <label
                    for="note"
                    class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >Catatan (Opsional)</label
                  >
                  <input
                    type="text"
                    id="note"
                    v-model="form.note"
                    placeholder="misal: Bonus akhir bulan"
                    class="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white py-2 px-3"
                  />
                </div>

                <div
                  v-if="goalStore.errorMessage"
                  class="text-xs text-red-600 font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded"
                >
                  {{ goalStore.errorMessage }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          class="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex flex-col sm:flex-row-reverse gap-3"
        >
          <button
            type="button"
            @click="submit"
            :disabled="goalStore.submitting || !isValid"
            class="inline-flex justify-center items-center px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
          >
            <LoadingSpinner
              v-if="goalStore.submitting"
              :visible="true"
              color="text-white"
              size="xs"
              class="mr-2"
            />
            Konfirmasi Alokasi
          </button>
          <button
            type="button"
            @click="$emit('close')"
            class="inline-flex justify-center px-6 py-2 bg-white text-slate-700 border border-slate-300 font-bold rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useFinancialGoalStore } from '@/stores/financialGoals'
import { useAccountStore } from '@/stores/accounts'
import CurrencyInput from '@/components/common/CurrencyInput.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const props = defineProps<{
  isOpen: boolean
  goalId: string
}>()

const emit = defineEmits(['close', 'success'])
const goalStore = useFinancialGoalStore()
const accountStore = useAccountStore()

const form = reactive({
  accountId: '',
  amount: 0,
  note: '',
})

const selectedAccount = computed(() => {
  return accountStore.accounts.find((a) => a.id === form.accountId)
})

const isValid = computed(() => {
  return (
    form.accountId &&
    form.amount > 0 &&
    (!selectedAccount.value || selectedAccount.value.currentBalance >= form.amount)
  )
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

onMounted(async () => {
  if (accountStore.accounts.length === 0) {
    await accountStore.fetchAccounts()
  }
  if (accountStore.accounts.length > 0) {
    form.accountId = accountStore.accounts[0].id
  }
})

const submit = async () => {
  try {
    await goalStore.allocateFunds(props.goalId, {
      accountId: form.accountId,
      amount: form.amount,
      note: form.note,
    })
    emit('success')
  } catch (error) {
    console.error('Failed to allocate funds:', error)
  }
}
</script>
