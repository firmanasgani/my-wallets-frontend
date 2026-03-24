<template>
  <div class="relative" ref="containerRef">
    <!-- Trigger button -->
    <button
      type="button"
      @click="toggleDropdown"
      class="appearance-none flex items-center w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg py-3 pl-3 pr-10 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-left"
      :class="{ 'ring-1 ring-indigo-500 border-indigo-500': isOpen }"
    >
      <!-- Selected category display -->
      <template v-if="selectedCategory">
        <span
          class="inline-flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0 mr-2"
          :style="{ backgroundColor: selectedCategory.color || '#CBD5E1' }"
        >
          <i
            v-if="selectedCategory.icon"
            :class="['fa-solid', `fa-${selectedCategory.icon}`, 'text-xs', 'text-white']"
          ></i>
          <i v-else class="fa-solid fa-tag text-xs text-white"></i>
        </span>
        <span class="truncate">{{ selectedCategory.parentPrefix }}{{ selectedCategory.categoryName }}</span>
      </template>
      <span v-else class="text-slate-400 dark:text-slate-500">Pilih kategori...</span>
    </button>

    <!-- Chevron icon -->
    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
      <svg class="h-4 w-4 transition-transform" :class="{ 'rotate-180': isOpen }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </div>

    <!-- Dropdown list -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <ul
        v-if="isOpen"
        class="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 shadow-lg max-h-60 rounded-lg py-1 text-sm border border-slate-200 dark:border-slate-600 overflow-auto focus:outline-none"
      >
        <li
          v-for="cat in categories"
          :key="cat.id"
          @click="selectCategory(cat)"
          class="flex items-center px-3 py-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          :class="{
            'bg-indigo-50 dark:bg-indigo-900/30': modelValue === cat.id,
            'pl-6': cat.parentPrefix,
          }"
        >
          <span
            class="inline-flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0 mr-2.5"
            :style="{ backgroundColor: cat.color || '#CBD5E1' }"
          >
            <i
              v-if="cat.icon"
              :class="['fa-solid', `fa-${cat.icon}`, 'text-xs', 'text-white']"
            ></i>
            <i v-else class="fa-solid fa-tag text-xs text-white"></i>
          </span>
          <span class="text-slate-800 dark:text-slate-200 truncate">
            {{ cat.parentPrefix }}{{ cat.categoryName }}
          </span>
          <svg
            v-if="modelValue === cat.id"
            class="ml-auto h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </li>
        <li v-if="categories.length === 0" class="px-3 py-2.5 text-slate-400 dark:text-slate-500 text-sm italic">
          Tidak ada kategori tersedia.
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

interface CategoryOption {
  id: string
  categoryName: string
  icon?: string | null
  color?: string | null
  parentPrefix?: string
}

const props = defineProps<{
  modelValue: string
  categories: CategoryOption[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const selectedCategory = computed(() =>
  props.categories.find((c) => c.id === props.modelValue) ?? null,
)

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function selectCategory(cat: CategoryOption) {
  emit('update:modelValue', cat.id)
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', handleClickOutside))
</script>
