<template>
  <div class="shell-workspace" :class="{ 'is-compact': collapsed }">
    <p v-if="!collapsed" class="shell-nav-label">Workspace</p>
    <div class="shell-workspace-options" role="group" aria-label="Pilih workspace">
      <button v-for="mode in modes" :key="mode.value" type="button"
        :class="{ 'is-selected': wsStore.mode === mode.value }"
        :aria-pressed="wsStore.mode === mode.value" :aria-label="mode.label + (mode.value === 'business' && !isBusinessPlan ? ' (perlu paket bisnis)' : '')"
        :title="collapsed ? mode.label : undefined" @click="select(mode.value)">
        <AppIcon :name="mode.icon" />
        <span v-if="!collapsed">{{ mode.label }}</span>
        <AppIcon v-if="!collapsed && mode.value === 'business' && !isBusinessPlan" name="lock" class="workspace-lock" />
      </button>
    </div>
  </div>
  <Teleport to="body">
    <PricingModal :is-open="upgradeOpen" :business-only="true" @update:is-open="upgradeOpen = $event" />
  </Teleport>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkspaceStore, type WorkspaceMode } from '@/stores/workspace'
import { useAuthStore } from '@/stores/auth'
import PricingModal from '@/components/common/PricingModal.vue'
import AppIcon from '@/components/common/AppIcon.vue'

withDefaults(defineProps<{ collapsed?: boolean }>(), { collapsed: false })
const emit = defineEmits<{ navigate: []; upgrade: [] }>()
const wsStore = useWorkspaceStore()
const authStore = useAuthStore()
const router = useRouter()
const upgradeOpen = ref(false)
const isBusinessPlan = computed(() => authStore.currentUser?.subscriptionPlan?.startsWith('BUSINESS') ?? false)
const modes: { value: WorkspaceMode; label: string; icon: string }[] = [
  { value: 'personal', label: 'Personal', icon: 'user' },
  { value: 'business', label: 'Bisnis', icon: 'building' },
]
function select(mode: WorkspaceMode) {
  if (mode === 'business' && !isBusinessPlan.value) {
    upgradeOpen.value = true
    emit('upgrade')
    return
  }
  wsStore.setMode(mode)
  router.push({ name: mode === 'personal' ? 'personal-dashboard' : 'business-kpi' })
  emit('navigate')
}
</script>
