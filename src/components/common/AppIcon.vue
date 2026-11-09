<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <path :d="paths[name] || paths.grid" />
  </svg>
</template>

<script setup lang="ts">
defineProps<{ name: string }>()
const paths: Record<string, string> = {
  check: 'm5 12 4 4L19 6',
  warning: 'm12 3 10 18H2L12 3Zm0 6v5m0 3h.01',
  info: 'M12 11v6m0-10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  eyeOff: 'm3 3 18 18M9 5.5A11 11 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 4M6 6a17 17 0 0 0-4 6s3.5 7 10 7c1.6 0 3-.4 4.3-1M10 10a3 3 0 0 0 4 4',
  edit: 'm15 5 4 4M3 21l4-1 13-13a3 3 0 0 0-4-4L3 16v5Z',
  trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
  credit: 'M3 5h18v14H3V5Zm0 5h18M7 15h4',
  coins: 'M18 6c0 2-3.6 4-8 4S2 8 2 6s3.6-4 8-4 8 2 8 4ZM2 6v5c0 2 3.6 4 8 4m-8-4v5c0 2 3.6 4 8 4m12-7c0 2-2.7 3-6 3s-6-1-6-3 2.7-3 6-3 6 1 6 3Zm-12 0v5c0 2 2.7 3 6 3s6-1 6-3v-5',
  search: 'm21 21-5-5m2-6a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z',
  calendar: 'M4 5h16v16H4V5Zm0 5h16M8 3v4m8-4v4M8 14h2m4 0h2m-8 4h2',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  attachment: 'm8 13 7-7a3 3 0 0 1 4 4l-9 9a5 5 0 0 1-7-7l9-9',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  chart: 'M4 3v17h17M8 15v-4m5 4V7m5 8v-5',
  user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM5 21v-2a7 7 0 0 1 14 0v2',
  building: 'M5 21V3h14v18M2 21h20M9 7h1m4 0h1m-6 4h1m4 0h1m-5 10v-5h4v5',
  wallet: 'M4 6V5a2 2 0 0 1 2-2h12v4M4 7h15a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2m16 5h-6v5h6m-3-2.5h.01',
  tag: 'm3 3 8 .1L21 13l-8 8L3 11V3Zm4 4h.01',
  transfer: 'M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4',
  target: 'M21 12a9 9 0 1 1-9-9m5 9a5 5 0 1 1-5-5m0 5 9-9m-5 0h5v5',
  pie: 'M10 3a9 9 0 1 0 11 11H10V3Zm4-1v8h8a9 9 0 0 0-8-8Z',
  settings: 'M4 7h16M4 17h16M8 4v6m8 4v6',
  help: 'M8 9a4 4 0 0 1 8 0c0 3-4 3-4 6m0 3h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  chat: 'M21 11a8 8 0 0 1-8 8H6l-4 3V11a9 9 0 0 1 19 0ZM7 10h10m-10 4h6',
  book: 'M12 5v16M3 3h5a4 4 0 0 1 4 2 4 4 0 0 1 4-2h5v16h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3V3Z',
  file: 'M14 2H5v20h14V7l-5-5Zm0 0v6h5M8 12h8m-8 4h8',
  team: 'M16 21v-2a6 6 0 0 0-12 0v2m9-14a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm4-3a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5v2',
  bank: 'm2 9 10-7 10 7H2Zm2 12h16M6 12v6m6-6v6m6-6v6',
  box: 'm3 6 9-4 9 4v12l-9 4-9-4V6Zm0 0 9 4 9-4m-9 4v12M7 4l10 4',
  percent: 'm5 19 14-14M9 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  panel: 'M3 4h18v16H3V4Zm5 0v16m5-11 3 3-3 3',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'm6 6 12 12M6 18 18 6',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  chevron: 'm9 5 7 7-7 7',
  down: 'm6 9 6 6 6-6',
  logout: 'M9 4H4v16h5m5-12 4 4-4 4m-6-4h12',
  lock: 'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5V10Zm7 4v3',
  sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5m-3 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  moon: 'M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10Z',
  plus: 'M12 4v16M4 12h16',
}
</script>
