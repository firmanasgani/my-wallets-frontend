<template>
  <RouterView />
</template>

<script setup lang="ts">
import { useThemeStore } from './stores/theme'

// Initialize theme store to apply theme settings
useThemeStore()
</script>

<style></style>
