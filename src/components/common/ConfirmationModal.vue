<template>
  <Teleport to="body">
    <dialog ref="dialogRef" class="money-confirm" :class="`is-${variant}`"
      :role="variant === 'danger' || variant === 'warning' ? 'alertdialog' : 'dialog'"
      aria-modal="true" :aria-labelledby="`${id}-title`" :aria-describedby="`${id}-message`"
      :aria-busy="busy" tabindex="-1" @cancel.prevent="handleCancel" @close="handleNativeClose"
      @keydown.esc.stop.prevent="handleCancel" @click="handleBackdropClick">
      <div class="confirm-content">
        <div class="confirm-topline">
          <span class="confirm-symbol" aria-hidden="true"><slot name="icon"><AppIcon :name="iconName" /></slot></span>
          <button type="button" class="confirm-close" aria-label="Tutup konfirmasi" :disabled="busy" @click="handleCancel"><AppIcon name="close" /></button>
        </div>
        <span class="confirm-eyebrow">{{ eyebrow }}</span>
        <h2 :id="`${id}-title`"><slot name="title">{{ title }}</slot></h2>
        <div :id="`${id}-message`" class="confirm-message"><slot name="message"><p>{{ message }}</p></slot></div>
      </div>
      <footer class="confirm-footer">
        <div v-if="busy" class="confirm-progress" role="status"><span class="confirm-progress-dot" aria-hidden="true"></span>{{ confirmingText }}</div>
        <div class="confirm-actions">
          <button ref="cancelButtonRef" type="button" class="confirm-button confirm-cancel" :disabled="busy" @click="handleCancel"><slot name="cancelButtonText">{{ cancelButtonText }}</slot></button>
          <button type="button" class="confirm-button confirm-primary" :class="confirmButtonClass" :disabled="busy" @click="handleConfirm">
            <span v-if="busy" class="confirm-spinner" aria-hidden="true"></span>
            <AppIcon v-else-if="variant === 'danger'" name="trash" />
            <span v-if="busy">{{ confirmingText }}</span><slot v-else name="confirmButtonText">{{ confirmButtonText }}</slot>
          </button>
        </div>
      </footer>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { lockModalScroll } from '@/utils/modalScrollLock'
import '@/assets/confirmation.css'

interface Props {
  isOpen: boolean
  title?: string
  message?: string
  confirmButtonText?: string
  cancelButtonText?: string
  /** Retained for existing callers; iconType controls the shared visual theme. */
  confirmButtonClass?: string
  iconType?: 'warning' | 'danger' | 'info' | 'success'
  isConfirming?: boolean
  confirmingText?: string
  closeOnOverlayClick?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  isOpen: false, title: 'Konfirmasi tindakan', message: 'Apakah kamu ingin melanjutkan tindakan ini?',
  confirmButtonText: 'Ya, lanjutkan', cancelButtonText: 'Batal', confirmButtonClass: '',
  iconType: 'warning', isConfirming: false, confirmingText: 'Memproses...', closeOnOverlayClick: true,
})
const emit = defineEmits<{ 'update:isOpen': [value: boolean]; confirm: []; cancel: [] }>()
const id = useId()
const dialogRef = ref<HTMLDialogElement | null>(null)
const cancelButtonRef = ref<HTMLButtonElement | null>(null)
const confirmationRequested = ref(false)
const busy = computed(() => props.isConfirming || confirmationRequested.value)
// Older delete dialogs pass red button classes without specifying iconType.
const variant = computed(() => props.iconType === 'warning' && /(?:bg-red-|bg-rose-)/.test(props.confirmButtonClass) ? 'danger' : props.iconType)
const iconName = computed(() => ({ danger: 'trash', warning: 'warning', info: 'info', success: 'check' })[variant.value])
const eyebrow = computed(() => ({ danger: 'KONFIRMASI TINDAKAN', warning: 'PERIKSA SEBELUM LANJUT', info: 'KONFIRMASI', success: 'BERHASIL' })[variant.value])
let opener: HTMLElement | null = null
let releaseScroll: (() => void) | null = null
let active = true
let openVersion = 0

const closeDialog = (restoreFocus = true) => {
  const wasOpen = dialogRef.value?.open
  dialogRef.value?.close()
  releaseScroll?.()
  releaseScroll = null
  confirmationRequested.value = false
  if (wasOpen && restoreFocus) {
    if (opener?.isConnected) opener.focus()
    else document.getElementById('main-content')?.focus()
  }
  opener = null
}
const handleCancel = () => {
  if (busy.value || !props.isOpen) return
  emit('update:isOpen', false)
  emit('cancel')
}
const handleConfirm = async () => {
  if (busy.value || !props.isOpen) return
  confirmationRequested.value = true
  emit('confirm')
  await nextTick()
  // Synchronous actions need not provide a loading state; async callers use isConfirming.
  if (!props.isConfirming) confirmationRequested.value = false
}
const handleBackdropClick = (event: MouseEvent) => {
  const dialog = dialogRef.value
  if (!props.closeOnOverlayClick || busy.value || !dialog || event.target !== dialog) return
  const rect = dialog.getBoundingClientRect()
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) handleCancel()
}
const handleNativeClose = () => {
  // Ignore a delayed native close event if the same dialog was already reopened.
  if (dialogRef.value?.open) return
  releaseScroll?.()
  releaseScroll = null
  confirmationRequested.value = false
  if (active && props.isOpen) { emit('update:isOpen', false); emit('cancel') }
}
watch(() => props.isOpen, async (open) => {
  const version = ++openVersion
  if (!open) { closeDialog(); return }
  confirmationRequested.value = false
  await nextTick()
  if (!active || version !== openVersion || !props.isOpen || !dialogRef.value || dialogRef.value.open) return
  opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  dialogRef.value.showModal()
  releaseScroll = lockModalScroll()
  // Native modal dialogs contain keyboard focus and make background controls inert.
  if (busy.value) dialogRef.value.focus()
  else cancelButtonRef.value?.focus()
}, { immediate: true })
watch(() => props.isConfirming, async (confirming) => {
  if (!confirming) confirmationRequested.value = false
  if (!props.isOpen) return
  await nextTick()
  if (!active || !props.isOpen) return
  if (busy.value) dialogRef.value?.focus()
  else cancelButtonRef.value?.focus()
})
onBeforeUnmount(() => { active = false; openVersion++; closeDialog(false) })
</script>
