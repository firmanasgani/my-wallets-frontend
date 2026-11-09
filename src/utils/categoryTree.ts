import { FrontendCategoryType, type Category, type CreateCategoryPayload } from '@/types/enums'

export function flattenCategories(categories: Category[]): Category[] {
  const result: Category[] = []
  const seen = new Set<string>()
  const visit = (items: Category[]) => { for (const item of items) {
    if (seen.has(item.id)) continue
    seen.add(item.id); result.push(item); visit(item.subCategories || [])
  } }
  visit(categories)
  return result
}
export function categoryCounts(categories: Category[]) {
  const flat = flattenCategories(categories)
  return {
    total: flat.length,
    income: flat.filter((category) => category.categoryType === FrontendCategoryType.INCOME).length,
    expense: flat.filter((category) => category.categoryType === FrontendCategoryType.EXPENSE).length,
    parents: flat.filter((category) => !category.parentCategoryId).length,
    children: flat.filter((category) => !!category.parentCategoryId).length,
  }
}
export function filterCategoryTree(categories: Category[], search: string, descending = false): Category[] {
  const query = search.trim().toLocaleLowerCase()
  const visit = (items: Category[]): Category[] => items.flatMap((category) => {
    const matches = category.categoryName.toLocaleLowerCase().includes(query)
    const children = filterCategoryTree(category.subCategories || [], matches ? '' : query, descending)
    return matches || children.length ? [{ ...category, subCategories: children }] : []
  }).sort((a, b) => a.categoryName.localeCompare(b.categoryName, 'id-ID') * (descending ? -1 : 1))
  return visit(categories)
}
export function categoryParentOptions(categories: Category[], type: FrontendCategoryType, editingId?: string) {
  const excluded = new Set<string>()
  const edited = flattenCategories(categories).find((category) => category.id === editingId)
  if (edited) flattenCategories([edited]).forEach((category) => excluded.add(category.id))
  const result: { value: string; label: string }[] = []
  const visit = (items: Category[], depth = 0) => { for (const category of items) {
    if (excluded.has(category.id)) continue
    if (category.categoryType === type) result.push({ value: category.id, label: '— '.repeat(depth) + category.categoryName })
    visit(category.subCategories || [], depth + 1)
  } }
  visit(categories)
  return result
}
export function normalizeCategoryColor(value?: string | null) {
  const color = value?.trim() || ''
  if (/^#[\da-f]{6}$/i.test(color)) return color.toLowerCase()
  if (/^#[\da-f]{3}$/i.test(color)) return '#' + color.slice(1).split('').map((letter) => letter + letter).join('').toLowerCase()
  return null
}
export function categoryTextColor(background: string) {
  const color = normalizeCategoryColor(background) || '#a780f2'
  const channels = [1, 3, 5].map((start) => {
    const channel = parseInt(color.slice(start, start + 2), 16) / 255
    return channel <= .04045 ? channel / 12.92 : Math.pow((channel + .055) / 1.055, 2.4)
  })
  const luminance = channels[0]! * .2126 + channels[1]! * .7152 + channels[2]! * .0722
  return (luminance + .05) / .067 >= 1.05 / (luminance + .05) ? '#27231d' : '#ffffff'
}
export function buildCategoryPayload(draft: CreateCategoryPayload, categories: Category[], editingId?: string): CreateCategoryPayload {
  if (!draft.name.trim()) throw new Error('Nama kategori wajib diisi.')
  if (!Object.values(FrontendCategoryType).includes(draft.type)) throw new Error('Pilih jenis kategori yang valid.')
  if (draft.parentId && !categoryParentOptions(categories, draft.type, editingId).some((option) => option.value === draft.parentId)) throw new Error('Pilih induk dengan jenis yang sama. Kategori tidak dapat menjadi induk dirinya atau turunannya.')
  const color = normalizeCategoryColor(draft.color)
  if (draft.color?.trim() && !color) throw new Error('Gunakan warna hex yang valid, misalnya #a780f2.')
  return { name: draft.name.trim(), type: draft.type, parentId: draft.parentId || null, icon: draft.icon?.trim() || null, color }
}
