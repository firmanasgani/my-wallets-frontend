<template>
  <section aria-labelledby="workspace-heading">
    <div class="workspace-section-heading">
      <h2 id="workspace-heading">Pilih ruang keuanganmu</h2>
      <p>Personal atau bisnis, semuanya dimulai dari sini.</p>
    </div>
    <div class="workspace-grid">
      <article class="workspace-card">
        <span class="workspace-card-top">
          <span class="workspace-card-icon"><AppIcon name="wallet" /></span>
          <span class="workspace-card-badge">{{ wsStore.mode === 'personal' ? 'Workspace aktif' : 'Personal' }}</span>
        </span>
        <h3>Keuangan personal</h3>
        <p>Dari pengeluaran harian hingga rencana masa depan. Pantau keuanganmu dengan lebih tenang.</p>
        <ul class="workspace-card-features" aria-label="Fitur personal">
          <li>Transaksi</li><li>Akun keuangan</li><li>Ringkasan saldo</li>
        </ul>
        <button type="button" class="workspace-card-cta" @click="selectPersonal">Buka dashboard personal <AppIcon name="arrow" /></button>
      </article>
      <article class="workspace-card is-business">
        <span class="workspace-card-top">
          <span class="workspace-card-icon"><AppIcon name="building" /></span>
          <span class="workspace-card-badge">
            <AppIcon v-if="!isBusinessPlan" name="lock" />
            {{ !isBusinessPlan ? 'Paket bisnis' : wsStore.mode === 'business' ? 'Workspace aktif' : 'Bisnis' }}
          </span>
        </span>
        <h3>Keuangan bisnis</h3>
        <p>Satu ruang untuk operasional usaha. Kelola invoice, pembukuan, dan tim dalam satu alur.</p>
        <ul class="workspace-card-features" aria-label="Fitur bisnis">
          <li>Invoice</li><li>Laporan keuangan</li><li>Kolaborasi tim</li>
        </ul>
        <button type="button" class="workspace-card-cta" @click="selectBusiness">{{ isBusinessPlan ? 'Buka dashboard bisnis' : 'Jelajahi paket bisnis' }} <AppIcon name="arrow" /></button>
      </article>
    </div>
  </section>
  <Teleport to="body">
    <PricingModal :is-open="upgradeOpen" :business-only="true" @update:is-open="upgradeOpen = $event" />
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkspaceStore } from '@/stores/workspace'
import { useAuthStore } from '@/stores/auth'
import PricingModal from '@/components/common/PricingModal.vue'
import AppIcon from '@/components/common/AppIcon.vue'

const wsStore = useWorkspaceStore()
const authStore = useAuthStore()
const router = useRouter()
const upgradeOpen = ref(false)
const isBusinessPlan = computed(() => authStore.currentUser?.subscriptionPlan?.startsWith('BUSINESS') ?? false)
function selectPersonal() {
  wsStore.setMode('personal')
  router.push({ name: 'personal-dashboard' })
}
function selectBusiness() {
  if (!isBusinessPlan.value) { upgradeOpen.value = true; return }
  wsStore.setMode('business')
  router.push({ name: 'business-kpi' })
}
</script>
