<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Back Button -->
    <button
      @click="$router.back()"
      class="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group"
    >
      <div class="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 group-hover:border-slate-300 dark:group-hover:border-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
      </div>
      <span class="text-sm font-medium">Kembali</span>
    </button>

    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <svg class="w-8 h-8 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p class="mt-4 text-slate-500 dark:text-slate-400">Memuat jurnal...</p>
    </div>

    <div v-else-if="tx" class="space-y-5">
      <!-- Header Card -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <!-- Top strip -->
        <div class="bg-gradient-to-r from-[#2E8B57] to-[#236B43] px-6 py-5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span
                  v-if="tx.isSystemGenerated && tx.invoice"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-white/20 text-white"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Dari Invoice
                </span>
                <span
                  v-else
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-white/20 text-white"
                >
                  Manual
                </span>
              </div>
              <h1 class="text-xl font-bold text-white leading-tight">{{ tx.description }}</h1>
              <p class="text-emerald-100 text-sm mt-1">{{ formatDate(tx.transactionDate) }}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-emerald-100 text-xs font-medium uppercase tracking-wide">Total Debit</p>
              <p class="text-white text-2xl font-bold">{{ formatRp(totalDebit) }}</p>
            </div>
          </div>
        </div>

        <!-- Invoice ref + meta -->
        <div class="px-6 py-3 bg-slate-50 dark:bg-slate-700/40 border-b border-slate-100 dark:border-slate-700 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span>
            <span class="font-medium text-slate-600 dark:text-slate-300">ID Jurnal:</span>
            {{ tx.id }}
          </span>
          <span v-if="tx.invoice">
            <span class="font-medium text-slate-600 dark:text-slate-300">Ref Invoice:</span>
            <RouterLink
              :to="{ name: 'invoice-detail', params: { id: tx.invoiceId! } }"
              class="text-emerald-600 dark:text-emerald-400 hover:underline ml-1"
            >
              {{ tx.invoice.invoiceNumber }}
            </RouterLink>
          </span>
          <span>
            <span class="font-medium text-slate-600 dark:text-slate-300">Dibuat:</span>
            {{ formatDateTime(tx.createdAt) }}
          </span>
        </div>
      </div>

      <!-- Journal Lines Table -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 class="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Entri Jurnal
          </h2>
        </div>

        <!-- Table Desktop -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                <th class="px-4 py-3 text-left font-semibold">Kode</th>
                <th class="px-4 py-3 text-left font-semibold">Nama Akun</th>
                <th class="px-4 py-3 text-left font-semibold">Kontak</th>
                <th class="px-4 py-3 text-left font-semibold hidden sm:table-cell">Keterangan</th>
                <th class="px-4 py-3 text-right font-semibold text-green-700 dark:text-green-400">Debit</th>
                <th class="px-4 py-3 text-right font-semibold text-red-600 dark:text-red-400">Kredit</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
              <tr
                v-for="(line, idx) in tx.lines"
                :key="line.id"
                :class="[
                  'transition-colors',
                  idx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-700/20',
                  line.type === 'CREDIT' ? 'pl-4' : '',
                ]"
              >
                <td class="px-4 py-3 font-mono text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                  {{ line.type === 'CREDIT' ? '\u00a0\u00a0\u00a0\u00a0' : '' }}{{ line.coa.code }}
                </td>
                <td class="px-4 py-3 font-medium text-slate-800 dark:text-slate-100 whitespace-nowrap">
                  <span v-if="line.type === 'CREDIT'" class="text-slate-300 dark:text-slate-600 mr-1 select-none">—</span>
                  {{ line.coa.name }}
                </td>
                <td class="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                  {{ line.contact?.name ?? '—' }}
                </td>
                <td class="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs hidden sm:table-cell">
                  {{ line.description ?? '—' }}
                </td>
                <td class="px-4 py-3 text-right font-medium text-green-700 dark:text-green-400 whitespace-nowrap">
                  {{ line.type === 'DEBIT' ? formatRp(parseFloat(line.amount)) : '—' }}
                </td>
                <td class="px-4 py-3 text-right font-medium text-red-600 dark:text-red-400 whitespace-nowrap">
                  {{ line.type === 'CREDIT' ? formatRp(parseFloat(line.amount)) : '—' }}
                </td>
              </tr>
            </tbody>
            <!-- Total Row -->
            <tfoot>
              <tr class="bg-indigo-50 dark:bg-emerald-900/20 border-t-2 border-emerald-100 dark:border-emerald-800">
                <td colspan="4" class="px-4 py-3 text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
                  Total
                </td>
                <td class="px-4 py-3 text-right font-bold text-green-700 dark:text-green-400 whitespace-nowrap">
                  {{ formatRp(totalDebit) }}
                </td>
                <td class="px-4 py-3 text-right font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                  {{ formatRp(totalCredit) }}
                </td>
              </tr>
              <!-- Balance check -->
              <tr v-if="!isBalanced" class="bg-red-50 dark:bg-red-900/20">
                <td colspan="6" class="px-4 py-2 text-center text-xs font-medium text-red-600 dark:text-red-400">
                  ⚠ Jurnal tidak seimbang (selisih {{ formatRp(Math.abs(totalDebit - totalCredit)) }})
                </td>
              </tr>
              <tr v-else class="bg-emerald-50 dark:bg-emerald-900/20">
                <td colspan="6" class="px-4 py-2 text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  ✓ Jurnal seimbang
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- ── Approval Workflow (Phase 8) ──────────────────────────────────── -->
      <div v-if="tx.status" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Status Persetujuan
          </h2>
          <span :class="statusBadgeClass(tx.status)" class="px-2.5 py-1 rounded-full text-xs font-semibold">{{ statusLabel(tx.status) }}</span>
        </div>

        <!-- Rejection note -->
        <div v-if="tx.status === 'REJECTED' && tx.rejectionNote" class="mx-6 mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p class="text-xs font-medium text-red-700 dark:text-red-300">Alasan Penolakan:</p>
          <p class="text-sm text-red-600 dark:text-red-400 mt-0.5">{{ tx.rejectionNote }}</p>
        </div>

        <!-- Timeline -->
        <div class="px-6 py-4 space-y-3">
          <!-- No-workflow: jurnal dibuat saat workflow nonaktif, tampilkan simplified -->
          <template v-if="!businessStore.currentCompany?.requiresApprovalWorkflow && !tx.checkerUserId && !tx.approverUserId">
            <div class="flex items-center gap-3 text-sm">
              <div :class="tx.status === 'APPROVED' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'"
                class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0">✓</div>
              <div>
                <span class="font-medium text-slate-700 dark:text-slate-300">
                  {{ tx.status === 'APPROVED' ? 'Disetujui otomatis (tanpa workflow)' : 'Menunggu persetujuan' }}
                </span>
              </div>
            </div>
          </template>
          <!-- With-workflow: tampilkan langkah CHECKER & ADMIN -->
          <template v-else>
            <div class="flex items-center gap-3 text-sm">
              <div :class="tx.checkerUserId ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'"
                class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0">✓</div>
              <div>
                <span class="font-medium text-slate-700 dark:text-slate-300">Dicek oleh CHECKER</span>
                <span v-if="tx.checker" class="text-slate-500 dark:text-slate-400 ml-1">— {{ tx.checker.fullName ?? tx.checker.email }}</span>
                <span v-if="tx.checkedAt" class="text-slate-400 dark:text-slate-500 ml-1 text-xs">{{ formatDateTime(tx.checkedAt) }}</span>
                <span v-if="!tx.checkerUserId" class="text-slate-400 dark:text-slate-500 ml-1">— Menunggu</span>
              </div>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <div :class="tx.approverUserId ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'"
                class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0">✓</div>
              <div>
                <span class="font-medium text-slate-700 dark:text-slate-300">Disetujui oleh ADMIN</span>
                <span v-if="tx.approver" class="text-slate-500 dark:text-slate-400 ml-1">— {{ tx.approver.fullName ?? tx.approver.email }}</span>
                <span v-if="tx.approvedAt" class="text-slate-400 dark:text-slate-500 ml-1 text-xs">{{ formatDateTime(tx.approvedAt) }}</span>
                <span v-if="!tx.approverUserId" class="text-slate-400 dark:text-slate-500 ml-1">— Menunggu</span>
              </div>
            </div>
          </template>
        </div>

        <!-- Action Buttons -->
        <div v-if="!tx.isSystemGenerated" class="px-6 pb-4 flex flex-wrap gap-2">
          <!-- Staff: submit DRAFT/REJECTED -->
          <button v-if="canSubmit" @click="doAction('submit')" :disabled="isActioning" class="bg-[#2E8B57] hover:bg-[#236B43] text-white font-medium py-1.5 px-4 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Submit untuk Review
          </button>
          <!-- Checker: check PENDING_CHECK -->
          <button v-if="canCheck" @click="doAction('check')" :disabled="isActioning" class="bg-[#2E8B57] hover:bg-[#236B43] text-white font-medium py-1.5 px-4 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Check (Gate 1)
          </button>
          <!-- Admin: approve PENDING_APPROVAL -->
          <button v-if="canApprove" @click="doAction('approve')" :disabled="isActioning" class="bg-[#2E8B57] hover:bg-[#236B43] text-white font-medium py-1.5 px-4 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Approve
          </button>
          <!-- Checker/Admin: reject -->
          <button v-if="canReject" @click="showRejectModal = true" class="bg-red-600 hover:bg-red-700 text-white font-medium py-1.5 px-4 text-sm rounded-lg transition-colors">
            Tolak
          </button>
          <span v-if="isActioning" class="text-xs text-slate-500 dark:text-slate-400 self-center">Memproses...</span>
          <p v-if="actionError" class="text-xs text-red-500 w-full mt-1">{{ actionError }}</p>
        </div>
      </div>

      <!-- ── Lampiran (Phase 8) ──────────────────────────────────────────────── -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
            </svg>
            Lampiran ({{ tx.attachments?.length ?? 0 }}/5)
          </h2>
          <label v-if="canUploadAttachment" class="cursor-pointer flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-100 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Upload
            <input type="file" class="sr-only" accept=".pdf,.jpg,.jpeg,.png,.webp" @change="uploadAttachment" :disabled="isUploadingAttachment" />
          </label>
        </div>
        <div class="px-6 py-4">
          <div v-if="isUploadingAttachment" class="text-xs text-slate-500 dark:text-slate-400 mb-3">Mengupload...</div>
          <div v-if="!tx.attachments?.length" class="text-sm text-slate-400 dark:text-slate-500">Belum ada lampiran.</div>
          <div v-else class="space-y-2">
            <div v-for="att in tx.attachments" :key="att.id"
              class="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div class="flex items-center gap-2 min-w-0">
                <svg class="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{{ att.fileName }}</p>
                  <p class="text-xs text-slate-400 dark:text-slate-500">{{ formatFileSize(att.fileSize) }} · {{ formatDateTime(att.createdAt) }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <a v-if="att.presignedUrl" :href="att.presignedUrl" target="_blank" class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">Buka</a>
                <button @click="deleteAttachment(att.id)" class="text-xs text-red-500 hover:underline">Hapus</button>
              </div>
            </div>
          </div>
          <p v-if="attachmentError" class="text-xs text-red-500 mt-2">{{ attachmentError }}</p>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-2">Format: PDF, JPG, PNG, WebP. Maks 10MB per file.</p>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex items-center justify-between gap-3">
        <div></div>
        <div class="flex gap-3">
          <button
            @click="downloadExcel"
            :disabled="isExporting"
            class="px-4 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Excel
          </button>
          <button
            @click="downloadPDF"
            class="px-4 py-2 text-sm font-bold text-emerald-600 hover:bg-indigo-50 dark:hover:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDF
          </button>
          <button
            v-if="!tx.isSystemGenerated"
            @click="showDeleteConfirm = true"
            class="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Hapus
          </button>
        </div>
      </div>

      <!-- System-generated note -->
      <div v-if="tx.isSystemGenerated" class="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-300">
        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Jurnal ini dibuat otomatis oleh sistem dan tidak dapat dihapus secara langsung.
      </div>
    </div>

    <!-- 404 -->
    <div v-else class="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
      <svg class="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">Jurnal tidak ditemukan</h2>
      <button
        @click="$router.push({ name: 'business-transactions' })"
        class="mt-6 px-6 py-2.5 bg-[#2E8B57] text-white rounded-xl font-bold hover:bg-[#236B43] transition-all"
      >
        Kembali ke Daftar
      </button>
    </div>

    <!-- Reject Modal -->
    <Teleport to="body">
      <div v-if="showRejectModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
          <h3 class="font-semibold text-slate-800 dark:text-slate-100">Tolak Jurnal</h3>
          <div>
            <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Alasan Penolakan</label>
            <textarea v-model="rejectNote" rows="3" maxlength="1000" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Jelaskan alasan penolakan..."></textarea>
          </div>
          <div class="flex justify-end gap-3">
            <button @click="showRejectModal = false" class="px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">Batal</button>
            <button @click="doAction('reject')" :disabled="isActioning" class="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50">
              {{ isActioning ? 'Memproses...' : 'Konfirmasi Tolak' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation -->
    <ConfirmationModal
      v-model:isOpen="showDeleteConfirm"
      title="Hapus Jurnal?"
      message="Apakah Anda yakin ingin menghapus jurnal ini? Tindakan ini tidak dapat dibatalkan."
      confirmButtonText="Hapus"
      cancelButtonText="Batal"
      iconType="danger"
      :isLoading="isDeleting"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBusinessTransactionsStore } from '@/stores/businessTransactions'
import { useBusinessStore } from '@/stores/business'
import { BusinessService } from '@/services/business.service'
import ExportService from '@/services/exportService'
import type { BusinessTransaction } from '@/types/business'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'

const route = useRoute()
const router = useRouter()
const txStore = useBusinessTransactionsStore()
const businessStore = useBusinessStore()

const tx = ref<BusinessTransaction | null>(null)
const isLoading = ref(true)
const isDeleting = ref(false)
const isExporting = ref(false)
const showDeleteConfirm = ref(false)

const myRole = computed(() => businessStore.myRole)

const totalDebit = computed(() =>
  (tx.value?.lines ?? [])
    .filter((l) => l.type === 'DEBIT')
    .reduce((sum, l) => sum + parseFloat(l.amount), 0),
)

const totalCredit = computed(() =>
  (tx.value?.lines ?? [])
    .filter((l) => l.type === 'CREDIT')
    .reduce((sum, l) => sum + parseFloat(l.amount), 0),
)

const isBalanced = computed(() => Math.abs(totalDebit.value - totalCredit.value) < 0.01)

// ── Approval Workflow ─────────────────────────────────────────────────────────
const isActioning = ref(false)
const actionError = ref('')
const showRejectModal = ref(false)
const rejectNote = ref('')

const ROLE_LEVEL: Record<string, number> = { VIEWER: 0, STAFF: 1, CHECKER: 2, ADMIN: 3, OWNER: 4 }
const roleLevel = computed(() => ROLE_LEVEL[myRole.value ?? ''] ?? 0)

const canSubmit = computed(() =>
  !tx.value?.isSystemGenerated &&
  roleLevel.value >= 1 &&
  (tx.value?.status === 'DRAFT' || tx.value?.status === 'REJECTED')
)
const canCheck = computed(() =>
  !tx.value?.isSystemGenerated &&
  roleLevel.value >= 2 &&
  tx.value?.status === 'PENDING_CHECK'
)
const canApprove = computed(() =>
  !tx.value?.isSystemGenerated &&
  roleLevel.value >= 3 &&
  tx.value?.status === 'PENDING_APPROVAL'
)
const canReject = computed(() =>
  !tx.value?.isSystemGenerated &&
  roleLevel.value >= 2 &&
  (tx.value?.status === 'PENDING_CHECK' || tx.value?.status === 'PENDING_APPROVAL')
)

async function doAction(action: 'submit' | 'check' | 'approve' | 'reject') {
  if (!tx.value) return
  isActioning.value = true
  actionError.value = ''
  try {
    let updated: BusinessTransaction
    if (action === 'submit') updated = await BusinessService.submitTransaction(tx.value.id)
    else if (action === 'check') updated = await BusinessService.checkTransaction(tx.value.id)
    else if (action === 'approve') updated = await BusinessService.approveTransaction(tx.value.id)
    else updated = await BusinessService.rejectTransaction(tx.value.id, rejectNote.value || undefined)
    tx.value = { ...tx.value, ...updated }
    showRejectModal.value = false
    rejectNote.value = ''
  } catch (e: any) {
    actionError.value = e.response?.data?.message ?? 'Terjadi kesalahan.'
  } finally {
    isActioning.value = false
  }
}

function statusLabel(status: string) {
  return { DRAFT: 'Draft', PENDING_CHECK: 'Menunggu Check', PENDING_APPROVAL: 'Menunggu Approve', APPROVED: 'Disetujui', REJECTED: 'Ditolak' }[status] ?? status
}
function statusBadgeClass(status: string) {
  return {
    DRAFT: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
    PENDING_CHECK: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    PENDING_APPROVAL: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-emerald-300',
    APPROVED: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    REJECTED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  }[status] ?? ''
}

// ── Attachments ───────────────────────────────────────────────────────────────
const isUploadingAttachment = ref(false)
const attachmentError = ref('')

const canUploadAttachment = computed(() => {
  if (!tx.value) return false
  if ((tx.value.attachments?.length ?? 0) >= 5) return false
  const status = tx.value.status
  // PENDING_CHECK / PENDING_APPROVAL: tidak bisa upload siapapun
  if (status === 'PENDING_CHECK' || status === 'PENDING_APPROVAL') return false
  // APPROVED: hanya ADMIN / OWNER
  if (status === 'APPROVED') return roleLevel.value >= 3
  // DRAFT / REJECTED: STAFF+
  return roleLevel.value >= 1
})

async function uploadAttachment(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !tx.value) return
  isUploadingAttachment.value = true
  attachmentError.value = ''
  try {
    const att = await BusinessService.uploadJournalAttachment(tx.value.id, file)
    if (!tx.value.attachments) tx.value.attachments = []
    tx.value.attachments.push(att as any)
  } catch (e: any) {
    attachmentError.value = e.response?.data?.message ?? 'Gagal upload lampiran.'
  } finally {
    isUploadingAttachment.value = false
    ;(event.target as HTMLInputElement).value = ''
  }
}

async function deleteAttachment(attachmentId: string) {
  if (!tx.value || !confirm('Hapus lampiran ini?')) return
  try {
    await BusinessService.deleteJournalAttachment(tx.value.id, attachmentId)
    tx.value.attachments = tx.value.attachments?.filter(a => a.id !== attachmentId) ?? []
  } catch (e: any) {
    attachmentError.value = e.response?.data?.message ?? 'Gagal menghapus lampiran.'
  }
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// ── Load ──────────────────────────────────────────────────────────────────────
const loadTransaction = async () => {
  isLoading.value = true
  const id = route.params.id as string
  try {
    tx.value = await txStore.fetchTransactionById(id)
  } catch {
    tx.value = null
  } finally {
    isLoading.value = false
  }
}

const downloadExcel = async () => {
  if (!tx.value) return
  isExporting.value = true
  try {
    await ExportService.exportBusinessTransactionToExcel(tx.value, businessStore.currentCompany?.name)
  } finally {
    isExporting.value = false
  }
}

const downloadPDF = () => {
  if (!tx.value) return
  ExportService.exportBusinessTransactionToPDF(tx.value, businessStore.currentCompany?.name)
}

const handleDelete = async () => {
  if (!tx.value) return
  isDeleting.value = true
  try {
    await txStore.deleteTransaction(tx.value.id)
    router.push({ name: 'business-transactions' })
  } catch {
    // error silently
  } finally {
    isDeleting.value = false
    showDeleteConfirm.value = false
  }
}

const formatRp = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

const formatDateTime = (d: string) =>
  new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

onMounted(async () => {
  await businessStore.fetchMembers()
  await loadTransaction()
})
</script>
