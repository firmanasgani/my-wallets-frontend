<template>
  <div class="flex gap-1 p-1 bg-slate-900/50 rounded-lg">
    <button @click="select('personal')" :class="tabClass('personal')">
      <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      Personal
    </button>
    <button @click="select('business')" :class="tabClass('business')">
      <svg v-if="!isBusinessPlan" class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <svg v-else class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      Bisnis
    </button>
  </div>

  <PricingModal :is-open="upgradeOpen" :business-only="true" @update:is-open="upgradeOpen = $event" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkspaceStore } from '@/stores/workspace'
import { useAuthStore } from '@/stores/auth'
import PricingModal from '@/components/common/PricingModal.vue'

const wsStore = useWorkspaceStore()
const authStore = useAuthStore()
const router = useRouter()

const upgradeOpen = ref(false)
const isBusinessPlan = computed(() => authStore.currentUser?.subscriptionPlan?.startsWith('BUSINESS') ?? false)

const tabClass = (mode: 'personal' | 'business') => {
  const isActive = wsStore.mode === mode && (mode === 'personal' || isBusinessPlan.value)
  return [
    'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-semibold transition-colors',
    isActive
      ? 'bg-[#2E8B57] text-white'
      : 'text-slate-400 hover:text-slate-200 hover:bg-[#236B43]/50',
  ]
}

function select(mode: 'personal' | 'business') {
  if (mode === 'business' && !isBusinessPlan.value) {
    upgradeOpen.value = true
    return
  }
  wsStore.setMode(mode)
  if (mode === 'business') {
    router.push({ name: 'business-invoices' })
  }
}
</script>
