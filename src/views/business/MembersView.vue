<template>
  <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
          Members
          <span class="text-base font-normal text-slate-500 dark:text-slate-400 ml-2">({{ activeCount }}/5)</span>
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola anggota perusahaan Anda.</p>
      </div>
      <button
        v-if="canInvite"
        @click="openInviteModal"
        :disabled="activeCount >= 5"
        :title="activeCount >= 5 ? 'Slot member sudah penuh (5/5)' : ''"
        class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Invite
      </button>
    </div>

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
    <div v-else class="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <div v-if="sortedMembers.length === 0" class="py-12 text-center text-slate-500 dark:text-slate-400">
        Belum ada member. Mulai dengan mengundang rekan tim Anda.
      </div>
      <ul v-else class="divide-y divide-slate-200 dark:divide-slate-700">
        <li
          v-for="member in sortedMembers"
          :key="member.id"
          class="flex items-center justify-between px-6 py-4 gap-4"
        >
          <!-- Avatar & Info -->
          <div class="flex items-center gap-3 min-w-0">
            <img
              v-if="member.user.profilePictureUrl"
              :src="member.user.profilePictureUrl"
              :alt="member.user.fullName || member.user.username"
              class="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-600 flex-shrink-0"
            />
            <div
              v-else
              class="w-9 h-9 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
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
          <div class="flex items-center gap-2 flex-shrink-0">
            <span :class="roleBadgeClass(member.role)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium">
              <span>{{ roleIcon(member.role) }}</span>
              {{ member.role }}
            </span>
            <span v-if="member.status === 'PENDING'" class="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
              Menunggu
            </span>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 flex-shrink-0">
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
              class="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
            <select
              v-model="inviteForm.role"
              class="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ADMIN">ADMIN — Akses penuh kecuali hapus company</option>
              <option value="STAFF">STAFF — Bisa buat invoice & transaksi</option>
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
              class="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md font-medium flex items-center gap-2"
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
            class="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ADMIN">ADMIN</option>
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
              class="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md font-medium flex items-center gap-2"
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

const roleOrder: Record<CompanyMemberRole, number> = { OWNER: 0, ADMIN: 1, STAFF: 2, VIEWER: 3 }

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
    case 'ADMIN': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
    case 'STAFF': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
    case 'VIEWER': return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
  }
}

function roleIcon(role: CompanyMemberRole): string {
  switch (role) {
    case 'OWNER': return '👑'
    case 'ADMIN': return '🛡️'
    case 'STAFF': return '✏️'
    case 'VIEWER': return '👁️'
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
const inviteForm = ref({ email: '', role: 'STAFF' as 'ADMIN' | 'STAFF' | 'VIEWER' })

function openInviteModal() {
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
const newRole = ref<'ADMIN' | 'STAFF' | 'VIEWER'>('STAFF')

function openEditRoleModal(member: CompanyMember) {
  selectedMember.value = member
  newRole.value = member.role === 'OWNER' ? 'ADMIN' : member.role as 'ADMIN' | 'STAFF' | 'VIEWER'
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
