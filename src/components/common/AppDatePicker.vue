<template>
  <div ref="root" class="date-picker" @keydown.esc.stop="close">
    <button :id="id" type="button" class="date-picker-trigger" :aria-expanded="open" :aria-controls="`${id}-calendar`" aria-haspopup="dialog" @click="toggle">
      <span>{{ displayDate }}</span><span aria-hidden="true">▦</span>
    </button>
    <div v-if="open" :id="`${id}-calendar`" class="date-picker-popover" role="dialog" aria-label="Pilih tanggal">
      <div class="date-picker-header"><button type="button" aria-label="Bulan sebelumnya" @click="moveMonth(-1)">‹</button><strong aria-live="polite">{{ monthLabel }}</strong><button type="button" aria-label="Bulan berikutnya" @click="moveMonth(1)">›</button></div>
      <div class="date-picker-grid"><span v-for="day in weekdays" :key="day" class="date-picker-weekday">{{ day }}</span><span v-for="blank in firstDay" :key="`blank-${blank}`"></span><button v-for="day in daysInMonth" :key="day" type="button" :class="{ selected: dayKey(day) === modelValue, today: dayKey(day) === today }" :aria-label="fullDate(day)" :aria-pressed="dayKey(day) === modelValue" @click="select(day)">{{ day }}</button></div>
      <button type="button" class="date-picker-today" @click="selectToday">Hari ini</button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { dateKey } from '@/utils/dateRange'

const props = defineProps<{ id: string; modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const root = ref<HTMLElement | null>(null)
const open = ref(false)
const month = ref(new Date())
const weekdays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const today = dateKey(new Date())
const parseDate = (value: string) => { const [year, month, day] = value.split('-').map(Number); return year && month && day ? new Date(year, month - 1, day) : new Date() }
const displayDate = computed(() => props.modelValue ? parseDate(props.modelValue).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Pilih tanggal')
const monthLabel = computed(() => month.value.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }))
const firstDay = computed(() => (new Date(month.value.getFullYear(), month.value.getMonth(), 1).getDay() + 6) % 7)
const daysInMonth = computed(() => new Date(month.value.getFullYear(), month.value.getMonth() + 1, 0).getDate())
const dayKey = (day: number) => dateKey(new Date(month.value.getFullYear(), month.value.getMonth(), day))
const fullDate = (day: number) => new Date(month.value.getFullYear(), month.value.getMonth(), day).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const toggle = () => { if (!open.value) month.value = parseDate(props.modelValue); open.value = !open.value }
const close = () => { if (open.value) { open.value = false; root.value?.querySelector<HTMLButtonElement>('.date-picker-trigger')?.focus() } }
const moveMonth = (offset: number) => { month.value = new Date(month.value.getFullYear(), month.value.getMonth() + offset, 1) }
const select = (day: number) => { emit('update:modelValue', dayKey(day)); close() }
const selectToday = () => { emit('update:modelValue', dateKey(new Date())); close() }
const outside = (event: MouseEvent) => { if (!root.value?.contains(event.target as Node)) open.value = false }
onMounted(() => document.addEventListener('click', outside))
onUnmounted(() => document.removeEventListener('click', outside))
</script>
<style scoped>
.date-picker { position: relative; }
.date-picker-trigger { width: 100%; min-height: 48px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; border: 1px solid var(--shell-border, #d8dedb); border-radius: 10px; background: var(--shell-surface, #fff); color: inherit; text-align: left; cursor: pointer; }
.date-picker-trigger:focus-visible, .date-picker-popover button:focus-visible { outline: 2px solid #2e8b57; outline-offset: 2px; }
.date-picker-popover { position: absolute; z-index: 20; top: calc(100% + 6px); left: 0; width: min(310px, 100%); min-width: 260px; padding: 14px; border: 1px solid var(--shell-border, #d8dedb); border-radius: 12px; background: var(--shell-surface, #fff); color: var(--shell-ink, #172b23); box-shadow: 0 12px 30px #0002; }
.dark .date-picker-popover, .dark .date-picker-trigger { background: #1e293b; color: #f1f5f9; border-color: #475569; }
.date-picker-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; text-transform: capitalize; }
.date-picker-header button, .date-picker-grid button { border: 0; background: transparent; color: inherit; cursor: pointer; border-radius: 8px; }
.date-picker-header button { width: 34px; height: 34px; font-size: 24px; }
.date-picker-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; text-align: center; }
.date-picker-weekday { padding: 7px 0; font-size: 11px; opacity: .65; }
.date-picker-grid button { aspect-ratio: 1; font-size: 13px; }
.date-picker-grid button:hover, .date-picker-header button:hover { background: #2e8b5720; }
.date-picker-grid button.today { box-shadow: inset 0 0 0 1px #2e8b57; }
.date-picker-grid button.selected { background: #2e8b57; color: white; }
.date-picker-today { display: block; margin: 12px auto 0; border: 0; background: transparent; color: #2e8b57; font-weight: 600; cursor: pointer; }
</style>
