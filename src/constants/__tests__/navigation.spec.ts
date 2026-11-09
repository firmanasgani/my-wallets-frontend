import { describe, expect, it } from 'vitest'
import { businessNavigation, isNavigationActive, personalNavigation } from '../navigation'

const personalItems = personalNavigation.flatMap((group) => group.items)
const businessItems = businessNavigation.flatMap((group) => group.items)

describe('workspace navigation', () => {
  it('highlights personal account and transaction detail routes', () => {
    for (const route of ['account-create', 'account-detail', 'account-edit']) {
      expect(personalItems.filter((item) => isNavigationActive(item, route)).map((item) => item.route))
        .toEqual(['accounts-list'])
    }
    expect(personalItems.filter((item) => isNavigationActive(item, 'transaction-detail')).map((item) => item.route))
      .toEqual(['transactions-list'])
  })

  it('keeps budget reports separate from budget setup', () => {
    for (const route of ['budget-create', 'budget-edit', 'budget-report']) {
      const active = personalItems.filter((item) => isNavigationActive(item, route))
      expect(active).toHaveLength(1)
      expect(active[0]?.route).toBe(route === 'budget-report' ? 'budget-report' : 'budget-setup')
    }
  })

  it('highlights business detail routes without activating unrelated links', () => {
    const cases = [
      ['invoice-edit', 'business-invoices'],
      ['invoice-export', 'business-invoices'],
      ['business-transaction-detail', 'business-transactions'],
      ['business-asset-edit', 'business-assets'],
      ['business-contacts-edit', 'business-contacts'],
      ['business-report-bs', 'business-report-bs'],
    ] as const
    for (const [route, expected] of cases) {
      expect(businessItems.filter((item) => isNavigationActive(item, route)).map((item) => item.route))
        .toEqual([expected])
    }
  })

  it('marks premium personal tools for subscription filtering', () => {
    const premium = personalItems.filter((item) => item.premium).map((item) => item.route)
    expect(premium).toEqual(['budget-setup', 'budget-report', 'spending-analysis', 'financial-goals-list'])
    expect(personalItems.filter((item) => !item.premium).map((item) => item.route))
      .toContain('transactions-list')
  })
})
