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
      class="fixed inset-0 z-50 overflow-y-auto bg-slate-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 min-h-screen"
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
          class="relative transform rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <!-- Header -->
          <div
            class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50"
          >
            <h3 class="text-xl font-bold text-slate-800">
              {{ currentStep === 'SUCCESS' ? 'Pembayaran Berhasil' : 'Upgrade ke Premium' }}
            </h3>
            <button
              @click="closeModal"
              class="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <i class="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-6">
            <!-- Loading State -->
            <div
              v-if="subscriptionStore.isLoading"
              class="flex flex-col items-center justify-center py-20"
            >
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p class="mt-4 text-slate-500 font-medium">Memuat paket langganan...</p>
            </div>

            <!-- Error State -->
            <div
              v-else-if="subscriptionStore.error"
              class="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-3 text-red-700"
            >
              <i class="fa-solid fa-circle-exclamation text-xl"></i>
              <p>{{ subscriptionStore.error }}</p>
              <button
                @click="subscriptionStore.fetchPlans"
                class="ml-auto text-sm font-bold underline hover:no-underline"
              >
                Coba Lagi
              </button>
            </div>

            <!-- STEP 1: PLAN SELECTION -->
            <div v-else-if="currentStep === 'PLAN_SELECTION'" class="space-y-8">
              <div class="text-center max-w-lg mx-auto">
                <h4 class="text-2xl font-extrabold text-slate-900 mb-2">
                  Buka Potensi Penuh Keuanganmu
                </h4>
                <p class="text-slate-500">
                  Pilih durasi yang paling cocok untukmu dan nikmati fitur premium tanpa batas.
                </p>
              </div>

              <!-- Durations Table/Grid -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                  v-for="plan in premiumPlans"
                  :key="plan.id"
                  class="group relative flex flex-col p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer"
                  :class="[
                    selectedPlanId === plan.id
                      ? 'border-indigo-600 bg-indigo-50/30'
                      : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50',
                  ]"
                  @click="selectedPlanId = plan.id"
                >
                  <!-- Badge for Best Value -->
                  <div
                    v-if="plan.durationMonths === 12"
                    class="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm tracking-wider uppercase"
                  >
                    Nilai Terbaik
                  </div>

                  <div class="mb-4">
                    <span class="text-sm font-bold text-indigo-600 uppercase tracking-widest"
                      >{{ plan.durationMonths }} Bulan</span
                    >
                    <h5 class="text-xl font-bold text-slate-800 mt-1">{{ plan.name }}</h5>
                  </div>

                  <div class="flex items-baseline gap-1 mb-4">
                    <span class="text-3xl font-black text-slate-900"
                      >Rp {{ formatNumber(plan.discountPrice || plan.price) }}</span
                    >
                    <span class="text-slate-400 text-sm">/total</span>
                  </div>

                  <div v-if="plan.discountPrice" class="mb-6">
                    <span class="text-xs text-slate-400 line-through"
                      >Rp {{ formatNumber(plan.price) }}</span
                    >
                    <span
                      class="ml-2 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded"
                      >Hemat {{ calculateSaving(plan) }}%</span
                    >
                  </div>

                  <div
                    class="mt-auto pt-4 flex items-center gap-2 font-bold"
                    :class="
                      selectedPlanId === plan.id
                        ? 'text-indigo-600'
                        : 'text-slate-400 group-hover:text-slate-600'
                    "
                  >
                    <i
                      class="fa-solid"
                      :class="
                        selectedPlanId === plan.id
                          ? 'fa-circle-check text-indigo-600'
                          : 'fa-circle text-slate-200'
                      "
                    ></i>
                    {{ selectedPlanId === plan.id ? 'Terpilih' : 'Pilih Paket' }}
                  </div>
                </div>
              </div>

              <!-- Features List -->
              <div class="bg-indigo-900 rounded-2xl p-8 text-white">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  <div
                    v-for="feature in premiumFeatures"
                    :key="feature"
                    class="flex items-start gap-3"
                  >
                    <div class="bg-indigo-500/30 p-1 rounded-full">
                      <i class="fa-solid fa-check text-xs text-indigo-300"></i>
                    </div>
                    <span class="text-sm font-medium text-indigo-50">{{ feature }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 3: SUCCESS -->
            <div
              v-else-if="currentStep === 'SUCCESS'"
              class="flex flex-col items-center justify-center py-12 text-center"
            >
              <div class="relative mb-8">
                <div
                  class="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-25"
                ></div>
                <div
                  class="relative h-20 w-20 bg-green-100 rounded-full flex items-center justify-center"
                >
                  <i class="fa-solid fa-check text-3xl text-green-600"></i>
                </div>
              </div>
              <h3 class="text-3xl font-black text-slate-900 mb-2">Upgrade Berhasil!</h3>
              <p class="text-slate-500 text-lg max-w-sm mx-auto mb-10">
                Terima kasih! Akun Anda kini aktif sebagai anggota <strong>Premium</strong>. Mulai
                kelola keuanganmu lebih baik.
              </p>
              <button
                @click="finishProcess"
                class="bg-indigo-600 text-white px-10 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
              >
                Mulai Sekarang
              </button>
            </div>
          </div>

          <!-- Sticky Footer -->
          <div
            v-if="currentStep === 'PLAN_SELECTION'"
            class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div v-if="selectedPlanDetails" class="flex items-center gap-3">
              <div class="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                <i class="fa-solid fa-crown"></i>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                  Total Bayar
                </p>
                <p class="text-lg font-black text-slate-900">
                  Rp
                  {{ formatNumber(selectedPlanDetails.discountPrice || selectedPlanDetails.price) }}
                </p>
              </div>
            </div>
            <div v-else class="text-slate-400 text-sm font-medium italic">
              Silakan pilih durasi paket langganan
            </div>

            <div class="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                class="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                @click="closeModal"
              >
                Batal
              </button>
              <button
                @click="handlePayment"
                :disabled="!selectedPlanId || isProcessing"
                class="flex-1 sm:flex-initial bg-indigo-600 text-white px-10 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <i v-if="isProcessing" class="fa-solid fa-circle-notch animate-spin"></i>
                {{ isProcessing ? 'Memproses...' : 'Lanjutkan ke Pembayaran' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useSubscriptionStore } from '@/stores/subscriptions'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['update:isOpen', 'success'])

const subscriptionStore = useSubscriptionStore()
const authStore = useAuthStore()

type Step = 'PLAN_SELECTION' | 'SUCCESS'
const currentStep = ref<Step>('PLAN_SELECTION')
const selectedPlanId = ref<string | null>(null)
const isProcessing = ref(false)

const premiumPlans = computed(() => {
  return subscriptionStore.plans.filter((p) => p.code !== 'FREE')
})

const selectedPlanDetails = computed(() => {
  return subscriptionStore.plans.find((p) => p.id === selectedPlanId.value)
})

const premiumFeatures = [
  'Akun Keuangan Tanpa Batas',
  'Kategori Kustom Tanpa Batas',
  'Laporan & Analisis Lanjutan',
  'Transaksi Berulang Otomatis',
  'Fitur Budgeting Lengkap',
  'Lampiran Struk Transaksi',
  'Export Data (CSV/Excel)',
  'Dukungan Prioritas 24/7',
]

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID').format(num)
}

const calculateSaving = (plan: any) => {
  if (!plan.discountPrice) return 0
  const saving = ((plan.price - plan.discountPrice) / plan.price) * 100
  return Math.round(saving)
}

const closeModal = () => {
  if (isProcessing.value) return
  emit('update:isOpen', false)
  setTimeout(() => {
    currentStep.value = 'PLAN_SELECTION'
    selectedPlanId.value = null
    isProcessing.value = false
  }, 300)
}

const handlePayment = async () => {
  if (!selectedPlanDetails.value) return

  isProcessing.value = true
  try {
    const snapToken = await subscriptionStore.initiateCheckout(selectedPlanDetails.value.code)

    // @ts-ignore
    window.snap.pay(snapToken, {
      onSuccess: function (result: any) {
        console.log('success', result)
        currentStep.value = 'SUCCESS'
        isProcessing.value = false
        // Polling profile update because Midtrans webhook is async
        let attempts = 0
        const maxAttempts = 5
        const checkStatus = async () => {
          await authStore.fetchUserProfile()
          if (authStore.currentUser?.subscriptionPlan !== 'FREE') return
          if (attempts < maxAttempts) {
            attempts++
            setTimeout(checkStatus, 2000)
          }
        }
        checkStatus()
      },
      onPending: function (result: any) {
        console.log('pending', result)
        isProcessing.value = false
        closeModal()
        alert('Pembayaran tertunda. Silakan selesaikan pembayaran Anda.')
      },
      onError: function (result: any) {
        console.log('error', result)
        isProcessing.value = false
        alert('Terjadi kesalahan saat pembayaran.')
      },
      onClose: function () {
        console.log('customer closed the popup without finishing the payment')
        isProcessing.value = false
      },
    })
  } catch (err: any) {
    alert(err.message || 'Gagal memproses pembayaran')
    isProcessing.value = false
  }
}

const finishProcess = () => {
  emit('success')
  closeModal()
}

onMounted(() => {
  if (props.isOpen) {
    subscriptionStore.fetchPlans()
  }
})

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      subscriptionStore.fetchPlans()
      currentStep.value = 'PLAN_SELECTION'
    }
  },
)
</script>
