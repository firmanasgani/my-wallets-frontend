<template>
  <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Toast Notification -->
    <Transition name="toast">
      <div
        v-if="toast"
        class="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium"
        :class="toast.type === 'success'
          ? 'bg-emerald-50 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700'
          : 'bg-red-50 dark:bg-red-900/80 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700'"
      >
        <!-- Icon -->
        <svg v-if="toast.type === 'success'" class="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else class="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        {{ toast.message }}
        <button @click="toast = null" class="ml-2 opacity-60 hover:opacity-100 transition-opacity">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Transition>

    <!-- Back -->
    <div class="mb-6 flex items-center gap-3">
      <RouterLink :to="{ name: 'business-invoices' }" class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
      </RouterLink>
      <h1 class="text-xl font-bold text-slate-800 dark:text-slate-100">Detail Invoice</h1>
    </div>

    <!-- Loading -->
    <div v-if="invoicesStore.isDetailLoading" class="flex justify-center p-12">
      <LoadingSpinner :visible="true" />
    </div>

    <!-- Error -->
    <div v-else-if="errorMsg" class="rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800">
      <p class="text-sm font-medium text-red-800 dark:text-red-300">{{ errorMsg }}</p>
    </div>

    <div v-else-if="invoice" class="space-y-6">
      <!-- Invoice Header Card -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-3 flex-wrap">
              <span class="font-mono text-lg font-bold text-slate-700 dark:text-slate-300">{{ invoice.invoiceNumber }}</span>
              <InvoiceStatusBadge :status="invoice.status" />
            </div>
            <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">{{ formatCurrency(invoice.totalAmount) }}</p>
            <div class="flex gap-4 text-sm text-slate-500 dark:text-slate-400 mt-2">
              <span>Terbit: {{ formatDate(invoice.issueDate) }}</span>
              <span :class="isOverdue ? 'text-red-500 font-medium' : ''">
                Jatuh tempo: {{ formatDate(invoice.dueDate) }}
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-2">
            <!-- Export / Print page -->
            <RouterLink
              :to="{ name: 'invoice-export', params: { id: invoice.id } }"
              class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              title="Export / Cetak Invoice"
            >
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </RouterLink>

            <!-- Print PDF — always visible -->
            <button
              @click="handlePrintPDF"
              class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              title="Unduh PDF"
            >
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF
            </button>

            <!-- Duplikat — always visible for canCreate -->
            <button
              v-if="canCreate"
              @click="handleDuplicate"
              :disabled="isDuplicating"
              class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <svg v-if="isDuplicating" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <svg v-else class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Duplikat
            </button>

            <RouterLink
              v-if="invoice.status === 'DRAFT' && canCreate"
              :to="{ name: 'invoice-edit', params: { id: invoice.id } }"
              class="px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Edit
            </RouterLink>
            <button
              v-if="invoice.status === 'DRAFT' && canCreate"
              @click="isSendModalOpen = true"
              class="px-4 py-2 text-sm font-medium bg-[#2E8B57] text-white rounded-lg hover:bg-[#236B43] transition-colors"
            >
              Kirim Invoice
            </button>
            <button
              v-if="(invoice.status === 'SENT' || invoice.status === 'OVERDUE') && canCreate"
              @click="isSendEmailModalOpen = true"
              class="px-4 py-2 text-sm font-medium bg-[#2E8B57] text-white rounded-lg hover:bg-[#236B43] transition-colors"
            >
              Kirim Email
            </button>
            <button
              v-if="(invoice.status === 'SENT' || invoice.status === 'OVERDUE') && canPay"
              @click="isPayModalOpen = true"
              class="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Bayar
            </button>
            <button
              v-if="invoice.status === 'DRAFT' && canCreate"
              @click="isDeleteModalOpen = true"
              class="px-4 py-2 text-sm font-medium bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 transition-colors"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>

      <!-- Client & Contact -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
          <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Informasi Klien</h3>
          <p class="font-semibold text-slate-800 dark:text-slate-100">{{ invoice.clientName }}</p>
          <p v-if="invoice.clientEmail" class="text-sm text-slate-500 dark:text-slate-400">{{ invoice.clientEmail }}</p>
          <p v-if="invoice.clientAddress" class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ invoice.clientAddress }}</p>
          <div v-if="invoice.contact" class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <span :class="['inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', contactTypeClass(invoice.contact.type)]">
              {{ formatContactType(invoice.contact.type) }}
            </span>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
          <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Ringkasan</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-500 dark:text-slate-400">Subtotal</span>
              <span class="text-slate-700 dark:text-slate-200">{{ formatCurrency(invoice.subtotal) }}</span>
            </div>
            <div v-if="parseFloat(invoice.taxAmount) > 0" class="flex justify-between">
              <span class="text-slate-500 dark:text-slate-400">PPN</span>
              <span class="text-slate-700 dark:text-slate-200">{{ formatCurrency(invoice.taxAmount) }}</span>
            </div>
            <div v-if="parseFloat(invoice.withholdingTaxAmount) > 0" class="flex justify-between">
              <span class="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                {{ invoice.taxConfig?.name ?? 'Withholding Tax' }}
                <span class="text-xs px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded font-medium">
                  {{ invoice.taxConfig?.rate ? parseFloat(invoice.taxConfig.rate) + '%' : '' }}
                </span>
              </span>
              <span class="text-slate-700 dark:text-slate-200">{{ formatCurrency(invoice.withholdingTaxAmount) }}</span>
            </div>
            <div class="flex justify-between font-bold text-base border-t border-slate-200 dark:border-slate-700 pt-2">
              <span class="text-slate-700 dark:text-slate-200">Total</span>
              <span class="text-slate-900 dark:text-white">{{ formatCurrency(invoice.totalAmount) }}</span>
            </div>
            <template v-if="parseFloat(invoice.amountPaid) > 0">
              <div class="flex justify-between text-amber-600 dark:text-amber-400">
                <span>Sudah Dibayar</span>
                <span class="font-medium">{{ formatCurrency(invoice.amountPaid) }}</span>
              </div>
              <div class="flex justify-between font-semibold border-t border-slate-200 dark:border-slate-700 pt-2"
                :class="parseFloat(invoice.amountPaid) >= parseFloat(invoice.totalAmount) ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'"
              >
                <span>Sisa Tagihan</span>
                <span>{{ formatCurrency(String(Math.max(0, parseFloat(invoice.totalAmount) - parseFloat(invoice.amountPaid)))) }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">Item / Layanan</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-slate-600 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th class="px-6 py-3">Deskripsi</th>
                <th class="px-6 py-3 text-right w-20">Qty</th>
                <th class="px-6 py-3 text-right w-36">Harga Satuan</th>
                <th class="px-6 py-3 text-right w-32">Diskon</th>
                <th class="px-6 py-3 text-center w-16">PPN</th>
                <th class="px-6 py-3 text-right w-36">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
              <tr v-for="item in invoice.items" :key="item.id" class="text-slate-700 dark:text-slate-300">
                <td class="px-6 py-3">{{ item.description }}</td>
                <td class="px-6 py-3 text-right font-mono">{{ parseFloat(item.quantity) }}</td>
                <td class="px-6 py-3 text-right font-mono">{{ formatCurrency(item.unitPrice) }}</td>
                <td class="px-6 py-3 text-right font-mono whitespace-nowrap">
                  <span v-if="parseFloat(item.discountAmount) > 0" class="text-red-500">-{{ formatCurrency(item.discountAmount) }}</span>
                  <span v-else class="text-slate-300 dark:text-slate-600">—</span>
                </td>
                <td class="px-6 py-3 text-center">
                  <span v-if="item.taxable" class="text-emerald-600 dark:text-emerald-400">{{ item.taxRate }}%</span>
                  <span v-else class="text-slate-300 dark:text-slate-600">—</span>
                </td>
                <td class="px-6 py-3 text-right font-semibold font-mono">{{ formatCurrency(item.total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Payment Bank Account -->
      <div v-if="invoice.paymentBankAccount" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
        <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Rekening Tujuan Transfer</h3>
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <p class="font-semibold text-slate-800 dark:text-slate-100">{{ invoice.paymentBankAccount.bankName }}</p>
            <p class="text-sm font-mono text-slate-600 dark:text-slate-300">{{ invoice.paymentBankAccount.accountNumber }}</p>
            <p class="text-xs text-slate-400 dark:text-slate-500">a/n {{ invoice.paymentBankAccount.accountHolder }}</p>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div v-if="invoice.notes" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
        <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Catatan</h3>
        <p class="text-sm text-slate-700 dark:text-slate-300">{{ invoice.notes }}</p>
      </div>

      <!-- Jurnal Pembayaran -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">Jurnal Pembayaran</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Jurnal akuntansi yang dibuat otomatis saat invoice dibayar.</p>
          </div>
          <RouterLink
            :to="{ name: 'business-transactions' }"
            class="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
          >
            Lihat semua →
          </RouterLink>
        </div>

        <!-- Loading -->
        <div v-if="journalsLoading" class="flex justify-center p-8">
          <svg class="w-6 h-6 animate-spin text-emerald-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>

        <!-- Empty -->
        <div v-else-if="invoiceJournals.length === 0" class="px-6 py-8 text-center">
          <svg class="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p class="text-sm text-slate-500 dark:text-slate-400">Belum ada jurnal. Jurnal akan muncul setelah invoice dibayar.</p>
        </div>

        <!-- Journal entries -->
        <div v-else class="divide-y divide-slate-100 dark:divide-slate-700">
          <div v-for="tx in invoiceJournals" :key="tx.id" class="px-6 py-4">
            <!-- Header -->
            <div class="flex items-center gap-2 mb-3">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-emerald-300">
                Dari Invoice
              </span>
              <span class="text-sm font-medium text-slate-800 dark:text-slate-100">{{ tx.description }}</span>
              <span class="ml-auto text-xs text-slate-400 dark:text-slate-500">{{ formatDate(tx.transactionDate) }}</span>
            </div>
            <!-- Lines table -->
            <div class="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-700">
              <table class="w-full text-xs">
                <thead class="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th class="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400 w-14">Tipe</th>
                    <th class="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">Akun</th>
                    <th class="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">Keterangan</th>
                    <th class="px-3 py-2 text-right font-medium text-slate-500 dark:text-slate-400">Jumlah</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                  <tr v-for="line in tx.lines" :key="line.id" class="text-slate-700 dark:text-slate-300">
                    <td class="px-3 py-2">
                      <span
                        :class="[
                          'inline-flex items-center px-1.5 py-0.5 rounded font-bold tracking-wide',
                          line.type === 'DEBIT'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                        ]"
                      >
                        {{ line.type === 'DEBIT' ? 'D' : 'C' }}
                      </span>
                    </td>
                    <td class="px-3 py-2 font-mono">
                      <span class="text-slate-500 dark:text-slate-400">{{ line.coa.code }}</span>
                      <span class="ml-1 text-slate-700 dark:text-slate-300">{{ line.coa.name }}</span>
                    </td>
                    <td class="px-3 py-2 text-slate-500 dark:text-slate-400">
                      <span v-if="line.description">{{ line.description }}</span>
                      <span v-else-if="line.contact" class="italic">{{ line.contact.name }}</span>
                      <span v-else class="text-slate-300 dark:text-slate-600">—</span>
                    </td>
                    <td class="px-3 py-2 text-right font-mono font-medium">{{ formatCurrency(line.amount) }}</td>
                  </tr>
                </tbody>
                <tfoot class="bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-600">
                  <tr>
                    <td colspan="3" class="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 text-right">Total</td>
                    <td class="px-3 py-2 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                      {{ formatCurrency(totalDebit(tx)) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Send Confirmation -->
    <ConfirmationModal
      :is-open="isSendModalOpen"
      title="Kirim Invoice"
      message="Setelah dikirim, invoice tidak bisa diedit lagi. Lanjutkan?"
      confirm-button-text="Ya, Kirim"
      confirm-button-class="bg-[#2E8B57] hover:bg-[#236B43] focus:ring-emerald-500"
      icon-type="info"
      :is-confirming="invoicesStore.isSubmitting"
      @update:is-open="isSendModalOpen = $event"
      @confirm="handleSend"
    />

    <!-- Send Email Confirmation -->
    <ConfirmationModal
      :is-open="isSendEmailModalOpen"
      title="Kirim Email Invoice"
      message="Email invoice akan dikirim ulang ke klien. Lanjutkan?"
      confirm-button-text="Ya, Kirim"
      confirm-button-class="bg-[#2E8B57] hover:bg-[#236B43] focus:ring-emerald-500"
      icon-type="info"
      :is-confirming="invoicesStore.isSubmitting"
      @update:is-open="isSendEmailModalOpen = $event"
      @confirm="handleSendEmail"
    />

    <!-- Delete Confirmation -->
    <ConfirmationModal
      :is-open="isDeleteModalOpen"
      title="Hapus Invoice"
      :message="`Hapus ${invoice?.invoiceNumber}? Tindakan ini tidak dapat dibatalkan.`"
      confirm-button-text="Ya, Hapus"
      confirm-button-class="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      :is-confirming="invoicesStore.isSubmitting"
      @update:is-open="isDeleteModalOpen = $event"
      @confirm="handleDelete"
    />

    <!-- Pay Modal -->
    <PayInvoiceModal
      :is-open="isPayModalOpen"
      :invoice="invoice"
      @close="isPayModalOpen = false"
      @paid="onPaid"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInvoicesStore } from '@/stores/invoices'
import { useBusinessStore } from '@/stores/business'
import { BusinessService } from '@/services/business.service'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import InvoiceStatusBadge from '@/components/business/InvoiceStatusBadge.vue'
import PayInvoiceModal from '@/components/business/PayInvoiceModal.vue'
import exportService from '@/services/exportService'
import type { ContactType, BusinessTransaction } from '@/types/business'

const route = useRoute()
const router = useRouter()
const invoicesStore = useInvoicesStore()
const businessStore = useBusinessStore()

const errorMsg = ref('')
const toast = ref<{ type: 'success' | 'error'; message: string } | null>(null)
const isSendModalOpen = ref(false)
const isSendEmailModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isPayModalOpen = ref(false)
const isDuplicating = ref(false)
const invoiceJournals = ref<BusinessTransaction[]>([])
const journalsLoading = ref(false)

const invoice = computed(() => invoicesStore.currentInvoice)

const canCreate = computed(() => {
  const role = businessStore.myRole
  return role === 'STAFF' || role === 'ADMIN' || role === 'OWNER'
})

const canPay = computed(() => {
  const role = businessStore.myRole
  return role === 'ADMIN' || role === 'OWNER'
})

const isOverdue = computed(() => invoice.value?.status === 'OVERDUE')

async function loadJournals() {
  const invoiceId = route.params.id as string
  journalsLoading.value = true
  try {
    const res = await BusinessService.getBusinessTransactions({ limit: 100 })
    invoiceJournals.value = res.data.filter((tx) => tx.invoiceId === invoiceId)
  } catch {
    // silent — journals are supplementary info
  } finally {
    journalsLoading.value = false
  }
}

onMounted(async () => {
  try {
    const fetchList: Promise<any>[] = [
      invoicesStore.fetchInvoiceById(route.params.id as string),
      businessStore.fetchMyCompany().catch(() => {}),
      loadJournals(),
    ]
    if (!businessStore.members.length) fetchList.push(businessStore.fetchMembers().catch(() => {}))
    await Promise.all(fetchList)
  } catch {
    errorMsg.value = 'Gagal memuat data invoice.'
  }
})

const handleSend = async () => {
  if (!invoice.value) return
  try {
    await invoicesStore.sendInvoice(invoice.value.id)
    isSendModalOpen.value = false
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Gagal mengirim invoice.'
    isSendModalOpen.value = false
  }
}

const showToast = (type: 'success' | 'error', message: string) => {
  toast.value = { type, message }
  setTimeout(() => { toast.value = null }, 4000)
}

const handleSendEmail = async () => {
  if (!invoice.value) return
  try {
    await invoicesStore.sendInvoiceEmail(invoice.value.id)
    isSendEmailModalOpen.value = false
    showToast('success', 'Email invoice berhasil dikirim.')
  } catch (err: any) {
    const status = err.response?.status
    const msg = err.response?.data?.message
    isSendEmailModalOpen.value = false
    showToast('error', msg || (status === 404 ? 'Endpoint belum tersedia di server.' : `Gagal mengirim email. (${status ?? 'network error'})`))
  }
}

const handleDelete = async () => {
  if (!invoice.value) return
  try {
    await invoicesStore.deleteInvoice(invoice.value.id)
    router.push({ name: 'business-invoices' })
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Gagal menghapus invoice.'
    isDeleteModalOpen.value = false
  }
}

const handlePrintPDF = async () => {
  if (!invoice.value) return
  await exportService.exportInvoiceToPDF(invoice.value, businessStore.currentCompany)
}

const handleDuplicate = async () => {
  if (!invoice.value) return
  isDuplicating.value = true
  try {
    const newInvoice = await invoicesStore.duplicateInvoice(invoice.value.id)
    router.push({ name: 'invoice-edit', params: { id: newInvoice.id } })
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Gagal menduplikat invoice.'
  } finally {
    isDuplicating.value = false
  }
}

const onPaid = () => {
  isPayModalOpen.value = false
  invoicesStore.fetchInvoiceById(route.params.id as string)
  loadJournals()
}

const totalDebit = (tx: BusinessTransaction): number =>
  tx.lines.filter((l) => l.type === 'DEBIT').reduce((s, l) => s + parseFloat(l.amount), 0)

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

const formatCurrency = (val: string | number) => {
  const num = typeof val === 'string' ? parseFloat(val) : val
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
}

const formatContactType = (type: ContactType) => {
  const map: Record<ContactType, string> = { CUSTOMER: 'Customer', VENDOR: 'Vendor', EMPLOYEE: 'Karyawan' }
  return map[type]
}

const contactTypeClass = (type: ContactType) => {
  const map: Record<ContactType, string> = {
    CUSTOMER: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-emerald-300',
    VENDOR: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    EMPLOYEE: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  }
  return map[type]
}
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(1rem); }
</style>
