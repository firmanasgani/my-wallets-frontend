<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 min-h-screen"
      @click.self="closeModal"
    >
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        enter-to-class="opacity-100 translate-y-0 sm:scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 translate-y-0 sm:scale-100"
        leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      >
        <div
          v-if="isOpen"
          class="relative transform rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 min-h-[400px]">
            <!-- STEP 1: PLAN SELECTION -->
            <div v-if="currentStep === 'PLAN_SELECTION'">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 class="text-xl font-bold leading-6 text-gray-900 text-center mb-8">
                    Upgrade Paket Anda
                  </h3>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                      v-for="plan in availablePlans"
                      :key="plan.key"
                      class="rounded-xl p-6 relative flex flex-col transition-all duration-300"
                      :class="[
                        plan.recommended
                          ? 'border-2 border-indigo-500 bg-blue-50 shadow-md hover:shadow-lg'
                          : 'border border-slate-200 bg-white opacity-90 hover:opacity-100 hover:shadow-md',
                      ]"
                    >
                      <div
                        v-if="plan.recommended"
                        class="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl"
                      >
                        POPULAR
                      </div>
                      <h4 class="text-lg font-bold text-slate-800">{{ plan.name }}</h4>
                      <p
                        class="text-3xl font-bold mt-2"
                        :class="plan.recommended ? 'text-indigo-600' : 'text-slate-700'"
                      >
                        {{ plan.price
                        }}<span class="text-sm text-slate-500 font-normal">{{
                          plan.billingPeriod
                        }}</span>
                      </p>
                      <ul class="mt-6 space-y-3 flex-1">
                        <li
                          v-for="feature in plan.features"
                          :key="feature"
                          class="flex items-start"
                        >
                          <svg
                            class="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span class="text-sm text-slate-600">{{ feature }}</span>
                        </li>
                      </ul>
                      <button
                        @click="goToPayment(plan.key)"
                        :disabled="plan.disabled"
                        class="mt-8 w-full py-2 rounded-lg font-semibold transition-colors"
                        :class="[
                          plan.recommended && !plan.disabled
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : plan.disabled
                              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                              : 'bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50',
                        ]"
                      >
                        {{ plan.disabled ? 'Segera Hadir' : 'Pilih ' + plan.name }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 2: PAYMENT METHOD -->
            <div v-else-if="currentStep === 'PAYMENT_METHOD'">
              <div class="max-w-xl mx-auto">
                <h3 class="text-lg font-bold text-slate-900 mb-6 flex items-center">
                  <button
                    @click="currentStep = 'PLAN_SELECTION'"
                    class="mr-3 text-slate-400 hover:text-slate-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-5 h-5"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                      />
                    </svg>
                  </button>
                  Pilih Metode Pembayaran
                </h3>

                <!-- Order Summary -->
                <div
                  class="bg-indigo-50 p-4 rounded-lg mb-6 flex justify-between items-center border border-indigo-100"
                >
                  <div>
                    <p class="font-semibold text-indigo-900">
                      Upgrade {{ selectedPlanDetails?.name }}
                    </p>
                    <p class="text-xs text-indigo-600">Tagihan Bulanan</p>
                  </div>
                  <p class="font-bold text-lg text-indigo-700">{{ selectedPlanDetails?.price }}</p>
                </div>

                <!-- Payment Options -->
                <div class="space-y-3">
                  <p class="text-sm font-medium text-slate-700">Virtual Account</p>
                  <label
                    v-for="bank in banks"
                    :key="bank.code"
                    class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                    :class="
                      selectedPayment === bank.code
                        ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                        : 'border-slate-200'
                    "
                  >
                    <input
                      type="radio"
                      name="payment"
                      :value="bank.code"
                      v-model="selectedPayment"
                      class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span class="ml-3 block text-sm font-medium text-gray-700">{{
                      bank.name
                    }}</span>
                    <span class="ml-auto text-xs text-slate-500">Auto Check</span>
                  </label>

                  <p class="text-sm font-medium text-slate-700 mt-4">E-Wallet / QRIS</p>
                  <label
                    v-for="wallet in wallets"
                    :key="wallet.code"
                    class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                    :class="
                      selectedPayment === wallet.code
                        ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                        : 'border-slate-200'
                    "
                  >
                    <input
                      type="radio"
                      name="payment"
                      :value="wallet.code"
                      v-model="selectedPayment"
                      class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span class="ml-3 block text-sm font-medium text-gray-700">{{
                      wallet.name
                    }}</span>
                  </label>
                </div>

                <button
                  @click="processPayment"
                  :disabled="!selectedPayment || isProcessing"
                  class="mt-8 w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  <span v-if="isProcessing">Memproses Pembayaran...</span>
                  <span v-else>Bayar Sekarang &bullet; {{ selectedPlanDetails?.price }}</span>
                </button>
              </div>
            </div>

            <!-- STEP 3: SUCCESS -->
            <div
              v-else-if="currentStep === 'SUCCESS'"
              class="flex flex-col items-center justify-center py-10"
            >
              <div
                class="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6"
              >
                <svg
                  class="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h3>
              <p class="text-slate-600 text-center max-w-sm mb-8">
                Selamat! Akun Anda telah berhasil diupgrade ke <strong>Premium</strong>. Nikmati
                fitur tanpa batas sekarang.
              </p>
              <button
                @click="finishProcess"
                class="bg-indigo-600 text-white px-8 py-2 rounded-lg font-semibold hover:bg-indigo-700"
              >
                Selesai
              </button>
            </div>
          </div>

          <!-- Footer Buttons (Only for Plan Selection) -->
          <div
            v-if="currentStep === 'PLAN_SELECTION'"
            class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6"
          >
            <button
              type="button"
              class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              @click="closeModal"
            >
              Tutup
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { PRICING_PLANS, SubscriptionPlan } from '@/enums/pricing'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['update:isOpen', 'select-plan'])

type Step = 'PLAN_SELECTION' | 'PAYMENT_METHOD' | 'SUCCESS'
const currentStep = ref<Step>('PLAN_SELECTION')
const selectedPlan = ref('')
const selectedPayment = ref('')
const isProcessing = ref(false)

const availablePlans = computed(() => {
  return PRICING_PLANS.filter((plan) => plan.key !== SubscriptionPlan.FREE)
})

const selectedPlanDetails = computed(() => {
  return PRICING_PLANS.find((p) => p.key === selectedPlan.value)
})

const banks = [
  { code: 'BCA', name: 'BCA Virtual Account' },
  { code: 'MANDIRI', name: 'Mandiri Virtual Account' },
  { code: 'BRI', name: 'BRI Virtual Account' },
  { code: 'BNI', name: 'BNI Virtual Account' },
]

const wallets = [
  { code: 'GOPAY', name: 'GoPay' },
  { code: 'OVO', name: 'OVO' },
  { code: 'DANA', name: 'DANA' },
  { code: 'SHOPEEPAY', name: 'ShopeePay' },
]

const closeModal = () => {
  emit('update:isOpen', false)
  // Reset after transition usually, but immediate for now
  setTimeout(() => {
    currentStep.value = 'PLAN_SELECTION'
    selectedPayment.value = ''
    selectedPlan.value = ''
    isProcessing.value = false
  }, 300)
}

const goToPayment = (plan: string) => {
  selectedPlan.value = plan
  currentStep.value = 'PAYMENT_METHOD'
}

const processPayment = () => {
  if (!selectedPayment.value) return

  isProcessing.value = true

  // Simulate API call
  setTimeout(() => {
    isProcessing.value = false
    currentStep.value = 'SUCCESS'
  }, 2000)
}

const finishProcess = () => {
  emit('select-plan', selectedPlan.value) // Parent handles the store update
  closeModal()
}

// Reset when opened
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      currentStep.value = 'PLAN_SELECTION'
    }
  },
)
</script>
