<template>
  <input
    ref="inputRef"
    type="text"
    class="block w-full rounded-md border border-slate-300 bg-white shadow-sm px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-500 transition-colors"
    placeholder="0"
  />
</template>

<script setup lang="ts">
import { useCurrencyInput } from 'vue-currency-input'
import { watch } from 'vue'

interface Props {
  modelValue: number | null | undefined
  options?: any
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  options: () => ({}),
})

const emit = defineEmits(['update:modelValue'])

const { inputRef, setValue, numberValue } = useCurrencyInput({
  currency: 'IDR',
  locale: 'id-ID',
  hideCurrencySymbolOnFocus: false,
  hideGroupingSeparatorOnFocus: false,
  hideNegligibleDecimalDigitsOnFocus: false,
  autoDecimalDigits: true,
  useGrouping: true,
  accountingSign: false,
  currencyDisplay: 'hidden' as any, // Supported by library but not in default Intl types
  valueRange: { min: 0 },
  precision: 0,
  ...props.options,
})

watch(
  () => props.modelValue,
  (value) => {
    setValue(value) // Programmatically update input value if model changes externally
  },
)

watch(numberValue, (value) => {
  emit('update:modelValue', value)
})
</script>

