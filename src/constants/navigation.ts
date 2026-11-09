export interface NavigationItem {
  label: string
  route: string
  icon: string
  match?: string[]
  premium?: boolean
  href?: string
}
export interface NavigationGroup {
  label: string
  items: NavigationItem[]
}

export const personalNavigation: NavigationGroup[] = [
  { label: 'Ringkasan', items: [
    { label: 'Workspace', route: 'dashboard', icon: 'grid' },
    { label: 'Dashboard', route: 'personal-dashboard', icon: 'chart' },
  ] },
  { label: 'Keuangan personal', items: [
    { label: 'Transaksi', route: 'transactions-list', icon: 'transfer', match: ['transactions-list', 'transaction-'] },
    { label: 'Akun keuangan', route: 'accounts-list', icon: 'wallet', match: ['accounts-list', 'account-'] },
    { label: 'Kategori', route: 'categories-list', icon: 'tag' },
    { label: 'Anggaran', route: 'budget-setup', icon: 'pie', match: ['budget-setup', 'budget-create', 'budget-edit'], premium: true },
    { label: 'Laporan anggaran', route: 'budget-report', icon: 'file', premium: true },
    { label: 'Analisis pengeluaran', route: 'spending-analysis', icon: 'chart', premium: true },
    { label: 'Target keuangan', route: 'financial-goals-list', icon: 'target', match: ['financial-goal'], premium: true },
  ] },
]
export const businessNavigation: NavigationGroup[] = [
  { label: 'Ringkasan', items: [
    { label: 'Workspace', route: 'dashboard', icon: 'grid' },
    { label: 'Dashboard bisnis', route: 'business-kpi', icon: 'chart' },
  ] },
  { label: 'Operasional bisnis', items: [
    { label: 'Invoice', route: 'business-invoices', icon: 'file', match: ['business-invoices', 'invoice-'] },
    { label: 'Transaksi', route: 'business-transactions', icon: 'transfer', match: ['business-transactions', 'business-transaction-'] },
    { label: 'Rekening', route: 'business-bank-accounts', icon: 'bank' },
    { label: 'Kontak', route: 'business-contacts', icon: 'user', match: ['business-contacts'] },
    { label: 'Aset', route: 'business-assets', icon: 'box', match: ['business-assets', 'business-asset-'] },
  ] },
  { label: 'Laporan keuangan', items: [
    { label: 'Laba rugi', route: 'business-report-pl', icon: 'chart' },
    { label: 'Neraca', route: 'business-report-bs', icon: 'pie' },
    { label: 'Arus kas', route: 'business-report-cf', icon: 'transfer' },
    { label: 'Jurnal umum', route: 'business-report-journal', icon: 'book' },
  ] },
  { label: 'Perusahaan', items: [
    { label: 'Profil perusahaan', route: 'business-settings', icon: 'building' },
    { label: 'Bagan akun', route: 'business-coa', icon: 'wallet' },
    { label: 'Anggota tim', route: 'business-members', icon: 'team' },
    { label: 'Pajak', route: 'business-tax', icon: 'percent' },
  ] },
]
export const supportNavigation: NavigationGroup = { label: 'Bantuan & preferensi', items: [
  { label: 'Pengaturan', route: 'settings', icon: 'settings', match: ['settings', 'subscription-checkout'] },
  { label: 'Live chat', route: 'help-chat', icon: 'chat' },
  { label: 'Cara penggunaan', route: 'how-to', icon: 'help', href: 'https://moneytory.my.id/id/cara-penggunaan' },
] }

export function isNavigationActive(item: NavigationItem, routeName: string) {
  return item.match ? item.match.some((name) => routeName.startsWith(name)) : item.route === routeName
}
