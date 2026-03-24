<template>
  <RouterView />
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from './stores/theme'

const themeStore = useThemeStore()
const route = useRoute()

watch(
  () => route.meta,
  (meta) => {
    const isPublicPage = !meta?.requiresAuth
    if (isPublicPage) {
      document.documentElement.classList.remove('dark')
    } else {
      themeStore.applyTheme()
    }
  },
  { immediate: true },
)
</script>

<style></style>
