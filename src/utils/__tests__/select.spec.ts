import { describe, expect, it } from 'vitest'
import { filterSelectOptions, nextSelectIndex } from '../select'
import type { SelectOption } from '@/types/select'

describe('shared select behavior', () => {
  const options: SelectOption[] = [
    { value: undefined, label: 'Semua akun' },
    { value: 0, label: 'Januari' },
    { value: 'blocked', label: 'Nonaktif', disabled: true },
    { value: 'bank', label: 'Rekening utama', group: 'Aset', description: 'Tabungan bisnis' },
    { value: null, label: 'Lainnya' },
  ]
  it('matches labels, groups and descriptions without case or accents', () => {
    expect(filterSelectOptions(options, '  REKENING ').map((option) => option.value)).toEqual(['bank'])
    expect(filterSelectOptions(options, 'aset').map((option) => option.value)).toEqual(['bank'])
    expect(filterSelectOptions(options, 'bisnis').map((option) => option.value)).toEqual(['bank'])
    expect(filterSelectOptions([{ value: 'cafe', label: 'Café' }], 'cafe')).toHaveLength(1)
    expect(filterSelectOptions(options, 'tidak cocok')).toEqual([])
  })
  it('preserves undefined, null and numeric zero when no search is entered', () => {
    const result = filterSelectOptions(options, '')
    expect(result[0]?.value).toBeUndefined()
    expect(result[1]?.value).toBe(0)
    expect(result[4]?.value).toBeNull()
    expect(result).not.toBe(options)
  })
  it('wraps keyboard navigation and skips disabled options in both directions', () => {
    expect(nextSelectIndex(options, -1, 1)).toBe(0)
    expect(nextSelectIndex(options, 1, 1)).toBe(3)
    expect(nextSelectIndex(options, 3, -1)).toBe(1)
    expect(nextSelectIndex(options, 4, 1)).toBe(0)
    expect(nextSelectIndex(options, 0, -1)).toBe(4)
  })
  it('does not activate an option when the list is empty or entirely disabled', () => {
    expect(nextSelectIndex([], -1, 1)).toBe(-1)
    expect(nextSelectIndex([{ value: 'x', label: 'Indisponible', disabled: true }], -1, 1)).toBe(-1)
  })
})
