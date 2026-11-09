<template>
  <div class="shell-nav-groups">
    <section v-for="group in visibleGroups" :key="group.label" class="shell-nav-group" :aria-label="group.label">
      <h2 class="shell-nav-label" :class="{ 'shell-sr-only': collapsed }">{{ group.label }}</h2>
      <ul>
        <li v-for="item in group.items" :key="item.route">
          <a v-if="item.href" :href="item.href" target="_blank" rel="noopener noreferrer"
            class="shell-nav-link" :title="collapsed ? item.label : undefined" @click="emit('navigate')">
            <AppIcon :name="item.icon" /><span :class="{ 'shell-sr-only': collapsed }">{{ item.label }}</span>
          </a>
          <RouterLink v-else :to="{ name: item.route }" class="shell-nav-link"
            :class="{ 'is-active': isNavigationActive(item, String(route.name || '')) }"
            :aria-current="isNavigationActive(item, String(route.name || '')) ? 'page' : undefined"
            :title="collapsed ? item.label : undefined" @click="emit('navigate')">
            <AppIcon :name="item.icon" /><span :class="{ 'shell-sr-only': collapsed }">{{ item.label }}</span>
          </RouterLink>
        </li>
      </ul>
    </section>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppIcon from '@/components/common/AppIcon.vue'
import { isNavigationActive, supportNavigation, type NavigationGroup } from '@/constants/navigation'

const props = withDefaults(defineProps<{ groups: NavigationGroup[]; collapsed?: boolean }>(), { collapsed: false })
const emit = defineEmits<{ navigate: [] }>()
const route = useRoute()
const authStore = useAuthStore()
const visibleGroups = computed(() => [...props.groups, supportNavigation].map((group) => ({
  ...group,
  items: group.items.filter((item) => !item.premium || authStore.currentUser?.subscriptionPlan !== 'FREE'),
})))
</script>
