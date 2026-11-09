import { describe, expect, it } from 'vitest'
import { FrontendCategoryType, type Category } from '@/types/enums'
import { buildCategoryPayload, categoryCounts, categoryParentOptions, categoryTextColor, filterCategoryTree, normalizeCategoryColor } from '../categoryTree'

const tree = [
  { id: 'expenses', categoryName: 'Belanja', categoryType: 'EXPENSE', subCategories: [
    { id: 'food', categoryName: 'Makanan', categoryType: 'EXPENSE', parentCategoryId: 'expenses', subCategories: [
      { id: 'lunch', categoryName: 'Makan siang', categoryType: 'EXPENSE', parentCategoryId: 'food' },
    ] },
    { id: 'travel', categoryName: 'Transportasi', categoryType: 'EXPENSE', parentCategoryId: 'expenses' },
  ] },
  { id: 'income', categoryName: 'Gaji', categoryType: 'INCOME' },
] as Category[]

describe('category hierarchy', () => {
  it('counts every level independently of the displayed filter', () => {
    expect(categoryCounts(tree)).toEqual({ total: 5, income: 1, expense: 4, parents: 2, children: 3 })
    expect(categoryCounts([]).total).toBe(0)
  })
  it('keeps ancestors when searching for a deeply nested child', () => {
    const result = filterCategoryTree(tree, '  makan siang  ')
    expect(result.map((category) => category.id)).toEqual(['expenses'])
    expect(result[0]?.subCategories?.[0]?.id).toBe('food')
    expect(result[0]?.subCategories?.[0]?.subCategories?.[0]?.id).toBe('lunch')
    expect(categoryCounts(result).total).toBe(3)
    expect(filterCategoryTree(tree, 'tidak ada')).toEqual([])
  })
  it('preserves the full child group when its parent matches', () => {
    expect(categoryCounts(filterCategoryTree(tree, 'belanja')).total).toBe(4)
    expect(filterCategoryTree(tree, '', true).map((category) => category.id)).toEqual(['income', 'expenses'])
    expect(tree[0]?.subCategories?.[0]?.id).toBe('food')
  })
  it('excludes the edited node, its descendants and other types from parent choices', () => {
    expect(categoryParentOptions(tree, FrontendCategoryType.EXPENSE, 'food').map((option) => option.value)).toEqual(['expenses', 'travel'])
    expect(categoryParentOptions(tree, FrontendCategoryType.INCOME).map((option) => option.value)).toEqual(['income'])
  })
  it('rejects cyclic and cross-type parenting while normalizing submitted fields', () => {
    const draft = { name: '  Repas  ', type: FrontendCategoryType.EXPENSE, parentId: 'expenses', color: '#ABC', icon: ' utensils ' }
    expect(buildCategoryPayload(draft, tree)).toEqual({ name: 'Repas', type: 'EXPENSE', parentId: 'expenses', color: '#aabbcc', icon: 'utensils' })
    expect(() => buildCategoryPayload({ ...draft, parentId: 'lunch' }, tree, 'food')).toThrow('induk')
    expect(() => buildCategoryPayload({ ...draft, parentId: 'income' }, tree)).toThrow('induk')
    expect(() => buildCategoryPayload({ ...draft, color: 'red' }, tree)).toThrow('hex')
  })
  it('normalizes colors and keeps icon text readable on pastel and dark fills', () => {
    expect(normalizeCategoryColor('#ABC')).toBe('#aabbcc')
    expect(normalizeCategoryColor('not-a-color')).toBeNull()
    expect(categoryTextColor('#c8edc6')).toBe('#27231d')
    expect(categoryTextColor('#5026a5')).toBe('#ffffff')
  })
})
