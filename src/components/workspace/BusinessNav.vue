<template>
  <WorkspaceNavigation :groups="businessNavigation" :collapsed="collapsed" @navigate="emit('navigate')" />
</template>
<script setup lang="ts">
import WorkspaceNavigation from './WorkspaceNavigation.vue'
import { businessNavigation } from '@/constants/navigation'
withDefaults(defineProps<{ collapsed?: boolean }>(), { collapsed: false })
const emit = defineEmits<{ navigate: [] }>()
</script>
