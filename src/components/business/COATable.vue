<template>
  <div class="account-groups"><section v-for="(accountsList, type) in accounts" :key="type" class="account-group"><button type="button" class="group-heading" :aria-expanded="!!expandedSections[type.toString()]" @click="toggleSection(type.toString())"><span class="group-icon">{{ formatTypeHeader(type.toString()).charAt(0) }}</span><span class="group-name"><strong>{{ formatTypeHeader(type.toString()) }}</strong><small>{{ accountsList.length }} akun</small></span><span class="group-toggle" aria-hidden="true">{{ expandedSections[type.toString()] ? '-' : '+' }}</span></button><div v-show="expandedSections[type.toString()]" class="table-scroll"><table><thead><tr><th scope="col">Kode</th><th scope="col">Nama akun</th><th scope="col" class="amount">Saldo awal</th><th scope="col">Tipe</th><th v-if="isAdmin" scope="col" class="actions">Aksi</th></tr></thead><tbody><tr v-for="account in accountsList" :key="account.id"><td><span class="code">{{ account.code }}</span></td><td class="name">{{ account.name }}</td><td class="amount">{{ formatCurrency(account.openingBalance) }}</td><td><span class="kind" :class="{ system: account.isSystem }">{{ account.isSystem ? 'Sistem' : 'Kustom' }}</span></td><td v-if="isAdmin" class="actions"><div v-if="!account.isSystem" class="row-actions"><button type="button" :aria-label="'Edit ' + account.name" @click="$emit('edit', account)">Edit</button><button type="button" class="delete" :aria-label="'Hapus ' + account.name" @click="$emit('delete', account)">Hapus</button></div><span v-else class="system-note">Dilindungi</span></td></tr><tr v-if="!accountsList.length"><td :colspan="isAdmin ? 5 : 4" class="empty">Belum ada akun untuk kelompok ini.</td></tr></tbody></table></div></section><div v-if="Object.keys(accounts).length === 0" class="empty-state"><strong>Belum ada bagan akun</strong><p>Data akun akan dibuat secara otomatis saat registrasi perusahaan.</p></div></div>
</template>
<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import type { ChartOfAccount } from '@/types/business'

const props = defineProps<{
  accounts: Record<string, ChartOfAccount[]>
  isAdmin?: boolean
}>()

defineEmits<{
  edit: [account: ChartOfAccount]
  delete: [account: ChartOfAccount]
}>()

const expandedSections = ref<Record<string, boolean>>({})

watchEffect(() => {
  if (props.accounts) {
    for (const key of Object.keys(props.accounts)) {
      if (expandedSections.value[key] === undefined) {
        expandedSections.value[key] = true
      }
    }
  }
})

const toggleSection = (type: string) => {
  expandedSections.value[type] = !expandedSections.value[type]
}

const formatTypeHeader = (type: string) => {
  const map: Record<string, string> = {
    ASSET: 'Aset (Harta)',
    LIABILITY: 'Kewajiban (Hutang)',
    EQUITY: 'Ekuitas (Modal)',
    REVENUE: 'Pendapatan',
    EXPENSE: 'Beban (Pengeluaran)',
  }
  return map[type] || type
}

const formatCurrency = (value: string) => {
  const num = parseFloat(value)
  if (isNaN(num) || num === 0) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
}
</script>
<style scoped>
.account-groups { --ink:var(--shell-ink,#27231d); --muted:var(--shell-muted,#6c6256); --surface:var(--shell-surface,#fffcf5); --rule:var(--shell-rule,#e2d8c7); display:grid; gap:14px; }.account-group,.empty-state { background:var(--surface); border:1px solid var(--rule); border-radius:20px; overflow:hidden; }.group-heading { width:100%; display:flex; align-items:center; gap:14px; padding:18px 22px; text-align:left; color:var(--ink); }.group-heading:hover { background:var(--shell-lilac,#eee4ff); }.group-icon { display:grid; place-items:center; flex:none; width:42px; height:42px; border-radius:14px; background:var(--shell-lilac,#eee4ff); color:#5026a5; font-size:16px; font-weight:900; }.group-name { display:flex; flex:1; flex-direction:column; gap:3px; }.group-name strong { font-size:16px; font-weight:800; }.group-name small { color:var(--muted); font-size:12px; }.group-toggle { display:grid; place-items:center; width:32px; height:32px; border:1px solid var(--rule); border-radius:50%; font-size:20px; }.table-scroll { overflow-x:auto; border-top:1px solid var(--rule); }table { width:100%; min-width:680px; border-collapse:collapse; font-size:13px; }th { padding:12px 22px; color:var(--muted); font-size:10px; text-transform:uppercase; letter-spacing:.09em; text-align:left; background:var(--surface); }td { padding:15px 22px; border-top:1px solid var(--rule); color:var(--ink); }tbody tr:hover { background:var(--shell-lilac,#eee4ff); }tbody tr:hover td { color:#31244c; }.code { font-family:monospace; color:var(--muted); }.name { font-weight:750; }.amount { text-align:right; white-space:nowrap; font-variant-numeric:tabular-nums; }.actions { text-align:right; }.kind { display:inline-block; border-radius:999px; padding:4px 9px; background:#eee4ff; color:#5026a5; font-size:11px; font-weight:700; }.kind.system { background:#e4eee7; color:#356c48; }.row-actions { display:flex; justify-content:flex-end; gap:12px; }.row-actions button { font-size:12px; font-weight:750; color:#5026a5; }.row-actions .delete { color:#b3433c; }.system-note { color:var(--muted); font-size:11px; }.empty,.empty-state { text-align:center; color:var(--muted); padding:32px; }.empty-state strong { color:var(--ink); }.empty-state p { font-size:13px; margin-top:6px; }.account-groups button:focus-visible { outline:3px solid #9a78d5; outline-offset:-3px; }
</style>
