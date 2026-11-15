<template>
  <div class="subscription-checkout">
    <!-- Header -->
    <div class="checkout-heading">
      <button
        aria-label="Kembali ke Pengaturan"
        @click="router.push({ name: 'settings' })"
        class="mr-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">{{ actionTitle }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ actionSubtitle }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="subscriptionStore.isLoading" class="flex flex-col items-center justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2E8B57]"></div>
      <p class="mt-4 text-slate-500 dark:text-slate-400 font-medium">Memuat data paket...</p>
    </div>

    <!-- Guard: nothing to do -->
    <div
      v-else-if="guardMessage"
      class="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center"
    >
      <p class="text-slate-600 dark:text-slate-300">{{ guardMessage }}</p>
      <button
        @click="router.push({ name: 'settings' })"
        class="mt-4 inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-[#2E8B57] hover:bg-[#236B43]"
      >
        Kembali ke Pengaturan
      </button>
    </div>

    <!-- STEP: CONFIGURE / REVIEW -->
    <div v-else-if="step === 'REVIEW'" class="checkout-review grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <!-- Upgrade configuration stays together to the left of the summary. -->
      <div v-if="actionType === 'upgrade'" class="checkout-options">
        <h2 class="checkout-options-title">Pilihan Paket</h2>
        <!-- Duration -->
        <fieldset>
          <legend>Durasi</legend>
          <p v-if="selectedFamily === 'FREE'" class="checkout-duration-note">Selamanya · tanpa biaya langganan</p>
          <div class="space-y-2">
            <label
              v-for="d in availableDurations"
              :key="d"
              class="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors"
              :class="
                selectedDuration === d
                  ? 'border-[#2E8B57] bg-emerald-50/40 dark:bg-emerald-900/10'
                  : 'border-slate-200 dark:border-slate-700 hover:border-emerald-200'
              "
            >
              <input type="radio" name="plan-duration" :checked="selectedDuration === d" @change="selectedDuration = d" class="h-4 w-4 accent-[#2E8B57]" />
              <span class="text-sm font-medium text-slate-800 dark:text-slate-100">{{ planDurationLabel(d) }}</span>
            </label>
          </div>
        </fieldset>

        <!-- Package name -->
        <fieldset>
          <legend>Jenis Paket</legend>
          <div class="space-y-2">
            <label
              v-for="fam in availableFamilies"
              :key="fam"
              class="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors"
              :class="
                selectedFamily === fam
                  ? 'border-[#2E8B57] bg-emerald-50/40 dark:bg-emerald-900/10'
                  : 'border-slate-200 dark:border-slate-700 hover:border-emerald-200'
              "
            >
              <input type="radio" name="plan-family" :checked="selectedFamily === fam" @change="selectedFamily = fam" class="h-4 w-4 accent-[#2E8B57]" />
              <span class="text-sm font-medium text-slate-800 dark:text-slate-100">{{ familyLabel(fam) }}</span>
            </label>
          </div>
        </fieldset>
      </div>

      <!-- Upgrade summary and confirmation; renewal keeps its existing two cards. -->
      <div class="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <h3 class="text-base font-semibold text-slate-900 dark:text-white">
            {{ actionType === 'renew' ? 'Rincian Perpanjangan' : 'Rincian Paket' }}
          </h3>
        </div>

        <div v-if="!targetPlanDetails" class="p-6 text-sm text-slate-500 dark:text-slate-400">
          Pilih durasi dan jenis paket di samping.
        </div>

        <template v-else>
          <div class="p-6 space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-500 dark:text-slate-400">Nama paket</span>
              <span class="font-medium text-slate-900 dark:text-white">
                {{ familyLabel(familyOf(targetPlanDetails.code)) }} · {{ planDurationLabel(targetPlanDetails.durationMonths) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500 dark:text-slate-400">Harga</span>
              <span
                class="font-medium"
                :class="targetPlanDetails.discountPrice ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'"
              >
                {{ Number(targetPlanDetails.price) === 0 ? 'Gratis' : `Rp ${formatNumber(targetPlanDetails.price)}` }}
              </span>
            </div>
            <div v-if="targetPlanDetails.discountPrice" class="flex justify-between">
              <span class="text-slate-500 dark:text-slate-400">Harga diskon</span>
              <span class="font-bold text-emerald-600 dark:text-emerald-400">
                Rp {{ formatNumber(targetPlanDetails.discountPrice) }}
                <span
                  v-if="Number(targetPlanDetails.price) !== 0"
                  class="text-xs font-semibold bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded ml-1"
                >
                  Hemat {{ savingPercent }}%
                </span>
              </span>
            </div>

            <div class="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between">
              <span class="text-slate-500 dark:text-slate-400">Paket saat ini</span>
              <span class="font-medium text-slate-900 dark:text-white">
                {{ currentPlanDetails ? `${familyLabel(familyOf(currentPlanDetails.code))} · ${planDurationLabel(currentPlanDetails.durationMonths)}` : 'Free' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500 dark:text-slate-400">Berlaku hingga</span>
              <span class="font-medium text-slate-900 dark:text-white">{{ currentEndDate ? formatDate(currentEndDate) : '-' }}</span>
            </div>

            <template v-if="isPaidFlow">
              <div class="flex justify-between">
                <span class="text-slate-500 dark:text-slate-400">Durasi ditambahkan</span>
                <span class="font-medium text-slate-900 dark:text-white">+{{ durationDays }} hari</span>
              </div>
              <div class="border-t border-dashed border-slate-200 dark:border-slate-700 pt-3 flex justify-between">
                <span class="text-slate-500 dark:text-slate-400">Berlaku hingga (baru)</span>
                <span class="font-bold text-emerald-600 dark:text-emerald-400">{{ newEndDate ? formatDate(newEndDate) : '-' }}</span>
              </div>
              <div class="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-baseline">
                <span class="text-slate-500 dark:text-slate-400">Total bayar</span>
                <span class="text-xl font-black text-slate-900 dark:text-white">
                  Rp {{ formatNumber(targetPlanDetails.discountPrice || targetPlanDetails.price) }}
                </span>
              </div>
            </template>
            <template v-else>
              <p class="text-slate-600 dark:text-slate-300 pt-2">
                Anda tetap dapat menggunakan fitur <strong>{{ currentPlanDetails ? familyLabel(familyOf(currentPlanDetails.code)) : 'saat ini' }}</strong>
                hingga <strong>{{ currentEndDate ? formatDate(currentEndDate) : '-' }}</strong>. Setelah itu, akun otomatis menjadi
                <strong>{{ familyLabel(familyOf(targetPlanDetails.code)) }}</strong>. Tidak ada biaya untuk perubahan ini.
              </p>
            </template>
          </div>

          <div v-if="actionType === 'upgrade'" class="px-6 pb-6">
            <button
              @click="handleConfirmPlan"
              :disabled="isProcessing"
              class="w-full bg-slate-800 dark:bg-slate-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-900 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
            >
              <i v-if="isProcessing" class="fa-solid fa-circle-notch animate-spin"></i>
              {{ isProcessing ? 'Memproses...' : 'Konfirmasi' }}
            </button>
          </div>
        </template>
      </div>

      <!-- RIGHT card: payment method — its own card, side by side with the price card -->
      <div
        v-if="actionType === 'renew' && isPaidFlow && targetPlanDetails"
        class="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <h3 class="text-base font-semibold text-slate-900 dark:text-white">Metode Pembayaran</h3>
        </div>
        <div class="p-6 space-y-3 text-sm">
          <p v-if="subscriptionStore.paymentMethodsError" class="text-red-600 dark:text-red-400">
            {{ subscriptionStore.paymentMethodsError }}
          </p>
          <p v-else-if="!subscriptionStore.paymentMethodsAvailable" class="text-slate-500 dark:text-slate-400">
            Pembayaran online belum tersedia saat ini. Silakan coba lagi nanti.
          </p>
          <div v-else class="space-y-2">
            <label v-for="m in subscriptionStore.paymentMethods" :key="m.code" class="flex items-center gap-3 cursor-pointer">
              <input type="radio" :checked="selectedMethodCode === m.code" @change="selectedMethodCode = m.code" />
              <span class="font-medium">{{ m.name }}</span>
            </label>
          </div>
        </div>
        <div class="px-6 pb-6">
          <button
            @click="handleConfirmPayment"
            :disabled="isProcessing || !selectedMethodCode"
            class="w-full bg-[#2E8B57] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#236B43] transition-all flex items-center justify-center gap-2"
          >
            <i v-if="isProcessing" class="fa-solid fa-circle-notch animate-spin"></i>
            {{ isProcessing ? 'Memproses...' : 'Bayar Sekarang' }}
          </button>
        </div>
      </div>
    </div>

    <!-- STEP: AWAITING PAYMENT -->
    <div v-else-if="step === 'AWAITING_PAYMENT' && checkoutResult" class="grid max-w-md mx-auto">
      <div class="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <h3 class="text-base font-semibold text-slate-900 dark:text-white">Instruksi Pembayaran</h3>
        </div>
        <div class="p-6">
          <PayfestCheckoutInstructions :checkout="checkoutResult.checkout" :order-id="checkoutResult.order_id" />
        </div>
        <div class="px-6 pb-6">
          <button
            @click="checkPaymentStatus"
            :disabled="isCheckingStatus"
            class="w-full flex items-center justify-center gap-2"
          >
            <i v-if="isCheckingStatus" class="fa-solid fa-circle-notch animate-spin"></i>
            {{ isCheckingStatus ? 'Memeriksa...' : 'Saya Sudah Membayar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- STEP: SUCCESS -->
    <div v-else-if="step === 'SUCCESS'" class="flex flex-col items-center justify-center py-16 text-center">
      <div class="relative mb-8">
        <div class="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-25"></div>
        <div class="relative h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
          <i class="fa-solid fa-check text-3xl text-green-600"></i>
        </div>
      </div>
      <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-2">{{ successTitle }}</h3>
      <p class="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">{{ successMessage }}</p>
      <button
        @click="router.push({ name: 'settings' })"
        class="bg-[#2E8B57] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 hover:bg-[#236B43] transition-all"
      >
        Kembali ke Pengaturan
      </button>
    </div>

    <AppDialog
      :is-open="isPaymentMethodOpen"
      title="Pilih Metode Pembayaran"
      eyebrow="PEMBAYARAN PAKET"
      :busy="isProcessing"
      @close="isPaymentMethodOpen = false"
    >
      <div class="checkout-payment-dialog">
        <p v-if="targetPlanDetails" class="checkout-payment-summary">
          {{ familyLabel(familyOf(targetPlanDetails.code)) }} · {{ planDurationLabel(targetPlanDetails.durationMonths) }}
          <strong>Rp {{ formatNumber(targetPlanDetails.discountPrice || targetPlanDetails.price) }}</strong>
        </p>
        <p v-if="subscriptionStore.isLoadingPaymentMethods" role="status">Memuat metode pembayaran...</p>
        <div v-else-if="subscriptionStore.paymentMethodsError || !subscriptionStore.paymentMethodsAvailable || !subscriptionStore.paymentMethods.length" role="status">
          <p>{{ subscriptionStore.paymentMethodsError || 'Pembayaran online belum tersedia saat ini. Silakan coba lagi nanti.' }}</p>
          <button type="button" class="checkout-payment-retry" @click="loadPaymentMethods">Coba lagi</button>
        </div>
        <fieldset v-else :disabled="isProcessing" class="checkout-payment-methods">
          <legend class="shell-sr-only">Metode pembayaran</legend>
          <label v-for="method in subscriptionStore.paymentMethods" :key="method.code">
            <input v-model="selectedMethodCode" type="radio" name="upgrade-payment-method" :value="method.code" />
            <span>{{ method.name }}</span>
          </label>
        </fieldset>
        <footer>
          <button
            type="button"
            :disabled="isProcessing || subscriptionStore.isLoadingPaymentMethods || !subscriptionStore.paymentMethodsAvailable || !subscriptionStore.paymentMethods.some(method => method.code === selectedMethodCode)"
            @click="handleConfirmPayment"
          >{{ isProcessing ? 'Memproses...' : 'Bayar Sekarang' }}</button>
        </footer>
      </div>
    </AppDialog>

    <AppDialog :is-open="!!errorMessage" title="Pembayaran Belum Berhasil" eyebrow="PAYFEST" @close="errorMessage = null">
      <div class="checkout-error-dialog">
        <p>{{ errorMessage }}</p>
        <footer>
          <button type="button" @click="errorMessage = null">Tutup</button>
        </footer>
      </div>
    </AppDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSubscriptionStore } from '@/stores/subscriptions'
import type { PayfestCheckoutResult } from '@/stores/subscriptions'
import { getDurationDays, addDays } from '@/utils/subscriptionDuration'
import '@/assets/subscription-checkout.css'
import PayfestCheckoutInstructions from '@/components/subscriptions/PayfestCheckoutInstructions.vue'
import AppDialog from '@/components/common/AppDialog.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()

type Action = 'renew' | 'upgrade'
type Step = 'REVIEW' | 'AWAITING_PAYMENT' | 'SUCCESS'
type Family = 'PREMIUM' | 'BUSINESS' | 'FREE'

const actionType = computed<Action>(() => {
  const a = route.query.action as string
  return (a === 'renew' ? 'renew' : 'upgrade') as Action
})

const step = ref<Step>('REVIEW')
const isProcessing = ref(false)
const isPaymentMethodOpen = ref(false)
const selectedMethodCode = ref<string | null>(null)
const checkoutResult = ref<PayfestCheckoutResult | null>(null)
const isCheckingStatus = ref(false)
const errorMessage = ref<string | null>(null)

const actionTitle = computed(() => (actionType.value === 'renew' ? 'Perpanjang Langganan' : 'Upgrade Paket'))
const actionSubtitle = computed(() =>
  actionType.value === 'renew'
    ? 'Perpanjang masa aktif paket Anda saat ini.'
    : 'Pilih durasi dan jenis paket — naik untuk fitur tambahan, atau turun jika ingin mengurangi paket.',
)

const activeSubscription = computed(() => authStore.currentUser?.activeSubscription ?? null)
const currentPlanCode = computed(() => activeSubscription.value?.planCode ?? 'FREE')
const currentPlanDetails = computed(() => subscriptionStore.plans.find((p) => p.code === currentPlanCode.value))
const currentEndDate = computed(() => (activeSubscription.value?.endDate ? new Date(activeSubscription.value.endDate) : null))

const familyOf = (code?: string): Family => {
  if (!code) return 'FREE'
  if (code.startsWith('BUSINESS')) return 'BUSINESS'
  if (code.startsWith('PREMIUM')) return 'PREMIUM'
  return 'FREE'
}
const familyLabel = (fam: Family) => ({ PREMIUM: 'Premium', BUSINESS: 'Business', FREE: 'Free' })[fam]
const planDurationLabel = (durationMonths: number | null) =>
  durationMonths == null ? 'Selamanya' : `${durationMonths} Bulan`

// Paid tiers use checkout even when their price is lower than the current plan.
const pickablePlans = computed(() =>
  actionType.value === 'upgrade' ? subscriptionStore.plans.filter((p) => p.code !== currentPlanCode.value) : [],
)

const availableFamilies = computed<Family[]>(() => {
  const set = new Set(pickablePlans.value.map((p) => familyOf(p.code)))
  return (['PREMIUM', 'BUSINESS', 'FREE'] as Family[]).filter((f) => set.has(f))
})

const selectedFamily = ref<Family>('PREMIUM')
const selectedDuration = ref<number | null>(null)

const availableDurations = computed(() =>
  pickablePlans.value
    .filter((p) => familyOf(p.code) === selectedFamily.value && p.durationMonths != null)
    .map((p) => p.durationMonths as number)
    .sort((a, b) => a - b),
)

// Keep the duration selection valid whenever the family changes.
watch(availableDurations, (durations) => {
  if (selectedFamily.value === 'FREE') {
    selectedDuration.value = null
    return
  }
  if (!durations.includes(selectedDuration.value as number)) {
    selectedDuration.value = durations[0] ?? null
  }
})

const derivedPlanCode = computed(() => {
  if (actionType.value !== 'upgrade') return currentPlanCode.value
  if (selectedFamily.value === 'FREE') return 'FREE'
  const plan = pickablePlans.value.find(
    (p) => familyOf(p.code) === selectedFamily.value && p.durationMonths === selectedDuration.value,
  )
  return plan?.code ?? null
})

const targetPlanDetails = computed(() => subscriptionStore.plans.find((p) => p.code === derivedPlanCode.value))
const isPaidFlow = computed(() => !!targetPlanDetails.value && familyOf(targetPlanDetails.value.code) !== 'FREE')
const savingPercent = computed(() => {
  const plan = targetPlanDetails.value
  if (!plan?.discountPrice) return 0
  return Math.round(((Number(plan.price) - Number(plan.discountPrice)) / Number(plan.price)) * 100)
})

const baseDate = computed(() => {
  const now = new Date()
  return currentEndDate.value && currentEndDate.value > now ? currentEndDate.value : now
})
const durationDays = computed(() =>
  targetPlanDetails.value ? getDurationDays(targetPlanDetails.value.durationMonths) : null,
)
const newEndDate = computed(() =>
  durationDays.value != null ? addDays(baseDate.value, durationDays.value) : null,
)

const guardMessage = computed(() => {
  if (actionType.value === 'renew' && currentPlanCode.value === 'FREE') {
    return 'Anda belum memiliki paket aktif untuk diperpanjang.'
  }
  if (actionType.value === 'upgrade' && pickablePlans.value.length === 0) {
    return 'Tidak ada paket lain yang tersedia saat ini.'
  }
  return null
})

const successTitle = computed(() => {
  if (!isPaidFlow.value) return 'Perubahan Terjadwal'
  return actionType.value === 'renew' ? 'Perpanjangan Berhasil!' : 'Upgrade Berhasil!'
})
const successMessage = computed(() =>
  isPaidFlow.value
    ? `Paket ${targetPlanDetails.value ? familyLabel(familyOf(targetPlanDetails.value.code)) : ''} Anda kini aktif hingga ${newEndDate.value ? formatDate(newEndDate.value) : '-'}.`
    : `Paket Anda akan berubah menjadi ${targetPlanDetails.value ? familyLabel(familyOf(targetPlanDetails.value.code)) : 'Free'} setelah ${currentEndDate.value ? formatDate(currentEndDate.value) : 'masa berlaku saat ini habis'}.`,
)

const formatNumber = (num: number) => new Intl.NumberFormat('id-ID').format(num)
const formatDate = (date: Date) =>
  date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

const handleConfirmPayment = async () => {
  if (isProcessing.value || !isPaidFlow.value || !targetPlanDetails.value || !selectedMethodCode.value ||
    subscriptionStore.isLoadingPaymentMethods || !subscriptionStore.paymentMethodsAvailable ||
    !subscriptionStore.paymentMethods.some(method => method.code === selectedMethodCode.value)) return
  isProcessing.value = true
  try {
    checkoutResult.value = await subscriptionStore.initiateCheckout(
      targetPlanDetails.value.code,
      selectedMethodCode.value,
    )
    isPaymentMethodOpen.value = false
    step.value = 'AWAITING_PAYMENT'
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memproses pembayaran'
  } finally {
    isProcessing.value = false
  }
}

const checkPaymentStatus = async () => {
  isCheckingStatus.value = true
  const previousEndDate = activeSubscription.value?.endDate ?? null
  try {
    await authStore.fetchUserProfile()
    const newEnd = authStore.currentUser?.activeSubscription?.endDate ?? null
    if (newEnd !== previousEndDate) {
      step.value = 'SUCCESS'
    } else {
      errorMessage.value = 'Pembayaran belum terdeteksi. Jika sudah membayar, mohon tunggu beberapa saat lalu coba lagi.'
    }
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memeriksa status pembayaran. Silakan coba lagi.'
  } finally {
    isCheckingStatus.value = false
  }
}

const handleConfirmDowngrade = async () => {
  const targetCode = derivedPlanCode.value
  if (!targetCode) return
  isProcessing.value = true
  try {
    await subscriptionStore.scheduleDowngrade(targetCode)
    await authStore.fetchUserProfile()
    step.value = 'SUCCESS'
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memproses perubahan paket.'
  } finally {
    isProcessing.value = false
  }
}

const loadPaymentMethods = async () => {
  await subscriptionStore.fetchPaymentMethods()
  if (!subscriptionStore.paymentMethods.some(method => method.code === selectedMethodCode.value)) {
    selectedMethodCode.value = null
  }
}

const handleConfirmPlan = () => {
  if (isProcessing.value || !targetPlanDetails.value) return
  if (isPaidFlow.value) {
    selectedMethodCode.value = null
    isPaymentMethodOpen.value = true
    void loadPaymentMethods()
  } else {
    void handleConfirmDowngrade()
  }
}

onMounted(async () => {
  if (subscriptionStore.plans.length === 0) {
    await subscriptionStore.fetchPlans()
  }
  if (actionType.value === 'renew') {
    await subscriptionStore.fetchPaymentMethods()
    selectedMethodCode.value = subscriptionStore.paymentMethods[0]?.code ?? null
  }
  await authStore.fetchUserProfile()

  if (actionType.value === 'upgrade') {
    const currentFamily = familyOf(currentPlanCode.value)
    selectedFamily.value = availableFamilies.value.includes(currentFamily === 'FREE' ? 'PREMIUM' : currentFamily)
      ? currentFamily === 'FREE'
        ? 'PREMIUM'
        : currentFamily
      : availableFamilies.value[0]
    selectedDuration.value = availableDurations.value[0] ?? null

    const preselected = route.query.plan as string | undefined
    if (preselected) {
      const plan = subscriptionStore.plans.find((p) => p.code === preselected)
      if (plan) {
        selectedFamily.value = familyOf(plan.code)
        selectedDuration.value = plan.durationMonths
      }
    }
  }
})
</script>
<style scoped>
.checkout-payment-dialog {
  padding: 24px;
  color: var(--shell-ink);
}
.checkout-payment-summary {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}
.checkout-payment-methods {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  border: 0;
}
.checkout-payment-methods label {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 50px;
  padding: 12px 14px;
  border: 1px solid var(--shell-rule);
  border-radius: 12px;
  cursor: pointer;
}
.checkout-payment-methods label:has(input:checked) {
  border-color: var(--shell-grape);
  background: var(--shell-lilac);
}
.checkout-payment-methods input { accent-color: var(--shell-grape); }
.checkout-payment-dialog footer { margin-top: 24px; }
.checkout-payment-dialog footer button {
  width: 100%;
  min-height: 48px;
  border: 0;
  border-radius: 999px;
  background: var(--shell-ink);
  color: var(--shell-surface);
  font-weight: 700;
  cursor: pointer;
}
.checkout-payment-dialog footer button:hover:not(:disabled) { background: var(--shell-grape); }
.checkout-payment-dialog footer button:disabled { opacity: .55; cursor: not-allowed; }
.checkout-payment-retry {
  margin-top: 12px;
  padding: 8px 16px;
  border: 1px solid var(--shell-rule);
  border-radius: 999px;
  background: var(--shell-surface);
  color: var(--shell-ink);
  cursor: pointer;
}
.checkout-error-dialog {
  padding: 4px 24px 24px;
}
.checkout-error-dialog p {
  margin: 0 0 20px;
  color: var(--shell-ink);
  font-size: 14px;
}
.checkout-error-dialog footer {
  display: flex;
  justify-content: flex-end;
}
.checkout-error-dialog footer button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 10px 20px;
  border: 1px solid var(--shell-line);
  border-radius: 999px;
  background: var(--shell-ink);
  color: var(--shell-surface);
  font-weight: 700;
  cursor: pointer;
  transition: background .18s ease;
}
.checkout-error-dialog footer button:hover {
  background: var(--shell-grape);
}
</style>
