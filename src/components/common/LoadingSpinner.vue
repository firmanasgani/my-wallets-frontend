<template>
  <div
    v-if="visible"
    :class="[
      'flex flex-col items-center justify-center',
      overlay ? 'fixed inset-0 bg-slate-900 bg-opacity-30 z-50 backdrop-blur-sm' : 'relative', // Jika tidak overlay, posisinya relatif
    ]"
    @click.self="overlay && closeOnOverlayClick ? handleOverlayClick() : null"
  >
    <div
      :class="['p-4 rounded-lg', overlay && !transparentOverlayContent ? 'bg-white shadow-xl' : '']"
    >
      <svg
        :class="['animate-spin', spinnerSizeClass, color]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p v-if="text" :class="['mt-3 text-sm font-medium', textColorClass]">
        {{ text }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  visible?: boolean // Untuk mengontrol visibilitas dari parent
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: string // Class warna Tailwind, mis: 'text-indigo-600'
  textColor?: string // Class warna teks Tailwind, mis: 'text-slate-700'
  overlay?: boolean // Apakah menggunakan full-screen overlay
  transparentOverlayContent?: boolean // Jika true, konten di atas overlay tidak punya background/shadow
  closeOnOverlayClick?: boolean // Apakah bisa ditutup dengan klik overlay
  text?: string // Teks opsional di bawah spinner
}

const props = withDefaults(defineProps<Props>(), {
  visible: true, // Defaultnya terlihat jika komponen dirender
  size: 'md',
  color: 'text-indigo-600',
  textColor: 'text-slate-700',
  overlay: false,
  transparentOverlayContent: false,
  closeOnOverlayClick: false,
  text: '',
})

const emit = defineEmits(['update:visible'])

const spinnerSizeClass = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'h-5 w-5'
    case 'sm':
      return 'h-6 w-6'
    case 'md':
      return 'h-8 w-8'
    case 'lg':
      return 'h-10 w-10'
    case 'xl':
      return 'h-12 w-12'
    default:
      return 'h-8 w-8'
  }
})

const textColorClass = computed(() => {
  return props.textColor
})

const handleOverlayClick = () => {
  if (props.closeOnOverlayClick) {
    emit('update:visible', false)
  }
}
</script>

<style scoped>
/* Tidak ada style khusus diperlukan jika hanya menggunakan Tailwind */
</style>
