<template>
  <Teleport to="body">
    <dialog ref="dialog" class="money-dialog" :aria-labelledby="`${id}-title`" :aria-describedby="description ? `${id}-description` : undefined" :aria-busy="busy" tabindex="-1" @cancel.prevent="requestClose" @keydown.esc.stop.prevent="requestClose" @click="backdrop" @close="nativeClose">
      <header class="app-dialog-heading"><div><span class="app-dialog-eyebrow">{{ eyebrow || 'PENGATURAN AKUN' }}</span><h2 :id="`${id}-title`">{{ title }}</h2><p v-if="description" :id="`${id}-description`">{{ description }}</p></div><button type="button" class="app-dialog-close" aria-label="Tutup dialog" :disabled="busy" @click="requestClose"><AppIcon name="close" /></button></header>
      <slot />
    </dialog>
  </Teleport>
</template>
<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { lockModalScroll } from '@/utils/modalScrollLock'
import '@/assets/dialog.css'
const props = defineProps<{ isOpen: boolean; title: string; description?: string; eyebrow?: string; busy?: boolean }>()
const emit = defineEmits<{ close: [] }>()
const id = useId(), dialog = ref<HTMLDialogElement | null>(null)
let active = true, version = 0, opener: HTMLElement | null = null, unlock: (() => void) | null = null
const requestClose = () => { if (props.isOpen && !props.busy) emit('close') }
const nativeClose = () => { if (active && props.isOpen && !props.busy) emit('close') }
const backdrop = (event: MouseEvent) => { if (event.target !== dialog.value || !dialog.value) return; const box = dialog.value.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) requestClose() }
const closeDialog = () => {
  const wasOpen = dialog.value?.open
  dialog.value?.close(); unlock?.(); unlock = null
  if (wasOpen) { if (opener?.isConnected) opener.focus(); else document.getElementById('main-content')?.focus() }
  opener = null
}
watch(() => props.isOpen, async (open) => {
  const request = ++version
  if (!open) { closeDialog(); return }
  await nextTick()
  if (!active || request !== version || !dialog.value || dialog.value.open || !props.isOpen) return
  opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  dialog.value.showModal(); unlock = lockModalScroll()
  const target = dialog.value.querySelector<HTMLElement>('[autofocus]') || dialog.value.querySelector<HTMLElement>('input:not(:disabled),textarea:not(:disabled)')
  if (!props.busy) target?.focus()
}, { immediate: true })
onBeforeUnmount(() => { active = false; version++; closeDialog() })
</script>
