export enum SubscriptionPlan {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  FAMILY = 'FAMILY', // Maps to 'Pro/Keluarga' in UI
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
  disabled?: boolean // For 'Segera Hadir' logic
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
    recommended: true,
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
    cta: { text: 'Pilih Pro', link: { name: 'register' } },
    recommended: false,
    disabled: false, // HomeView implies it's available (link to register), but PricingModal previously had it disabled.
    // User said "Buat yang ada di HomeView sebagai patokannya". HomeView links to register.
    // However, if the features aren't built, maybe I should keep it disabled in Modal?
    // But instructions say "HomeView sebagai patokannya".
    // I will set disabled to false, or let the Modal decide based on logic.
    // For now I'll stick to HomeView data.
  },
]
