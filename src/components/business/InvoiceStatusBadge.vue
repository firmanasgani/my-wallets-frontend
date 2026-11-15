<template>
  <span
    :class="cfg.cls"
    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
  >
    <span class="w-1.5 h-1.5 rounded-full" :class="cfg.dot" aria-hidden="true"></span>
    {{ cfg.label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { InvoiceStatus } from '@/types/business'

const props = defineProps<{ status: InvoiceStatus }>()

const config: Record<InvoiceStatus, { label: string; cls: string; dot: string }> = {
  DRAFT: { label: 'Draf', cls: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300', dot: 'bg-slate-400' },
  SENT: { label: 'Terkirim', cls: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', dot: 'bg-blue-500' },
  PAID: { label: 'Lunas', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', dot: 'bg-emerald-500' },
  OVERDUE: { label: 'Terlambat', cls: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300', dot: 'bg-red-500' },
  CANCELLED: { label: 'Dibatalkan', cls: 'bg-zinc-100 text-zinc-500 line-through decoration-zinc-400/60 dark:bg-zinc-800 dark:text-zinc-400', dot: 'bg-zinc-400' },
}

const cfg = computed(() => config[props.status] ?? { label: props.status, cls: '', dot: 'bg-slate-400' })
</script>
