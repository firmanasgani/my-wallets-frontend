import { describe, expect, it } from 'vitest'
import { analysisCategoryTotals, analysisComparison, analysisExportTables, analysisFilters, analysisHasTrend, analysisMonth, insightParts } from '../spendingAnalysis'
import type { CategoryTrendAnalysis, ComparisonData, SpendingAnalysisData } from '@/types/reports'

const categories: CategoryTrendAnalysis = { labels: ['2026-11-01', '2026-11-02'], datasets: [{ label: 'Belanja', data: [10, 20], backgroundColor: '#abc' }, { label: 'Lainnya', data: [10, 0], backgroundColor: 'invalid' }] }
const comparison = (current: number, previous: number) => ({ current, previous } as ComparisonData)

describe('spending analysis', () => {
  it('uses valid custom ranges and falls back to a complete month for malformed URL values', () => {
    expect(analysisFilters({ startDate: '2024-02-01', endDate: '2024-02-29', interval: 'MONTH' })).toEqual({ startDate: '2024-02-01', endDate: '2024-02-29', interval: 'MONTH' })
    expect(analysisFilters({ startDate: '2026-02-30', endDate: '2026-01-01' }, new Date(2026, 10, 9))).toEqual({ startDate: '2026-11-01', endDate: '2026-11-30', interval: 'DAY' })
    expect(analysisFilters({ startDate: '2026-11-10', endDate: '2026-11-01' }, new Date(2026, 10, 9)).startDate).toBe('2026-11-01')
  })
  it('anchors monthly context on the range end rather than its start', () => {
    const month = analysisMonth('2026-01-02')
    expect(month.month).toBe(1)
    expect(month.year).toBe(2026)
    expect(() => analysisMonth('2026-02-30')).toThrow('Tanggal')
  })
  it('derives category shares from the same trend totals, including grouped categories', () => {
    const result = analysisCategoryTotals(categories)
    expect(result.map((item) => item.totalAmount)).toEqual([30, 10])
    expect(result.map((item) => item.percentage)).toEqual([75, 25])
    expect(result[0]?.color).toBe('#aabbcc')
    expect(analysisCategoryTotals({ labels: [], datasets: [] })).toEqual([])
  })
  it('handles zero prior periods and distinguishes income and expense changes', () => {
    expect(analysisComparison(comparison(100, 0)).percentage).toBe(null)
    expect(analysisComparison(comparison(0, 0)).label).toBe('Belum ada transaksi')
    expect(analysisComparison(comparison(120, 100)).tone).toBe('good')
    expect(analysisComparison(comparison(120, 100), true).tone).toBe('warning')
    expect(analysisComparison(comparison(80, 100), true).percentage).toBe(-20)
    expect(analysisComparison(comparison(100, 100)).label).toBe('Tetap')
  })
  it('distinguishes empty or zero-only charts from real cash-flow data', () => {
    expect(analysisHasTrend(null)).toBe(false)
    expect(analysisHasTrend({ labels: ['one'], datasets: [{ label: 'Net', data: [0] }] })).toBe(false)
    expect(analysisHasTrend({ labels: ['one'], datasets: [{ label: 'Net', data: [-10] }] })).toBe(true)
  })
  it('keeps insight content as text while recognizing emphasis markers', () => {
    expect(insightParts('Dana **Rp100** <img src=x onerror=alert(1)>')).toEqual([{ text: 'Dana ', strong: false }, { text: 'Rp100', strong: true }, { text: ' <img src=x onerror=alert(1)>', strong: false }])
  })
  it('exports matching category values and labels monthly sections with their own scope', () => {
    const data: SpendingAnalysisData = { summary: { period: { start: '', end: '' }, totalIncome: 0, totalExpense: 40, netCashFlow: -40, savingsRate: 0 }, trend: null, categories, comparison: { period: { current: '2026-11', previous: '2026-10' }, income: comparison(0, 0), expense: comparison(40, 20) }, insights: [], budgets: [] }
    const tables = analysisExportTables(data, { startDate: '2026-10-15', endDate: '2026-11-10', interval: 'DAY' })
    expect(tables[0]?.rows[3]?.[1]).toBe('-')
    expect(tables.find((table) => table.title === 'Distribusi kategori')?.rows[0]).toEqual(['Belanja', 30, '75.0%'])
    expect(tables.find((table) => table.title === 'Perbandingan bulanan')?.scope).toBe('November 2026 dibanding bulan sebelumnya')
    expect(tables.find((table) => table.title === 'Perbandingan bulanan')?.rows[0]?.[4]).toBe('-')
  })
})
