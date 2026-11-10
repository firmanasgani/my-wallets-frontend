<template>
  <div class="team-page">
    <header class="team-heading"><div><span class="shell-overline">PENGATURAN BISNIS</span><h1>Anggota tim</h1><p>Kelola siapa yang dapat mengakses perusahaan dan peran mereka.</p></div><button v-if="canInvite" type="button" class="invite-button" :disabled="activeCount >= 5" :title="activeCount >= 5 ? 'Slot anggota sudah penuh (5/5)' : ''" @click="openInviteModal"><span aria-hidden="true">+</span> Undang anggota</button></header>
    <section class="team-overview"><div><span class="overview-label">AKSES PERUSAHAAN</span><h2>Tim Anda</h2><p>Undang rekan kerja dan atur akses sesuai tanggung jawab mereka.</p></div><div class="capacity"><span>SLOT DIGUNAKAN</span><strong>{{ activeCount }} <small>/ 5</small></strong><div class="capacity-track" role="progressbar" aria-label="Slot anggota digunakan" :aria-valuenow="activeCount" aria-valuemin="0" aria-valuemax="5"><div :style="{ width: Math.min(activeCount / 5 * 100, 100) + '%' }"></div></div><p>{{ Math.max(0, 5 - activeCount) }} slot tersedia</p></div></section>
    <div class="team-section"><div><span class="section-label">DAFTAR ANGGOTA</span><h2>Orang dan peran</h2><p>Lihat status undangan dan kelola akses anggota.</p></div></div>
    <!-- Alert messages -->
    <div v-if="successMsg" class="mb-4 rounded-md bg-green-50 dark:bg-green-900/30 p-4 border border-green-200 dark:border-green-800">
      <p class="text-sm font-medium text-green-800 dark:text-green-300">{{ successMsg }}</p>
    </div>
    <div v-if="errorMsg" class="mb-4 rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800">
      <p class="text-sm font-medium text-red-800 dark:text-red-300">{{ errorMsg }}</p>
    </div>

    <!-- Loading -->
    <div v-if="businessStore.isMembersLoading" class="flex justify-center p-12">
      <LoadingSpinner :visible="true" />
    </div>

    <!-- Member list -->
    <div v-else class="member-list">
      <div v-if="sortedMembers.length === 0" class="py-12 text-center text-slate-500 dark:text-slate-400">
        Belum ada member. Mulai dengan mengundang rekan tim Anda.
      </div>
      <ul v-else class="divide-y divide-slate-200 dark:divide-slate-700">
        <li
          v-for="member in sortedMembers"
          :key="member.id"
          class="member-row"
        >
          <!-- Avatar & Info -->
          <div class="member-identity">
            <img
              v-if="member.user.profilePictureUrl"
              :src="member.user.profilePictureUrl"
              :alt="member.user.fullName || member.user.username"
              class="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-600 flex-shrink-0"
            />
            <div
              v-else
              class="w-9 h-9 bg-[#2E8B57] rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
            >
              {{ (member.user.fullName || member.user.username).charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                {{ member.user.fullName || member.user.username }}
                <span v-if="member.userId === authStore.currentUser?.id" class="text-xs text-slate-400 ml-1">(Anda)</span>
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ member.user.email }}</p>
            </div>
          </div>

          <!-- Role & Status badges -->
          <div class="member-badges">
            <span :class="roleBadgeClass(member.role)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium">
              
              {{ member.role }}
            </span>
            <span v-if="member.status === 'REVOKED'" class="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Akses dicabut</span>
            <span v-if="member.status === 'PENDING'" class="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
              Menunggu
            </span>
          </div>

          <!-- Actions -->
          <div class="member-actions">
            <!-- Edit Role (OWNER only, not self, not another OWNER) -->
            <button
              v-if="canEditRole(member)"
              @click="openEditRoleModal(member)"
              class="text-xs px-2.5 py-1 rounded border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Ubah Role
            </button>
            <!-- Revoke -->
            <button
              v-if="canRevoke(member)"
              @click="openRevokeModal(member)"
              class="text-xs px-2.5 py-1 rounded border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Cabut Akses
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="isInviteModalOpen" class="team-modal-overlay" @click.self="closeInviteModal" @keydown.esc="closeInviteModal">
      <section class="team-modal" role="dialog" aria-modal="true" aria-labelledby="invite-title">
        <header class="modal-hero"><div><span class="modal-overline">AKSES PERUSAHAAN</span><h2 id="invite-title">Undang anggota</h2><p>Ajak rekan kerja untuk berkolaborasi dalam pembukuan.</p></div><button type="button" class="modal-close" aria-label="Tutup" @click="closeInviteModal">&#10005;</button></header>
        <form class="modal-form" @submit.prevent="handleInvite"><div class="modal-note"><strong>Sebelum mengundang</strong><p>Anggota harus sudah terdaftar di Moneytory. Tautan undangan berlaku selama 30 menit.</p></div><div class="modal-field"><label for="invite-email">Email anggota</label><input id="invite-email" v-model="inviteForm.email" type="email" required placeholder="budi@example.com" /></div><div class="modal-field"><label for="invite-role">Peran</label><select id="invite-role" v-model="inviteForm.role"><option value="ADMIN">ADMIN - Approve, kelola aset dan pajak</option><option value="CHECKER">CHECKER - Periksa dan tolak jurnal</option><option value="STAFF">STAFF - Buat dan ajukan transaksi</option><option value="VIEWER">VIEWER - Hanya melihat</option></select><p>Pilih peran sesuai tanggung jawab anggota.</p></div><div v-if="inviteError" class="modal-error" role="alert">{{ inviteError }}</div><footer class="modal-actions"><button type="button" class="modal-secondary" :disabled="isInviting" @click="closeInviteModal">Batal</button><button type="submit" class="modal-primary" :disabled="isInviting"><LoadingSpinner v-if="isInviting" :visible="true" size="xs" color="text-white" />{{ isInviting ? 'Mengirim...' : 'Kirim undangan' }}</button></footer></form>
      </section>
    </div>
    <div v-if="isEditRoleModalOpen && selectedMember" class="team-modal-overlay" @click.self="closeEditRoleModal" @keydown.esc="closeEditRoleModal">
      <section class="team-modal" role="dialog" aria-modal="true" aria-labelledby="role-title"><header class="modal-hero"><div><span class="modal-overline">AKSES ANGGOTA</span><h2 id="role-title">Ubah peran</h2><p>Sesuaikan akses anggota sesuai tanggung jawabnya.</p></div><button type="button" class="modal-close" aria-label="Tutup" @click="closeEditRoleModal">&#10005;</button></header><div class="modal-form"><div class="selected-person"><span class="person-avatar">{{ (selectedMember.user.fullName || selectedMember.user.username).charAt(0).toUpperCase() }}</span><div><strong>{{ selectedMember.user.fullName || selectedMember.user.username }}</strong><p>{{ selectedMember.user.email }}</p></div></div><div class="modal-field"><label for="new-role">Peran baru</label><select id="new-role" v-model="newRole"><option value="ADMIN">ADMIN</option><option value="CHECKER">CHECKER</option><option value="STAFF">STAFF</option><option value="VIEWER">VIEWER</option></select><p>Perubahan akan berlaku untuk akses anggota ini.</p></div><div v-if="editRoleError" class="modal-error" role="alert">{{ editRoleError }}</div><footer class="modal-actions"><button type="button" class="modal-secondary" :disabled="isUpdatingRole" @click="closeEditRoleModal">Batal</button><button type="button" class="modal-primary" :disabled="isUpdatingRole" @click="handleUpdateRole"><LoadingSpinner v-if="isUpdatingRole" :visible="true" size="xs" color="text-white" />{{ isUpdatingRole ? 'Menyimpan...' : 'Simpan perubahan' }}</button></footer></div></section>
    </div>
  </Teleport>

  <!-- Revoke Confirmation Modal -->
  <ConfirmationModal
    :is-open="isRevokeModalOpen"
    title="Cabut Akses Member"
    :message="`Apakah Anda yakin ingin mencabut akses ${selectedMember?.user.fullName || selectedMember?.user.email}? Mereka tidak akan bisa mengakses data perusahaan lagi.`"
    confirm-button-text="Ya, Cabut Akses"
    confirm-button-class="bg-red-600 hover:bg-red-700 focus:ring-red-500"
    icon-type="danger"
    :is-confirming="isRevoking"
    @confirm="handleRevoke"
    @update:is-open="isRevokeModalOpen = $event"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import { lockModalScroll } from '@/utils/modalScrollLock'
import { useBusinessStore } from '@/stores/business'
import { useAuthStore } from '@/stores/auth'
import type { CompanyMember, CompanyMemberRole } from '@/types/business'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'

const businessStore = useBusinessStore()
const authStore = useAuthStore()

const successMsg = ref('')
const errorMsg = ref('')

// --- Computed ---
const myRole = computed<CompanyMemberRole | null>(() => {
  const myId = authStore.currentUser?.id
  const me = businessStore.members.find((m) => m.userId === myId)
  return me?.role ?? null
})

const roleOrder: Record<CompanyMemberRole, number> = { OWNER: 0, ADMIN: 1, CHECKER: 2, STAFF: 3, VIEWER: 4 }

const sortedMembers = computed(() => {
  return [...businessStore.members].sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return 1
    if (a.status !== 'PENDING' && b.status === 'PENDING') return -1
    return roleOrder[a.role] - roleOrder[b.role]
  })
})

const activeCount = computed(() =>
  businessStore.members.filter((m) => m.status !== 'REVOKED').length,
)

const canInvite = computed(() => myRole.value === 'OWNER' || myRole.value === 'ADMIN')

function canEditRole(member: CompanyMember): boolean {
  if (myRole.value !== 'OWNER') return false
  if (member.userId === authStore.currentUser?.id) return false
  if (member.role === 'OWNER') return false
  return true
}

function canRevoke(member: CompanyMember): boolean {
  if (!myRole.value || myRole.value === 'STAFF' || myRole.value === 'VIEWER') return false
  if (member.role === 'OWNER') return false
  if (member.userId === authStore.currentUser?.id) return false
  if (myRole.value === 'ADMIN' && member.role === 'ADMIN') return false
  return true
}

function roleBadgeClass(role: CompanyMemberRole): string {
  switch (role) {
    case 'OWNER': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'ADMIN': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'CHECKER': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'STAFF': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
    case 'VIEWER': return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
    default: return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
  }
}

// --- Lifecycle ---
onMounted(async () => {
  try {
    await businessStore.fetchMembers()
  } catch {
    errorMsg.value = 'Gagal memuat daftar member.'
  }
})

// --- Invite ---
const isInviteModalOpen = ref(false)
const isInviting = ref(false)
const inviteError = ref('')
const inviteForm = ref({ email: '', role: 'STAFF' as 'ADMIN' | 'CHECKER' | 'STAFF' | 'VIEWER' })

function openInviteModal() {
  const userEmail = authStore.currentUser?.email
  if (userEmail === 'demo@moneytory.id') {
    errorMsg.value = 'Akun Demo Tidak bisa digunakan untuk fitur invite member.'
    return
  }
  inviteForm.value = { email: '', role: 'STAFF' }
  inviteError.value = ''
  isInviteModalOpen.value = true
}

function closeInviteModal() {
  if (isInviting.value) return
  isInviteModalOpen.value = false
}

async function handleInvite() {
  inviteError.value = ''
  isInviting.value = true
  try {
    const result = await businessStore.inviteMember(inviteForm.value)
    successMsg.value = result.message
    isInviteModalOpen.value = false
    setTimeout(() => (successMsg.value = ''), 5000)
  } catch (err: any) {
    const status = err.response?.status
    const msg = err.response?.data?.message
    if (status === 404) {
      inviteError.value = `${msg || 'Email tidak ditemukan.'} Pastikan user sudah mendaftar di Moneytory terlebih dahulu.`
    } else {
      inviteError.value = msg || 'Gagal mengirim undangan.'
    }
  } finally {
    isInviting.value = false
  }
}

// --- Edit Role ---
const isEditRoleModalOpen = ref(false)
const isUpdatingRole = ref(false)
const editRoleError = ref('')
const selectedMember = ref<CompanyMember | null>(null)
const newRole = ref<'ADMIN' | 'CHECKER' | 'STAFF' | 'VIEWER'>('STAFF')

function openEditRoleModal(member: CompanyMember) {
  selectedMember.value = member
  newRole.value = member.role === 'OWNER' ? 'ADMIN' : member.role as 'ADMIN' | 'CHECKER' | 'STAFF' | 'VIEWER'
  editRoleError.value = ''
  isEditRoleModalOpen.value = true
}

function closeEditRoleModal() {
  if (isUpdatingRole.value) return
  isEditRoleModalOpen.value = false
  selectedMember.value = null
}

async function handleUpdateRole() {
  if (!selectedMember.value) return
  editRoleError.value = ''
  isUpdatingRole.value = true
  try {
    await businessStore.updateMemberRole(selectedMember.value.id, newRole.value)
    successMsg.value = 'Role berhasil diperbarui.'
    isEditRoleModalOpen.value = false
    selectedMember.value = null
    setTimeout(() => (successMsg.value = ''), 3000)
  } catch (err: any) {
    editRoleError.value = err.response?.data?.message || 'Gagal mengubah role.'
  } finally {
    isUpdatingRole.value = false
  }
}

let releaseTeamModalScroll: (() => void) | null = null
let modalOpener: HTMLElement | null = null
watch([isInviteModalOpen, isEditRoleModalOpen], async ([invite, edit]) => {
  if (invite || edit) {
    modalOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    releaseTeamModalScroll = lockModalScroll()
    await nextTick()
    document.querySelector<HTMLElement>(invite ? '#invite-email' : '#new-role')?.focus()
  } else {
    releaseTeamModalScroll?.()
    releaseTeamModalScroll = null
    modalOpener?.focus()
    modalOpener = null
  }
})
onBeforeUnmount(() => releaseTeamModalScroll?.())

// --- Revoke ---
const isRevokeModalOpen = ref(false)
const isRevoking = ref(false)

function openRevokeModal(member: CompanyMember) {
  selectedMember.value = member
  isRevokeModalOpen.value = true
}

async function handleRevoke() {
  if (!selectedMember.value) return
  isRevoking.value = true
  try {
    const result = await businessStore.revokeMember(selectedMember.value.id)
    successMsg.value = result.message
    isRevokeModalOpen.value = false
    selectedMember.value = null
    setTimeout(() => (successMsg.value = ''), 3000)
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Gagal mencabut akses member.'
    isRevokeModalOpen.value = false
  } finally {
    isRevoking.value = false
  }
}
</script>

<style scoped>
.team-page { --ink:var(--shell-ink,#27231d); --muted:var(--shell-muted,#6c6256); --surface:var(--shell-surface,#fffcf5); --rule:var(--shell-rule,#e2d8c7); max-width:1280px; margin:auto; padding:clamp(20px,3vw,40px) clamp(16px,3vw,32px); color:var(--ink); }.team-heading { display:flex; justify-content:space-between; align-items:end; gap:20px; margin-bottom:28px; }.team-heading h1 { font-size:clamp(34px,4vw,52px); line-height:1; letter-spacing:-.055em; font-weight:900; margin:9px 0; }.team-heading p,.team-section p { color:var(--muted); font-size:14px; }.invite-button { background:var(--shell-grape,#5026a5); color:white; padding:11px 18px; border-radius:999px; font-weight:750; white-space:nowrap; }.invite-button span { font-size:20px; vertical-align:middle; margin-right:4px; }.invite-button:disabled { opacity:.5; cursor:not-allowed; }.team-overview { display:flex; justify-content:space-between; align-items:center; gap:32px; padding:30px 32px; border-radius:24px; background:radial-gradient(circle at 100% 0%,#7756ad,transparent 55%),#3d2c60; color:white; }.overview-label,.section-label,.capacity > span { font-size:10px; letter-spacing:.13em; font-weight:800; }.overview-label,.capacity > span { color:#d7c9ef; }.team-overview h2 { font-size:26px; font-weight:850; letter-spacing:-.04em; margin:7px 0; }.team-overview p { color:#e0d5ef; font-size:13px; }.capacity { min-width:210px; border-left:1px solid #ffffff44; padding-left:28px; }.capacity strong { display:block; font-size:36px; line-height:1; margin:8px 0 12px; }.capacity small { color:#d7c9ef; font-size:18px; }.capacity-track { height:6px; background:#ffffff33; border-radius:999px; overflow:hidden; }.capacity-track div { height:100%; background:#bce8cc; border-radius:inherit; }.capacity p { margin-top:8px; }.team-section { margin:32px 0 16px; }.section-label { color:var(--muted); }.team-section h2 { font-size:26px; font-weight:850; letter-spacing:-.04em; margin:4px 0; }.member-list { background:var(--surface); border:1px solid var(--rule); border-radius:20px; overflow:hidden; }.member-row { display:grid; grid-template-columns:minmax(0,1fr) auto auto; align-items:center; gap:20px; padding:20px 24px; }.member-identity { display:flex; align-items:center; gap:12px; min-width:0; }.member-badges,.member-actions { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }.member-actions button { border-radius:999px; padding:7px 12px; font-weight:700; }.team-page :deep(button:focus-visible) { outline:3px solid #9a78d5; outline-offset:3px; } @media(max-width:700px) { .team-heading { align-items:start; flex-direction:column; }.team-overview { align-items:start; flex-direction:column; padding:24px; }.capacity { border-left:0; border-top:1px solid #ffffff44; padding:18px 0 0; width:100%; }.member-row { grid-template-columns:1fr; gap:12px; padding:18px; }.member-actions { padding-left:48px; }.member-badges { padding-left:48px; } }
</style>

<style scoped>
.team-modal-overlay { position:fixed; inset:0; z-index:50; display:flex; align-items:center; justify-content:center; padding:16px; background:rgba(24,19,35,.65); }.team-modal { --ink:var(--shell-ink,#27231d); --muted:var(--shell-muted,#6c6256); --surface:var(--shell-surface,#fffcf5); --rule:var(--shell-rule,#e2d8c7); width:min(100%,500px); max-height:calc(100dvh - 32px); overflow:auto; border-radius:24px; background:var(--surface); color:var(--ink); box-shadow:0 24px 80px #0005; }.modal-hero { display:flex; justify-content:space-between; gap:20px; padding:28px; background:radial-gradient(circle at 100% 0%,#7756ad,transparent 60%),#3d2c60; color:white; }.modal-overline { font-size:10px; letter-spacing:.13em; font-weight:800; color:#d7c9ef; }.modal-hero h2 { font-size:28px; line-height:1.1; letter-spacing:-.04em; font-weight:900; margin:8px 0; }.modal-hero p { color:#e0d5ef; font-size:13px; line-height:1.5; }.modal-close { flex:none; width:36px; height:36px; border-radius:50%; background:#ffffff20; color:white; }.modal-form { display:flex; flex-direction:column; gap:20px; padding:26px 28px; }.modal-note { padding:15px 16px; background:var(--shell-lilac,#eee4ff); border-radius:14px; color:#31244c; font-size:13px; }.modal-note strong { font-weight:800; }.modal-note p { margin-top:4px; line-height:1.5; }.modal-field { display:flex; flex-direction:column; gap:7px; }.modal-field label { font-size:13px; font-weight:800; }.modal-field input,.modal-field select { width:100%; min-height:44px; padding:10px 12px; border:1px solid var(--rule); border-radius:12px; background:var(--surface); color:var(--ink); font-size:14px; }.modal-field p,.selected-person p { color:var(--muted); font-size:12px; line-height:1.5; }.selected-person { display:flex; align-items:center; gap:12px; padding:14px; border:1px solid var(--rule); border-radius:14px; }.selected-person strong,.selected-person p { overflow-wrap:anywhere; }.selected-person strong { font-size:14px; }.person-avatar { display:grid; place-items:center; width:42px; height:42px; flex:none; border-radius:14px; background:var(--shell-lilac,#eee4ff); color:#5026a5; font-weight:800; }.modal-error { padding:12px; border-radius:12px; background:#fff0ee; color:#a8322b; font-size:13px; }.modal-actions { display:flex; justify-content:flex-end; gap:8px; padding-top:4px; }.modal-actions button { display:flex; align-items:center; justify-content:center; gap:8px; padding:10px 17px; border-radius:999px; font-size:13px; font-weight:800; }.modal-actions button:disabled { opacity:.5; }.modal-secondary { border:1px solid var(--rule); color:var(--ink); }.modal-primary { background:var(--shell-grape,#5026a5); color:white; }.team-modal :is(button,input,select):focus-visible { outline:3px solid #9a78d5; outline-offset:3px; } @media(max-width:520px) { .modal-hero,.modal-form { padding:22px; }.modal-actions button { flex:1; } }
</style>
