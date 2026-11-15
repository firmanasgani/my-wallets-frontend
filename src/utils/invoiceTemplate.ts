import { BusinessService } from '@/services/business.service'
import type { Company, Invoice, InvoiceTemplateSettings } from '@/types/business'

/**
 * Mirrors API `DEFAULT_INVOICE_TEMPLATE` (the original indigo invoice look).
 */
export const DEFAULT_INVOICE_TEMPLATE: InvoiceTemplateSettings = {
  layout: 'CLASSIC',
  primaryColor: '#4F46E5',
  accentColor: '#EEF2FF',
  backgroundColor: '#FFFFFF',
  textColor: '#1E293B',
  fontFamily: 'SANS',
  showLogo: true,
  logoPosition: 'LEFT',
  logoSize: 'MEDIUM',
  title: 'INVOICE',
  showCompanyAddress: true,
  showCompanyContact: true,
  showNpwp: false,
  showStatusBadge: true,
  showItemDiscount: true,
  showItemTax: true,
  showBankAccount: true,
  showNotes: true,
  termsText: null,
  footerText: null,
}

const SETTING_KEYS = Object.keys(DEFAULT_INVOICE_TEMPLATE) as (keyof InvoiceTemplateSettings)[]

/** Keep only API-accepted keys (the API rejects unknown properties). */
export function pickTemplateSettings(source: Partial<InvoiceTemplateSettings> | null | undefined): InvoiceTemplateSettings {
  const out = { ...DEFAULT_INVOICE_TEMPLATE } as Record<string, unknown>
  if (!source) return out as unknown as InvoiceTemplateSettings
  for (const key of SETTING_KEYS) {
    const value = (source as Record<string, unknown>)[key]
    if (value !== undefined) out[key] = value
  }
  return out as unknown as InvoiceTemplateSettings
}

/** Curated starting points — inspired by the theme pickers in Stripe / Zoho. */
export const TEMPLATE_PRESETS: { name: string; settings: Partial<InvoiceTemplateSettings> }[] = [
  { name: 'Indigo', settings: { primaryColor: '#4F46E5', accentColor: '#EEF2FF', backgroundColor: '#FFFFFF', textColor: '#1E293B' } },
  { name: 'Hijau Moneytory', settings: { primaryColor: '#2E8B57', accentColor: '#E8F5EE', backgroundColor: '#FFFFFF', textColor: '#1F2937' } },
  { name: 'Samudra', settings: { primaryColor: '#0369A1', accentColor: '#E0F2FE', backgroundColor: '#FFFFFF', textColor: '#0F172A' } },
  { name: 'Terakota', settings: { primaryColor: '#C2410C', accentColor: '#FFEDD5', backgroundColor: '#FFFBF5', textColor: '#292524' } },
  { name: 'Anggur', settings: { primaryColor: '#7E22CE', accentColor: '#F3E8FF', backgroundColor: '#FFFFFF', textColor: '#1E1B4B' } },
  { name: 'Arang', settings: { primaryColor: '#111827', accentColor: '#F3F4F6', backgroundColor: '#FFFFFF', textColor: '#111827' } },
  { name: 'Kertas Krem', settings: { primaryColor: '#854D0E', accentColor: '#FEF3C7', backgroundColor: '#FFFBEB', textColor: '#422006' } },
]

// ─── Colour helpers (kept in sync with API invoice-email.template.ts) ────────

export type RGB = [number, number, number]

export function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value)
}

export function hexToRgb(hex: string): RGB {
  const h = /^#?([0-9a-f]{6})$/i.exec(hex)?.[1] ?? '000000'
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB
}

function rgbToHex([r, g, b]: RGB): string {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase()
}

/** Linear blend: t=0 → a, t=1 → b. */
export function mixColor(a: string, b: string, t: number): string {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  return rgbToHex([0, 1, 2].map((i) => ca[i]! + (cb[i]! - ca[i]!) * t) as RGB)
}

export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }) as RGB
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio (1–21). ≥ 4.5 is comfortable for body text. */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

export function readableOn(bg: string): string {
  return luminance(bg) > 0.45 ? '#0F172A' : '#FFFFFF'
}

// ─── Logo loading ────────────────────────────────────────────────────────────

export interface LoadedLogo {
  /** PNG data URL — jsPDF cannot embed WebP, so everything is normalised. */
  dataUrl: string
  width: number
  height: number
}

const logoCache = new Map<string, Promise<LoadedLogo | null>>()

async function blobToPng(blob: Blob): Promise<LoadedLogo | null> {
  const url = URL.createObjectURL(blob)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = reject
      el.src = url
    })
    const w = img.naturalWidth || img.width
    const h = img.naturalHeight || img.height
    if (!w || !h) return null
    // Downscale very large logos to keep the PDF small (≈ 300 dpi at 26 mm).
    const scale = Math.min(1, 320 / h)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(w * scale)
    canvas.height = Math.round(h * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return { dataUrl: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height }
  } finally {
    URL.revokeObjectURL(url)
  }
}

/**
 * Load the company logo for PDF embedding. Goes through the authenticated API
 * endpoint so it works regardless of MinIO CORS or presigned-URL expiry.
 * Never throws — a missing logo must not block the export.
 */
export function loadCompanyLogo(company: Company | null | undefined): Promise<LoadedLogo | null> {
  if (!company?.logoUrl) return Promise.resolve(null)
  const key = company.logoUrl
  if (!logoCache.has(key)) {
    const p = BusinessService.getCompanyLogoBlob()
      .then(blobToPng)
      .catch(() => null)
      .then((res) => {
        if (!res) logoCache.delete(key) // retry next time
        return res
      })
    logoCache.set(key, p)
  }
  return logoCache.get(key)!
}

// ─── Sample data for previews ───────────────────────────────────────────────

export function buildSampleInvoice(company: Company | null): Invoice {
  const now = new Date()
  const due = new Date(now.getTime() + 14 * 86400000)
  const rate = company?.taxEnabled ? Number(company.taxRate ?? 11) : 0
  const lines = [
    { description: 'Jasa desain logo & identitas visual', qty: 1, price: 3500000, disc: 250000, taxable: true },
    { description: 'Konsultasi strategi brand (jam)', qty: 4, price: 450000, disc: 0, taxable: true },
    { description: 'Cetak kartu nama (box)', qty: 2, price: 175000, disc: 0, taxable: false },
  ]
  let subtotal = 0
  let tax = 0
  const items = lines.map((l, i) => {
    const net = l.qty * l.price - l.disc
    const itemRate = l.taxable ? rate : 0
    const t = (net * itemRate) / 100
    subtotal += net
    tax += t
    return {
      id: `sample-${i}`,
      invoiceId: 'sample',
      description: l.description,
      quantity: String(l.qty),
      unitPrice: String(l.price),
      discountAmount: String(l.disc),
      taxable: l.taxable && rate > 0,
      taxRate: String(itemRate),
      taxAmount: String(t),
      total: String(net + t),
    }
  })
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return {
    id: 'sample',
    companyId: company?.id ?? '',
    contactId: null,
    invoiceNumber: `INV-${ym}-0001`,
    clientName: 'PT Contoh Pelanggan',
    clientEmail: 'finance@contoh.co.id',
    clientAddress: 'Jl. Sudirman No. 1, Jakarta',
    issueDate: now.toISOString(),
    dueDate: due.toISOString(),
    status: 'SENT',
    subtotal: String(subtotal),
    taxAmount: String(tax),
    withholdingTaxAmount: '0',
    totalAmount: String(subtotal + tax),
    amountPaid: '0',
    sentAt: now.toISOString(),
    paidAt: null,
    cancelledAt: null,
    cancelReason: null,
    paymentDate: null,
    paymentCoaId: null,
    paymentMethod: null,
    paymentReference: null,
    paymentBankAccountId: null,
    notes: 'Terima kasih atas kepercayaan Anda.',
    taxConfigId: null,
    createdByUserId: '',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    items,
    contact: null,
    paymentBankAccount: {
      id: 'sample',
      companyId: company?.id ?? '',
      bankName: 'Bank Contoh',
      accountNumber: '1234567890',
      accountHolder: company?.name ?? 'Perusahaan Anda',
      isDefault: true,
    } as Invoice['paymentBankAccount'],
    taxConfig: null,
  }
}
