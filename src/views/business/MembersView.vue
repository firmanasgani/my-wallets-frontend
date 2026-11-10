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

  <!-- Invite Modal -->
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isInviteModalOpen"
      class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="closeInviteModal"
    >
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">Undang Member Baru</h2>
          <p class="text-xs text-slate-500 mt-1">User harus sudah terdaftar di Moneytory. Link undangan berlaku 30 menit.</p>
        </div>
        <form @submit.prevent="handleInvite" class="px-6 py-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              v-model="inviteForm.email"
              type="email"
              required
              placeholder="budi@example.com"
              class="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
            <select
              v-model="inviteForm.role"
              class="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ADMIN">ADMIN — Approve, manage aset & pajak</option>
              <option value="CHECKER">CHECKER — Check (gate pertama) & reject</option>
              <option value="STAFF">STAFF — Buat transaksi, submit untuk review</option>
              <option value="VIEWER">VIEWER — Read-only</option>
            </select>
          </div>
          <div v-if="inviteError" class="rounded-md bg-red-50 dark:bg-red-900/30 p-3 border border-red-200 dark:border-red-700">
            <p class="text-sm text-red-700 dark:text-red-400">{{ inviteError }}</p>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" @click="closeInviteModal" class="px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
              Batal
            </button>
            <button
              type="submit"
              :disabled="isInviting"
              class="px-4 py-2 text-sm bg-[#2E8B57] hover:bg-[#236B43] disabled:opacity-50 text-white rounded-md font-medium flex items-center gap-2"
            >
              <LoadingSpinner v-if="isInviting" :visible="true" size="xs" color="text-white" />
              Kirim Undangan
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>

  <!-- Edit Role Modal -->
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isEditRoleModalOpen && selectedMember"
      class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="closeEditRoleModal"
    >
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm">
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">Ubah Role</h2>
          <p class="text-sm text-slate-500 mt-1">{{ selectedMember.user.fullName || selectedMember.user.username }}</p>
        </div>
        <div class="px-6 py-4 space-y-3">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role baru</label>
          <select
            v-model="newRole"
            class="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ADMIN">ADMIN</option>
            <option value="CHECKER">CHECKER</option>
            <option value="STAFF">STAFF</option>
            <option value="VIEWER">VIEWER</option>
          </select>
          <div v-if="editRoleError" class="rounded-md bg-red-50 dark:bg-red-900/30 p-3 border border-red-200 dark:border-red-700">
            <p class="text-sm text-red-700 dark:text-red-400">{{ editRoleError }}</p>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" @click="closeEditRoleModal" class="px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
              Batal
            </button>
            <button
              @click="handleUpdateRole"
              :disabled="isUpdatingRole"
              class="px-4 py-2 text-sm bg-[#2E8B57] hover:bg-[#236B43] disabled:opacity-50 text-white rounded-md font-medium flex items-center gap-2"
            >
              <LoadingSpinner v-if="isUpdatingRole" :visible="true" size="xs" color="text-white" />
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>

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
import { ref, computed, onMounted } from 'vue'
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
  isInviteModalOpen.value = false
}

async function handleInvite() {
  inviteError.value = ''
  isInviting.value = true
  try {
    const result = await businessStore.inviteMember(inviteForm.value)
    successMsg.value = result.message
    closeInviteModal()
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
    closeEditRoleModal()
    setTimeout(() => (successMsg.value = ''), 3000)
  } catch (err: any) {
    editRoleError.value = err.response?.data?.message || 'Gagal mengubah role.'
  } finally {
    isUpdatingRole.value = false
  }
}

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
