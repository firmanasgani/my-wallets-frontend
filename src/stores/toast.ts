import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
}

let nextId = 0

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  const dismiss = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  const show = (message: string, type: ToastType = 'success', durationMs = 3500) => {
    const id = nextId++
    toasts.value.push({ id, message, type })
    setTimeout(() => dismiss(id), durationMs)
    return id
  }

  return {
    toasts,
    show,
    dismiss,
  }
})
