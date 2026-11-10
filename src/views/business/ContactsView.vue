<template>
  <div class="business-contacts-page">

    <!-- Header -->
    <div class="contacts-heading">
      <div class="contacts-title">
        <span class="shell-overline">ORANG DI BALIK SETIAP TRANSAKSI</span><h1 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Simpan koneksi penting bisnismu.</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola informasi pelanggan, pemasok, dan karyawan dalam satu tempat.</p>
      </div>
      <button
        v-if="canCreate"
        @click="router.push({ name: 'business-contacts-create' })"
        class="bg-[#2E8B57] hover:bg-[#236B43] text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm shrink-0"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Tambah kontak
      </button>
    </div>

    <!-- Error -->
    <div v-if="errorMsg" class="mb-5 rounded-lg bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800 flex items-start gap-3">
      <svg class="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-sm font-medium text-red-800 dark:text-red-300">{{ errorMsg }}</p>
    </div>

    <div class="contacts-overview" aria-label="Ringkasan kontak">
      <div v-for="tab in tabs" :key="tab.value" class="contacts-stat">
        <span>{{ tab.label === 'Semua' ? 'Total kontak' : tab.label }}</span>
        <strong>{{ countByType(tab.value) }}</strong>
      </div>
    </div>

    <div class="contacts-directory-heading">
      <div><span class="shell-overline">DIREKTORI</span><h2>Daftar kontak</h2><p>Temukan dan kelola koneksi bisnismu.</p></div>
      <label class="contacts-search"><span class="sr-only">Cari kontak</span><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke-width="2"/><path d="m20 20-4-4" stroke-width="2" stroke-linecap="round"/></svg><input v-model.trim="searchQuery" type="search" placeholder="Cari nama, email, atau telepon..." /></label>
    </div>

    <!-- Filter Tabs + Count Summary -->
    <div class="mb-6 flex items-center justify-between flex-wrap gap-3">
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="activeFilter = tab.value"
          :class="[
            'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150',
            activeFilter === tab.value
              ? 'bg-[#2E8B57] text-white shadow-sm scale-[1.02]'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-400 hover:text-emerald-600',
          ]"
          :aria-pressed="activeFilter === tab.value"
        >
          {{ tab.label }}
          <span
            :class="[
              'ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold',
              activeFilter === tab.value
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
            ]"
          >
            {{ countByType(tab.value) }}
          </span>
        </button>
      </div>

      <!-- View search hint -->
      <p v-if="filteredContacts.length > 0" class="text-xs text-slate-400 dark:text-slate-500">
        {{ filteredContacts.length }} kontak ditemukan
      </p>
    </div>

    <!-- Loading -->
    <div v-if="contactsStore.isLoading" class="flex justify-center p-16">
      <LoadingSpinner :visible="true" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredContacts.length === 0"
      class="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-16 text-center"
    >
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
        <svg class="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <p class="text-base font-semibold text-slate-700 dark:text-slate-300">{{ searchQuery || activeFilter !== 'ALL' ? 'Kontak tidak ditemukan' : 'Belum ada kontak' }}</p>
      <p class="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
        {{ searchQuery || activeFilter !== 'ALL' ? 'Coba kata kunci atau kategori lain.' : canCreate ? 'Tambahkan pelanggan, pemasok, atau karyawan untuk memudahkan pencatatanmu.' : 'Kontak akan ditampilkan di sini.' }}
      </p>
      <button
        v-if="canCreate && !searchQuery && activeFilter === 'ALL'"
        @click="router.push({ name: 'business-contacts-create' })"
        class="mt-5 inline-flex items-center gap-2 bg-[#2E8B57] hover:bg-[#236B43] text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Tambah kontak pertama
      </button>
    </div>

    <!-- Card Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="contact in filteredContacts"
        :key="contact.id"
        class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col"
      >
        <!-- Card Top Strip + Avatar -->
        <div :class="['h-2 w-full', getStripClass(contact.type)]"></div>

        <div class="p-5 flex flex-col gap-4 flex-1">

          <!-- Identity Row -->
          <div class="flex items-start gap-3">
            <!-- Avatar -->
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-sm', getAvatarClass(contact.type)]">
              {{ contact.name.charAt(0).toUpperCase() }}
            </div>

            <!-- Name + Type Badge -->
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-slate-800 dark:text-slate-100 leading-tight truncate">{{ contact.name }}</p>
              <span :class="['mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold', getTypeBadgeClass(contact.type)]">
                <span :class="['w-1.5 h-1.5 rounded-full', getTypeDotClass(contact.type)]"></span>
                {{ formatType(contact.type) }}
              </span>
            </div>
          </div>

          <!-- Info Badges -->
          <div class="flex flex-col gap-2">
            <!-- Email -->
            <div v-if="contact.email" class="flex items-center gap-2 min-w-0">
              <div class="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                <svg class="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span class="text-sm text-slate-600 dark:text-slate-300 truncate">{{ contact.email }}</span>
            </div>

            <!-- Phone -->
            <div v-if="contact.phone" class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                <svg class="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span class="text-sm text-slate-600 dark:text-slate-300">{{ contact.phone }}</span>
            </div>

            <!-- Bank -->
            <div v-if="contact.bankName" class="flex items-center gap-2 min-w-0">
              <div class="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                <svg class="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div class="min-w-0">
                <span class="text-xs font-medium text-slate-700 dark:text-slate-300">{{ contact.bankName }}</span>
                <span class="text-xs text-slate-400 dark:text-slate-500 ml-1">· {{ contact.bankAccountNumber }}</span>
              </div>
            </div>

            <!-- No info placeholder -->
            <div v-if="!contact.email && !contact.phone && !contact.bankName" class="text-xs text-slate-400 dark:text-slate-500 italic">
              Informasi tambahan belum diisi
            </div>
          </div>

          <!-- Spacer -->
          <div class="flex-1"></div>

          <!-- Divider + Actions -->
          <div class="border-t border-slate-100 dark:border-slate-700 pt-3 flex items-center justify-between">
            <span class="text-xs text-slate-400 dark:text-slate-500">#{{ contact.id }}</span>
            <div class="flex items-center gap-1">
              <button
                v-if="canCreate"
                @click="router.push({ name: 'business-contacts-edit', params: { id: contact.id } })"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-600 hover:bg-indigo-50 dark:hover:bg-emerald-900/30 dark:text-emerald-400 transition-colors"
                title="Edit"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                v-if="canDelete"
                @click="openDeleteConfirm(contact)"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 dark:text-red-400 transition-colors"
                title="Hapus"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Hapus
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <ConfirmationModal
      :is-open="isDeleteModalOpen"
      title="Hapus kontak"
      :message="`Hapus kontak '${selectedContact?.name}'?`"
      confirm-button-text="Ya, hapus"
      confirm-button-class="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      :is-confirming="isDeleting"
      @update:is-open="isDeleteModalOpen = $event"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useContactsStore } from '@/stores/contacts'
import { useBusinessStore } from '@/stores/business'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { Contact, ContactType } from '@/types/business'
import '@/assets/business-contacts.css'

const router = useRouter()
const contactsStore = useContactsStore()
const businessStore = useBusinessStore()

const errorMsg = ref('')
const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)
const selectedContact = ref<Contact | null>(null)
const activeFilter = ref<ContactType | 'ALL'>('ALL')
const searchQuery = ref('')

const tabs = [
  { value: 'ALL' as const, label: 'Semua' },
  { value: 'CUSTOMER' as const, label: 'Pelanggan' },
  { value: 'VENDOR' as const, label: 'Pemasok' },
  { value: 'EMPLOYEE' as const, label: 'Karyawan' },
]

const canCreate = computed(() =>
  businessStore.myRole !== null &&
  ['STAFF', 'ADMIN', 'OWNER'].includes(businessStore.myRole)
)

const canDelete = computed(() => {
  const role = businessStore.myRole
  return role === 'ADMIN' || role === 'OWNER'
})

const filteredContacts = computed(() => {
  const query = searchQuery.value.toLocaleLowerCase()
  return contactsStore.contacts.filter((c) =>
    (activeFilter.value === 'ALL' || c.type === activeFilter.value) &&
    (!query || [c.name, c.email, c.phone].some((value) => value?.toLocaleLowerCase().includes(query)))
  )
})

const countByType = (type: ContactType | 'ALL') => {
  if (type === 'ALL') return contactsStore.contacts.length
  return contactsStore.contacts.filter((c) => c.type === type).length
}

onMounted(async () => {
  try {
    await Promise.all([
      contactsStore.fetchContacts(),
      businessStore.fetchMembers().catch(() => {}),
    ])
  } catch {
    errorMsg.value = 'Belum berhasil memuat daftar kontak.'
  }
})

const openDeleteConfirm = (contact: Contact) => {
  selectedContact.value = contact
  isDeleteModalOpen.value = true
}

const handleDelete = async () => {
  if (!selectedContact.value) return
  isDeleting.value = true
  try {
    await contactsStore.deleteContact(selectedContact.value.id)
    isDeleteModalOpen.value = false
    selectedContact.value = null
  } catch (err: any) {
    const msg = err.response?.data?.message
    if (err.response?.status === 400) {
      errorMsg.value = 'Kontak ini tidak bisa dihapus karena masih terhubung dengan invoice atau transaksi yang ada.'
    } else {
      errorMsg.value = msg || 'Belum berhasil menghapus kontak.'
    }
    isDeleteModalOpen.value = false
  } finally {
    isDeleting.value = false
  }
}

const formatType = (type: ContactType) => {
  const map: Record<ContactType, string> = {
    CUSTOMER: 'Pelanggan',
    VENDOR: 'Pemasok',
    EMPLOYEE: 'Karyawan',
  }
  return map[type]
}

const getTypeBadgeClass = (type: ContactType) => {
  const map: Record<ContactType, string> = {
    CUSTOMER: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-emerald-300',
    VENDOR: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    EMPLOYEE: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  }
  return map[type]
}

const getTypeDotClass = (type: ContactType) => {
  const map: Record<ContactType, string> = {
    CUSTOMER: 'bg-[#2E8B57]',
    VENDOR: 'bg-amber-500',
    EMPLOYEE: 'bg-purple-500',
  }
  return map[type]
}

const getAvatarClass = (type: ContactType) => {
  const map: Record<ContactType, string> = {
    CUSTOMER: 'bg-[#2E8B57]',
    VENDOR: 'bg-amber-500',
    EMPLOYEE: 'bg-purple-500',
  }
  return map[type]
}

const getStripClass = (type: ContactType) => {
  const map: Record<ContactType, string> = {
    CUSTOMER: 'bg-[#2E8B57]',
    VENDOR: 'bg-amber-500',
    EMPLOYEE: 'bg-purple-500',
  }
  return map[type]
}
</script>
