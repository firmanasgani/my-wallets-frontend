<template>
  <div class="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Kontak</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Customer, vendor, dan karyawan perusahaan.</p>
      </div>
      <button
        v-if="canCreate"
        @click="router.push({ name: 'business-contacts-create' })"
        class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        Tambah Kontak
      </button>
    </div>

    <!-- Error -->
    <div v-if="errorMsg" class="mb-4 rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800">
      <p class="text-sm font-medium text-red-800 dark:text-red-300">{{ errorMsg }}</p>
    </div>

    <!-- Filter Tabs -->
    <div class="mb-4 flex gap-2 flex-wrap">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="activeFilter = tab.value"
        :class="[
          'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
          activeFilter === tab.value
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-400',
        ]"
      >
        {{ tab.label }}
        <span class="ml-1 text-xs opacity-75">({{ countByType(tab.value) }})</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="contactsStore.isLoading" class="flex justify-center p-12">
      <LoadingSpinner :visible="true" />
    </div>

    <!-- List -->
    <div v-else>
      <div v-if="filteredContacts.length === 0" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
        <svg class="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        <p class="text-base font-medium text-slate-700 dark:text-slate-300">Belum ada kontak</p>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {{ canCreate ? 'Klik tombol Tambah Kontak untuk membuat kontak baru.' : 'Kontak akan ditampilkan di sini.' }}
        </p>
      </div>

      <div v-else class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <ul class="divide-y divide-slate-200 dark:divide-slate-700">
          <li
            v-for="contact in filteredContacts"
            :key="contact.id"
            class="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div class="flex items-center gap-4 min-w-0">
              <!-- Avatar -->
              <div :class="['w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0', getAvatarClass(contact.type)]">
                {{ contact.name.charAt(0).toUpperCase() }}
              </div>
              <!-- Info -->
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <p class="font-semibold text-slate-800 dark:text-slate-100 truncate">{{ contact.name }}</p>
                  <span :class="['inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', getTypeBadgeClass(contact.type)]">
                    {{ formatType(contact.type) }}
                  </span>
                </div>
                <div class="flex items-center gap-3 mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  <span v-if="contact.email" class="truncate">{{ contact.email }}</span>
                  <span v-if="contact.phone">📞 {{ contact.phone }}</span>
                </div>
                <div v-if="contact.bankName" class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {{ contact.bankName }} · {{ contact.bankAccountNumber }}
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1 shrink-0 ml-4">
              <button
                v-if="canCreate"
                @click="router.push({ name: 'business-contacts-edit', params: { id: contact.id } })"
                class="p-2 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-colors"
                title="Edit"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </button>
              <button
                v-if="canDelete"
                @click="openDeleteConfirm(contact)"
                class="p-2 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                title="Hapus"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <ConfirmationModal
      :is-open="isDeleteModalOpen"
      title="Hapus Kontak"
      :message="`Apakah Anda yakin ingin menghapus kontak '${selectedContact?.name}'?`"
      confirm-button-text="Ya, Hapus"
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

const router = useRouter()
const contactsStore = useContactsStore()
const businessStore = useBusinessStore()

const errorMsg = ref('')
const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)
const selectedContact = ref<Contact | null>(null)
const activeFilter = ref<ContactType | 'ALL'>('ALL')

const tabs = [
  { value: 'ALL' as const, label: 'Semua' },
  { value: 'CUSTOMER' as const, label: 'Customer' },
  { value: 'VENDOR' as const, label: 'Vendor' },
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
  if (!contactsStore.contacts.length) return []
  if (activeFilter.value === 'ALL') return contactsStore.contacts
  return contactsStore.contacts.filter((c) => c.type === activeFilter.value)
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
    errorMsg.value = 'Gagal memuat daftar kontak.'
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
      errorMsg.value = msg || 'Gagal menghapus kontak.'
    }
    isDeleteModalOpen.value = false
  } finally {
    isDeleting.value = false
  }
}

const formatType = (type: ContactType) => {
  const map: Record<ContactType, string> = {
    CUSTOMER: 'Customer',
    VENDOR: 'Vendor',
    EMPLOYEE: 'Karyawan',
  }
  return map[type]
}

const getTypeBadgeClass = (type: ContactType) => {
  const map: Record<ContactType, string> = {
    CUSTOMER: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    VENDOR: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    EMPLOYEE: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  }
  return map[type]
}

const getAvatarClass = (type: ContactType) => {
  const map: Record<ContactType, string> = {
    CUSTOMER: 'bg-blue-500',
    VENDOR: 'bg-amber-500',
    EMPLOYEE: 'bg-purple-500',
  }
  return map[type]
}
</script>
