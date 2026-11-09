import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { budgetPeriod, budgetPeriodLabel } from '@/utils/budget'

export function useBudgetPeriod() {
  const route = useRoute(), router = useRouter()
  const period = computed(() => budgetPeriod(route.query.year, route.query.month))
  const setPeriod = (changes: { year?: number; month?: number }) => router.replace({ query: { ...route.query, year: String(changes.year ?? period.value.year), month: String(changes.month ?? period.value.month) } })
  const year = computed({ get: () => period.value.year, set: (value: number) => { void setPeriod({ year: value }) } })
  const month = computed({ get: () => period.value.month, set: (value: number) => { void setPeriod({ month: value }) } })
  const periodLabel = computed(() => budgetPeriodLabel(year.value, month.value))
  const periodQuery = computed(() => ({ ...route.query, year: String(year.value), month: String(month.value) }))
  return { year, month, periodLabel, periodQuery }
}
