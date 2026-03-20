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
            <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {{ isEdit ? 'Edit COA' : 'Tambah COA Custom' }}
            </h2>
            <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="px-6 py-5 space-y-4">
            <!-- Kode (create only) -->
            <div v-if="!isEdit">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Kode Akun <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.code"
                type="text"
                placeholder="Contoh: 1-005"
                required
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Konvensi: 1-xxx=ASSET, 2-xxx=LIABILITY, 3-xxx=EQUITY, 4-xxx=REVENUE, 5-xxx=EXPENSE
              </p>
            </div>

            <!-- Nama -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nama Akun <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Nama akun"
                required
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <!-- Tipe -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tipe Akun <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.type"
                required
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="ASSET">ASSET — Aset (Harta)</option>
                <option value="LIABILITY">LIABILITY — Kewajiban (Hutang)</option>
                <option value="EQUITY">EQUITY — Ekuitas (Modal)</option>
                <option value="REVENUE">REVENUE — Pendapatan</option>
                <option value="EXPENSE">EXPENSE — Beban</option>
              </select>
            </div>

            <!-- Saldo Awal -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Saldo Awal (Opening Balance)
              </label>
              <input
                v-model.number="form.openingBalance"
                type="number"
                min="0"
                step="any"
                placeholder="0"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Isi jika sedang migrasi dari pembukuan manual/Excel. Kosongkan jika mulai dari nol.
              </p>
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
                :disabled="isSubmitting"
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <svg v-if="isSubmitting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                {{ isEdit ? 'Simpan Perubahan' : 'Tambah COA' }}
              </button>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useBusinessStore } from '@/stores/business'
import type { ChartOfAccount, CoaType } from '@/types/business'

const props = defineProps<{
  isOpen: boolean
  account?: ChartOfAccount | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const businessStore = useBusinessStore()

const isEdit = ref(false)
const isSubmitting = ref(false)
const errorMsg = ref('')

const form = ref({
  code: '',
  name: '',
  type: 'ASSET' as CoaType,
  openingBalance: 0,
})

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      errorMsg.value = ''
      if (props.account) {
        isEdit.value = true
        form.value = {
          code: props.account.code,
          name: props.account.name,
          type: props.account.type,
          openingBalance: parseFloat(props.account.openingBalance) || 0,
        }
      } else {
        isEdit.value = false
        form.value = { code: '', name: '', type: 'ASSET', openingBalance: 0 }
      }
    }
  },
)

const handleSubmit = async () => {
  errorMsg.value = ''
  isSubmitting.value = true
  try {
    if (isEdit.value && props.account) {
      await businessStore.updateChartOfAccount(props.account.id, {
        name: form.value.name,
        type: form.value.type,
        openingBalance: form.value.openingBalance,
      })
    } else {
      await businessStore.createChartOfAccount({
        code: form.value.code,
        name: form.value.name,
        type: form.value.type,
        openingBalance: form.value.openingBalance,
      })
    }
    emit('saved')
    emit('close')
  } catch (err: any) {
    const msg = err.response?.data?.message
    errorMsg.value = Array.isArray(msg) ? msg.join(', ') : (msg || 'Gagal menyimpan COA.')
  } finally {
    isSubmitting.value = false
  }
}
</script>
