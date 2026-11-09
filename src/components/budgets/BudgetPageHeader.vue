<template>
  <header class="budget-heading">
    <div><span class="shell-overline">RENCANAKAN, LALU WUJUDKAN</span><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>
    <div class="budget-actions"><slot /></div>
  </header>
  <nav class="budget-tabs" aria-label="Halaman anggaran">
    <RouterLink :to="{ name: 'budget-setup', query }" :aria-current="active === 'setup' ? 'page' : undefined" :class="{ 'is-active': active === 'setup' }"><AppIcon name="settings" />Pengaturan anggaran</RouterLink>
    <RouterLink :to="{ name: 'budget-report', query }" :aria-current="active === 'report' ? 'page' : undefined" :class="{ 'is-active': active === 'report' }"><AppIcon name="chart" />Laporan realisasi</RouterLink>
  </nav>
</template>
<script setup lang="ts">
import { RouterLink, type LocationQueryRaw } from 'vue-router'
import AppIcon from '@/components/common/AppIcon.vue'
defineProps<{ title: string; subtitle: string; active: 'setup' | 'report'; query: LocationQueryRaw }>()
</script>
