<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="$emit('close')"
    >
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')" />

      <div
        class="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div>
            <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">Buku Besar</h2>
            <p v-if="coa" class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {{ coa.code }} {{ coa.name }}
              <span class="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                {{ coa.type }}
              </span>
            </p>
          </div>
          <button
            @click="$emit('close')"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Filters -->
        <div class="px-6 py-3 border-b border-slate-200 dark:border-slate-700 shrink-0 flex gap-3 flex-wrap items-end">
          <div>
            <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Dari Tanggal</label>
            <input
              v-model="startDate"
              type="date"
              class="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Sampai Tanggal</label>
            <input
              v-model="endDate"
              type="date"
              class="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            @click="loadLedger"
            :disabled="isLoading"
            class="px-4 py-1.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Tampilkan
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto px-6 py-4">
          <!-- Loading -->
          <div v-if="isLoading" class="flex justify-center py-12">
            <svg class="w-8 h-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>

          <template v-else-if="coa">
            <!-- Summary Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div class="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                <p class="text-xs text-slate-500 dark:text-slate-400">Saldo Awal</p>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">{{ formatRp(openingBalance) }}</p>
              </div>
              <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                <p class="text-xs text-green-600 dark:text-green-400">Total Debit</p>
                <p class="text-sm font-semibold text-green-700 dark:text-green-300 mt-0.5">{{ formatRp(totalDebit) }}</p>
              </div>
              <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                <p class="text-xs text-red-600 dark:text-red-400">Total Credit</p>
                <p class="text-sm font-semibold text-red-700 dark:text-red-300 mt-0.5">{{ formatRp(totalCredit) }}</p>
              </div>
              <div class="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 border border-indigo-200 dark:border-indigo-800">
                <p class="text-xs text-indigo-600 dark:text-indigo-400">Saldo Akhir</p>
                <p class="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mt-0.5">{{ formatRp(closingBalance) }}</p>
              </div>
            </div>

            <!-- Table -->
            <div class="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    <tr>
                      <th class="px-4 py-3 text-left">Tanggal</th>
                      <th class="px-4 py-3 text-left">Keterangan</th>
                      <th class="px-4 py-3 text-right">Debit</th>
                      <th class="px-4 py-3 text-right">Credit</th>
                      <th class="px-4 py-3 text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
                    <!-- Opening balance row -->
                    <tr class="bg-slate-50/50 dark:bg-slate-800/30">
                      <td class="px-4 py-3 text-slate-500 dark:text-slate-400">—</td>
                      <td class="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">Saldo Awal</td>
                      <td class="px-4 py-3 text-right text-slate-400">—</td>
                      <td class="px-4 py-3 text-right text-slate-400">—</td>
                      <td class="px-4 py-3 text-right font-medium text-slate-800 dark:text-slate-100">
                        {{ formatRp(openingBalance) }}
                      </td>
                    </tr>
                    <!-- Transaction rows -->
                    <tr
                      v-for="row in ledgerRows"
                      :key="row.lineId"
                      class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td class="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {{ formatDate(row.transactionDate) }}
                      </td>
                      <td class="px-4 py-3 text-slate-700 dark:text-slate-300">
                        <div>{{ row.description }}</div>
                        <div v-if="row.invoiceNumber" class="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                          {{ row.invoiceNumber }}
                        </div>
                        <div v-if="row.contactName" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {{ row.contactName }}
                        </div>
                      </td>
                      <td class="px-4 py-3 text-right text-green-700 dark:text-green-400 font-medium">
                        {{ row.debitAmount > 0 ? formatRp(row.debitAmount) : '—' }}
                      </td>
                      <td class="px-4 py-3 text-right text-red-700 dark:text-red-400 font-medium">
                        {{ row.creditAmount > 0 ? formatRp(row.creditAmount) : '—' }}
                      </td>
                      <td class="px-4 py-3 text-right font-semibold text-slate-800 dark:text-slate-100">
                        {{ formatRp(row.runningBalance) }}
                      </td>
                    </tr>
                    <!-- Empty state -->
                    <tr v-if="ledgerRows.length === 0">
                      <td colspan="5" class="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        Tidak ada transaksi pada periode ini.
                      </td>
                    </tr>
                  </tbody>
                  <!-- Closing balance footer -->
                  <tfoot v-if="ledgerRows.length > 0" class="bg-slate-50 dark:bg-slate-800 border-t-2 border-slate-300 dark:border-slate-600">
                    <tr>
                      <td colspan="4" class="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Saldo Akhir
                      </td>
                      <td class="px-4 py-3 text-right text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        {{ formatRp(closingBalance) }}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { BusinessService } from '@/services/business.service'
import type { ChartOfAccount, BusinessTransaction } from '@/types/business'

interface LedgerRow {
  lineId: string
  transactionDate: string
  description: string
  debitAmount: number
  creditAmount: number
  runningBalance: number
  invoiceNumber: string | null
  contactName: string | null
}

const props = defineProps<{
  isOpen: boolean
  coa: ChartOfAccount | null
}>()
const emit = defineEmits<{ (e: 'close'): void }>()

const isLoading = ref(false)
const transactions = ref<BusinessTransaction[]>([])

const today = new Date()
const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)
const startDate = ref(firstOfMonth)
const endDate = ref(today.toISOString().slice(0, 10))

watch(() => props.isOpen, (val) => { if (val && props.coa) loadLedger() })
watch(() => props.coa, (val) => { if (val && props.isOpen) loadLedger() })

async function loadLedger() {
  if (!props.coa) return
  isLoading.value = true
  try {
    const res = await BusinessService.getBusinessTransactions({
      coaId: props.coa.id,
      startDate: startDate.value || undefined,
      endDate: endDate.value || undefined,
      limit: 100,
    })
    transactions.value = res.data
  } finally {
    isLoading.value = false
  }
}

const openingBalance = computed(() => parseFloat(props.coa?.openingBalance ?? '0') || 0)

const isDebitNormal = computed(() =>
  props.coa?.type === 'ASSET' || props.coa?.type === 'EXPENSE',
)

// Build ledger rows by iterating lines[] per entry
const ledgerRows = computed((): LedgerRow[] => {
  if (!props.coa) return []
  let balance = openingBalance.value
  const rows: LedgerRow[] = []

  for (const entry of transactions.value) {
    for (const line of entry.lines) {
      if (line.coa.id !== props.coa!.id) continue

      const amount = parseFloat(line.amount) || 0
      const debitAmount = line.type === 'DEBIT' ? amount : 0
      const creditAmount = line.type === 'CREDIT' ? amount : 0

      if (isDebitNormal.value) {
        balance += debitAmount - creditAmount
      } else {
        balance += creditAmount - debitAmount
      }

      rows.push({
        lineId: line.id,
        transactionDate: entry.transactionDate,
        description: line.description ?? entry.description,
        debitAmount,
        creditAmount,
        runningBalance: balance,
        invoiceNumber: entry.invoice?.invoiceNumber ?? null,
        contactName: line.contact?.name ?? null,
      })
    }
  }

  return rows
})

const totalDebit = computed(() => ledgerRows.value.reduce((s, r) => s + r.debitAmount, 0))
const totalCredit = computed(() => ledgerRows.value.reduce((s, r) => s + r.creditAmount, 0))
const closingBalance = computed(() =>
  ledgerRows.value.length > 0
    ? ledgerRows.value[ledgerRows.value.length - 1].runningBalance
    : openingBalance.value,
)

function formatRp(val: number) {
  return 'Rp ' + val.toLocaleString('id-ID')
}

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
