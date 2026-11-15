import { describe, expect, it, vi } from 'vitest'

vi.mock('@/services/business.service', () => ({ BusinessService: {} }))

import { renderInvoicePdf } from '@/services/invoicePdf'
import { buildSampleInvoice, contrastRatio, mixColor, pickTemplateSettings, readableOn } from '@/utils/invoiceTemplate'
import type { Company, InvoiceTemplateLayout, InvoiceLogoPosition } from '@/types/business'

const company = {
  id: 'c1',
  name: 'PT Contoh Nama Perusahaan Yang Cukup Panjang Sekali',
  address: 'Jl. Merdeka 10\nBandung',
  phone: '0812',
  email: 'hi@contoh.id',
  npwp: '01.234.567.8-901.000',
  taxEnabled: true,
  taxRate: 11,
  currency: 'IDR',
  requiresApprovalWorkflow: false,
  createdAt: '',
  updatedAt: '',
} as Company

// 1×1 PNG
const logo = {
  dataUrl:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  width: 300,
  height: 100,
}

describe('renderInvoicePdf', () => {
  const layouts: InvoiceTemplateLayout[] = ['CLASSIC', 'MODERN', 'MINIMAL']
  const positions: InvoiceLogoPosition[] = ['LEFT', 'CENTER', 'RIGHT']

  for (const layout of layouts) {
    for (const logoPosition of positions) {
      it(`renders ${layout} / logo ${logoPosition}`, () => {
        const doc = renderInvoicePdf(buildSampleInvoice(company), company, {
          template: { layout, logoPosition, fontFamily: 'SERIF', showNpwp: true, termsText: 'Net 14' },
          logo,
        })
        expect(doc.getNumberOfPages()).toBe(1)
        expect(doc.output('arraybuffer').byteLength).toBeGreaterThan(1000)
      })
    }
  }

  it('renders a cancelled invoice and paginates long item lists', () => {
    const invoice = buildSampleInvoice(company)
    invoice.status = 'CANCELLED'
    invoice.cancelReason = 'Salah input harga'
    invoice.items = Array.from({ length: 40 }, (_, i) => ({ ...invoice.items[0]!, id: `x${i}` }))
    const doc = renderInvoicePdf(invoice, company, { template: { backgroundColor: '#FFFBEB' } })
    expect(doc.getNumberOfPages()).toBeGreaterThan(1)
  })

  it('works without company, logo or template', () => {
    expect(() => renderInvoicePdf(buildSampleInvoice(null), null)).not.toThrow()
  })
})

describe('invoice template utils', () => {
  it('strips non-setting keys before sending to the API', () => {
    const picked = pickTemplateSettings({ layout: 'MODERN', isCustomized: true, updatedAt: 'x' } as never)
    expect(picked.layout).toBe('MODERN')
    expect('isCustomized' in picked).toBe(false)
    expect('updatedAt' in picked).toBe(false)
  })

  it('picks readable text colour and blends colours', () => {
    expect(readableOn('#111827')).toBe('#FFFFFF')
    expect(readableOn('#FEF3C7')).toBe('#0F172A')
    expect(mixColor('#000000', '#FFFFFF', 0.5)).toBe('#808080')
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0)
  })
})
