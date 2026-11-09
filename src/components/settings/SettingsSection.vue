<template>
  <section class="settings-panel" :class="tone ? `is-${tone}` : undefined" :aria-labelledby="`${id}-heading`"><header class="settings-panel-heading"><span class="settings-section-icon"><AppIcon :name="icon" /></span><div><span v-if="eyebrow" class="shell-overline">{{ eyebrow }}</span><h2 :id="`${id}-heading`">{{ title }}</h2><p v-if="description">{{ description }}</p></div><slot name="action" /></header><div class="settings-panel-content"><slot /></div></section>
</template>
<script setup lang="ts">
import AppIcon from '@/components/common/AppIcon.vue'
defineProps<{ id: string; title: string; icon: string; eyebrow?: string; description?: string; tone?: 'lilac' | 'mint' | 'sun' }>()
</script>
