<template>
  <main class="business-contacts-page contact-directory">
    <header class="directory-header"><div><span class="shell-overline">PENGELOLAAN BISNIS</span><h1>Manajemen kontak</h1><p>Kelola pelanggan, pemasok, dan karyawan dalam satu tempat.</p></div><button v-if="canCreate" type="button" class="directory-primary" @click="router.push({ name: 'business-contacts-create' })">+ Tambah kontak</button></header>
    <div v-if="errorMsg" class="directory-error" role="alert">{{ errorMsg }}</div>
    <section class="directory-overview" aria-label="Ringkasan kontak"><div class="overview-intro"><span class="overview-label">DIREKTORI BISNIS</span><h2>Orang di balik transaksi</h2><p>Simpan informasi kontak yang dibutuhkan untuk kegiatan bisnis.</p></div><div class="overview-stat"><strong>{{ countByType('ALL') }}</strong><span>total kontak</span></div><div class="overview-stat"><strong>{{ countByType('CUSTOMER') }}</strong><span>pelanggan</span></div><div class="overview-stat"><strong>{{ countByType('VENDOR') }}</strong><span>pemasok</span></div></section>
    <section class="directory-content"><div class="directory-heading"><div><span class="directory-label">DIREKTORI</span><h2>Daftar kontak</h2><p>Temukan dan kelola kontak perusahaan.</p></div><div class="directory-search"><label for="contact-search">Cari kontak</label><input id="contact-search" v-model.trim="searchQuery" type="search" placeholder="Nama, email, atau telepon" /></div></div><div class="directory-filters"><div class="filter-list" aria-label="Filter jenis kontak"><button v-for="tab in tabs" :key="tab.value" type="button" :aria-pressed="activeFilter === tab.value" @click="activeFilter = tab.value">{{ tab.label }} <span>{{ countByType(tab.value) }}</span></button></div><p v-if="!contactsStore.isLoading">{{ filteredContacts.length }} kontak ditemukan</p></div>
      <div v-if="contactsStore.isLoading" class="directory-state"><LoadingSpinner :visible="true" /></div><div v-else-if="!filteredContacts.length && !errorMsg" class="directory-state"><div class="empty-symbol" aria-hidden="true">&#9825;</div><h3>{{ searchQuery || activeFilter !== 'ALL' ? 'Kontak tidak ditemukan' : 'Belum ada kontak' }}</h3><p>{{ searchQuery || activeFilter !== 'ALL' ? 'Coba kata kunci atau jenis kontak lain.' : canCreate ? 'Tambahkan kontak pertama untuk memudahkan pencatatan bisnis.' : 'Kontak akan ditampilkan di sini.' }}</p><button v-if="searchQuery || activeFilter !== 'ALL'" type="button" class="directory-secondary" @click="searchQuery = ''; activeFilter = 'ALL'">Reset filter</button><button v-else-if="canCreate" type="button" class="directory-primary" @click="router.push({ name: 'business-contacts-create' })">+ Tambah kontak</button></div>
      <div v-else-if="filteredContacts.length" class="directory-grid"><article v-for="contact in filteredContacts" :key="contact.id" class="contact-card"><div class="contact-identity"><span class="contact-avatar">{{ contact.name.charAt(0).toUpperCase() }}</span><div><span class="contact-type">{{ formatType(contact.type) }}</span><h3>{{ contact.name }}</h3></div></div><dl class="contact-details"><div v-if="contact.email"><dt>Email</dt><dd>{{ contact.email }}</dd></div><div v-if="contact.phone"><dt>Telepon</dt><dd>{{ contact.phone }}</dd></div><div v-if="contact.bankName"><dt>Bank</dt><dd>{{ contact.bankName }}<template v-if="contact.bankAccountNumber"> - {{ contact.bankAccountNumber }}</template></dd></div><div v-if="!contact.email && !contact.phone && !contact.bankName" class="no-details">Informasi tambahan belum diisi.</div></dl><footer v-if="canCreate || canDelete" class="contact-actions"><button v-if="canCreate" type="button" class="action-edit" :aria-label="'Edit ' + contact.name" @click="router.push({ name: 'business-contacts-edit', params: { id: contact.id } })">Edit</button><button v-if="canDelete" type="button" class="action-delete" :aria-label="'Hapus ' + contact.name" @click="openDeleteConfirm(contact)">Hapus</button></footer></article></div>
    </section><ConfirmationModal :is-open="isDeleteModalOpen" title="Hapus kontak" :message="`Hapus kontak '${selectedContact?.name}'?`" confirm-button-text="Ya, hapus" confirm-button-class="bg-red-600 hover:bg-red-700 focus:ring-red-500" :is-confirming="isDeleting" @update:is-open="isDeleteModalOpen = $event" @confirm="handleDelete" />
  </main>
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

</script>
<style scoped>
.directory-header { display:flex; justify-content:space-between; align-items:end; gap:20px; margin-bottom:28px; }.directory-header h1 { font-size:clamp(34px,4vw,52px); line-height:1; letter-spacing:-.055em; font-weight:900; margin:9px 0; }.directory-header p,.directory-heading p { color:var(--contact-muted); font-size:14px; }.directory-primary,.directory-secondary { padding:10px 16px; border-radius:999px; font-size:13px; font-weight:800; white-space:nowrap; }.directory-primary { background:var(--contact-ink); color:var(--contact-surface); }.directory-secondary { border:1px solid var(--contact-rule); color:var(--contact-ink); }.directory-error { padding:14px; margin-bottom:16px; border:1px solid #dca7a0; border-radius:14px; color:#a8322b; background:#fff0ee; }.directory-overview { display:flex; align-items:center; gap:30px; padding:30px 32px; border-radius:24px; background:radial-gradient(circle at 100% 0%,#7756ad,transparent 55%),#3d2c60; color:white; }.overview-intro { flex:1; }.overview-label,.directory-label { font-size:10px; letter-spacing:.13em; font-weight:800; }.overview-label { color:#d7c9ef; }.overview-intro h2 { font-size:25px; font-weight:850; letter-spacing:-.04em; margin:7px 0; }.overview-intro p,.overview-stat span { color:#e0d5ef; font-size:13px; }.overview-stat { display:flex; flex-direction:column; min-width:88px; border-left:1px solid #ffffff44; padding-left:22px; }.overview-stat strong { font-size:30px; line-height:1; }.overview-stat span { margin-top:7px; }.directory-content { margin-top:36px; }.directory-heading { display:flex; justify-content:space-between; align-items:end; gap:20px; }.directory-label { color:var(--contact-muted); }.directory-heading h2 { font-size:26px; font-weight:850; letter-spacing:-.04em; margin:4px 0; }.directory-search { display:flex; flex-direction:column; gap:6px; min-width:270px; }.directory-search label { font-size:12px; font-weight:700; color:var(--contact-muted); }.directory-search input { background:var(--contact-surface); border:1px solid var(--contact-rule); border-radius:12px; color:var(--contact-ink); padding:10px 14px; }.directory-filters { display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; margin:20px 0; }.filter-list { display:flex; flex-wrap:wrap; gap:8px; }.filter-list button { border:1px solid var(--contact-rule); border-radius:999px; padding:8px 12px; color:var(--contact-muted); background:var(--contact-surface); font-size:12px; font-weight:750; }.filter-list button[aria-pressed="true"] { background:var(--contact-ink); border-color:var(--contact-ink); color:var(--contact-surface); }.filter-list span { margin-left:5px; }.directory-filters p { color:var(--contact-muted); font-size:12px; }.directory-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; }.contact-card { display:flex; flex-direction:column; min-width:0; padding:20px; border:1px solid var(--contact-rule); border-radius:20px; background:var(--contact-surface); }.contact-identity { display:flex; align-items:center; gap:12px; }.contact-avatar { display:grid; place-items:center; flex:none; width:48px; height:48px; border-radius:15px; color:var(--contact-accent); background:var(--contact-tint); font-weight:900; font-size:18px; }.contact-type { color:var(--contact-muted); font-size:10px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }.contact-identity h3 { color:var(--contact-ink); font-size:16px; font-weight:800; overflow-wrap:anywhere; margin:3px 0 0; }.contact-details { display:grid; gap:12px; margin:20px 0; flex:1; }.contact-details dt { color:var(--contact-muted); font-size:11px; }.contact-details dd { color:var(--contact-ink); font-size:13px; font-weight:700; overflow-wrap:anywhere; margin-top:2px; }.no-details { color:var(--contact-muted); font-size:13px; }.contact-actions { display:flex; justify-content:flex-end; gap:14px; border-top:1px solid var(--contact-rule); padding-top:14px; }.directory-state { text-align:center; padding:48px 24px; background:var(--contact-surface); border:1px solid var(--contact-rule); border-radius:20px; }.directory-state h3 { font-size:18px; font-weight:800; margin:10px 0 5px; }.directory-state p { color:var(--contact-muted); font-size:13px; margin-bottom:16px; }.empty-symbol { display:grid; place-items:center; width:48px; height:48px; margin:auto; border-radius:15px; background:var(--contact-tint); color:var(--contact-accent); font-size:24px; } .directory-search input:focus-visible { outline:3px solid var(--contact-accent); outline-offset:3px; } @media(max-width:900px) { .directory-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }.directory-overview { flex-wrap:wrap; }.overview-intro { flex-basis:100%; } } @media(max-width:600px) { .directory-header,.directory-heading { align-items:start; flex-direction:column; }.directory-search { width:100%; min-width:0; }.directory-overview { padding:24px; gap:18px; }.overview-stat { min-width:0; }.directory-grid { grid-template-columns:1fr; } }
</style>
