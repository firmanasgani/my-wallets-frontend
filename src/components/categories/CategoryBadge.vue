<template>
  <span class="category-badge" :style="{ backgroundColor: color, color: categoryTextColor(color) }" aria-hidden="true">
    <i v-if="icon" :class="['fa-solid', `fa-${icon}`]"></i><AppIcon v-else name="tag" />
  </span>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { categoryTextColor, normalizeCategoryColor } from '@/utils/categoryTree'
const props = defineProps<{ icon?: string | null; color?: string | null }>()
const color = computed(() => normalizeCategoryColor(props.color) || '#a780f2')
</script>
