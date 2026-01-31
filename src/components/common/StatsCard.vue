<template>
  <div class="bg-white overflow-hidden shadow rounded-lg">
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
            <dt class="text-sm font-medium text-gray-500 truncate">
              {{ title }}
            </dt>
            <dd>
              <div class="text-lg font-medium text-gray-900">
                {{ value }}
              </div>
              <div v-if="subtitle || $slots.subtitle" class="text-xs text-slate-500">
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
  }>(),
  {
    variant: 'indigo',
    subtitle: '',
  },
)

const colorMap: Record<string, { bg: string; text: string }> = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
  green: { bg: 'bg-green-50', text: 'text-green-600' },
  red: { bg: 'bg-red-50', text: 'text-red-600' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  gray: { bg: 'bg-gray-50', text: 'text-gray-600' },
}

const colorParams = computed(() => {
  return colorMap[props.variant] || colorMap['indigo']
})
</script>
