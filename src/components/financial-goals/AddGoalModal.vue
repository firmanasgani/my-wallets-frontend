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
        <div class="px-6 py-6">
          <div class="flex items-start">

            <div class="ml-4 w-full text-left">
              <h3 class="text-xl font-bold text-slate-900 dark:text-white" id="modal-title">
                {{ isEdit ? 'Edit Goal' : 'Tambah Goal Baru' }}
              </h3>
              <div class="mt-4 space-y-4">
                <!-- Name -->
                <div>
                  <label
                    for="goal-name"
                    class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >Nama Goal</label
                  >
                  <input
                    type="text"
                    id="goal-name"
                    v-model="form.name"
                    placeholder="misal: Liburan ke Bali"
                    :class="inputClass"
                  />
                </div>

                <!-- Target Amount -->
                <div>
                  <label
                    for="goal-amount"
                    class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >Target Nominal (IDR)</label
                  >
                  <CurrencyInput id="goal-amount" v-model="form.targetAmount" :class="inputClass" />
                </div>

                <!-- Target Date -->
                <div>
                  <label
                    for="goal-date"
                    class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >Target Tanggal (Opsional)</label
                  >
                  <input
                    type="date"
                    id="goal-date"
                    v-model="form.targetDate"
                    :class="[inputClass, 'dark:[color-scheme:dark]']"
                  />
                </div>

                <!-- Description -->
                <div>
                  <label
                    for="goal-desc"
                    class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >Deskripsi (Opsional)</label
                  >
                  <textarea
                    id="goal-desc"
                    v-model="form.description"
                    rows="3"
                    :class="inputClass"
                    placeholder="Kenapa Anda ingin mencapai goal ini?"
                  ></textarea>
                </div>

                <div
                  v-if="goalStore.errorMessage"
                  class="text-sm text-red-600 font-medium p-2 bg-red-50 dark:bg-red-900/20 rounded"
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
            class="inline-flex justify-center items-center px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
          >
            <LoadingSpinner
              v-if="goalStore.submitting"
              :visible="true"
              class="mr-2"
              color="text-white"
              size="xs"
            />
            {{ isEdit ? 'Simpan Perubahan' : 'Buat Goal' }}
          </button>
          <button
            type="button"
            @click="$emit('close')"
            class="inline-flex justify-center px-6 py-2 bg-white text-slate-700 border border-slate-300 font-bold rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, reactive, onMounted } from 'vue'
import { useFinancialGoalStore } from '@/stores/financialGoals'
import CurrencyInput from '@/components/common/CurrencyInput.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { FinancialGoal } from '@/types/financialGoals'

const props = defineProps<{
  isOpen: boolean
  goal?: FinancialGoal | null
}>()

const emit = defineEmits(['close', 'success'])
const goalStore = useFinancialGoalStore()

const isEdit = computed(() => !!props.goal)

const inputClass =
  'mt-1 block w-full rounded-lg border border-slate-300 bg-white shadow-sm py-2.5 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-500 transition-colors'

const form = reactive({
  name: '',
  targetAmount: 0,
  targetDate: '',
  description: '',
})

const isValid = computed(() => {
  return form.name.trim().length > 0 && form.targetAmount > 0
})

onMounted(() => {
  if (props.goal) {
    form.name = props.goal.name
    form.targetAmount = props.goal.targetAmount
    form.description = props.goal.description || ''
    if (props.goal.targetDate) {
      form.targetDate = new Date(props.goal.targetDate).toISOString().split('T')[0]
    }
  }
})

const submit = async () => {
  try {
    if (isEdit.value && props.goal) {
      await goalStore.updateGoal(props.goal.id, {
        name: form.name,
        targetAmount: form.targetAmount,
        targetDate: form.targetDate || undefined,
        description: form.description,
      })
    } else {
      await goalStore.createGoal({
        name: form.name,
        targetAmount: form.targetAmount,
        targetDate: form.targetDate || undefined,
        description: form.description,
      })
    }
    emit('success')
  } catch (error) {
    console.error('Failed to submit goal:', error)
  }
}
</script>
