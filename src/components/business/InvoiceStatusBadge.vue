<template>
  <span :class="badgeClass" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { InvoiceStatus } from '@/types/business'

const props = defineProps<{ status: InvoiceStatus }>()

const config: Record<InvoiceStatus, { label: string; cls: string }> = {
  DRAFT: { label: 'Draft', cls: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' },
  SENT: { label: '🟡 Terkirim', cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  PAID: { label: '✅ Lunas', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
  OVERDUE: { label: '🔴 Terlambat', cls: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
}

const badgeClass = computed(() => config[props.status]?.cls || '')
const label = computed(() => config[props.status]?.label || props.status)
</script>
