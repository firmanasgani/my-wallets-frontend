export interface DateRange { startDate: string; endDate: string }
export type DatePreset = 'today' | 'yesterday' | 'week' | 'month' | 'lastMonth' | 'year'

export function dateKey(date: Date): string {
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function parseDate(value?: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T12:00:00`)
  return Number.isFinite(date.getTime()) && date.getFullYear() >= 1 && dateKey(date) === value ? date : null
}
export function monthOffset(date: Date, offset: number): Date {
  const result = new Date(date)
  result.setDate(1)
  result.setMonth(result.getMonth() + offset)
  return result
}
export function calendarDays(month: Date): (string | null)[] {
  const first = monthOffset(month, 0)
  const offset = (first.getDay() + 6) % 7
  const last = monthOffset(month, 1)
  last.setDate(0)
  return Array.from({ length: 42 }, (_, index) => {
    const day = index - offset + 1
    if (day < 1 || day > last.getDate()) return null
    const date = new Date(first)
    date.setDate(day)
    return dateKey(date)
  })
}
export function orderedRange(first: string, second: string): DateRange {
  return first <= second ? { startDate: first, endDate: second } : { startDate: second, endDate: first }
}
export function presetRange(preset: DatePreset, today = new Date()): DateRange {
  const start = new Date(today)
  const end = new Date(today)
  if (preset === 'yesterday') { start.setDate(start.getDate() - 1); end.setDate(end.getDate() - 1) }
  if (preset === 'week') start.setDate(start.getDate() - 6)
  if (preset === 'month') start.setDate(1)
  if (preset === 'lastMonth') { start.setDate(1); start.setMonth(start.getMonth() - 1); end.setDate(0) }
  if (preset === 'year') { start.setMonth(0, 1) }
  return { startDate: dateKey(start), endDate: dateKey(end) }
}
