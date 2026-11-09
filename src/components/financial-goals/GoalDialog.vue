<template>
  <Teleport to="body"><dialog ref="dialog" class="goal-dialog" :aria-labelledby="`${id}-title`" :aria-busy="busy" tabindex="-1" @cancel.prevent="close" @close="nativeClose" @click="backdrop" @keydown.esc.stop.prevent="close">
    <header class="goal-dialog-heading"><div><span class="shell-overline">{{ eyebrow || 'SELANGKAH LEBIH DEKAT' }}</span><h2 :id="`${id}-title`">{{ title }}</h2><p v-if="description">{{ description }}</p></div><button type="button" class="goal-icon-button" aria-label="Tutup dialog" :disabled="busy" @click="close"><AppIcon name="close" /></button></header>
    <slot />
  </dialog></Teleport>
</template>
<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { lockModalScroll } from '@/utils/modalScrollLock'
import '@/assets/financial-goals.css'
const props = defineProps<{ isOpen: boolean; title: string; description?: string; eyebrow?: string; busy?: boolean }>()
const emit = defineEmits<{ close: [] }>()
const dialog = ref<HTMLDialogElement | null>(null), id = useId()
let opener: HTMLElement | null = null, releaseScroll: (() => void) | null = null, active = true, version = 0
const close = () => { if (!props.busy) emit('close') }
const nativeClose = () => { if (active && props.isOpen && !props.busy) emit('close') }
const backdrop = (event: MouseEvent) => { if (event.target !== dialog.value || !dialog.value) return; const rect = dialog.value.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close() }
const cleanup = () => { dialog.value?.close(); releaseScroll?.(); releaseScroll = null; if (opener?.isConnected) opener.focus(); else document.getElementById('main-content')?.focus(); opener = null }
watch(() => props.isOpen, async (open) => {
  const request = ++version
  if (!open) { cleanup(); return }
  await nextTick()
  if (!active || request !== version || !dialog.value || dialog.value.open) return
  opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  dialog.value.showModal(); releaseScroll = lockModalScroll()
  const target = dialog.value.querySelector<HTMLElement>('[autofocus]') || dialog.value.querySelector<HTMLElement>('input:not(:disabled),textarea:not(:disabled)')
  target?.focus()
}, { immediate: true })
onBeforeUnmount(() => { active = false; version++; cleanup() })
</script>
