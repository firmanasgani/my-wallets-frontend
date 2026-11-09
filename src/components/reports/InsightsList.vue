<template>
  <ul v-if="insights.length" class="analysis-insights">
    <li v-for="(insight, index) in insights" :key="index" :class="`is-${insight.type.toLowerCase()}`"><AppIcon :name="insight.type === 'DANGER' || insight.type === 'WARNING' ? 'warning' : 'info'" /><div><h3>{{ insight.title }}</h3><p><template v-for="(part, partIndex) in insightParts(insight.message)" :key="partIndex"><strong v-if="part.strong">{{ part.text }}</strong><span v-else>{{ part.text }}</span></template></p></div></li>
  </ul>
  <div v-else class="analysis-empty is-compact"><AppIcon name="chat" /><h3>Belum ada sorotan bulan ini.</h3><p>Terus catat transaksi untuk melihat pola keuanganmu.</p></div>
</template>
<script setup lang="ts">
import AppIcon from '@/components/common/AppIcon.vue'
import { insightParts } from '@/utils/spendingAnalysis'
import type { Insight } from '@/types/reports'
defineProps<{ insights: Insight[] }>()
</script>
