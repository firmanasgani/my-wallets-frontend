<template>
  <li class="bg-white rounded-md shadow">
    <div class="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
      <div class="flex items-center">
        <span
          class="w-6 h-6 rounded-full flex items-center justify-center mr-3 text-white text-xs"
          :style="{ backgroundColor: category.color || '#CBD5E1' }"
          :title="category.categoryName"
        >
          <svg
            v-if="category.icon === 'briefcase'"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-4 h-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M20.25 14.15v4.073a2.25 2.25 0 0 1-2.25 2.25h-12a2.25 2.25 0 0 1-2.25-2.25v-4.073M15.75 10.5h-7.5a2.25 2.25 0 0 0-2.25 2.25v4.073a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-4.073a2.25 2.25 0 0 0-2.25-2.25Z"
            />
          </svg>
          <svg
            v-else-if="category.icon === 'utensils'"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-4 h-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.362 5.214A8.252 8.252 0 0 1 12 21M6.038 7.098A8.252 8.252 0 0 1 9.75 21M12 13.5A3.375 3.375 0 0 0 15.375 10.125V9.75A3.375 3.375 0 0 0 12 6.375V5.25A3.375 3.375 0 0 0 8.625 1.875M12 6.375A3.375 3.375 0 0 0 8.625 9.75V10.125A3.375 3.375 0 0 0 12 13.5Z"
            />
          </svg>
          <span v-else class="font-semibold">{{
            category.categoryName.charAt(0).toUpperCase()
          }}</span>
        </span>
        <span class="text-sm font-medium text-slate-700">{{ category.categoryName }}</span>
        <span
          v-if="!category.userId"
          class="ml-2 text-xs bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-full"
          >Default</span
        >
      </div>
      <div class="flex items-center space-x-2 print:hidden">
        <button
          @click="$emit('edit', category)"
          title="Edit Kategori"
          class="p-1 text-slate-500 hover:text-blue-600 rounded-md hover:bg-blue-50"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            ></path>
          </svg>
        </button>
        <button
          v-if="category.userId"
          @click="$emit('delete', category)"
          title="Hapus Kategori"
          class="p-1 text-slate-500 hover:text-red-600 rounded-md hover:bg-red-50"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            ></path>
          </svg>
        </button>
      </div>
    </div>
    <ul
      v-if="category.subCategories && category.subCategories.length > 0"
      class="ml-6 pl-3 border-l border-slate-200 space-y-1 pb-2 pr-2"
    >
      <CategoryItem
        v-for="subCategory in category.subCategories"
        :key="subCategory.id"
        :category="subCategory"
        :level="level + 1"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
// Impor tipe Category lagi di sini atau dari file global
interface Category {
  id: string
  categoryName: string
  categoryType: 'INCOME' | 'EXPENSE'
  icon?: string | null
  color?: string | null
  parentCategoryId?: string | null
  subCategories?: Category[]
  userId?: string | null // Untuk membedakan global/default (null) dengan user-specific
}

interface Props {
  category: Category
  level: number // Untuk indentasi atau styling berbeda berdasarkan level hierarki
}
const props = defineProps<Props>()

const emit = defineEmits(['edit', 'delete'])

// Contoh ikon sederhana berdasarkan prop 'icon'. Anda bisa kembangkan ini.
// Atau gunakan library ikon dan passing nama ikonnya.
</script>
