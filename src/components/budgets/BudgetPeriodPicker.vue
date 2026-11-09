<template>
  <div class="budget-period-picker">
    <AppSelect :id="`${id}-month`" :model-value="month" :options="budgetMonthOptions" label="Bulan" :disabled="disabled" @update:model-value="$emit('update:month', $event)" />
    <AppSelect :id="`${id}-year`" :model-value="year" :options="budgetYearOptions" label="Tahun" searchable :disabled="disabled" @update:model-value="$emit('update:year', $event)" />
  </div>
</template>
<script setup lang="ts">
import AppSelect from '@/components/common/AppSelect.vue'
import { budgetMonthOptions, budgetYearOptions } from '@/utils/budget'
defineProps<{ id: string; year: number; month: number; disabled?: boolean }>()
defineEmits<{ 'update:year': [value: number]; 'update:month': [value: number] }>()
</script>
