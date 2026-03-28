<template>
  <div
    class="bg-white overflow-hidden shadow rounded-lg dark:bg-slate-800 transition-all duration-200"
    :class="[
      onClick ? 'cursor-pointer hover:shadow-md' : '',
      active ? `ring-2 ${colorParams.ring}` : '',
    ]"
    @click="onClick?.($event)"
  >
    <div class="p-5">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div :class="['rounded-md p-3', colorParams.bg]">
            <!-- Icon Slot: Icons should use 'text-current' or inherit color to match the theme -->
            <span :class="['h-6 w-6 block', colorParams.text]">
              <slot name="icon"></slot>
            </span>
          </div>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate dark:text-white">
              {{ title }}
            </dt>
            <dd>
              <div class="text-lg font-medium text-gray-900 dark:text-white">
                {{ value }}
              </div>
              <div v-if="subtitle || $slots.subtitle" class="text-xs text-slate-500 dark:text-white">
                <slot name="subtitle">{{ subtitle }}</slot>
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    value: string | number
    variant?: 'indigo' | 'green' | 'red' | 'blue' | 'yellow' | 'purple' | 'gray'
    subtitle?: string
    active?: boolean
    onClick?: (event: MouseEvent) => void
  }>(),
  {
    variant: 'indigo',
    subtitle: '',
    active: false,
    onClick: undefined,
  },
)

const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  indigo: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-500' },
  green: { bg: 'bg-green-50', text: 'text-green-600', ring: 'ring-green-500' },
  red: { bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-500' },
  blue: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-500' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', ring: 'ring-yellow-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-500' },
  gray: { bg: 'bg-gray-50', text: 'text-gray-600', ring: 'ring-gray-500' },
}

const colorParams = computed(() => {
  return colorMap[props.variant] || colorMap['indigo']
})
</script>
