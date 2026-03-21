<template>
  <div class="space-y-3">
    <!-- Lines table - scrollable on mobile -->
    <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table class="w-full text-sm min-w-[640px]">
        <thead class="bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          <tr>
            <th class="px-3 py-2.5 text-left w-28">Tipe</th>
            <th class="px-3 py-2.5 text-left">Akun COA</th>
            <th class="px-3 py-2.5 text-left w-36">Jumlah (Rp)</th>
            <th class="px-3 py-2.5 text-left w-36">Contact</th>
            <th class="px-3 py-2.5 text-left">Keterangan Baris</th>
            <th class="px-3 py-2.5 w-8"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
          <tr
            v-for="(line, idx) in lines"
            :key="idx"
            :class="[
              'transition-colors',
              line.type === 'DEBIT'
                ? 'bg-green-50/30 dark:bg-green-900/10'
                : 'bg-red-50/30 dark:bg-red-900/10',
            ]"
          >
            <!-- Type -->
            <td class="px-3 py-2">
              <select
                v-model="line.type"
                class="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                :class="line.type === 'DEBIT' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'"
              >
                <option value="DEBIT">DEBIT</option>
                <option value="CREDIT">CREDIT</option>
              </select>
            </td>

            <!-- COA -->
            <td class="px-3 py-2">
              <select
                v-model="line.coaId"
                required
                class="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="" disabled>Pilih akun...</option>
                <optgroup v-for="(group, type) in coaGrouped" :key="type" :label="String(type)">
                  <option v-for="coa in group" :key="coa.id" :value="coa.id">
                    {{ coa.code }} {{ coa.name }}
                  </option>
                </optgroup>
              </select>
            </td>

            <!-- Amount -->
            <td class="px-3 py-2">
              <input
                :value="line.amountDisplay"
                type="text"
                inputmode="numeric"
                placeholder="0"
                required
                @input="onAmountInput($event, idx)"
                class="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </td>

            <!-- Contact -->
            <td class="px-3 py-2">
              <select
                v-model="line.contactId"
                class="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">—</option>
                <option v-for="contact in contacts" :key="contact.id" :value="contact.id">
                  {{ contact.name }}
                </option>
              </select>
            </td>

            <!-- Description -->
            <td class="px-3 py-2">
              <input
                v-model="line.description"
                type="text"
                placeholder="(opsional)"
                class="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </td>

            <!-- Remove -->
            <td class="px-3 py-2 text-center">
              <button
                v-if="lines.length > 2"
                type="button"
                @click="removeLine(idx)"
                class="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                title="Hapus baris"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add line + Balance -->
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <button
        type="button"
        @click="addLine"
        class="flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Tambah Baris
      </button>

      <!-- Balance indicator -->
      <div class="flex items-center gap-4 text-sm font-mono">
        <span class="text-slate-600 dark:text-slate-400">
          Debit: <span class="font-semibold text-green-700 dark:text-green-400">{{ formatRp(totalDebit) }}</span>
        </span>
        <span class="text-slate-600 dark:text-slate-400">
          Credit: <span class="font-semibold text-red-700 dark:text-red-400">{{ formatRp(totalCredit) }}</span>
        </span>
        <span
          v-if="totalDebit > 0 || totalCredit > 0"
          :class="[
            'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
            isBalanced
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
          ]"
        >
          <svg v-if="isBalanced" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {{ isBalanced ? 'Balance' : 'Tidak Balance' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ChartOfAccount, Contact, CreateJournalLinePayload } from '@/types/business'

interface FormLine {
  type: 'DEBIT' | 'CREDIT'
  coaId: string
  amountRaw: number
  amountDisplay: string
  description: string
  contactId: string
}

defineProps<{
  coaGrouped: Record<string, ChartOfAccount[]>
  contacts: Contact[]
}>()

const lines = ref<FormLine[]>([
  { type: 'DEBIT', coaId: '', amountRaw: 0, amountDisplay: '', description: '', contactId: '' },
  { type: 'CREDIT', coaId: '', amountRaw: 0, amountDisplay: '', description: '', contactId: '' },
])

const totalDebit = computed(() =>
  lines.value.filter((l) => l.type === 'DEBIT').reduce((s, l) => s + l.amountRaw, 0),
)

const totalCredit = computed(() =>
  lines.value.filter((l) => l.type === 'CREDIT').reduce((s, l) => s + l.amountRaw, 0),
)

const isBalanced = computed(() => totalDebit.value > 0 && totalDebit.value === totalCredit.value)

function onAmountInput(e: Event, idx: number) {
  const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '')
  const parsed = parseInt(raw) || 0
  lines.value[idx].amountRaw = parsed
  lines.value[idx].amountDisplay = parsed > 0 ? parsed.toLocaleString('id-ID') : ''
}

function addLine() {
  lines.value.push({ type: 'CREDIT', coaId: '', amountRaw: 0, amountDisplay: '', description: '', contactId: '' })
}

function removeLine(idx: number) {
  if (lines.value.length > 2) lines.value.splice(idx, 1)
}

function reset() {
  lines.value = [
    { type: 'DEBIT', coaId: '', amountRaw: 0, amountDisplay: '', description: '', contactId: '' },
    { type: 'CREDIT', coaId: '', amountRaw: 0, amountDisplay: '', description: '', contactId: '' },
  ]
}

function toPayload(): CreateJournalLinePayload[] {
  return lines.value.map((l) => ({
    coaId: l.coaId,
    type: l.type,
    amount: l.amountRaw,
    description: l.description || undefined,
    contactId: l.contactId || undefined,
  }))
}

function formatRp(val: number) {
  return 'Rp ' + val.toLocaleString('id-ID')
}

defineExpose({ isBalanced, toPayload, reset, lines })
</script>
