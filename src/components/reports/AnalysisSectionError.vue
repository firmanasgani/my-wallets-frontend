<template>
  <div class="analysis-section-error" role="alert"><AppIcon name="warning" /><div><h3>{{ label }} belum berhasil dimuat.</h3><p>Coba muat ulang untuk melengkapi laporan.</p></div><button type="button" class="analysis-button" @click="$emit('retry')">Coba lagi</button></div>
</template>
<script setup lang="ts">
import AppIcon from '@/components/common/AppIcon.vue'
defineProps<{ label: string }>()
defineEmits<{ retry: [] }>()
</script>
