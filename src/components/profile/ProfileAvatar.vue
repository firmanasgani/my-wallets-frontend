<template>
  <div class="profile-avatar" :class="{ 'is-large': large }" :aria-busy="busy || undefined"><img v-if="src && !failed" :src="src" :alt="`Foto profil ${name || username || 'pengguna'}`" @error="failed = true" /><span v-else :aria-label="`Inisial ${name || username || 'pengguna'}`">{{ profileInitials(name, username) }}</span><div v-if="busy" class="profile-avatar-progress" role="status"><span class="profile-spinner" aria-hidden="true"></span><span class="shell-sr-only">Memperbarui foto profil...</span></div></div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { profileInitials } from '@/utils/profile'
const props = defineProps<{ src?: string | null; name?: string | null; username?: string; busy?: boolean; large?: boolean }>()
const failed = ref(false)
watch(() => props.src, () => { failed.value = false })
</script>
