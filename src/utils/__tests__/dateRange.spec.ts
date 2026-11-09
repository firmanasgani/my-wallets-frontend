import { describe, expect, it } from 'vitest'
import { calendarDays, dateKey, monthOffset, orderedRange, parseDate, presetRange } from '../dateRange'

describe('date range picker calendar', () => {
  it('validates actual calendar dates and preserves local dates', () => {
    expect(dateKey(new Date(2026, 10, 10, 0, 15))).toBe('2026-11-10')
    expect(parseDate('2024-02-29')).not.toBeNull()
    expect(parseDate('2026-02-29')).toBeNull()
    expect(parseDate('2026-11-31')).toBeNull()
    expect(parseDate('2026-1-1')).toBeNull()
    expect(parseDate('0000-01-01')).toBeNull()
  })

  it('renders a Monday-first calendar including every date once', () => {
    const days = calendarDays(new Date(2026, 10, 1))
    expect(days).toHaveLength(42)
    expect(days.slice(0, 6)).toEqual([null, null, null, null, null, null])
    expect(days[6]).toBe('2026-11-01')
    expect(days.filter(Boolean)).toHaveLength(30)
    expect(calendarDays(new Date(2024, 1, 1)).filter(Boolean)).toHaveLength(29)
  })

  it('moves between months without overflowing from the 31st', () => {
    expect(dateKey(monthOffset(new Date(2026, 0, 31), 1))).toBe('2026-02-01')
    expect(dateKey(monthOffset(new Date(2026, 0, 1), -1))).toBe('2025-12-01')
  })

  it('accepts reversed selection, same-day, and cross-year ranges', () => {
    expect(orderedRange('2026-01-03', '2025-12-29')).toEqual({ startDate: '2025-12-29', endDate: '2026-01-03' })
    expect(orderedRange('2026-11-10', '2026-11-10')).toEqual({ startDate: '2026-11-10', endDate: '2026-11-10' })
  })

  it('calculates presets at month and year boundaries', () => {
    const now = new Date(2026, 0, 3)
    expect(presetRange('week', now)).toEqual({ startDate: '2025-12-28', endDate: '2026-01-03' })
    expect(presetRange('lastMonth', now)).toEqual({ startDate: '2025-12-01', endDate: '2025-12-31' })
    expect(presetRange('month', now)).toEqual({ startDate: '2026-01-01', endDate: '2026-01-03' })
    expect(presetRange('yesterday', new Date(2026, 0, 1))).toEqual({ startDate: '2025-12-31', endDate: '2025-12-31' })
    expect(presetRange('lastMonth', new Date(2024, 2, 10))).toEqual({ startDate: '2024-02-01', endDate: '2024-02-29' })
    expect(presetRange('year', new Date(2026, 10, 10))).toEqual({ startDate: '2026-01-01', endDate: '2026-11-10' })
  })
})
