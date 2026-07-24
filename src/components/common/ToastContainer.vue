<template>
  <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 rounded-xl border-l-4 bg-white dark:bg-slate-800 shadow-lg px-4 py-3"
        :class="borderClass(toast.type)"
      >
        <i :class="['mt-0.5 text-lg', iconClass(toast.type)]"></i>
        <p class="flex-1 text-sm text-gray-700 dark:text-slate-200">{{ toast.message }}</p>
        <button
          @click="toastStore.dismiss(toast.id)"
          class="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToastStore, type ToastType } from '@/stores/toast'

const toastStore = useToastStore()

const borderClass = (type: ToastType) => {
  if (type === 'success') return 'border-[#2E8B57]'
  if (type === 'error') return 'border-red-500'
  return 'border-blue-500'
}

const iconClass = (type: ToastType) => {
  if (type === 'success') return 'fa-solid fa-circle-check text-[#2E8B57] dark:text-emerald-400'
  if (type === 'error') return 'fa-solid fa-circle-xmark text-red-500'
  return 'fa-solid fa-circle-info text-blue-500'
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(24px);
}
</style>
