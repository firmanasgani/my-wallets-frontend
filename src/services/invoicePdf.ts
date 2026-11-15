import jsPDF from 'jspdf'
import autoTable, { type RowInput, type Styles } from 'jspdf-autotable'
import type { Company, Invoice, InvoiceStatus, InvoiceTemplateSettings } from '@/types/business'
import {
  DEFAULT_INVOICE_TEMPLATE,
  hexToRgb,
  mixColor,
  readableOn,
  type LoadedLogo,
  type RGB,
} from '@/utils/invoiceTemplate'

/**
 * Template-driven invoice PDF (A4, mm units).
 *
 * Mirrors the three email layouts rendered by the API
 * (my-wallets-api/src/business/invoices/invoice-email.template.ts):
 *  - CLASSIC: solid coloured header band
 *  - MODERN : accent bar + large coloured title, filled total box
 *  - MINIMAL: no fills, typography and thin rules only
 */

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  DRAFT: 'DRAFT',
  SENT: 'TERKIRIM',
  PAID: 'LUNAS',
  OVERDUE: 'TERLAMBAT',
  CANCELLED: 'DIBATALKAN',
}

const STATUS_COLOR: Record<InvoiceStatus, string> = {
  DRAFT: '#64748B',
  SENT: '#2563EB',
  PAID: '#059669',
  OVERDUE: '#DC2626',
  CANCELLED: '#6B7280',
}

const PDF_FONT = { SANS: 'helvetica', SERIF: 'times', MONO: 'courier' } as const
const LOGO_HEIGHT_MM = { SMALL: 10, MEDIUM: 14, LARGE: 20 } as const

const fmtCurrency = (val: string | number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(
    typeof val === 'string' ? parseFloat(val) || 0 : val,
  )

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

export interface RenderInvoicePdfOptions {
  template?: Partial<InvoiceTemplateSettings> | null
  logo?: LoadedLogo | null
}

export function renderInvoicePdf(invoice: Invoice, company: Company | null, opts: RenderInvoicePdfOptions = {}): jsPDF {
  const t: InvoiceTemplateSettings = { ...DEFAULT_INVOICE_TEMPLATE, ...(opts.template ?? {}) }
  const logo = t.showLogo ? (opts.logo ?? null) : null
  const items = Array.isArray(invoice.items) ? invoice.items : []

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const M = 14 // margin
  const contentW = pageW - M * 2
  const font = PDF_FONT[t.fontFamily] ?? 'helvetica'

  // ── Palette ──────────────────────────────────────────────────
  const C = {
    primary: t.primaryColor,
    onPrimary: readableOn(t.primaryColor),
    accent: t.accentColor,
    bg: t.backgroundColor,
    text: t.textColor,
    muted: mixColor(t.textColor, t.backgroundColor, 0.4),
    border: mixColor(t.textColor, t.backgroundColor, 0.85),
  }
  const rgb = (hex: string): RGB => hexToRgb(hex)
  const fill = (hex: string) => doc.setFillColor(...rgb(hex))
  const ink = (hex: string) => doc.setTextColor(...rgb(hex))
  const stroke = (hex: string) => doc.setDrawColor(...rgb(hex))
  const setFont = (size: number, style: 'normal' | 'bold' = 'normal') => {
    doc.setFont(font, style)
    doc.setFontSize(size)
  }
  const paintBackground = () => {
    if (C.bg.toUpperCase() === '#FFFFFF') return
    fill(C.bg)
    doc.rect(0, 0, pageW, pageH, 'F')
  }
  const FOOTER_H = 14
  const bottomLimit = pageH - FOOTER_H - 4
  const ensureSpace = (y: number, needed: number) => {
    if (y + needed <= bottomLimit) return y
    doc.addPage()
    paintBackground()
    return M
  }

  paintBackground()

  // ── Header building blocks ───────────────────────────────────
  type Align = 'left' | 'right' | 'center'

  const brandLines: string[] = []
  if (t.showCompanyAddress && company?.address) brandLines.push(...company.address.split(/\r?\n/))
  if (t.showCompanyContact) {
    const contact = [company?.phone, company?.email].filter(Boolean).join('  ·  ')
    if (contact) brandLines.push(contact)
  }
  if (t.showNpwp && company?.npwp) brandLines.push(`NPWP: ${company.npwp}`)

  // Logo box keeps the real aspect ratio, capped at 3:1.
  let logoW = 0
  let logoH = 0
  if (logo) {
    logoH = LOGO_HEIGHT_MM[t.logoSize] ?? LOGO_HEIGHT_MM.MEDIUM
    logoW = (logo.width / logo.height) * logoH
    if (logoW > logoH * 3) {
      logoW = logoH * 3
      logoH = logoW * (logo.height / logo.width)
    }
  }

  const brandWidth = t.logoPosition === 'CENTER' ? contentW : contentW * 0.56
  const wrappedBrandLines = (() => {
    setFont(8)
    return brandLines.flatMap((l) => doc.splitTextToSize(l, brandWidth) as string[])
  })()
  const nameLines = (() => {
    setFont(14, 'bold')
    return doc.splitTextToSize(company?.name ?? '', brandWidth) as string[]
  })()
  const brandHeight = (logo ? logoH + 3 : 0) + nameLines.length * 6 + wrappedBrandLines.length * 4
  const titleHeight = 10 + 6 + (t.showStatusBadge ? 9 : 0)

  const drawBrand = (x: number, y: number, align: Align, nameColor: string, subColor: string) => {
    let cy = y
    if (logo) {
      const lx = align === 'left' ? x : align === 'right' ? x - logoW : x - logoW / 2
      try {
        doc.addImage(logo.dataUrl, 'PNG', lx, cy, logoW, logoH)
      } catch {
        /* ignore broken images */
      }
      cy += logoH + 3
    }
    setFont(14, 'bold')
    ink(nameColor)
    nameLines.forEach((line, i) => doc.text(line, x, cy + 4.5 + i * 6, { align }))
    cy += nameLines.length * 6
    setFont(8)
    ink(subColor)
    wrappedBrandLines.forEach((line) => {
      cy += 4
      doc.text(line, x, cy, { align })
    })
  }

  const drawTitle = (x: number, y: number, align: Align, titleColor: string, subColor: string, size: number, bold: boolean) => {
    setFont(size, bold ? 'bold' : 'normal')
    ink(titleColor)
    doc.text((t.title || 'INVOICE').toUpperCase(), x, y + 8, { align, charSpace: bold ? 0.6 : 1.2 })
    setFont(9.5)
    ink(subColor)
    doc.text(invoice.invoiceNumber, x, y + 14.5, { align })
    if (t.showStatusBadge) {
      const label = STATUS_LABEL[invoice.status] ?? invoice.status
      setFont(7, 'bold')
      const w = doc.getTextWidth(label) + 8
      const bx = align === 'left' ? x : align === 'right' ? x - w : x - w / 2
      fill(STATUS_COLOR[invoice.status] ?? '#64748B')
      doc.roundedRect(bx, y + 17.5, w, 6, 3, 3, 'F')
      doc.setTextColor(255, 255, 255)
      doc.text(label, bx + w / 2, y + 21.6, { align: 'center' })
    }
  }

  /** Draws brand + title according to logoPosition; returns height used. */
  const drawHeaderContent = (
    y: number,
    colors: { name: string; sub: string; title: string; titleSub: string },
    titleSize: number,
    titleBold: boolean,
  ) => {
    if (t.logoPosition === 'CENTER') {
      drawBrand(pageW / 2, y, 'center', colors.name, colors.sub)
      drawTitle(pageW / 2, y + brandHeight + 2, 'center', colors.title, colors.titleSub, titleSize, titleBold)
      return brandHeight + 2 + titleHeight
    }
    if (t.logoPosition === 'RIGHT') {
      drawTitle(M, y, 'left', colors.title, colors.titleSub, titleSize, titleBold)
      drawBrand(pageW - M, y, 'right', colors.name, colors.sub)
    } else {
      drawBrand(M, y, 'left', colors.name, colors.sub)
      drawTitle(pageW - M, y, 'right', colors.title, colors.titleSub, titleSize, titleBold)
    }
    return Math.max(brandHeight, titleHeight)
  }

  const contentHeight =
    t.logoPosition === 'CENTER' ? brandHeight + 2 + titleHeight : Math.max(brandHeight, titleHeight)

  // ── Header per layout ────────────────────────────────────────
  let y: number
  if (t.layout === 'CLASSIC') {
    const h = contentHeight + 16
    fill(C.primary)
    doc.rect(0, 0, pageW, h, 'F')
    const sub = mixColor(C.onPrimary, C.primary, 0.25)
    drawHeaderContent(8, { name: C.onPrimary, sub, title: C.onPrimary, titleSub: sub }, 22, true)
    y = h
  } else if (t.layout === 'MODERN') {
    fill(C.primary)
    doc.rect(0, 0, pageW, 2.5, 'F')
    drawHeaderContent(12, { name: C.text, sub: C.muted, title: C.primary, titleSub: C.muted }, 26, true)
    y = 12 + contentHeight + 6
  } else {
    drawHeaderContent(14, { name: C.text, sub: C.muted, title: C.text, titleSub: C.primary }, 22, false)
    y = 14 + contentHeight + 5
    stroke(C.text)
    doc.setLineWidth(0.3)
    doc.line(M, y, pageW - M, y)
    y += 1
  }

  // ── Cancelled banner ─────────────────────────────────────────
  if (invoice.status === 'CANCELLED') {
    y += 5
    const reasonLines = invoice.cancelReason
      ? (doc.splitTextToSize(`Alasan: ${invoice.cancelReason}`, contentW - 8) as string[])
      : []
    const bh = 9 + reasonLines.length * 4
    doc.setFillColor(254, 242, 242)
    doc.setDrawColor(254, 202, 202)
    doc.roundedRect(M, y, contentW, bh, 1.5, 1.5, 'FD')
    setFont(9, 'bold')
    doc.setTextColor(185, 28, 28)
    doc.text('Invoice ini telah dibatalkan dan tidak perlu dibayar.', M + 4, y + 6)
    setFont(8)
    doc.setTextColor(127, 29, 29)
    reasonLines.forEach((l, i) => doc.text(l, M + 4, y + 10.5 + i * 4))
    y += bh + 4
  }

  // ── Client + dates ───────────────────────────────────────────
  const labelColor = t.layout === 'MINIMAL' ? C.muted : C.primary
  const drawLabel = (label: string, x: number, yy: number, color = labelColor) => {
    setFont(6.8, 'bold')
    ink(color)
    doc.text(label.toUpperCase(), x, yy, { charSpace: 0.3 })
  }
  const clientLines = [invoice.clientEmail, ...(invoice.clientAddress?.split(/\r?\n/) ?? [])].filter(Boolean) as string[]
  const drawClient = (x: number, yy: number, width: number, label = labelColor) => {
    drawLabel('Ditagihkan kepada', x, yy, label)
    setFont(11, 'bold')
    ink(C.text)
    doc.text(invoice.clientName, x, yy + 6, { maxWidth: width })
    setFont(8)
    ink(C.muted)
    let cy = yy + 6
    clientLines.forEach((l) => {
      ;(doc.splitTextToSize(l, width) as string[]).forEach((wl) => {
        cy += 4.2
        doc.text(wl, x, cy)
      })
    })
    return cy - yy + 2
  }
  const drawDate = (label: string, value: string, x: number, yy: number) => {
    drawLabel(label, x, yy)
    setFont(9.5, 'bold')
    ink(C.text)
    doc.text(value, x, yy + 5.5)
  }
  const clientBlockH = 10 + clientLines.length * 4.2 + 2

  if (t.layout === 'CLASSIC') {
    fill(C.accent)
    doc.rect(0, y, pageW, 13, 'F')
    drawDate('Tanggal terbit', fmtDate(invoice.issueDate), M, y + 5)
    drawDate('Jatuh tempo', fmtDate(invoice.dueDate), M + 70, y + 5)
    y += 18
    stroke(C.border)
    doc.setLineWidth(0.25)
    doc.roundedRect(M, y, contentW, clientBlockH + 6, 1.5, 1.5, 'S')
    drawClient(M + 5, y + 6, contentW - 10, C.muted)
    y += clientBlockH + 6 + 6
  } else {
    const boxH = Math.max(clientBlockH, 24) + 8
    if (t.layout === 'MODERN') {
      fill(C.accent)
      doc.roundedRect(M, y + 2, contentW, boxH, 2, 2, 'F')
    }
    const pad = t.layout === 'MODERN' ? 5 : 0
    drawClient(M + pad, y + 2 + 6, contentW * 0.55 - pad)
    const dx = M + contentW * 0.62
    drawDate('Tanggal terbit', fmtDate(invoice.issueDate), dx, y + 2 + 6)
    drawDate('Jatuh tempo', fmtDate(invoice.dueDate), dx, y + 2 + 18)
    y += boxH + 8
  }

  // ── Items table ──────────────────────────────────────────────
  const showDiscount = t.showItemDiscount && items.some((i) => parseFloat(i.discountAmount) > 0)
  const showTax = t.showItemTax && items.some((i) => i.taxable && parseFloat(i.taxRate) > 0)

  const head = ['Deskripsi', 'Qty', 'Harga satuan']
  if (showDiscount) head.push('Diskon')
  if (showTax) head.push('PPN')
  head.push('Total')

  const body: RowInput[] = items.map((item) => {
    const row: string[] = [item.description, String(parseFloat(item.quantity)), fmtCurrency(item.unitPrice)]
    if (showDiscount) row.push(parseFloat(item.discountAmount) > 0 ? `-${fmtCurrency(item.discountAmount)}` : '–')
    if (showTax) row.push(item.taxable && parseFloat(item.taxRate) > 0 ? `${parseFloat(item.taxRate)}%` : '–')
    row.push(fmtCurrency(item.total))
    return row
  })

  const colStyles: Record<number, Partial<Styles>> = { 0: { cellWidth: 'auto' }, 1: { halign: 'right', cellWidth: 14 }, 2: { halign: 'right', cellWidth: 32 } }
  let ci = 3
  if (showDiscount) colStyles[ci++] = { halign: 'right', cellWidth: 28, textColor: [220, 38, 38] }
  if (showTax) colStyles[ci++] = { halign: 'center', cellWidth: 14 }
  colStyles[ci] = { halign: 'right', cellWidth: 34, fontStyle: 'bold' }

  const headStyles: Partial<Styles> =
    t.layout === 'CLASSIC'
      ? { fillColor: rgb(C.primary), textColor: rgb(C.onPrimary) }
      : t.layout === 'MODERN'
        ? { fillColor: rgb(C.bg), textColor: rgb(C.primary), lineColor: rgb(C.primary), lineWidth: { bottom: 0.6 } }
        : { fillColor: rgb(C.bg), textColor: rgb(C.text), lineColor: rgb(C.text), lineWidth: { bottom: 0.3 } }

  autoTable(doc, {
    startY: y,
    head: [head],
    body,
    margin: { left: M, right: M, bottom: FOOTER_H + 6 },
    styles: { font, fontSize: 8.5, cellPadding: 3.2, textColor: rgb(C.text), fillColor: rgb(C.bg), lineColor: rgb(C.border) },
    headStyles: { ...headStyles, font, fontSize: 7.5, fontStyle: 'bold', cellPadding: 3.2 },
    bodyStyles: { lineWidth: { bottom: 0.2 } },
    alternateRowStyles: t.layout === 'CLASSIC' ? { fillColor: rgb(mixColor(C.accent, C.bg, 0.55)) } : {},
    columnStyles: colStyles,
    // columnStyles only affect body cells — mirror alignment onto headers.
    didParseCell: (data) => {
      if (data.section === 'head') {
        const align = colStyles[data.column.index]?.halign
        if (align) data.cell.styles.halign = align
      }
    },
    willDrawPage: (data) => {
      if (data.pageNumber > 1) paintBackground()
    },
  })

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7

  // ── Totals (right) ───────────────────────────────────────────
  const amountPaid = parseFloat(invoice.amountPaid ?? '0') || 0
  const totalsRows =
    1 + (parseFloat(invoice.taxAmount) > 0 ? 1 : 0) + (parseFloat(invoice.withholdingTaxAmount) > 0 ? 1 : 0)
  const totalsH = totalsRows * 6 + 14 + (amountPaid > 0 ? 12 : 0)
  y = ensureSpace(y, totalsH)
  const startY = y

  const totalsX = pageW - M - 78
  const right = pageW - M
  let ty = y + 3
  const totalRow = (label: string, value: string, color = C.muted, valueColor = C.text, bold = false) => {
    setFont(8.8, bold ? 'bold' : 'normal')
    ink(color)
    doc.text(label, totalsX, ty)
    ink(valueColor)
    doc.text(value, right, ty, { align: 'right' })
    ty += 6
  }
  totalRow('Subtotal', fmtCurrency(invoice.subtotal))
  if (parseFloat(invoice.taxAmount) > 0) {
    totalRow(company?.taxRate ? `PPN (${Number(company.taxRate)}%)` : 'PPN', fmtCurrency(invoice.taxAmount))
  }
  if (parseFloat(invoice.withholdingTaxAmount) > 0) {
    const name = invoice.taxConfig?.name ?? 'Pajak'
    const rate = invoice.taxConfig?.rate ? ` (${parseFloat(invoice.taxConfig.rate)}%)` : ''
    totalRow(`${name}${rate}`, fmtCurrency(invoice.withholdingTaxAmount))
  }

  // Total box
  const boxY = ty - 2
  let totalColor = C.primary
  if (t.layout === 'MODERN') {
    fill(C.primary)
    doc.roundedRect(totalsX - 3, boxY, right - totalsX + 3, 10, 1.5, 1.5, 'F')
    totalColor = C.onPrimary
  } else if (t.layout === 'MINIMAL') {
    stroke(C.primary)
    doc.setLineWidth(0.6)
    doc.line(totalsX - 3, boxY, right, boxY)
  } else {
    fill(C.accent)
    doc.roundedRect(totalsX - 3, boxY, right - totalsX + 3, 10, 1.5, 1.5, 'F')
    totalColor = readableOn(C.accent) === '#FFFFFF' ? '#FFFFFF' : C.primary
  }
  setFont(11, 'bold')
  ink(totalColor)
  doc.text('Total', totalsX, boxY + 6.7)
  doc.text(fmtCurrency(invoice.totalAmount), right - (t.layout === 'MINIMAL' ? 0 : 3), boxY + 6.7, { align: 'right' })
  ty = boxY + 16

  if (amountPaid > 0) {
    totalRow('Sudah dibayar', fmtCurrency(amountPaid), '#B45309', '#B45309')
    const remaining = Math.max(0, parseFloat(invoice.totalAmount) - amountPaid)
    totalRow('Sisa tagihan', fmtCurrency(remaining), '#DC2626', '#DC2626', true)
  }

  // ── Bank / notes / terms (left) ──────────────────────────────
  const leftW = totalsX - M - 10
  let ly = startY
  const ba = invoice.paymentBankAccount
  if (t.showBankAccount && ba) {
    const h = 22
    if (t.layout === 'MINIMAL') {
      stroke(C.border)
      doc.setLineWidth(0.25)
      doc.roundedRect(M, ly, leftW, h, 1.5, 1.5, 'S')
    } else {
      fill(C.accent)
      doc.roundedRect(M, ly, leftW, h, 1.5, 1.5, 'F')
    }
    drawLabel('Rekening tujuan transfer', M + 4, ly + 5.5)
    setFont(9.5, 'bold')
    ink(C.text)
    doc.text(ba.bankName, M + 4, ly + 11)
    doc.setFont('courier', 'bold')
    doc.setFontSize(9.5)
    doc.text(ba.accountNumber, M + 4, ly + 15.5)
    setFont(7.5)
    ink(C.muted)
    doc.text(`a/n ${ba.accountHolder}`, M + 4, ly + 19.5, { maxWidth: leftW - 8 })
    ly += h + 6
  }

  const textBlock = (label: string, text: string | null | undefined) => {
    if (!text) return
    setFont(8.2)
    const lines = doc.splitTextToSize(text, leftW) as string[]
    ly = ensureSpace(ly, 6 + lines.length * 4)
    drawLabel(label, M, ly + 2)
    setFont(8.2)
    ink(C.muted)
    lines.forEach((l, i) => doc.text(l, M, ly + 7 + i * 4))
    ly += 9 + lines.length * 4
  }
  if (t.showNotes) textBlock('Catatan', invoice.notes)
  textBlock('Syarat & ketentuan', t.termsText)

  // ── Cancelled watermark ─────────────────────────────────────
  if (invoice.status === 'CANCELLED') {
    const pages = doc.getNumberOfPages()
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i)
      const GState = (doc as unknown as { GState: new (o: object) => unknown }).GState
      doc.saveGraphicsState()
      ;(doc as unknown as { setGState: (g: unknown) => void }).setGState(new GState({ opacity: 0.06 }))
      doc.setFont(font, 'bold')
      doc.setFontSize(72)
      doc.setTextColor(220, 38, 38)
      doc.text('DIBATALKAN', pageW / 2, pageH / 2, { align: 'center', angle: 30 })
      doc.restoreGraphicsState()
    }
  }

  // ── Footer on every page ────────────────────────────────────
  const footerText = t.footerText?.trim() || 'Dibuat dengan Moneytory'
  const printed = `Dicetak pada ${new Date().toLocaleString('id-ID')}`
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    stroke(C.border)
    doc.setLineWidth(0.25)
    doc.line(M, pageH - FOOTER_H, pageW - M, pageH - FOOTER_H)
    setFont(7.5)
    ink(C.muted)
    const lines = (doc.splitTextToSize(footerText, contentW) as string[]).slice(0, 2)
    lines.forEach((l, li) => doc.text(l, pageW / 2, pageH - FOOTER_H + 4.5 + li * 3.5, { align: 'center' }))
    setFont(6.5)
    doc.text(`${printed}${pages > 1 ? `  ·  Halaman ${i}/${pages}` : ''}`, pageW / 2, pageH - 2.8, { align: 'center' })
  }

  return doc
}
