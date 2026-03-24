export enum SubscriptionPlan {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  FAMILY = 'FAMILY', // Maps to 'Pro/Keluarga' in UI
  BUSINESS = 'BUSINESS',
}

export interface PricingPlanDetails {
  key: SubscriptionPlan
  name: string
  description: string
  price: string
  billingPeriod?: string // e.g. '/bulan'
  features: string[]
  cta: {
    text: string
    link: { name: string }
  }
  recommended: boolean
  disabled?: boolean
  hidden?: boolean // Hide plan from landing page pricing section
}

export const PRICING_PLANS: PricingPlanDetails[] = [
  {
    key: SubscriptionPlan.FREE,
    name: 'Dasar',
    description: 'Untuk kebutuhan pencatatan keuangan pribadi yang esensial.',
    price: 'Gratis',
    billingPeriod: '',
    features: [
      'Hingga 4 Akun Keuangan',
      'Hingga 30 Kategori Kustom',
      'Pencatatan Transaksi Manual',
      'Dashboard Ringkas',
      'Riwayat Transaksi 12 Bulan',
    ],
    cta: { text: 'Mulai Gratis', link: { name: 'register' } },
    recommended: false,
  },
  {
    key: SubscriptionPlan.BUSINESS,
    name: 'Bisnis',
    description: 'Solusi akuntansi lengkap untuk usaha dan profesional.',
    price: 'Rp 199rb',
    billingPeriod: '/bulan',
    features: [
      'Semua di paket Premium',
      'Manajemen Perusahaan',
      'Bagan Akun (Chart of Accounts) Otomatis',
      'Manajemen Kontak (Pelanggan & Pemasok)',
      'Pembuatan & Pengelolaan Invoice',
      'Pencatatan Jurnal Double-Entry',
      'Laporan Keuangan (Laba Rugi, Neraca, Arus Kas)',
      'KPI Dashboard Bisnis',
      'Multi-user dengan Role (Owner, Admin, Staff, Viewer)',
      'Manajemen Pajak (PPN)',
    ],
    cta: { text: 'Pilih Bisnis', link: { name: 'register' } },
    recommended: true,
  },
  {
    key: SubscriptionPlan.PREMIUM,
    name: 'Premium',
    description: 'Fitur lengkap untuk kontrol finansial yang lebih mendalam.',
    price: 'Rp 39rb',
    billingPeriod: '/bulan',
    features: [
      'Semua di paket Dasar',
      'Akun Keuangan Tanpa Batas',
      'Kategori Kustom Tanpa Batas',
      'Laporan & Analisis Lanjutan',
      'Transaksi Berulang Otomatis',
      'Fitur Budgeting',
      'Lampiran Struk Transaksi',
      'Dukungan Prioritas',
    ],
    cta: { text: 'Pilih Premium', link: { name: 'register' } },
    recommended: false,
  },
  {
    key: SubscriptionPlan.FAMILY,
    name: 'Pro/Keluarga',
    description: 'Untuk pengguna mahir atau pengelolaan keuangan bersama keluarga.',
    price: 'Rp 99rb',
    billingPeriod: '/bulan',
    features: [
      'Semua di paket Premium',
      'Akun Bersama (Family Sharing)',
      'Laporan Keluarga Terkonsolidasi',
      'Budgeting Keluarga',
      'Pelacakan Tujuan Finansial',
      'Analisis Kekayaan Bersih',
    ],
    cta: { text: 'Pilih Pro (Menyusul)', link: { name: 'register' } },
    recommended: false,
    disabled: true,
    hidden: true, // Sementara disembunyikan dari halaman landing
  },
]
