<template>
  <div class="money-select" :class="$attrs.class" :style="wrapperStyle" ref="root">
    <label v-if="label" :id="`${inputId}-label`" :for="inputId" class="ms-label">
      {{ label }} <span v-if="required" aria-hidden="true">*</span>
    </label>
    <button v-bind="controlAttrs" :id="inputId" ref="trigger" type="button" role="combobox" class="ms-trigger"
      :class="{ 'is-placeholder': !selectedOption, 'is-invalid': invalid || validationFailed }"
      :disabled="disabled" :aria-label="ariaLabel" :aria-labelledby="label ? `${inputId}-label` : undefined"
      :aria-expanded="isOpen" :aria-controls="`${inputId}-list`" aria-haspopup="listbox"
      :aria-activedescendant="isOpen && !searchable ? activeOptionId : undefined" :aria-required="required || undefined"
      :aria-invalid="invalid || validationFailed || undefined" :aria-describedby="describedBy"
      @click="isOpen ? close() : open()" @keydown="handleKeydown">
      <span>{{ selectedOption?.label || placeholder }}</span>
      <span v-if="loading" class="ms-spinner" aria-hidden="true"></span>
      <AppIcon v-else name="down" class="ms-chevron" :class="{ 'is-open': isOpen }" />
    </button>
    <input v-if="name || required" class="ms-validation" type="text" :name="name"
      :value="modelValue == null ? '' : String(modelValue)" :required="required" :disabled="disabled"
      tabindex="-1" aria-hidden="true" @invalid.prevent="handleInvalid" />
    <p v-if="helperText || validationFailed" :id="`${inputId}-hint`" class="ms-hint" :class="{ 'is-error': validationFailed }" :role="validationFailed ? 'alert' : undefined">
      {{ validationFailed ? 'Pilih salah satu pilihan untuk melanjutkan.' : helperText }}
    </p>

    <div v-if="isOpen" ref="panel" class="money-select ms-panel" :popover="supportsPopover ? 'manual' : undefined"
      :style="panelStyle" @keydown="handleKeydown">
      <div v-if="searchable" class="ms-search">
        <AppIcon name="search" />
        <input ref="searchInput" v-model="search" role="combobox" :aria-label="`Cari ${label || ariaLabel || 'pilihan'}`"
          aria-autocomplete="list" aria-expanded="true" :aria-controls="`${inputId}-list`" :aria-activedescendant="activeOptionId"
          type="search" placeholder="Ketik untuk mencari..." autocomplete="off" @input="resetActive" />
      </div>
      <div v-if="loading" class="ms-message" role="status">Memuat pilihan...</div>
      <ul v-else :id="`${inputId}-list`" ref="list" role="listbox" :aria-label="label || ariaLabel || 'Pilihan'" class="ms-list">
        <li v-for="(group, groupIndex) in groups" :key="groupIndex" role="group" :aria-label="group.label || undefined">
          <div v-if="group.label" class="ms-group-label" aria-hidden="true">{{ group.label }}</div>
          <ul role="presentation">
            <li v-for="entry in group.entries" :id="`${inputId}-option-${entry.index}`" :key="entry.index"
              role="option" :aria-selected="entry.option.value === modelValue" :aria-disabled="entry.option.disabled || undefined"
              :aria-label="entry.option.group ? `${entry.option.label}, ${entry.option.group}` : undefined"
              class="ms-option" :class="{ 'is-active': entry.index === activeIndex, 'is-selected': entry.option.value === modelValue, 'is-disabled': entry.option.disabled }"
              @mouseenter="!entry.option.disabled && (activeIndex = entry.index)" @pointerdown.prevent @click="choose(entry.option)">
              <span><strong>{{ entry.option.label }}</strong><small v-if="entry.option.description">{{ entry.option.description }}</small></span>
              <span v-if="entry.option.value === modelValue" class="ms-check" aria-hidden="true">✓</span>
            </li>
          </ul>
        </li>
        <li v-if="!filteredOptions.length" role="presentation" class="ms-message">{{ search ? 'Tidak ada pilihan yang cocok.' : emptyText }}</li>
      </ul>
      <span v-if="searchable && !loading" class="ms-sr-only" role="status">{{ filteredOptions.length }} pilihan ditemukan.</span>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends SelectValue">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, useId, watch, type StyleValue } from 'vue'
import AppIcon from './AppIcon.vue'
import type { SelectOption, SelectValue } from '@/types/select'
import { filterSelectOptions, nextSelectIndex } from '@/utils/select'
import '@/assets/select.css'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  modelValue?: T
  options: readonly SelectOption<T>[]
  id?: string
  label?: string
  ariaLabel?: string
  placeholder?: string
  searchable?: boolean
  disabled?: boolean
  loading?: boolean
  invalid?: boolean
  required?: boolean
  helperText?: string
  emptyText?: string
  name?: string
}>(), {
  placeholder: 'Pilih salah satu', searchable: false, disabled: false, loading: false,
  invalid: false, required: false, emptyText: 'Belum ada pilihan.',
})
const emit = defineEmits<{ 'update:modelValue': [value: T]; change: [value: T] }>()
const attrs = useAttrs()
const wrapperStyle = computed(() => attrs.style as StyleValue)
const autoId = useId()
const inputId = computed(() => props.id || `select-${autoId}`)
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLDivElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)
const list = ref<HTMLUListElement | null>(null)
const isOpen = ref(false)
const search = ref('')
const activeIndex = ref(-1)
const validationFailed = ref(false)
const panelStyle = ref<Record<string, string>>({})
const supportsPopover = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype
const controlAttrs = computed(() => Object.fromEntries(Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style' && key !== 'aria-describedby')))
const describedBy = computed(() => [attrs['aria-describedby'], (props.helperText || validationFailed.value) ? `${inputId.value}-hint` : ''].filter(Boolean).join(' ') || undefined)
const selectedOption = computed(() => props.options.find((option) => option.value === props.modelValue))
const filteredOptions = computed(() => filterSelectOptions(props.options, search.value))
const activeOptionId = computed(() => !props.loading && activeIndex.value >= 0 ? `${inputId.value}-option-${activeIndex.value}` : undefined)
const groups = computed(() => {
  const result: { label: string; entries: { option: SelectOption<T>; index: number }[] }[] = []
  filteredOptions.value.forEach((option, index) => {
    const label = option.group || ''
    if (!result.length || result[result.length - 1]?.label !== label) result.push({ label, entries: [] })
    result[result.length - 1]!.entries.push({ option, index })
  })
  return result
})
const updatePosition = () => {
  if (!trigger.value || !isOpen.value) return
  const rect = trigger.value.getBoundingClientRect()
  const viewport = window.visualViewport
  const bottom = (viewport?.offsetTop || 0) + (viewport?.height || window.innerHeight)
  const top = viewport?.offsetTop || 0
  const below = bottom - rect.bottom - 12
  const above = rect.top - top - 12
  const upward = below < 220 && above > below
  const height = Math.max(80, Math.min(320, upward ? above : below))
  const width = Math.min(Math.max(rect.width, 200), window.innerWidth - 24)
  const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12))
  panelStyle.value = {
    left: `${left}px`, width: `${width}px`, maxHeight: `${height}px`,
    ...(upward ? { bottom: `${window.innerHeight - rect.top + 6}px` } : { top: `${rect.bottom + 6}px` }),
  }
}
const scrollActive = async () => {
  await nextTick()
  list.value?.querySelector<HTMLElement>(`[id="${inputId.value}-option-${activeIndex.value}"]`)?.scrollIntoView({ block: 'nearest' })
}
const resetActive = () => { activeIndex.value = nextSelectIndex(filteredOptions.value, -1, 1); scrollActive() }
const open = async (direction: 1 | -1 = 1) => {
  if (props.disabled || isOpen.value) return
  search.value = ''
  const selected = filteredOptions.value.findIndex((option) => option.value === props.modelValue && !option.disabled)
  activeIndex.value = selected >= 0 ? selected : nextSelectIndex(filteredOptions.value, direction === 1 ? -1 : 0, direction)
  isOpen.value = true
  await nextTick()
  if (!isOpen.value || !panel.value) return
  updatePosition()
  if (supportsPopover) panel.value.showPopover()
  if (props.searchable) searchInput.value?.focus()
  scrollActive()
}
const close = (restoreFocus = true) => {
  if (supportsPopover && panel.value?.matches(':popover-open')) panel.value.hidePopover()
  isOpen.value = false
  search.value = ''
  if (restoreFocus) trigger.value?.focus()
}
const choose = (option: SelectOption<T>) => {
  if (props.disabled || props.loading || option.disabled) return
  validationFailed.value = false
  const changed = option.value !== props.modelValue
  emit('update:modelValue', option.value)
  if (changed) emit('change', option.value)
  close()
}
let typeahead = ''
let typeaheadTimer: ReturnType<typeof setTimeout> | undefined
const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return
  if (event.key === 'Escape' && isOpen.value) { event.preventDefault(); event.stopPropagation(); close(); return }
  if (event.key === 'Tab' && isOpen.value) { trigger.value?.focus(); close(false); return }
  const editing = event.target === searchInput.value
  if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) && !(editing && ['Home', 'End'].includes(event.key))) {
    event.preventDefault(); event.stopPropagation()
    const direction = event.key === 'ArrowUp' || event.key === 'End' ? -1 : 1
    if (!isOpen.value) { open(direction); return }
    const from = event.key === 'Home' ? -1 : event.key === 'End' ? 0 : activeIndex.value
    activeIndex.value = nextSelectIndex(filteredOptions.value, from, direction)
    scrollActive(); return
  }
  if ((event.key === 'Enter' || (event.key === ' ' && !editing))) {
    event.preventDefault(); event.stopPropagation()
    if (!isOpen.value) open()
    else { const option = filteredOptions.value[activeIndex.value]; if (option) choose(option) }
    return
  }
  if (!editing && !props.searchable && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault()
    if (typeaheadTimer) clearTimeout(typeaheadTimer)
    typeahead += event.key.toLocaleLowerCase()
    typeaheadTimer = setTimeout(() => { typeahead = '' }, 600)
    if (!isOpen.value) open()
    const index = filteredOptions.value.findIndex((option) => !option.disabled && option.label.toLocaleLowerCase().startsWith(typeahead))
    if (index >= 0) { activeIndex.value = index; scrollActive() }
  }
}
const handleInvalid = () => { validationFailed.value = true; trigger.value?.focus() }
const handleOutside = (event: PointerEvent) => { if (isOpen.value && !root.value?.contains(event.target as Node)) close(false) }
watch(() => props.disabled, (disabled) => { if (disabled) close(false) })
watch(() => props.modelValue, () => { validationFailed.value = false })
watch(() => props.options, () => { if (isOpen.value) resetActive() })
onMounted(() => {
  document.addEventListener('pointerdown', handleOutside)
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', updatePosition, true)
  window.visualViewport?.addEventListener('resize', updatePosition)
})
onBeforeUnmount(() => {
  if (typeaheadTimer) clearTimeout(typeaheadTimer)
  document.removeEventListener('pointerdown', handleOutside)
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
  window.visualViewport?.removeEventListener('resize', updatePosition)
})
</script>
