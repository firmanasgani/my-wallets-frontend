<template>
  <li class="category-tree-item">
    <div class="category-tree-row">
      <button v-if="hasChildren" type="button" class="category-expand" :aria-label="`${expanded ? 'Tutup' : 'Buka'} subkategori ${category.categoryName}`"
        :aria-expanded="expanded" :aria-controls="`${id}-children`" @click="isExpanded = !isExpanded"><AppIcon name="chevron" :class="{ 'is-expanded': expanded }" /></button>
      <span v-else class="category-expand-spacer" aria-hidden="true"></span>
      <CategoryBadge :icon="category.icon" :color="category.color" />
      <div class="category-row-name">
        <button v-if="hasChildren" type="button" :aria-expanded="expanded" :aria-controls="`${id}-children`" @click="isExpanded = !isExpanded">{{ category.categoryName }}</button>
        <strong v-else>{{ category.categoryName }}</strong>
        <span>{{ level ? 'Subkategori' : 'Kategori utama' }}<span v-if="hasChildren"> · {{ category.subCategories?.length }} subkategori</span><span v-if="!category.userId"> · Bawaan</span></span>
      </div>
      <div class="category-row-actions print:hidden">
        <button type="button" class="category-icon-button" :disabled="disabled" :aria-label="`Edit kategori ${category.categoryName}`" title="Edit kategori" @click="emit('edit', category)"><AppIcon name="edit" /></button>
        <button v-if="category.userId" type="button" class="category-icon-button is-danger" :disabled="disabled" :aria-label="`Hapus kategori ${category.categoryName}`" title="Hapus kategori" @click="emit('delete', category)"><AppIcon name="trash" /></button>
      </div>
    </div>
    <ul v-if="hasChildren && expanded" :id="`${id}-children`" class="category-children">
      <CategoryItem v-for="child in category.subCategories" :key="child.id" :category="child" :level="level + 1"
        :expand-all="expandAll" :expansion-version="expansionVersion" :searching="searching" :disabled="disabled"
        @edit="emit('edit', $event)" @delete="emit('delete', $event)" />
    </ul>
  </li>
</template>
<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import type { Category } from '@/types/enums'
import AppIcon from '@/components/common/AppIcon.vue'
import CategoryBadge from './CategoryBadge.vue'
const props = withDefaults(defineProps<{ category: Category; level?: number; expandAll?: boolean; expansionVersion?: number; searching?: boolean; disabled?: boolean }>(), {
  level: 0, expandAll: false, expansionVersion: 0, searching: false, disabled: false,
})
const emit = defineEmits<{ edit: [category: Category]; delete: [category: Category] }>()
const id = useId()
const isExpanded = ref(props.expandAll || props.searching)
const hasChildren = computed(() => !!props.category.subCategories?.length)
const expanded = computed(() => isExpanded.value)
watch(() => props.expansionVersion, () => { isExpanded.value = props.expandAll })
watch(() => props.searching, (searching) => { isExpanded.value = searching || props.expandAll })
watch(() => props.category, () => { if (props.searching) isExpanded.value = true })
</script>
