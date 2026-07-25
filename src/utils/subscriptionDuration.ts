// Mirrors the backend's day mapping (my-wallets-api) used for renewal/upgrade
// calculation previews: 1 month -> 30 days, 6 months -> 180 days, 12 months
// (1 year) -> 365 days.
export function getDurationDays(durationMonths: number | null): number | null {
  if (durationMonths == null) return null
  const map: Record<number, number> = { 1: 30, 6: 180, 12: 365 }
  return map[durationMonths] ?? durationMonths * 30
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}
