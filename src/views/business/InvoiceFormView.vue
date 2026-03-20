<template>
  <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

    <!-- Page Header -->
    <div class="mb-6 flex items-center gap-3">
      <button
        @click="router.back()"
        class="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
          {{ isEdit ? 'Edit Invoice' : 'Buat Invoice Baru' }}
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Status: <span class="font-medium text-slate-600 dark:text-slate-300">Draft</span> · Nomor invoice di-generate otomatis
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoadingDetail" class="flex justify-center p-16">
      <LoadingSpinner :visible="true" />
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-5">

      <!-- ── KLIEN ─────────────────────────────────────── -->
      <section class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
            <svg class="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-200">Informasi Klien</h2>
        </div>

        <div class="p-5 space-y-4">
          <!-- Contact Picker -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Pilih dari Kontak
              <span class="ml-1 text-xs font-normal text-slate-400 dark:text-slate-500">(opsional)</span>
            </label>
            <div class="relative">
              <select
                v-model="selectedContactId"
                @change="onContactChange"
                class="w-full pl-3.5 pr-9 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
              >
                <option value="">— Tanpa kontak terdaftar —</option>
                <optgroup label="Customer">
                  <option v-for="c in contacts.filter(x => x.type === 'CUSTOMER')" :key="c.id" :value="c.id">
                    {{ c.name }}
                  </option>
                </optgroup>
                <optgroup label="Vendor">
                  <option v-for="c in contacts.filter(x => x.type === 'VENDOR')" :key="c.id" :value="c.id">
                    {{ c.name }}
                  </option>
                </optgroup>
                <optgroup label="Karyawan">
                  <option v-for="c in contacts.filter(x => x.type === 'EMPLOYEE')" :key="c.id" :value="c.id">
                    {{ c.name }}
                  </option>
                </optgroup>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Auto-filled notice -->
          <div v-if="selectedContactId" class="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
            <svg class="w-4 h-4 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-xs text-indigo-700 dark:text-indigo-300">Data klien diambil otomatis dari kontak terpilih.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Nama -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Klien <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.clientName"
                type="text"
                placeholder="Nama klien / perusahaan"
                :required="!selectedContactId"
                :readonly="!!selectedContactId"
                :class="[
                  'w-full px-3.5 py-2.5 border rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all',
                  selectedContactId
                    ? 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100',
                ]"
              />
            </div>
            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Klien</label>
              <input
                v-model="form.clientEmail"
                type="email"
                placeholder="email@example.com"
                :readonly="!!selectedContactId"
                :class="[
                  'w-full px-3.5 py-2.5 border rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all',
                  selectedContactId
                    ? 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100',
                ]"
              />
            </div>
            <!-- Alamat -->
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Alamat Klien</label>
              <input
                v-model="form.clientAddress"
                type="text"
                placeholder="Alamat lengkap (opsional)"
                :readonly="!!selectedContactId"
                :class="[
                  'w-full px-3.5 py-2.5 border rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all',
                  selectedContactId
                    ? 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100',
                ]"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- ── DETAIL ─────────────────────────────────────── -->
      <section class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
            <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-200">Detail Invoice</h2>
        </div>

        <div class="p-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Tanggal Terbit <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.issueDate"
                type="date"
                required
                class="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Jatuh Tempo <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.dueDate"
                type="date"
                required
                class="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Rekening Tujuan Transfer
                <span class="ml-1 text-xs font-normal text-slate-400 dark:text-slate-500">(opsional)</span>
              </label>
              <div class="relative">
                <select
                  v-model="form.paymentBankAccountId"
                  class="w-full pl-3.5 pr-9 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                >
                  <option value="">— Tanpa rekening —</option>
                  <option v-for="acc in bankAccounts" :key="acc.id" :value="acc.id">
                    {{ acc.bankName }} · {{ acc.accountNumber }} ({{ acc.accountHolder }}){{ acc.isDefault ? ' ★' : '' }}
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Catatan</label>
              <div class="relative">
                <textarea
                  v-model="form.notes"
                  rows="2"
                  maxlength="500"
                  placeholder="Terima kasih atas kepercayaan Anda."
                  class="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                ></textarea>
                <span class="absolute bottom-2 right-3 text-xs text-slate-400 dark:text-slate-500 pointer-events-none">
                  {{ form.notes.length }}/500
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── ITEMS ──────────────────────────────────────── -->
      <section class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <svg class="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-200">Item / Layanan</h2>
            <span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
              {{ form.items.length }} item
            </span>
          </div>
          <button
            type="button"
            @click="addItem"
            class="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Item
          </button>
        </div>

        <!-- Column Headers (desktop only) -->
        <div class="hidden md:grid md:grid-cols-12 gap-3 px-5 pt-4 pb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <div class="col-span-4">Deskripsi</div>
          <div class="col-span-2 text-right">Qty</div>
          <div class="col-span-2 text-right">Harga Satuan</div>
          <div class="col-span-1 text-right">Diskon</div>
          <div class="col-span-1 text-center">PPN</div>
          <div class="col-span-1 text-right">Total</div>
          <div class="col-span-1"></div>
        </div>

        <!-- Item List -->
        <div class="px-5 pb-5 space-y-3">
          <div
            v-for="(item, idx) in form.items"
            :key="idx"
          >
            <!-- Desktop: single-row grid -->
            <div class="hidden md:grid md:grid-cols-12 gap-3 items-center group">
              <!-- Description -->
              <div class="col-span-4">
                <input
                  v-model="item.description"
                  type="text"
                  placeholder="Nama produk / layanan"
                  required
                  class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-700 transition-all"
                />
              </div>
              <!-- Qty -->
              <div class="col-span-2">
                <input
                  v-model.number="item.quantity"
                  type="number"
                  min="0.0001"
                  step="any"
                  required
                  class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-right bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-700 transition-all"
                />
              </div>
              <!-- Unit Price -->
              <div class="col-span-2">
                <CurrencyInput
                  v-model="item.unitPrice"
                  class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 !rounded-xl text-sm text-right bg-slate-50 dark:bg-slate-700/60 focus:bg-white dark:focus:bg-slate-700 transition-all"
                />
              </div>
              <!-- Discount -->
              <div class="col-span-1">
                <CurrencyInput
                  v-model="item.discountAmount"
                  class="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 !rounded-xl text-sm text-right bg-slate-50 dark:bg-slate-700/60 focus:bg-white dark:focus:bg-slate-700 transition-all"
                />
              </div>
              <!-- PPN Checkbox -->
              <div class="col-span-1 flex justify-center">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="item.taxable" class="sr-only peer" />
                  <div class="w-9 h-5 bg-slate-200 peer-focus:ring-2 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-600 peer-checked:bg-indigo-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                </label>
              </div>
              <!-- Total -->
              <div class="col-span-1 text-right">
                <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {{ formatCurrencyShort(calcItemTotal(item)) }}
                </span>
              </div>
              <!-- Remove -->
              <div class="col-span-1 flex justify-center">
                <button
                  v-if="form.items.length > 1"
                  type="button"
                  @click="removeItem(idx)"
                  class="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Mobile: card layout -->
            <div class="md:hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 p-4 space-y-3">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Item {{ idx + 1 }}</span>
                <button
                  v-if="form.items.length > 1"
                  type="button"
                  @click="removeItem(idx)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <!-- Deskripsi -->
              <div>
                <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Deskripsi *</label>
                <input
                  v-model="item.description"
                  type="text"
                  placeholder="Nama produk / layanan"
                  required
                  class="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <!-- Qty + Harga -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Qty *</label>
                  <input
                    v-model.number="item.quantity"
                    type="number"
                    min="0.0001"
                    step="any"
                    required
                    class="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm text-right bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Harga Satuan *</label>
                  <CurrencyInput
                    v-model="item.unitPrice"
                    class="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 !rounded-xl text-sm text-right"
                  />
                </div>
              </div>
              <!-- Diskon -->
              <div>
                <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Diskon</label>
                <CurrencyInput
                  v-model="item.discountAmount"
                  class="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 !rounded-xl text-sm text-right"
                />
              </div>
              <!-- PPN + Total -->
              <div class="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-600">
                <label class="flex items-center gap-2.5 cursor-pointer select-none">
                  <div class="relative">
                    <input type="checkbox" v-model="item.taxable" class="sr-only peer" />
                    <div class="w-9 h-5 bg-slate-200 rounded-full peer dark:bg-slate-600 peer-checked:bg-indigo-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                  </div>
                  <span class="text-sm text-slate-600 dark:text-slate-400">
                    PPN {{ taxEnabled ? `(${taxRate}%)` : '(dinonaktifkan)' }}
                  </span>
                </label>
                <div class="text-right">
                  <p class="text-xs text-slate-400 dark:text-slate-500">Total</p>
                  <p class="text-sm font-bold text-slate-800 dark:text-slate-100">{{ formatCurrency(calcItemTotal(item)) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="form.items.length === 0" class="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
            Belum ada item. Klik <strong>Tambah Item</strong> untuk menambahkan.
          </div>
        </div>

        <!-- Summary -->
        <div class="border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-5 py-4">
          <div class="max-w-xs ml-auto space-y-2 text-sm">
            <div class="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span class="font-medium tabular-nums">{{ formatCurrency(subtotal) }}</span>
            </div>
            <div v-if="taxEnabled" class="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span class="flex items-center gap-1.5">
                PPN
                <span class="text-xs px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded font-medium">{{ taxRate }}%</span>
              </span>
              <span class="font-medium tabular-nums">{{ formatCurrency(totalTax) }}</span>
            </div>
            <div v-if="!taxEnabled" class="text-xs text-slate-400 dark:text-slate-500 text-right italic">
              PPN tidak aktif di profil perusahaan
            </div>
            <div class="flex justify-between items-center pt-2.5 border-t border-slate-200 dark:border-slate-700">
              <span class="font-bold text-slate-700 dark:text-slate-200">Total</span>
              <span class="font-bold text-lg text-indigo-600 dark:text-indigo-400 tabular-nums">{{ formatCurrency(grandTotal) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Error -->
      <div v-if="errorMsg" class="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800">
        <svg class="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm text-red-700 dark:text-red-300">{{ errorMsg }}</p>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 pb-4">
        <button
          type="button"
          @click="router.back()"
          :disabled="isSubmitting"
          class="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="submit"
          :disabled="isSubmitting || form.items.length === 0"
          class="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <svg v-if="isSubmitting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ isEdit ? 'Simpan Perubahan' : 'Simpan sebagai Draft' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useInvoicesStore } from '@/stores/invoices'
import { useContactsStore } from '@/stores/contacts'
import { useBusinessStore } from '@/stores/business'
import { useBankAccountsStore } from '@/stores/bankAccounts'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import CurrencyInput from '@/components/common/CurrencyInput.vue'
import type { Contact, CompanyBankAccount } from '@/types/business'

const router = useRouter()
const route = useRoute()
const invoicesStore = useInvoicesStore()
const contactsStore = useContactsStore()
const businessStore = useBusinessStore()
const bankAccountsStore = useBankAccountsStore()

const isEdit = computed(() => !!route.params.id)
const isLoadingDetail = ref(false)
const isSubmitting = ref(false)
const errorMsg = ref('')
const selectedContactId = ref('')
const contacts = ref<Contact[]>([])
const bankAccounts = ref<CompanyBankAccount[]>([])

const taxEnabled = computed(() => businessStore.currentCompany?.taxEnabled ?? false)
const taxRate = computed(() => businessStore.currentCompany?.taxRate ?? 11)

const defaultItem = () => ({ description: '', quantity: 1, unitPrice: 0, discountAmount: 0, taxable: false })

const form = ref({
  clientName: '',
  clientEmail: '',
  clientAddress: '',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  notes: '',
  paymentBankAccountId: '',
  items: [defaultItem()],
})

const subtotal = computed(() =>
  form.value.items.reduce((sum, item) => sum + item.quantity * item.unitPrice - item.discountAmount, 0),
)

const totalTax = computed(() => {
  if (!taxEnabled.value) return 0
  return form.value.items
    .filter((i) => i.taxable)
    .reduce((sum, item) => {
      const lineAfterDiscount = item.quantity * item.unitPrice - item.discountAmount
      return sum + lineAfterDiscount * (taxRate.value / 100)
    }, 0)
})

const grandTotal = computed(() => subtotal.value + totalTax.value)

const calcItemTotal = (item: { quantity: number; unitPrice: number; discountAmount: number; taxable: boolean }) => {
  const lineAfterDiscount = item.quantity * item.unitPrice - item.discountAmount
  if (taxEnabled.value && item.taxable) return lineAfterDiscount + lineAfterDiscount * (taxRate.value / 100)
  return lineAfterDiscount
}

onMounted(async () => {
  const initFetch: Promise<any>[] = [
    contactsStore.fetchContacts(),
    businessStore.fetchMyCompany().catch(() => {}),
    bankAccountsStore.fetchBankAccounts().catch(() => {}),
  ]
  if (!businessStore.members.length) initFetch.push(businessStore.fetchMembers().catch(() => {}))
  await Promise.all(initFetch)
  contacts.value = contactsStore.contacts
  bankAccounts.value = bankAccountsStore.bankAccounts

  const due = new Date()
  due.setDate(due.getDate() + 30)
  form.value.dueDate = due.toISOString().split('T')[0]

  if (isEdit.value) {
    isLoadingDetail.value = true
    try {
      const invoice = await invoicesStore.fetchInvoiceById(route.params.id as string)
      if (invoice.status !== 'DRAFT') {
        router.replace({ name: 'invoice-detail', params: { id: invoice.id } })
        return
      }
      selectedContactId.value = invoice.contactId || ''
      form.value = {
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail || '',
        clientAddress: invoice.clientAddress || '',
        issueDate: invoice.issueDate.split('T')[0],
        dueDate: invoice.dueDate.split('T')[0],
        notes: invoice.notes || '',
        paymentBankAccountId: invoice.paymentBankAccountId || '',
        items: invoice.items.map((i) => ({
          description: i.description,
          quantity: parseFloat(i.quantity),
          unitPrice: parseFloat(i.unitPrice),
          discountAmount: parseFloat(i.discountAmount),
          taxable: i.taxable,
        })),
      }
    } catch {
      errorMsg.value = 'Gagal memuat data invoice.'
    } finally {
      isLoadingDetail.value = false
    }
  }
})

const onContactChange = () => {
  if (!selectedContactId.value) {
    form.value.clientName = ''
    form.value.clientEmail = ''
    form.value.clientAddress = ''
    return
  }
  const contact = contacts.value.find((c) => c.id === selectedContactId.value)
  if (contact) {
    form.value.clientName = contact.name
    form.value.clientEmail = contact.email || ''
    form.value.clientAddress = contact.address || ''
  }
}

const addItem = () => form.value.items.push(defaultItem())
const removeItem = (idx: number) => form.value.items.splice(idx, 1)

const handleSubmit = async () => {
  errorMsg.value = ''
  if (form.value.items.length === 0) {
    errorMsg.value = 'Minimal satu item harus diisi.'
    return
  }
  isSubmitting.value = true
  const payload = {
    contactId: selectedContactId.value || undefined,
    clientName: selectedContactId.value ? undefined : form.value.clientName,
    clientEmail: selectedContactId.value ? undefined : (form.value.clientEmail || undefined),
    clientAddress: form.value.clientAddress || undefined,
    issueDate: form.value.issueDate,
    dueDate: form.value.dueDate,
    notes: form.value.notes || undefined,
    paymentBankAccountId: form.value.paymentBankAccountId || (isEdit.value ? null : undefined),
    items: form.value.items.map((i) => ({
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      discountAmount: i.discountAmount || undefined,
      taxable: i.taxable,
    })),
  }
  try {
    if (isEdit.value) {
      const updated = await invoicesStore.updateInvoice(route.params.id as string, payload)
      router.push({ name: 'invoice-detail', params: { id: updated.id } })
    } else {
      const created = await invoicesStore.createInvoice(payload)
      router.push({ name: 'invoice-detail', params: { id: created.id } })
    }
  } catch (err: any) {
    const msg = err.response?.data?.message
    errorMsg.value = Array.isArray(msg) ? msg.join(', ') : (msg || 'Gagal menyimpan invoice.')
  } finally {
    isSubmitting.value = false
  }
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)

const formatCurrencyShort = (val: number) =>
  new Intl.NumberFormat('id-ID', { notation: 'compact', minimumFractionDigits: 0 }).format(val)
</script>
