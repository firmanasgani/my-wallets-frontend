<template>
  <div v-bind="$attrs" class="money-date-range dr-field">
    <label :for="`${id}-trigger`">{{ label }}</label>
    <button :id="`${id}-trigger`" ref="trigger" type="button" class="dr-trigger"
      aria-haspopup="dialog" :aria-expanded="isOpen" :aria-controls="`${id}-dialog`" :disabled="disabled" @click="open">
      <AppIcon name="calendar" /><span>{{ rangeLabel }}</span><AppIcon name="down" />
    </button>
  </div>
  <Teleport to="body">
    <dialog :id="`${id}-dialog`" ref="dialog" class="money-date-range dr-dialog"
      :aria-labelledby="`${id}-title`" @cancel.prevent="cancel" @close="handleNativeClose"
      @click="handleBackdrop" @keydown.esc.stop.prevent="cancel">
      <div class="dr-panel">
        <header class="dr-header">
          <div><span class="dr-eyebrow">PERIODE PILIHANMU</span><h2 :id="`${id}-title`">Pilih rentang tanggal</h2></div>
          <button type="button" class="dr-icon-button" aria-label="Tutup pemilih tanggal" @click="cancel"><AppIcon name="close" /></button>
        </header>
        <div class="dr-body">
          <aside class="dr-presets" aria-label="Periode cepat">
            <button v-for="preset in presets" :key="preset.value" type="button"
              :aria-pressed="activePreset === preset.value" :class="{ 'is-active': activePreset === preset.value }"
              @click="selectPreset(preset.value)">{{ preset.label }}</button>
            <span class="dr-custom-label">Atau pilih tanggal sendiri di kalender.</span>
          </aside>
          <div class="dr-calendar-area">
            <div class="dr-inputs">
              <div><label :for="`${id}-start`">Tanggal mulai</label>
                <input :id="`${id}-start`" ref="startInput" v-model="draft.startDate" type="date"
                  :aria-invalid="!!validationError" :aria-describedby="`${id}-status`" @change="syncMonthFromInput" />
              </div>
              <span aria-hidden="true">→</span>
              <div><label :for="`${id}-end`">Tanggal akhir</label>
                <input :id="`${id}-end`" v-model="draft.endDate" type="date"
                  :aria-invalid="!!validationError" :aria-describedby="`${id}-status`" @change="syncMonthFromInput" />
              </div>
            </div>
            <div class="dr-month-controls">
              <button type="button" class="dr-icon-button" aria-label="Bulan sebelumnya" @click="moveMonth(-1)"><AppIcon name="chevron" class="dr-back-arrow" /></button>
              <div class="dr-month-jump">
                <label class="dr-sr-only" :for="`${id}-month`">Bulan</label>
                <AppSelect :id="`${id}-month`" class="dr-month-select" aria-label="Bulan" :model-value="viewMonth.getMonth()" :options="monthOptions" @change="jumpMonth" />
                <label class="dr-sr-only" :for="`${id}-year`">Tahun</label>
                <input :id="`${id}-year`" type="number" min="1" max="9999" :value="viewMonth.getFullYear()" @change="jumpYear" />
              </div>
              <button type="button" class="dr-icon-button" aria-label="Bulan berikutnya" @click="moveMonth(1)"><AppIcon name="chevron" /></button>
            </div>
            <div class="dr-calendars" @mouseleave="hoverDay = ''">
              <section v-for="(month, index) in months" :key="dateKey(month)" class="dr-month" :class="{ 'is-second': index === 1 }"
                :aria-label="monthLabel(month)">
                <h3>{{ monthLabel(month) }}</h3>
                <div class="dr-weekdays" aria-hidden="true"><span v-for="day in weekdays" :key="day">{{ day }}</span></div>
                <div class="dr-days">
                  <template v-for="(day, cell) in calendarDays(month)" :key="cell">
                    <button v-if="day" type="button" :data-date="day" :tabindex="day === focusedDay ? 0 : -1"
                      :aria-label="dayLabel(day)" :aria-pressed="day === draft.startDate || day === draft.endDate"
                      :aria-current="day === dateKey(new Date()) ? 'date' : undefined"
                      :class="{ 'is-endpoint': day === draft.startDate || day === draft.endDate, 'is-in-range': isInRange(day), 'is-today': day === dateKey(new Date()) }"
                      @focus="focusedDay = day" @mouseenter="hoverDay = day" @click="selectDay(day)" @keydown="handleDayKey($event, day)">
                      {{ Number(day.slice(-2)) }}
                    </button>
                    <span v-else aria-hidden="true"></span>
                  </template>
                </div>
              </section>
            </div>
            <p :id="`${id}-status`" class="dr-status" :class="{ 'is-error': validationError }" aria-live="polite">
              {{ validationError || (awaitingEnd ? 'Pilih tanggal akhir. Tanggal yang sama juga bisa dipilih.' : 'Klik tanggal mulai, lalu tanggal akhir. Gunakan tombol panah untuk berpindah hari.') }}
            </p>
          </div>
        </div>
        <footer class="dr-footer">
          <span>{{ draftLabel }}</span>
          <div><button type="button" class="dr-button" @click="cancel">Batal</button>
            <button type="button" class="dr-button is-primary" :disabled="!canApply" @click="apply">Terapkan</button></div>
        </footer>
      </div>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, useId } from 'vue'
import AppIcon from './AppIcon.vue'
import AppSelect from './AppSelect.vue'
import { calendarDays, dateKey, monthOffset, orderedRange, parseDate, presetRange, type DatePreset, type DateRange } from '@/utils/dateRange'
import '@/assets/date-range.css'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ startDate?: string | null; endDate?: string | null; label?: string; disabled?: boolean }>(), {
  label: 'Rentang tanggal', disabled: false,
})
const emit = defineEmits<{ apply: [range: DateRange] }>()
const id = useId()
const trigger = ref<HTMLButtonElement | null>(null)
const dialog = ref<HTMLDialogElement | null>(null)
const startInput = ref<HTMLInputElement | null>(null)
const isOpen = ref(false)
const draft = reactive<DateRange>({ startDate: '', endDate: '' })
const viewMonth = ref(monthOffset(new Date(), 0))
const focusedDay = ref(dateKey(new Date()))
const hoverDay = ref('')
const awaitingEnd = ref(false)
const months = computed(() => [viewMonth.value, monthOffset(viewMonth.value, 1)].filter((date) => date.getFullYear() <= 9999))
const weekdays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const monthNames = Array.from({ length: 12 }, (_, index) => new Date(2024, index, 1).toLocaleDateString('id-ID', { month: 'long' }))
const monthOptions = monthNames.map((label, value) => ({ value, label }))
const presets: { value: DatePreset; label: string }[] = [
  { value: 'today', label: 'Hari ini' }, { value: 'yesterday', label: 'Kemarin' }, { value: 'week', label: '7 hari terakhir' },
  { value: 'month', label: 'Bulan ini' }, { value: 'lastMonth', label: 'Bulan lalu' }, { value: 'year', label: 'Tahun ini' },
]
const monthLabel = (date: Date) => date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
const dayLabel = (value: string) => parseDate(value)?.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) || value
const shortDate = (value?: string | null) => parseDate(value)?.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) || 'Pilih tanggal'
const rangeLabel = computed(() => !props.startDate && !props.endDate ? 'Pilih periode' : `${shortDate(props.startDate)} – ${shortDate(props.endDate)}`)
const draftLabel = computed(() => `${shortDate(draft.startDate)} – ${shortDate(draft.endDate)}`)
const validationError = computed(() => {
  if (!draft.startDate || !draft.endDate) return ''
  if (!parseDate(draft.startDate) || !parseDate(draft.endDate)) return 'Masukkan tanggal yang valid.'
  return draft.startDate > draft.endDate ? 'Tanggal mulai harus sama atau lebih awal dari tanggal akhir.' : ''
})
const canApply = computed(() => !props.disabled && !!parseDate(draft.startDate) && !!parseDate(draft.endDate) && !validationError.value)
const activePreset = computed(() => presets.find(({ value }) => {
  const range = presetRange(value)
  return range.startDate === draft.startDate && range.endDate === draft.endDate
})?.value)
let previousOverflow: string | null = null
const restoreScroll = () => {
  if (previousOverflow !== null) { document.body.style.overflow = previousOverflow; previousOverflow = null }
}
const open = async () => {
  if (props.disabled || isOpen.value) return
  draft.startDate = props.startDate || ''
  draft.endDate = props.endDate || ''
  awaitingEnd.value = false
  hoverDay.value = ''
  const date = parseDate(draft.startDate) || parseDate(draft.endDate) || new Date()
  viewMonth.value = monthOffset(date, 0)
  focusedDay.value = dateKey(date)
  isOpen.value = true
  await nextTick()
  if (!dialog.value || !isOpen.value) return
  dialog.value.showModal()
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  startInput.value?.focus()
}
const close = () => {
  isOpen.value = false
  dialog.value?.close()
  restoreScroll()
  trigger.value?.focus()
}
const cancel = () => close()
const handleNativeClose = () => { isOpen.value = false; restoreScroll() }
const handleBackdrop = (event: MouseEvent) => {
  const element = dialog.value
  if (!element || event.target !== element) return
  const bounds = element.getBoundingClientRect()
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) cancel()
}
const apply = () => {
  if (!canApply.value) return
  emit('apply', { ...draft })
  close()
}
const selectDay = (day: string) => {
  focusedDay.value = day
  if (!awaitingEnd.value) { draft.startDate = day; draft.endDate = ''; awaitingEnd.value = true }
  else { Object.assign(draft, orderedRange(draft.startDate, day)); awaitingEnd.value = false }
}
const isInRange = (day: string) => {
  if (!draft.startDate) return false
  const end = draft.endDate || (awaitingEnd.value ? hoverDay.value : '')
  if (!end) return false
  const range = orderedRange(draft.startDate, end)
  return day > range.startDate && day < range.endDate
}
const syncMonthFromInput = () => {
  awaitingEnd.value = !draft.endDate && !!draft.startDate
  const date = parseDate(draft.startDate) || parseDate(draft.endDate)
  if (date) { viewMonth.value = monthOffset(date, 0); focusedDay.value = dateKey(date) }
}
const selectPreset = (value: DatePreset) => { Object.assign(draft, presetRange(value)); awaitingEnd.value = false; syncMonthFromInput() }
const moveMonth = (offset: number) => {
  const next = monthOffset(viewMonth.value, offset)
  if (next.getFullYear() < 1 || next.getFullYear() > 9999) return
  viewMonth.value = next
  focusedDay.value = dateKey(next)
}
const jumpMonth = (month: number) => moveMonth(month - viewMonth.value.getMonth())
const jumpYear = (event: Event) => {
  const input = event.target as HTMLInputElement
  const year = Number(input.value)
  if (Number.isInteger(year) && year >= 1 && year <= 9999) moveMonth((year - viewMonth.value.getFullYear()) * 12)
  else input.value = String(viewMonth.value.getFullYear())
}
const handleDayKey = async (event: KeyboardEvent, day: string) => {
  const date = parseDate(day)
  if (!date) return
  const delta: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
  if (event.key in delta) date.setDate(date.getDate() + delta[event.key]!)
  else if (event.key === 'Home') date.setDate(date.getDate() - (date.getDay() + 6) % 7)
  else if (event.key === 'End') date.setDate(date.getDate() + 6 - (date.getDay() + 6) % 7)
  else if (event.key === 'PageUp' || event.key === 'PageDown') {
    const target = monthOffset(date, event.key === 'PageUp' ? -1 : 1)
    const last = monthOffset(target, 1); last.setDate(0)
    target.setDate(Math.min(date.getDate(), last.getDate())); date.setTime(target.getTime())
  } else return
  event.preventDefault()
  if (date.getFullYear() < 1 || date.getFullYear() > 9999) return
  focusedDay.value = dateKey(date)
  // Keep keyboard focus in the first calendar, which is visible at every screen size.
  viewMonth.value = monthOffset(date, 0)
  await nextTick()
  dialog.value?.querySelector<HTMLButtonElement>(`[data-date="${focusedDay.value}"]`)?.focus()
}
onBeforeUnmount(() => { dialog.value?.close(); restoreScroll() })
</script>
