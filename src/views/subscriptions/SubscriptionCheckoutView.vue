<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex items-center mb-8">
      <button
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
    <div v-else-if="step === 'REVIEW'" class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <!-- LEFT: selectors (upgrade only — renew has nothing to pick) -->
      <div v-if="actionType === 'upgrade'" class="space-y-6">
        <!-- Duration -->
        <div>
          <p class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Durasi</p>
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
              <input type="checkbox" :checked="selectedDuration === d" @change="selectedDuration = d" class="h-4 w-4 rounded accent-[#2E8B57]" />
              <span class="text-sm font-medium text-slate-800 dark:text-slate-100">{{ planDurationLabel(d) }}</span>
            </label>
          </div>
        </div>

        <!-- Package name -->
        <div>
          <p class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Jenis Paket</p>
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
              <input type="checkbox" :checked="selectedFamily === fam" @change="selectedFamily = fam" class="h-4 w-4 rounded accent-[#2E8B57]" />
              <span class="text-sm font-medium text-slate-800 dark:text-slate-100">{{ familyLabel(fam) }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- RIGHT: package information / calculation -->
      <div
        class="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        :class="actionType === 'renew' ? 'md:col-span-2 max-w-md' : ''"
      >
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <h3 class="text-base font-semibold text-slate-900 dark:text-white">
            {{ isPaidFlow ? 'Rincian Perpanjangan' : 'Konfirmasi Perubahan Paket' }}
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
                <span class="text-xs font-semibold bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded ml-1">
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

          <div class="px-6 pb-6">
            <button
              v-if="isPaidFlow"
              @click="handlePay"
              :disabled="isProcessing"
              class="w-full bg-[#2E8B57] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#236B43] transition-all flex items-center justify-center gap-2"
            >
              <i v-if="isProcessing" class="fa-solid fa-circle-notch animate-spin"></i>
              {{ isProcessing ? 'Memproses...' : 'Bayar Sekarang' }}
            </button>
            <button
              v-else
              @click="handleConfirmDowngrade"
              :disabled="isProcessing"
              class="w-full bg-slate-800 dark:bg-slate-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-900 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
            >
              <i v-if="isProcessing" class="fa-solid fa-circle-notch animate-spin"></i>
              {{ isProcessing ? 'Memproses...' : 'Konfirmasi' }}
            </button>
          </div>
        </template>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSubscriptionStore } from '@/stores/subscriptions'
import { getDurationDays, addDays } from '@/utils/subscriptionDuration'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()

type Action = 'renew' | 'upgrade'
type Step = 'REVIEW' | 'SUCCESS'
type Family = 'PREMIUM' | 'BUSINESS' | 'FREE'

const actionType = computed<Action>(() => {
  const a = route.query.action as string
  return (a === 'renew' ? 'renew' : 'upgrade') as Action
})

const step = ref<Step>('REVIEW')
const isProcessing = ref(false)

const actionTitle = computed(() => (actionType.value === 'renew' ? 'Perpanjang Langganan' : 'Upgrade Paket'))
const actionSubtitle = computed(() =>
  actionType.value === 'renew'
    ? 'Perpanjang masa aktif paket Anda saat ini.'
    : 'Pilih durasi dan jenis paket — naik untuk fitur tambahan, atau turun jika ingin mengurangi paket.',
)

const activeSubscription = computed(() => authStore.currentUser?.activeSubscription ?? null)
const currentPlanCode = computed(() => activeSubscription.value?.planCode ?? 'FREE')
const currentPlanDetails = computed(() => subscriptionStore.plans.find((p) => p.code === currentPlanCode.value))
const currentPrice = computed(() => Number(currentPlanDetails.value?.price ?? 0))
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

// Every plan except the one already active — the target's price relative
// to the current plan decides whether it's a paid extension (>=) or a
// scheduled downgrade (<), not the action name itself.
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
const isPaidFlow = computed(() => !!targetPlanDetails.value && Number(targetPlanDetails.value.price) >= currentPrice.value)
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

const handlePay = async () => {
  if (!targetPlanDetails.value) return
  isProcessing.value = true
  const previousEndDate = activeSubscription.value?.endDate ?? null

  try {
    const snapToken = await subscriptionStore.initiateCheckout(targetPlanDetails.value.code)
    // @ts-ignore
    window.snap.pay(snapToken, {
      onSuccess: () => {
        pollForProfileUpdate(previousEndDate)
      },
      onPending: () => {
        isProcessing.value = false
        alert('Pembayaran tertunda. Silakan selesaikan pembayaran Anda.')
      },
      onError: () => {
        isProcessing.value = false
        alert('Terjadi kesalahan saat pembayaran.')
      },
      onClose: () => {
        isProcessing.value = false
      },
    })
  } catch (err: any) {
    alert(err.message || 'Gagal memproses pembayaran')
    isProcessing.value = false
  }
}

const pollForProfileUpdate = (previousEndDate: string | null | undefined) => {
  let attempts = 0
  const maxAttempts = 5
  const check = async () => {
    await authStore.fetchUserProfile()
    const newEnd = authStore.currentUser?.activeSubscription?.endDate ?? null
    if (newEnd !== previousEndDate || attempts >= maxAttempts) {
      isProcessing.value = false
      step.value = 'SUCCESS'
      return
    }
    attempts++
    setTimeout(check, 2000)
  }
  check()
}

const handleConfirmDowngrade = async () => {
  const targetCode = derivedPlanCode.value
  if (!targetCode) return
  isProcessing.value = true
  try {
    await subscriptionStore.scheduleDowngrade(targetCode)
    await authStore.fetchUserProfile()
    step.value = 'SUCCESS'
  } catch (err: any) {
    alert(err.message || 'Gagal memproses perubahan paket.')
  } finally {
    isProcessing.value = false
  }
}

onMounted(async () => {
  if (subscriptionStore.plans.length === 0) {
    await subscriptionStore.fetchPlans()
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
