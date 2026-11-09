<template>
  <AppSelect v-bind="$attrs" :id="inputId || undefined" :model-value="modelValue" :options="options"
    :label="label" :placeholder="placeholder" :required="required" :disabled="disabled"
    :helper-text="helperText" searchable @update:model-value="emit('update:modelValue', $event)" />
</template>

<script setup lang="ts">
import AppSelect from './AppSelect.vue'
import type { SelectOption } from '@/types/select'

// Compatibility API for the bank selectors already used throughout the app.
defineOptions({ inheritAttrs: false })
withDefaults(defineProps<{
  modelValue: string | null
  options: SelectOption<string | null>[]
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  helperText?: string
  inputId?: string
}>(), {
  label: '', placeholder: 'Pilih atau ketik untuk mencari...', required: false,
  disabled: false, helperText: '', inputId: '',
})
const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()
</script>
