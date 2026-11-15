<template>
  <div class="invoice-list-page">
    <!-- Header -->
    <div class="mb-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4">
      <div class="invoice-list-title">
        <span class="shell-overline">DARI TAGIHAN HINGGA PEMBAYARAN</span><h1 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Kelola tagihan bisnismu.</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Buat invoice, pantau jatuh tempo, dan catat pembayaran pelangganmu.</p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <RouterLink
          :to="{ name: 'invoice-template' }"
          class="border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors"
          title="Atur tampilan, warna, dan logo invoice"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
          Template
        </RouterLink>
        <RouterLink
          v-if="canCreate"
          :to="{ name: 'invoice-create' }"
          class="bg-[#2E8B57] hover:bg-[#236B43] text-white text-sm font-medium py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Buat invoice
        </RouterLink>
      </div>
    </div>

    <!-- Error -->
    <div v-if="errorMsg" class="mb-4 rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800">
      <p class="text-sm font-medium text-red-800 dark:text-red-300">{{ errorMsg }}</p>
    </div>

    <!-- Filter Tabs -->
    <div class="mb-4 flex gap-2 flex-wrap">
      <button
        v-for="tab in statusTabs"
        :key="tab.value"
        @click="activeStatus = tab.value"
        :class="[
          'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
          activeStatus === tab.value
            ? 'bg-[#2E8B57] text-white shadow-sm'
            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-400',
        ]"
        :aria-pressed="activeStatus === tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="invoicesStore.isLoading" class="flex justify-center p-12">
      <LoadingSpinner :visible="true" />
    </div>

    <!-- List -->
    <div v-else>
      <div v-if="filteredInvoices.length === 0" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
        <svg class="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        <p class="text-base font-medium text-slate-700 dark:text-slate-300">Belum ada invoice</p>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {{ canCreate ? 'Mulai dari invoice pertama untuk mencatat tagihan pelangganmu.' : 'Invoice akan ditampilkan di sini.' }}
        </p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="invoice in filteredInvoices"
          :key="invoice.id"
          :class="[
            'bg-white dark:bg-slate-800 rounded-xl shadow-sm border transition-all hover:shadow-md cursor-pointer',
            invoice.status === 'OVERDUE'
              ? 'border-red-300 dark:border-red-700'
              : 'border-slate-200 dark:border-slate-700',
            invoice.status === 'CANCELLED' ? 'opacity-70' : '',
          ]"
          @click="goToDetail(invoice.id)"
        >
          <div class="px-6 py-4 flex items-start justify-between gap-4">
            <!-- Left: Invoice Info -->
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">{{ invoice.invoiceNumber }}</span>
                <InvoiceStatusBadge :status="invoice.status" />
              </div>
              <p class="text-base font-semibold text-slate-800 dark:text-slate-100 mt-1">{{ invoice.clientName }}</p>
              <div class="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span>Diterbitkan: {{ formatDate(invoice.issueDate) }}</span>
                <span :class="invoice.status === 'OVERDUE' ? 'text-red-500 font-medium' : ''">
                  Jatuh tempo: {{ formatDate(invoice.dueDate) }}
                </span>
              </div>
            </div>

            <!-- Right: Amount + Actions -->
            <div class="flex flex-col items-end gap-2 shrink-0">
              <span
                class="text-lg font-bold"
                :class="invoice.status === 'CANCELLED' ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'"
              >{{ formatCurrency(invoice.totalAmount) }}</span>
              <template v-if="hasPayments(invoice) && invoice.status !== 'PAID'">
                <span class="text-xs text-amber-600 dark:text-amber-400">
                  Dibayar: {{ formatCurrency(invoice.amountPaid) }} · Sisa: {{ formatCurrency(String(parseFloat(invoice.totalAmount) - parseFloat(invoice.amountPaid))) }}
                </span>
              </template>
              <div class="flex items-center gap-2" @click.stop>
                <!-- Send (DRAFT) -->
                <button
                  v-if="invoice.status === 'DRAFT' && canCreate"
                  @click="openSendConfirm(invoice)"
                  class="px-3 py-1 text-xs font-medium rounded-md bg-[#2E8B57] text-white hover:bg-[#236B43] transition-colors"
                >
                  Kirim
                </button>
                <!-- Edit (DRAFT) -->
                <RouterLink
                  v-if="invoice.status === 'DRAFT' && canCreate"
                  :to="{ name: 'invoice-edit', params: { id: invoice.id } }"
                  class="px-3 py-1 text-xs font-medium rounded-md border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Edit
                </RouterLink>
                <!-- Cancel (SENT/OVERDUE, no payments yet) -->
                <button
                  v-if="(invoice.status === 'SENT' || invoice.status === 'OVERDUE') && canCreate && !hasPayments(invoice)"
                  @click="openCancelConfirm(invoice)"
                  class="p-1 text-slate-400 hover:text-amber-600 transition-colors"
                  title="Batalkan invoice"
                  aria-label="Batalkan invoice"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                </button>
                <!-- Delete (any unpaid invoice without payments) -->
                <button
                  v-if="canDelete(invoice)"
                  @click="openDeleteConfirm(invoice)"
                  class="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  title="Hapus"
                  aria-label="Hapus invoice"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
                <!-- Pay (SENT/OVERDUE) -->
                <button
                  v-if="(invoice.status === 'SENT' || invoice.status === 'OVERDUE') && canPay"
                  @click="openPayModal(invoice)"
                  class="px-3 py-1 text-xs font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  Catat pembayaran
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Send Confirmation -->
    <ConfirmationModal
      :is-open="isSendModalOpen"
      title="Kirim invoice"
      message="Setelah dikirim, invoice tidak bisa diedit lagi. Lanjutkan?"
      confirm-button-text="Ya, kirim"
      confirm-button-class="bg-[#2E8B57] hover:bg-[#236B43] focus:ring-emerald-500"
      icon-type="info"
      :is-confirming="invoicesStore.isSubmitting"
      @update:is-open="isSendModalOpen = $event"
      @confirm="handleSend"
    />

    <!-- Cancel Confirmation -->
    <ConfirmationModal
      :is-open="isCancelModalOpen"
      title="Batalkan invoice"
      confirm-button-text="Ya, batalkan"
      confirm-button-class="bg-amber-600 hover:bg-amber-700 focus:ring-amber-500"
      :is-confirming="invoicesStore.isSubmitting"
      @update:is-open="isCancelModalOpen = $event"
      @confirm="handleCancel"
    >
      <template #message>
        <p>Invoice <strong>{{ selectedInvoice?.invoiceNumber }}</strong> akan ditandai <strong>Dibatalkan</strong> dan tidak bisa dibayar. Riwayatnya tetap tersimpan.</p>
        <label class="block mt-3 text-left">
          <span class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Alasan pembatalan (opsional)</span>
          <textarea
            v-model="cancelReason"
            rows="2"
            maxlength="500"
            class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          ></textarea>
        </label>
      </template>
    </ConfirmationModal>

    <!-- Delete Confirmation -->
    <ConfirmationModal
      :is-open="isDeleteModalOpen"
      title="Hapus invoice"
      :message="deleteMessage"
      confirm-button-text="Ya, hapus permanen"
      confirm-button-class="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      :is-confirming="invoicesStore.isSubmitting"
      @update:is-open="isDeleteModalOpen = $event"
      @confirm="handleDelete"
    />

    <!-- Pay Modal -->
    <PayInvoiceModal
      :is-open="isPayModalOpen"
      :invoice="selectedInvoice"
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
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import InvoiceStatusBadge from '@/components/business/InvoiceStatusBadge.vue'
import PayInvoiceModal from '@/components/business/PayInvoiceModal.vue'
import { useToastStore } from '@/stores/toast'
import type { Invoice, InvoiceStatus } from '@/types/business'
import '@/assets/invoices.css'

const route = useRoute()
const router = useRouter()
const invoicesStore = useInvoicesStore()
const businessStore = useBusinessStore()
const toast = useToastStore()

const errorMsg = ref('')
const isSendModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isPayModalOpen = ref(false)
const isCancelModalOpen = ref(false)
const cancelReason = ref('')
const selectedInvoice = ref<Invoice | null>(null)


const statusTabs = [
  { value: 'ALL' as const, label: 'Semua' },
  { value: 'DRAFT' as const, label: 'Draf' },
  { value: 'SENT' as const, label: 'Terkirim' },
  { value: 'OVERDUE' as const, label: 'Terlambat' },
  { value: 'PAID' as const, label: 'Lunas' },
  { value: 'CANCELLED' as const, label: 'Dibatalkan' },
]

// Honour ?status=OVERDUE etc. (e.g. links from the KPI dashboard)
const initialStatus = String(route.query.status ?? '').toUpperCase()
const activeStatus = ref<InvoiceStatus | 'ALL'>(
  statusTabs.some((t) => t.value === initialStatus) ? (initialStatus as InvoiceStatus) : 'ALL',
)

const hasPayments = (invoice: Invoice) => parseFloat(invoice.amountPaid) > 0
const canDelete = (invoice: Invoice) => canCreate.value && invoice.status !== 'PAID' && !hasPayments(invoice)

const deleteMessage = computed(() => {
  const inv = selectedInvoice.value
  if (!inv) return ''
  if (inv.status === 'SENT' || inv.status === 'OVERDUE') {
    return `${inv.invoiceNumber} sudah dikirim ke pelanggan. Pertimbangkan "Batalkan" agar riwayatnya tetap ada. Hapus permanen?`
  }
  return `Hapus invoice ${inv.invoiceNumber}? Tindakan ini tidak dapat dibatalkan.`
})

const canCreate = computed(() => {
  const role = businessStore.myRole
  return role === 'STAFF' || role === 'ADMIN' || role === 'OWNER'
})

const canPay = computed(() => {
  const role = businessStore.myRole
  return role === 'ADMIN' || role === 'OWNER'
})

const filteredInvoices = computed(() => {
  if (!invoicesStore.invoices.length) return []
  if (activeStatus.value === 'ALL') return invoicesStore.invoices
  return invoicesStore.invoices.filter((i) => i.status === activeStatus.value)
})

onMounted(async () => {
  try {
    const promises: Promise<any>[] = [invoicesStore.fetchInvoices()]
    if (!businessStore.members.length) promises.push(businessStore.fetchMembers().catch(() => {}))
    await Promise.all(promises)
  } catch {
    errorMsg.value = 'Belum berhasil memuat daftar invoice.'
  }
})

const goToDetail = (id: string) => {
  router.push({ name: 'invoice-detail', params: { id } })
}

const openSendConfirm = (invoice: Invoice) => {
  selectedInvoice.value = invoice
  isSendModalOpen.value = true
}

const openDeleteConfirm = (invoice: Invoice) => {
  selectedInvoice.value = invoice
  isDeleteModalOpen.value = true
}

const openCancelConfirm = (invoice: Invoice) => {
  selectedInvoice.value = invoice
  cancelReason.value = ''
  isCancelModalOpen.value = true
}

const handleCancel = async () => {
  if (!selectedInvoice.value) return
  try {
    await invoicesStore.cancelInvoice(selectedInvoice.value.id, { reason: cancelReason.value.trim() || undefined })
    toast.show(`Invoice ${selectedInvoice.value.invoiceNumber} dibatalkan`, 'success')
    selectedInvoice.value = null
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message
    errorMsg.value = msg || 'Belum berhasil membatalkan invoice.'
  } finally {
    isCancelModalOpen.value = false
  }
}

const openPayModal = (invoice: Invoice) => {
  selectedInvoice.value = invoice
  isPayModalOpen.value = true
}

const handleSend = async () => {
  if (!selectedInvoice.value) return
  try {
    const result = await invoicesStore.sendInvoice(selectedInvoice.value.id)
    isSendModalOpen.value = false
    if (result.emailError) toast.show(result.emailError, 'error')
    else toast.show('Invoice ditandai terkirim', 'success')
    selectedInvoice.value = null
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Belum berhasil mengirim invoice.'
    isSendModalOpen.value = false
  }
}

const handleDelete = async () => {
  if (!selectedInvoice.value) return
  try {
    await invoicesStore.deleteInvoice(selectedInvoice.value.id)
    isDeleteModalOpen.value = false
    selectedInvoice.value = null
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Belum berhasil menghapus invoice.'
    isDeleteModalOpen.value = false
  }
}

const onPaid = () => {
  isPayModalOpen.value = false
  selectedInvoice.value = null
  invoicesStore.fetchInvoices()
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatCurrency = (value: string) => {
  const num = parseFloat(value)
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
}
</script>
