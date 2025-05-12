<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto bg-slate-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4"
      @keydown.esc="handleCancel"
      tabindex="-1"
      ref="modalBackdropRef"
      @click.self="handleOverlayClick"
    >
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        enter-to-class="opacity-100 translate-y-0 sm:scale-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0 sm:scale-100"
        leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      >
        <div
          v-if="isOpen"
          class="bg-white rounded-lg shadow-xl transform transition-all sm:max-w-lg sm:w-full overflow-hidden"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          ref="modalContentRef"
        >
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div class="sm:flex sm:items-start">
              <div
                :class="[
                  'mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10',
                  iconBgClass,
                ]"
              >
                <slot name="icon">
                  <svg
                    class="h-6 w-6 text-red-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                    />
                  </svg>
                </slot>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 :id="titleId" class="text-lg leading-6 font-medium text-gray-900">
                  <slot name="title">{{ title }}</slot>
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    <slot name="message">{{ message }}</slot>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div
            class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse space-y-2 sm:space-y-0 sm:space-x-reverse sm:space-x-3"
          >
            <button
              type="button"
              :class="[
                'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50',
                confirmButtonClass,
              ]"
              @click="handleConfirm"
              :disabled="isConfirming"
              ref="confirmButtonRef"
            >
              <LoadingSpinner
                v-if="isConfirming"
                :visible="true"
                size="xs"
                color="text-white"
                class="-ml-1 mr-2"
              />
              <slot name="confirmButtonText">{{ confirmButtonText }}</slot>
            </button>
            <button
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50"
              @click="handleCancel"
              :disabled="isConfirming"
            >
              <slot name="cancelButtonText">{{ cancelButtonText }}</slot>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'

interface Props {
  isOpen: boolean
  title?: string
  message?: string
  confirmButtonText?: string
  cancelButtonText?: string
  confirmButtonClass?: string
  iconType?: 'warning' | 'danger' | 'info' | 'success'
  isConfirming?: boolean // Untuk menampilkan loading di tombol konfirmasi
  closeOnOverlayClick?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  title: 'Konfirmasi Aksi',
  message: 'Apakah Anda yakin ingin melanjutkan aksi ini?',
  confirmButtonText: 'Ya, Lanjutkan',
  cancelButtonText: 'Batal',
  confirmButtonClass: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
  iconType: 'warning',
  isConfirming: false,
  closeOnOverlayClick: true,
})

const emit = defineEmits(['update:isOpen', 'confirm', 'cancel'])

const modalBackdropRef = ref<HTMLElement | null>(null)
const modalContentRef = ref<HTMLElement | null>(null)
const confirmButtonRef = ref<HTMLButtonElement | null>(null)
const titleId = computed(() => `modal-title-${Math.random().toString(36).substring(7)}`)

const iconBgClass = computed(() => {
  switch (props.iconType) {
    case 'danger':
    case 'warning':
      return 'bg-red-100'
    case 'info':
      return 'bg-blue-100'
    case 'success':
      return 'bg-green-100'
    default:
      return 'bg-red-100' // Default untuk konfirmasi delete
  }
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('update:isOpen', false)
  emit('cancel')
}

const handleOverlayClick = () => {
  if (props.closeOnOverlayClick) {
    handleCancel()
  }
}

// Fokus ke tombol konfirmasi saat modal terbuka
watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      nextTick(() => {
        confirmButtonRef.value?.focus()
        // Jika Anda ingin modal bisa ditutup dengan tombol Escape
        modalBackdropRef.value?.focus() // Set focus ke backdrop untuk keydown listener
      })
    }
  },
)
</script>
