<template>
  <div class="workspace-home">
    <section class="workspace-welcome" aria-labelledby="welcome-title">
      <div>
        <span class="shell-overline">RUANG UNTUK SETIAP RENCANA</span>
        <h1 id="welcome-title">Halo, {{ displayName }}.</h1>
        <p>Selamat datang kembali. Apa yang ingin kamu kelola hari ini?</p>
      </div>
      <span class="workspace-date">{{ today }}</span>
    </section>
    <WorkspaceCards />
    <section aria-labelledby="shortcut-heading">
      <div class="workspace-section-heading">
        <h2 id="shortcut-heading">Langsung ke tujuan</h2>
        <p>Jalan singkat untuk hal yang kamu butuhkan.</p>
      </div>
      <div class="workspace-shortcuts">
        <RouterLink :to="{ name: isBusinessWorkspace ? 'invoice-create' : 'transaction-create' }" class="workspace-shortcut">
          <AppIcon name="plus" /><span><strong>{{ isBusinessWorkspace ? 'Buat invoice' : 'Catat transaksi' }}</strong><small>{{ isBusinessWorkspace ? 'Siapkan tagihan baru' : 'Tambahkan pemasukan atau pengeluaran' }}</small></span>
        </RouterLink>
        <RouterLink :to="{ name: isBusinessWorkspace ? 'business-bank-accounts' : 'accounts-list' }" class="workspace-shortcut">
          <AppIcon name="wallet" /><span><strong>Akun &amp; rekening</strong><small>Lihat tempat uangmu tersimpan</small></span>
        </RouterLink>
        <RouterLink :to="{ name: 'help-chat' }" class="workspace-shortcut">
          <AppIcon name="chat" /><span><strong>Butuh bantuan?</strong><small>Hubungi tim Moneytory</small></span>
        </RouterLink>
      </div>
    </section>
    <aside class="workspace-tip">
      <AppIcon name="book" />
      <p>Baru mulai? Kenali cara mencatat transaksi dan mengatur akun lewat
        <a href="https://moneytory.my.id/id/cara-penggunaan" target="_blank" rel="noopener noreferrer">panduan Moneytory ↗</a>.
      </p>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useWorkspaceStore } from '@/stores/workspace'
import WorkspaceCards from '@/components/workspace/WorkspaceCards.vue'
import AppIcon from '@/components/common/AppIcon.vue'

const authStore = useAuthStore()
const wsStore = useWorkspaceStore()
const displayName = computed(() => (authStore.currentUser?.fullName || authStore.currentUser?.username || 'teman').trim().split(/\s+/)[0])
const isBusinessWorkspace = computed(() => wsStore.mode === 'business' && authStore.currentUser?.subscriptionPlan?.startsWith('BUSINESS'))
const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
</script>
