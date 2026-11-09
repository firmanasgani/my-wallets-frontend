import type { AnalysisFilters, CategoryTrendAnalysis, ComparisonData, SpendingAnalysisData, TrendAnalysis } from '@/types/reports'
import { budgetProgress } from './budget'
import { dateKey, parseDate, type DateRange } from './dateRange'
import { normalizeCategoryColor } from './categoryTree'

export const analysisColors = ['#7955ae', '#618771', '#bb8746', '#6c8fba', '#b16b83', '#878174']
export const analysisNumber = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0
export function analysisSeriesLabel(label: string) {
  return ({ Income: 'Pemasukan', Expense: 'Pengeluaran', 'Net Cashflow': 'Arus kas bersih' } as Record<string, string>)[label] || label
}
export function analysisChartLabel(label: string) {
  const day = parseDate(label)
  if (day) return day.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  if (/^\d{4}-\d{2}$/.test(label)) return parseDate(`${label}-01`)?.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) || label
  return label
}
export function analysisFilters(query: { startDate?: unknown; endDate?: unknown; interval?: unknown }, today = new Date()): AnalysisFilters {
  const start = typeof query.startDate === 'string' ? parseDate(query.startDate) : null
  const end = typeof query.endDate === 'string' ? parseDate(query.endDate) : null
  const valid = !!start && !!end && dateKey(start) <= dateKey(end)
  const first = new Date(today.getFullYear(), today.getMonth(), 1)
  const last = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  return { startDate: valid ? dateKey(start!) : dateKey(first), endDate: valid ? dateKey(end!) : dateKey(last), interval: query.interval === 'MONTH' ? 'MONTH' : 'DAY' }
}
export function analysisRangeLabel(range: DateRange) {
  const format = (value: string) => parseDate(value)?.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) || value
  return range.startDate === range.endDate ? format(range.startDate) : `${format(range.startDate)} – ${format(range.endDate)}`
}
export function analysisMonth(endDate: string) {
  const date = parseDate(endDate)
  if (!date) throw new Error('Tanggal akhir tidak valid.')
  return { month: date.getMonth() + 1, year: date.getFullYear(), label: date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) }
}
export function analysisCategoryTotals(data: CategoryTrendAnalysis | null) {
  if (!data) return []
  const items = data.datasets.map((dataset, index) => ({
    id: `category-${index}`, categoryName: dataset.label, color: normalizeCategoryColor(dataset.backgroundColor) || analysisColors[index % analysisColors.length]!,
    totalAmount: dataset.data.reduce((sum, value) => sum + analysisNumber(value), 0),
  })).filter((item) => item.totalAmount > 0).sort((a, b) => b.totalAmount - a.totalAmount)
  const total = items.reduce((sum, item) => sum + item.totalAmount, 0)
  return items.map((item) => ({ ...item, percentage: total > 0 ? item.totalAmount / total * 100 : 0 }))
}
export function analysisComparison(data: ComparisonData, expense = false) {
  const current = analysisNumber(data.current), previous = analysisNumber(data.previous)
  const difference = current - previous
  const percentage = previous > 0 ? difference / previous * 100 : null
  const label = percentage === null ? current > 0 ? 'Mulai tercatat' : 'Belum ada transaksi' : difference === 0 ? 'Tetap' : difference > 0 ? 'Naik' : 'Turun'
  const tone = difference === 0 || percentage === null ? 'neutral' : (expense ? difference < 0 : difference > 0) ? 'good' : 'warning'
  return { current, previous, difference, percentage, label, tone }
}
export function analysisHasTrend(data: TrendAnalysis | CategoryTrendAnalysis | null) {
  return !!data?.labels.length && data.datasets.some((dataset) => dataset.data.some((value) => analysisNumber(value) !== 0))
}
export function insightParts(message: string) {
  // Render API content as text nodes; only paired **markers** receive emphasis.
  return message.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part) => ({ text: part.startsWith('**') && part.endsWith('**') ? part.slice(2, -2) : part, strong: part.startsWith('**') && part.endsWith('**') }))
}

export interface AnalysisExportTable { title: string; scope: string; headers: string[]; rows: (string | number)[][] }
export function analysisExportTables(data: SpendingAnalysisData, filters: AnalysisFilters): AnalysisExportTable[] {
  const range = analysisRangeLabel(filters), month = analysisMonth(filters.endDate).label
  const tables: AnalysisExportTable[] = []
  if (data.summary) {
    const income = analysisNumber(data.summary.totalIncome), expense = analysisNumber(data.summary.totalExpense)
    tables.push({ title: 'Ringkasan keuangan', scope: range, headers: ['Metrik', 'Nilai'], rows: [['Pemasukan (IDR)', income], ['Pengeluaran (IDR)', expense], ['Arus kas bersih (IDR)', income - expense], ['Rasio sisa dana', income > 0 ? `${((income - expense) / income * 100).toFixed(1)}%` : '-']] })
  }
  if (data.categories) tables.push({ title: 'Distribusi kategori', scope: `${range} | Lima kategori teratas dan Lainnya`, headers: ['Kategori', 'Pengeluaran (IDR)', 'Persentase'], rows: analysisCategoryTotals(data.categories).map((item) => [item.categoryName, item.totalAmount, `${item.percentage.toFixed(1)}%`]) })
  for (const [title, chart] of [['Tren arus kas', data.trend], ['Tren kategori', data.categories]] as const) {
    if (chart) tables.push({ title, scope: `${range} | ${filters.interval === 'DAY' ? 'Harian' : 'Bulanan'}`, headers: ['Periode', ...chart.datasets.map((dataset) => analysisSeriesLabel(dataset.label))], rows: chart.labels.map((label, index) => [label, ...chart.datasets.map((dataset) => analysisNumber(dataset.data[index]))]) })
  }
  if (data.comparison) tables.push({ title: 'Perbandingan bulanan', scope: `${month} dibanding bulan sebelumnya`, headers: ['Jenis', 'Bulan pilihan (IDR)', 'Bulan sebelumnya (IDR)', 'Selisih (IDR)', 'Perubahan'], rows: ([['Pemasukan', data.comparison.income], ['Pengeluaran', data.comparison.expense]] as const).map(([label, comparison]) => {
    const item = analysisComparison(comparison, label === 'Pengeluaran')
    return [label, item.current, item.previous, item.difference, item.percentage === null ? '-' : `${item.percentage.toFixed(1)}%`]
  }) })
  if (data.budgets) tables.push({ title: 'Anggaran pengeluaran', scope: `${month} | Sebulan penuh`, headers: ['Kategori', 'Anggaran (IDR)', 'Terpakai (IDR)', 'Selisih (IDR)', 'Status'], rows: data.budgets.map((item) => {
    const progress = budgetProgress(item)
    return [item.category?.categoryName || '-', analysisNumber(item.amount), analysisNumber(item.spent), progress.remaining, progress.status]
  }) })
  if (data.insights) tables.push({ title: 'Sorotan bulanan', scope: `${month} | Sebulan penuh`, headers: ['Jenis', 'Judul', 'Catatan'], rows: data.insights.map((item) => [item.type, item.title, insightParts(item.message).map((part) => part.text).join('')]) })
  return tables
}
