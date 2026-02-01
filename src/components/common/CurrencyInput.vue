<template>
  <input
    ref="inputRef"
    type="text"
    class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-lg border-slate-300 rounded-md py-3 placeholder:text-slate-300 font-semibold text-slate-900"
    placeholder="0"
  />
</template>

<script setup lang="ts">
import { useCurrencyInput } from 'vue-currency-input'
import { watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: null,
  },
  options: {
    type: Object,
    default: () => ({}),
  },
})

const { inputRef, setValue } = useCurrencyInput({
  currency: 'IDR',
  locale: 'id-ID',
  hideCurrencySymbolOnFocus: false,
  hideGroupingSeparatorOnFocus: false,
  hideNegligibleDecimalDigitsOnFocus: false,
  autoDecimalDigits: true,
  useGrouping: true,
  accountingSign: false,
  currencyDisplay: 'hidden', // We have a prefix in the parent design
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
</script>
