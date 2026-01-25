<template>
  <div class="relative" ref="dropdownRef">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-slate-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <input
        :id="inputId"
        type="text"
        v-model="searchQuery"
        @focus="openDropdown"
        @input="openDropdown"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          'border border-gray-300 rounded-lg block w-full px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-text',
        ]"
      />

      <!-- Icon -->
      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg
          class="h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </div>

    <!-- Dropdown List -->
    <div
      v-show="isOpen && filteredOptions.length > 0"
      class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
    >
      <ul class="py-1">
        <li
          v-for="(option, index) in filteredOptions"
          :key="option.value || `option-${index}`"
          @click="selectOption(option)"
          :class="[
            'px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors',
            modelValue === option.value
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'text-slate-700',
          ]"
        >
          {{ option.label }}
        </li>
      </ul>
    </div>

    <!-- No Results -->
    <div
      v-show="isOpen && filteredOptions.length === 0 && searchQuery"
      class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg"
    >
      <div class="px-3 py-2 text-sm text-slate-500 text-center">
        Tidak ada hasil untuk "{{ searchQuery }}"
      </div>
    </div>

    <!-- Helper Text -->
    <p v-if="helperText" class="text-xs text-slate-500 mt-1">
      {{ helperText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface Option {
  value: string | null
  label: string
}

interface Props {
  modelValue: string | null
  options: Option[]
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  helperText?: string
  inputId?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: 'Pilih atau ketik untuk mencari...',
  required: false,
  disabled: false,
  helperText: '',
  inputId: 'searchable-select',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const searchQuery = ref('')
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

// Computed untuk filter options berdasarkan search query
const filteredOptions = computed(() => {
  if (!searchQuery.value) {
    return props.options
  }

  const query = searchQuery.value.toLowerCase()
  return props.options.filter((option) => option.label.toLowerCase().includes(query))
})

// Watch untuk update search query ketika value berubah dari luar
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      const selectedOption = props.options.find((opt) => opt.value === newValue)
      if (selectedOption) {
        searchQuery.value = selectedOption.label
      }
    } else {
      searchQuery.value = ''
    }
  },
  { immediate: true },
)

const openDropdown = () => {
  if (!props.disabled) {
    isOpen.value = true
  }
}

const closeDropdown = () => {
  isOpen.value = false
  // Restore selected value jika ada
  if (props.modelValue) {
    const selectedOption = props.options.find((opt) => opt.value === props.modelValue)
    if (selectedOption) {
      searchQuery.value = selectedOption.label
    }
  } else {
    searchQuery.value = ''
  }
}

const selectOption = (option: Option) => {
  emit('update:modelValue', option.value)
  searchQuery.value = option.label
  isOpen.value = false
}

// Click outside handler
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Custom scrollbar untuk dropdown */
.overflow-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
