import ExcelJS from 'exceljs'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Transaction } from '@/types/transaction'
import type { BudgetReportItem } from '@/types/budget'
import type {
  Invoice,
  Company,
  BusinessTransaction,
  ProfitLossResponse,
  BalanceSheetResponse,
  CashFlowResponse,
  JournalReportEntry,
} from '@/types/business'

class ExportService {
  /**
   * Format currency for export
   */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  /**
   * Export Transactions to Excel
   */
  async exportTransactionsToExcel(
    transactions: Transaction[],
    title: string = 'Laporan Transaksi',
  ) {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Transaksi')

    // Add Title
    const titleRow = worksheet.addRow([title])
    titleRow.font = { name: 'Arial', family: 4, size: 16, bold: true }
    worksheet.mergeCells('A1:G1')
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' }
    worksheet.addRow([]) // Spacer

    // Define Columns
    worksheet.columns = [
      { header: 'Tanggal', key: 'date', width: 15 },
      { header: 'Deskripsi', key: 'description', width: 30 },
      { header: 'Kategori', key: 'category', width: 20 },
      { header: 'Akun', key: 'account', width: 20 },
      { header: 'Tipe', key: 'type', width: 15 },
      { header: 'Jumlah', key: 'amount', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
    ]

    // Set Headers at Row 3
    const headerRow = worksheet.getRow(3)
    headerRow.values = worksheet.columns?.map((c) => String(c.header)) || []
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } }
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4F46E5' }, // Indigo-600
      }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
    })

    // Add Data
    transactions.forEach((tx) => {
      const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount

      let accountName = '-'
      if (tx.transactionType === 'INCOME') {
        accountName = tx.destinationAccount?.accountName || '-'
      } else if (tx.transactionType === 'EXPENSE') {
        accountName = tx.sourceAccount?.accountName || '-'
      } else if (tx.transactionType === 'TRANSFER') {
        accountName = `${tx.sourceAccount?.accountName || '?'} -> ${tx.destinationAccount?.accountName || '?'}`
      }

      worksheet.addRow({
        date: new Date(tx.transactionDate).toLocaleDateString('id-ID'),
        description: tx.description || '-',
        category: tx.category?.categoryName || '-',
        account: accountName,
        type:
          tx.transactionType === 'INCOME'
            ? 'Pemasukan'
            : tx.transactionType === 'EXPENSE'
              ? 'Pengeluaran'
              : 'Transfer',
        amount: amount,
        status: tx.isRecurring ? 'Berulang' : 'Sekali',
      })
    })

    // Format Amount Column
    worksheet.getColumn('amount').numFmt = '#,##0'

    // Write to Buffer and Download
    const buffer = await workbook.xlsx.writeBuffer()
    this.downloadFile(
      buffer,
      `${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
  }

  /**
   * Export Transactions to PDF
   */
  exportTransactionsToPDF(transactions: Transaction[], title: string = 'Laporan Transaksi') {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.setTextColor(79, 70, 229) // Indigo-600
    doc.text(title, 14, 22)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 30)

    // Table
    const tableData = transactions.map((tx) => {
      const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount

      let accountName = '-'
      if (tx.transactionType === 'INCOME') {
        accountName = tx.destinationAccount?.accountName || '-'
      } else if (tx.transactionType === 'EXPENSE') {
        accountName = tx.sourceAccount?.accountName || '-'
      } else if (tx.transactionType === 'TRANSFER') {
        accountName = `${tx.sourceAccount?.accountName || '?'} -> ${tx.destinationAccount?.accountName || '?'}`
      }

      return [
        new Date(tx.transactionDate).toLocaleDateString('id-ID'),
        tx.description || '-',
        tx.category?.categoryName || '-',
        accountName,
        tx.transactionType === 'INCOME'
          ? 'Pemasukan'
          : tx.transactionType === 'EXPENSE'
            ? 'Pengeluaran'
            : 'Transfer',
        this.formatCurrency(amount),
      ]
    })

    autoTable(doc, {
      startY: 35,
      head: [['Tanggal', 'Deskripsi', 'Kategori', 'Akun', 'Tipe', 'Jumlah']],
      body: tableData,
      headStyles: { fillColor: [79, 70, 229] },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      styles: { fontSize: 8, cellPadding: 3 },
    })

    doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`)
  }

  /**
   * Export Budgets to Excel
   */
  async exportBudgetsToExcel(budgets: BudgetReportItem[], periodName: string) {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Anggaran')

    const title = `Laporan Anggaran - ${periodName}`
    const titleRow = worksheet.addRow([title])
    titleRow.font = { name: 'Arial', family: 4, size: 16, bold: true }
    worksheet.mergeCells('A1:F1')
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' }
    worksheet.addRow([])

    worksheet.columns = [
      { header: 'Kategori', key: 'category', width: 25 },
      { header: 'Anggaran', key: 'amount', width: 20 },
      { header: 'Terpakai', key: 'spent', width: 20 },
      { header: 'Sisa', key: 'remaining', width: 20 },
      { header: 'Persentase', key: 'percentage', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
    ]

    // Set Headers at Row 3
    const headerRow = worksheet.getRow(3)
    headerRow.values = worksheet.columns?.map((c) => String(c.header)) || []
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } }
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F46E5' } }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
    })

    budgets.forEach((b) => {
      let status = 'Aman'
      if (b.percentage >= 100) status = 'Melebihi'
      else if (b.percentage >= 80) status = 'Peringatan'

      worksheet.addRow({
        category: b.category?.categoryName || '-',
        amount: Number(b.amount),
        spent: b.spent,
        remaining: b.remaining,
        percentage: `${b.percentage.toFixed(1)}%`,
        status: status,
      })
    })

    worksheet.getColumn('amount').numFmt = '#,##0'
    worksheet.getColumn('spent').numFmt = '#,##0'
    worksheet.getColumn('remaining').numFmt = '#,##0'

    const buffer = await workbook.xlsx.writeBuffer()
    this.downloadFile(
      buffer,
      `laporan_anggaran_${periodName.toLowerCase().replace(/\s+/g, '_')}.xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
  }

  /**
   * Export Budgets to PDF
   */
  exportBudgetsToPDF(budgets: BudgetReportItem[], periodName: string) {
    const doc = new jsPDF()
    const title = `Laporan Anggaran - ${periodName}`

    doc.setFontSize(20)
    doc.setTextColor(79, 70, 229)
    doc.text(title, 14, 22)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 30)

    const tableData = budgets.map((b) => {
      let status = 'Aman'
      if (b.percentage >= 100) status = 'Melebihi'
      else if (b.percentage >= 80) status = 'Peringatan'

      return [
        b.category?.categoryName || '-',
        this.formatCurrency(Number(b.amount)),
        this.formatCurrency(b.spent),
        this.formatCurrency(b.remaining),
        `${b.percentage.toFixed(1)}%`,
        status,
      ]
    })

    autoTable(doc, {
      startY: 35,
      head: [['Kategori', 'Anggaran', 'Terpakai', 'Sisa', '%', 'Status']],
      body: tableData,
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 9, cellPadding: 3 },
    })

    doc.save(`laporan_anggaran_${periodName.toLowerCase().replace(/\s+/g, '_')}.pdf`)
  }

  /**
   * Export Accounts List to Excel
   */
  async exportAccountsToExcel(accounts: any[], title: string = 'Laporan Daftar Akun') {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Daftar Akun')

    const titleRow = worksheet.addRow([title])
    titleRow.font = { name: 'Arial', family: 4, size: 16, bold: true }
    worksheet.mergeCells('A1:E1')
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' }
    worksheet.addRow([])

    worksheet.columns = [
      { header: 'Nama Akun', key: 'name', width: 25 },
      { header: 'Tipe', key: 'type', width: 15 },
      { header: 'Mata Uang', key: 'currency', width: 10 },
      { header: 'Saldo Awal', key: 'initial', width: 20 },
      { header: 'Saldo Saat Ini', key: 'current', width: 20 },
    ]

    // Set Headers at Row 3
    const headerRow = worksheet.getRow(3)
    headerRow.values = worksheet.columns?.map((c) => String(c.header)) || []
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } }
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F46E5' } }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
    })

    accounts.forEach((acc) => {
      worksheet.addRow({
        name: acc.accountName,
        type: acc.accountType,
        currency: acc.currency,
        initial: Number(acc.initialBalance),
        current: Number(acc.currentBalance),
      })
    })

    worksheet.getColumn('initial').numFmt = '#,##0'
    worksheet.getColumn('current').numFmt = '#,##0'

    const buffer = await workbook.xlsx.writeBuffer()
    this.downloadFile(
      buffer,
      `daftar_akun_${Date.now()}.xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
  }

  /**
   * Export Accounts List to PDF
   */
  exportAccountsToPDF(accounts: any[], title: string = 'Laporan Daftar Akun') {
    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.setTextColor(79, 70, 229)
    doc.text(title, 14, 22)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 30)

    const tableData = accounts.map((acc) => [
      acc.accountName,
      acc.accountType,
      acc.currency,
      this.formatCurrency(Number(acc.initialBalance)),
      this.formatCurrency(Number(acc.currentBalance)),
    ])

    autoTable(doc, {
      startY: 35,
      head: [['Nama Akun', 'Tipe', 'Mata Uang', 'Saldo Awal', 'Saldo Saat Ini']],
      body: tableData,
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 10, cellPadding: 3 },
    })

    doc.save(`daftar_akun_${Date.now()}.pdf`)
  }

  /**
   * Load an image URL as a base64 data URL for embedding in PDF.
   */
  private async loadImageAsDataURL(url: string): Promise<string | null> {
    try {
      const response = await fetch(url)
      if (!response.ok) return null
      const blob = await response.blob()
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(blob)
      })
    } catch {
      return null
    }
  }

  /**
   * Export Invoice Journal (transactions) to Excel
   */
  async exportInvoiceJournalToExcel(
    journals: BusinessTransaction[],
    invoice: Invoice,
    company: Company | null,
  ) {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Jurnal Invoice')

    const fmtCurrency = (val: string | number) => {
      const num = typeof val === 'string' ? parseFloat(val) : val
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
    }
    const fmtDate = (d: string) =>
      new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

    // ── Title ─────────────────────────────────────────────────────
    worksheet.mergeCells('A1:F1')
    const titleCell = worksheet.getCell('A1')
    titleCell.value = `Jurnal Invoice ${invoice.invoiceNumber}`
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: '4F46E5' } }
    titleCell.alignment = { horizontal: 'left' }

    if (company?.name) {
      worksheet.mergeCells('A2:F2')
      const companyCell = worksheet.getCell('A2')
      companyCell.value = company.name
      companyCell.font = { name: 'Arial', size: 10, color: { argb: '475569' } }
    }

    worksheet.mergeCells('A3:F3')
    const printedCell = worksheet.getCell('A3')
    printedCell.value = `Dicetak pada: ${new Date().toLocaleString('id-ID')}`
    printedCell.font = { name: 'Arial', size: 9, color: { argb: '94A3B8' } }

    worksheet.addRow([]) // spacer

    // ── Table Header ──────────────────────────────────────────────
    const headerRow = worksheet.addRow(['Tanggal', 'Keterangan Jurnal', 'Kode Akun', 'Nama Akun', 'Debit', 'Kredit'])
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F46E5' } }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = { bottom: { style: 'thin', color: { argb: 'C7D2FE' } } }
    })
    headerRow.height = 20

    // ── Journal Rows ──────────────────────────────────────────────
    let grandTotalDebit = 0
    let grandTotalCredit = 0
    let rowIdx = 0

    journals.forEach((tx) => {
      tx.lines.forEach((line, lineIdx) => {
        const debit = line.type === 'DEBIT' ? parseFloat(line.amount) : 0
        const credit = line.type === 'CREDIT' ? parseFloat(line.amount) : 0
        grandTotalDebit += debit
        grandTotalCredit += credit

        const desc = line.description
          ?? (line.contact ? line.contact.name : null)
          ?? tx.description

        const row = worksheet.addRow([
          lineIdx === 0 ? fmtDate(tx.transactionDate) : '',
          lineIdx === 0 ? tx.description : '',
          line.coa.code,
          line.coa.name,
          debit > 0 ? debit : '',
          credit > 0 ? credit : '',
        ])

        const bgColor = rowIdx % 2 === 0 ? 'FFFFFF' : 'F1F5F9'
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } }
          cell.font = { color: { argb: '1E293B' } }
        })

        row.getCell(1).font = { color: { argb: '64748B' } }
        row.getCell(2).font = { color: { argb: '334155' } }
        row.getCell(3).font = { color: { argb: '94A3B8' }, name: 'Courier New' }
        row.getCell(4).font = { color: { argb: '1E293B' } }

        if (debit > 0) {
          row.getCell(5).numFmt = '#,##0'
          row.getCell(5).alignment = { horizontal: 'right' }
          row.getCell(5).font = { color: { argb: '166534' } } // green for debit
        }
        if (credit > 0) {
          row.getCell(6).numFmt = '#,##0'
          row.getCell(6).alignment = { horizontal: 'right' }
          row.getCell(6).font = { color: { argb: 'B91C1C' } } // red for credit
        }

        rowIdx++
      })

      // Separator after each journal entry
      const sepRow = worksheet.addRow([''])
      sepRow.height = 4
    })

    // ── Grand Total ───────────────────────────────────────────────
    worksheet.addRow([])
    const totalRow = worksheet.addRow(['', '', '', 'TOTAL', grandTotalDebit, grandTotalCredit])
    totalRow.getCell(4).font = { bold: true, color: { argb: '4F46E5' } }
    totalRow.getCell(4).alignment = { horizontal: 'right' }
    totalRow.getCell(5).numFmt = '#,##0'
    totalRow.getCell(5).font = { bold: true, color: { argb: '166534' } }
    totalRow.getCell(5).alignment = { horizontal: 'right' }
    totalRow.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } }
    totalRow.getCell(6).numFmt = '#,##0'
    totalRow.getCell(6).font = { bold: true, color: { argb: 'B91C1C' } }
    totalRow.getCell(6).alignment = { horizontal: 'right' }
    totalRow.getCell(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } }

    // ── Column Widths ─────────────────────────────────────────────
    worksheet.getColumn(1).width = 20
    worksheet.getColumn(2).width = 36
    worksheet.getColumn(3).width = 14
    worksheet.getColumn(4).width = 30
    worksheet.getColumn(5).width = 20
    worksheet.getColumn(6).width = 20

    const buffer = await workbook.xlsx.writeBuffer()
    this.downloadFile(
      buffer,
      `jurnal_${invoice.invoiceNumber}.xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
  }

  /**
   * Export Invoice Journal (transactions) to PDF
   */
  exportInvoiceJournalToPDF(
    journals: BusinessTransaction[],
    invoice: Invoice,
    company: Company | null,
  ) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })
    const pageW = doc.internal.pageSize.getWidth()
    const margin = 14

    const fmtCurrency = (val: string | number) => {
      const num = typeof val === 'string' ? parseFloat(val) : val
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
    }
    const fmtDate = (d: string) =>
      new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

    // ── Header strip ─────────────────────────────────────────────
    doc.setFillColor(79, 70, 229)
    doc.rect(0, 0, pageW, 24, 'F')

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(`Jurnal Invoice ${invoice.invoiceNumber}`, margin, 12)

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(199, 210, 254)
    if (company?.name) doc.text(company.name, margin, 19)
    doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, pageW - margin, 19, { align: 'right' })

    // ── Build table rows ─────────────────────────────────────────
    const tableRows: (string | { content: string; styles: object })[][] = []
    let grandTotalDebit = 0
    let grandTotalCredit = 0

    journals.forEach((tx) => {
      tx.lines.forEach((line, lineIdx) => {
        const debit = line.type === 'DEBIT' ? parseFloat(line.amount) : 0
        const credit = line.type === 'CREDIT' ? parseFloat(line.amount) : 0
        grandTotalDebit += debit
        grandTotalCredit += credit

        tableRows.push([
          lineIdx === 0 ? fmtDate(tx.transactionDate) : '',
          lineIdx === 0 ? tx.description : '',
          line.coa.code,
          line.coa.name,
          debit > 0 ? fmtCurrency(debit) : '—',
          credit > 0 ? fmtCurrency(credit) : '—',
        ])
      })
    })

    autoTable(doc, {
      startY: 30,
      head: [['Tanggal', 'Keterangan', 'Kode Akun', 'Nama Akun', 'Debit', 'Kredit']],
      body: tableRows,
      foot: [['', '', '', 'TOTAL', fmtCurrency(grandTotalDebit), fmtCurrency(grandTotalCredit)]],
      margin: { left: margin, right: margin },
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 8, fontStyle: 'bold', cellPadding: 3 },
      bodyStyles: { fontSize: 8, cellPadding: 3, textColor: [30, 41, 59] },
      footStyles: { fillColor: [238, 242, 255], textColor: [79, 70, 229], fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 22, fontStyle: 'normal', textColor: [148, 163, 184] },
        3: { cellWidth: 55 },
        4: { cellWidth: 38, halign: 'right', textColor: [22, 101, 52] },
        5: { cellWidth: 38, halign: 'right', textColor: [185, 28, 28] },
      },
    })

    doc.save(`jurnal_${invoice.invoiceNumber}.pdf`)
  }

  /**
   * Export single Business Transaction (Journal Entry) to Excel
   */
  async exportBusinessTransactionToExcel(tx: BusinessTransaction, companyName?: string) {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Bukti Jurnal')

    const fmtDate = (d: string) =>
      new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

    // ── Header ────────────────────────────────────────────────────
    worksheet.mergeCells('A1:F1')
    const titleCell = worksheet.getCell('A1')
    titleCell.value = 'Bukti Jurnal'
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: '4F46E5' } }

    if (companyName) {
      worksheet.mergeCells('A2:F2')
      worksheet.getCell('A2').value = companyName
      worksheet.getCell('A2').font = { name: 'Arial', size: 10, color: { argb: '475569' } }
    }

    worksheet.mergeCells('A3:F3')
    worksheet.getCell('A3').value = `Dicetak pada: ${new Date().toLocaleString('id-ID')}`
    worksheet.getCell('A3').font = { name: 'Arial', size: 9, color: { argb: '94A3B8' } }

    worksheet.addRow([]) // spacer

    // ── Transaction Meta ──────────────────────────────────────────
    const metaStyle = { name: 'Arial', size: 9 }
    worksheet.addRow(['Tanggal', fmtDate(tx.transactionDate)]).getCell(1).font = { ...metaStyle, bold: true }
    worksheet.addRow(['Keterangan', tx.description]).getCell(1).font = { ...metaStyle, bold: true }
    if (tx.invoice) {
      worksheet.addRow(['Ref Invoice', tx.invoice.invoiceNumber]).getCell(1).font = { ...metaStyle, bold: true }
    }
    worksheet.addRow([]) // spacer

    // ── Table Header ──────────────────────────────────────────────
    const headerRow = worksheet.addRow(['Kode Akun', 'Nama Akun', 'Kontak', 'Keterangan Baris', 'Debit', 'Kredit'])
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F46E5' } }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
    })
    headerRow.height = 20

    // ── Lines ─────────────────────────────────────────────────────
    let totalDebit = 0
    let totalCredit = 0

    tx.lines.forEach((line, idx) => {
      const debit = line.type === 'DEBIT' ? parseFloat(line.amount) : 0
      const credit = line.type === 'CREDIT' ? parseFloat(line.amount) : 0
      totalDebit += debit
      totalCredit += credit

      const row = worksheet.addRow([
        line.type === 'CREDIT' ? `    ${line.coa.code}` : line.coa.code,
        line.type === 'CREDIT' ? `    ${line.coa.name}` : line.coa.name,
        line.contact?.name ?? '',
        line.description ?? '',
        debit > 0 ? debit : '',
        credit > 0 ? credit : '',
      ])

      const bg = idx % 2 === 0 ? 'FFFFFF' : 'F8FAFC'
      row.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
        cell.font = { name: 'Arial', size: 9 }
      })
      row.getCell(1).font = { name: 'Courier New', size: 9, color: { argb: '94A3B8' } }

      if (debit > 0) {
        row.getCell(5).numFmt = '#,##0'
        row.getCell(5).alignment = { horizontal: 'right' }
        row.getCell(5).font = { name: 'Arial', size: 9, color: { argb: '166534' } }
      }
      if (credit > 0) {
        row.getCell(6).numFmt = '#,##0'
        row.getCell(6).alignment = { horizontal: 'right' }
        row.getCell(6).font = { name: 'Arial', size: 9, color: { argb: 'B91C1C' } }
      }
    })

    // ── Total ─────────────────────────────────────────────────────
    worksheet.addRow([])
    const totalRow = worksheet.addRow(['', '', '', 'TOTAL', totalDebit, totalCredit])
    totalRow.getCell(4).font = { bold: true, color: { argb: '4F46E5' } }
    totalRow.getCell(4).alignment = { horizontal: 'right' }
    totalRow.getCell(5).numFmt = '#,##0'
    totalRow.getCell(5).font = { bold: true, color: { argb: '166534' } }
    totalRow.getCell(5).alignment = { horizontal: 'right' }
    totalRow.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } }
    totalRow.getCell(6).numFmt = '#,##0'
    totalRow.getCell(6).font = { bold: true, color: { argb: 'B91C1C' } }
    totalRow.getCell(6).alignment = { horizontal: 'right' }
    totalRow.getCell(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } }

    worksheet.getColumn(1).width = 16
    worksheet.getColumn(2).width = 32
    worksheet.getColumn(3).width = 22
    worksheet.getColumn(4).width = 28
    worksheet.getColumn(5).width = 18
    worksheet.getColumn(6).width = 18

    const safeDesc = tx.description.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30)
    const buffer = await workbook.xlsx.writeBuffer()
    this.downloadFile(
      buffer,
      `jurnal_${safeDesc}_${tx.transactionDate}.xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
  }

  /**
   * Export single Business Transaction (Journal Entry) to PDF
   */
  exportBusinessTransactionToPDF(tx: BusinessTransaction, companyName?: string) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const pageW = doc.internal.pageSize.getWidth()
    const margin = 14

    const fmtCurrency = (val: string | number) => {
      const num = typeof val === 'string' ? parseFloat(val) : val
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
    }
    const fmtDate = (d: string) =>
      new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

    // ── Header strip ─────────────────────────────────────────────
    doc.setFillColor(79, 70, 229)
    doc.rect(0, 0, pageW, 26, 'F')

    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text('Bukti Jurnal', margin, 11)

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(199, 210, 254)
    if (companyName) doc.text(companyName, margin, 18)
    doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, pageW - margin, 18, { align: 'right' })

    // ── Transaction Meta ─────────────────────────────────────────
    let y = 34
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 41, 59)
    doc.text('Tanggal:', margin, y)
    doc.setFont('helvetica', 'normal')
    doc.text(fmtDate(tx.transactionDate), margin + 26, y)

    doc.setFont('helvetica', 'bold')
    doc.text('Keterangan:', margin, y + 6)
    doc.setFont('helvetica', 'normal')
    const descLines = doc.splitTextToSize(tx.description, pageW - margin * 2 - 30)
    doc.text(descLines, margin + 26, y + 6)

    if (tx.invoice) {
      y += 6 * descLines.length + 3
      doc.setFont('helvetica', 'bold')
      doc.text('Ref Invoice:', margin, y + 6)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(79, 70, 229)
      doc.text(tx.invoice.invoiceNumber, margin + 26, y + 6)
      doc.setTextColor(30, 41, 59)
      y += 6
    }

    const startY = y + 14

    // ── Journal Lines Table ───────────────────────────────────────
    const tableRows: (string | { content: string; styles: object })[][] = []
    let totalDebit = 0
    let totalCredit = 0

    tx.lines.forEach((line) => {
      const debit = line.type === 'DEBIT' ? parseFloat(line.amount) : 0
      const credit = line.type === 'CREDIT' ? parseFloat(line.amount) : 0
      totalDebit += debit
      totalCredit += credit

      tableRows.push([
        line.type === 'DEBIT' ? line.coa.code : `    ${line.coa.code}`,
        line.type === 'DEBIT' ? line.coa.name : `    ${line.coa.name}`,
        line.contact?.name ?? '—',
        line.description ?? '—',
        debit > 0 ? fmtCurrency(debit) : '—',
        credit > 0 ? fmtCurrency(credit) : '—',
      ])
    })

    autoTable(doc, {
      startY,
      head: [['Kode', 'Nama Akun', 'Kontak', 'Keterangan Baris', 'Debit', 'Kredit']],
      body: tableRows,
      foot: [['', '', '', 'TOTAL', fmtCurrency(totalDebit), fmtCurrency(totalCredit)]],
      margin: { left: margin, right: margin },
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 8, fontStyle: 'bold', cellPadding: 3 },
      bodyStyles: { fontSize: 8, cellPadding: 3, textColor: [30, 41, 59] },
      footStyles: { fillColor: [238, 242, 255], textColor: [79, 70, 229], fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 20, fontStyle: 'normal', textColor: [148, 163, 184] },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 30 },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 32, halign: 'right', textColor: [22, 101, 52] },
        5: { cellWidth: 32, halign: 'right', textColor: [185, 28, 28] },
      },
    })

    const safeDesc = tx.description.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30)
    doc.save(`jurnal_${safeDesc}_${tx.transactionDate}.pdf`)
  }

  /**
   * Export single Invoice to Excel
   */
  async exportInvoiceToExcel(invoice: Invoice, company: Company | null) {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Invoice')

    const fmtCurrency = (val: string | number) => {
      const num = typeof val === 'string' ? parseFloat(val) : val
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
    }
    const fmtDate = (d: string) =>
      new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

    const statusLabel: Record<string, string> = {
      DRAFT: 'DRAFT',
      SENT: 'TERKIRIM',
      PAID: 'LUNAS',
      OVERDUE: 'TERLAMBAT',
    }

    // ── Title / Company Header ────────────────────────────────────
    worksheet.mergeCells('A1:F1')
    const companyRow = worksheet.getCell('A1')
    companyRow.value = company?.name ?? 'Invoice'
    companyRow.font = { name: 'Arial', size: 16, bold: true, color: { argb: '4F46E5' } }
    companyRow.alignment = { horizontal: 'left' }

    if (company?.address || company?.phone) {
      worksheet.mergeCells('A2:F2')
      const addrCell = worksheet.getCell('A2')
      addrCell.value = [company.address, company.phone].filter(Boolean).join('  |  ')
      addrCell.font = { name: 'Arial', size: 9, color: { argb: '64748B' } }
    }

    worksheet.addRow([]) // spacer

    // ── Invoice Info ──────────────────────────────────────────────
    const infoStartRow = 4
    const infoData = [
      ['No. Invoice', invoice.invoiceNumber],
      ['Status', statusLabel[invoice.status] ?? invoice.status],
      ['Tanggal Terbit', fmtDate(invoice.issueDate)],
      ['Jatuh Tempo', fmtDate(invoice.dueDate)],
      ['Klien', invoice.clientName],
      ...(invoice.clientEmail ? [['Email Klien', invoice.clientEmail]] : []),
      ...(invoice.clientAddress ? [['Alamat Klien', invoice.clientAddress]] : []),
    ]

    infoData.forEach(([label, value]) => {
      const row = worksheet.addRow([label, value])
      row.getCell(1).font = { bold: true, color: { argb: '475569' } }
      row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } }
      row.getCell(2).font = { color: { argb: '1E293B' } }
    })

    worksheet.addRow([]) // spacer

    // ── Items Table Header ────────────────────────────────────────
    const tableHeaderRow = worksheet.addRow(['Deskripsi', 'Qty', 'Harga Satuan', 'Diskon', 'PPN (%)', 'Total'])
    tableHeaderRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F46E5' } }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'C7D2FE' } },
      }
    })

    // ── Items Rows ────────────────────────────────────────────────
    invoice.items.forEach((item, idx) => {
      const row = worksheet.addRow([
        item.description,
        parseFloat(item.quantity),
        parseFloat(item.unitPrice),
        parseFloat(item.discountAmount),
        item.taxable ? parseFloat(item.taxRate) : 0,
        parseFloat(item.total),
      ])
      const bgColor = idx % 2 === 0 ? 'FFFFFF' : 'F1F5F9'
      row.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } }
      })
      row.getCell(2).alignment = { horizontal: 'right' }
      row.getCell(3).numFmt = '#,##0'
      row.getCell(3).alignment = { horizontal: 'right' }
      row.getCell(4).numFmt = '#,##0'
      row.getCell(4).alignment = { horizontal: 'right' }
      row.getCell(5).numFmt = '0.##"%"'
      row.getCell(5).alignment = { horizontal: 'center' }
      row.getCell(6).numFmt = '#,##0'
      row.getCell(6).alignment = { horizontal: 'right' }
      row.getCell(6).font = { bold: true }
    })

    worksheet.addRow([]) // spacer

    // ── Totals ────────────────────────────────────────────────────
    const subtotalRow = worksheet.addRow(['', '', '', '', 'Subtotal', parseFloat(invoice.subtotal)])
    subtotalRow.getCell(5).font = { bold: false, color: { argb: '475569' } }
    subtotalRow.getCell(6).numFmt = '#,##0'
    subtotalRow.getCell(6).alignment = { horizontal: 'right' }

    const taxRow = worksheet.addRow(['', '', '', '', 'PPN', parseFloat(invoice.taxAmount)])
    taxRow.getCell(5).font = { bold: false, color: { argb: '475569' } }
    taxRow.getCell(6).numFmt = '#,##0'
    taxRow.getCell(6).alignment = { horizontal: 'right' }

    const totalRow = worksheet.addRow(['', '', '', '', 'TOTAL', parseFloat(invoice.totalAmount)])
    totalRow.getCell(5).font = { bold: true, color: { argb: '4F46E5' } }
    totalRow.getCell(6).font = { bold: true, color: { argb: '4F46E5' } }
    totalRow.getCell(6).numFmt = '#,##0'
    totalRow.getCell(6).alignment = { horizontal: 'right' }
    totalRow.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EEF2FF' } }
    totalRow.getCell(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EEF2FF' } }

    const amountPaid = parseFloat(invoice.amountPaid ?? '0')
    if (amountPaid > 0) {
      const paidRow = worksheet.addRow(['', '', '', '', 'Sudah Dibayar', amountPaid])
      paidRow.getCell(5).font = { color: { argb: 'B45309' } }
      paidRow.getCell(6).numFmt = '#,##0'
      paidRow.getCell(6).alignment = { horizontal: 'right' }

      const remaining = Math.max(0, parseFloat(invoice.totalAmount) - amountPaid)
      const sisaRow = worksheet.addRow(['', '', '', '', 'Sisa Tagihan', remaining])
      sisaRow.getCell(5).font = { bold: true, color: { argb: 'DC2626' } }
      sisaRow.getCell(6).font = { bold: true, color: { argb: 'DC2626' } }
      sisaRow.getCell(6).numFmt = '#,##0'
      sisaRow.getCell(6).alignment = { horizontal: 'right' }
    }

    // ── Bank Account ──────────────────────────────────────────────
    if (invoice.paymentBankAccount) {
      worksheet.addRow([])
      const ba = invoice.paymentBankAccount
      const baLabelRow = worksheet.addRow(['Rekening Tujuan Transfer'])
      baLabelRow.getCell(1).font = { bold: true, color: { argb: '475569' } }
      worksheet.addRow([ba.bankName, ba.accountNumber, `a/n ${ba.accountHolder}`])
    }

    // ── Notes ─────────────────────────────────────────────────────
    if (invoice.notes) {
      worksheet.addRow([])
      const notesLabelRow = worksheet.addRow(['Catatan'])
      notesLabelRow.getCell(1).font = { bold: true, color: { argb: '475569' } }
      const notesRow = worksheet.addRow([invoice.notes])
      worksheet.mergeCells(`A${notesRow.number}:F${notesRow.number}`)
    }

    // ── Column Widths ─────────────────────────────────────────────
    worksheet.columns = [
      { key: 'A', width: 40 },
      { key: 'B', width: 10 },
      { key: 'C', width: 20 },
      { key: 'D', width: 18 },
      { key: 'E', width: 16 },
      { key: 'F', width: 22 },
    ]

    // ── Info rows column widths ───────────────────────────────────
    worksheet.getColumn(1).width = 20
    worksheet.getColumn(2).width = 40

    const buffer = await workbook.xlsx.writeBuffer()
    this.downloadFile(
      buffer,
      `${invoice.invoiceNumber}.xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
  }

  /**
   * Export single Invoice to PDF
   */
  async exportInvoiceToPDF(invoice: Invoice, company: Company | null) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const margin = 14
    const rightCol = pageW - margin

    const fmtCurrency = (val: string | number) => {
      const num = typeof val === 'string' ? parseFloat(val) : val
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(num)
    }

    const fmtDate = (d: string) =>
      new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

    const statusLabel: Record<string, string> = {
      DRAFT: 'DRAFT',
      SENT: 'TERKIRIM',
      PAID: 'LUNAS',
      OVERDUE: 'TERLAMBAT',
    }

    const statusColor: Record<string, [number, number, number]> = {
      DRAFT: [100, 116, 139],
      SENT: [234, 179, 8],
      PAID: [22, 163, 74],
      OVERDUE: [220, 38, 38],
    }

    // ── Load logo ────────────────────────────────────────────────
    let logoDataUrl: string | null = null
    if (company?.logoPresignedUrl) {
      logoDataUrl = await this.loadImageAsDataURL(company.logoPresignedUrl)
    } else if (company?.logoUrl) {
      logoDataUrl = await this.loadImageAsDataURL(`${import.meta.env.VITE_API_BASE_URL}/business/company/logo`)
    }

    // ── Header strip ────────────────────────────────────────────
    doc.setFillColor(79, 70, 229) // indigo-600
    doc.rect(0, 0, pageW, 32, 'F')

    // Logo (if available) — left side of header
    const textStartX = logoDataUrl ? margin + 26 : margin
    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, 'PNG', margin, 4, 22, 22)
      } catch {
        // silently ignore if image embed fails
      }
    }

    // Company name
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(company?.name ?? '', textStartX, 13)

    // Subtitle: address · phone
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const companyDetail = [company?.address, company?.phone]
      .filter(Boolean)
      .join('  ·  ')
    if (companyDetail) doc.text(companyDetail, textStartX, 21)

    // INVOICE label right
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text('INVOICE', rightCol, 14, { align: 'right' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(invoice.invoiceNumber, rightCol, 22, { align: 'right' })

    // ── Status badge ────────────────────────────────────────────
    const [sr, sg, sb] = statusColor[invoice.status] ?? [100, 116, 139]
    doc.setFillColor(sr, sg, sb)
    doc.roundedRect(rightCol - 32, 26, 32, 7, 2, 2, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(statusLabel[invoice.status] ?? invoice.status, rightCol - 16, 31, { align: 'center' })

    // ── Info grid (dates) ────────────────────────────────────────
    let y = 42
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 116, 139)

    const infoItems = [
      ['Tanggal Terbit', fmtDate(invoice.issueDate)],
      ['Jatuh Tempo', fmtDate(invoice.dueDate)],
    ]
    infoItems.forEach(([label, value], i) => {
      const x = margin + i * 70
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 116, 139)
      doc.text(label, x, y)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 41, 59)
      doc.text(value, x, y + 5)
    })

    // ── Billed To ────────────────────────────────────────────────
    y = 62
    doc.setFillColor(248, 250, 252) // slate-50
    doc.rect(margin, y, pageW - margin * 2, invoice.clientAddress ? 24 : 19, 'F')

    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 116, 139)
    doc.text('DITAGIHKAN KEPADA', margin + 4, y + 6)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 23, 42)
    doc.text(invoice.clientName, margin + 4, y + 13)

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(71, 85, 105)
    const clientDetails = [invoice.clientEmail, invoice.clientAddress].filter(Boolean)
    clientDetails.forEach((line, i) => {
      doc.text(line!, margin + 4, y + 18 + i * 5)
    })

    // ── Items table ───────────────────────────────────────────────
    y = invoice.clientAddress ? 92 : 87

    const hasDiscount = invoice.items.some((item) => parseFloat(item.discountAmount) > 0)
    const tableHead = hasDiscount
      ? [['Deskripsi', 'Qty', 'Harga Satuan', 'Diskon', 'PPN', 'Total']]
      : [['Deskripsi', 'Qty', 'Harga Satuan', 'PPN', 'Total']]

    const tableRows = invoice.items.map((item) => {
      const base = [
        item.description,
        parseFloat(item.quantity).toString(),
        fmtCurrency(item.unitPrice),
      ]
      if (hasDiscount) base.push(parseFloat(item.discountAmount) > 0 ? `-${fmtCurrency(item.discountAmount)}` : '—')
      base.push(item.taxable ? `${item.taxRate}%` : '—')
      base.push(fmtCurrency(item.total))
      return base
    })

    const colStyles: Record<number, object> = hasDiscount
      ? { 0: { cellWidth: 'auto' }, 1: { halign: 'right', cellWidth: 14 }, 2: { halign: 'right', cellWidth: 34 }, 3: { halign: 'right', cellWidth: 28 }, 4: { halign: 'center', cellWidth: 14 }, 5: { halign: 'right', cellWidth: 32 } }
      : { 0: { cellWidth: 'auto' }, 1: { halign: 'right', cellWidth: 18 }, 2: { halign: 'right', cellWidth: 38 }, 3: { halign: 'center', cellWidth: 18 }, 4: { halign: 'right', cellWidth: 38 } }

    autoTable(doc, {
      startY: y,
      head: tableHead,
      body: tableRows,
      margin: { left: margin, right: margin },
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 8, fontStyle: 'bold', cellPadding: 4 },
      bodyStyles: { fontSize: 8, cellPadding: 4, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: colStyles,
    })

    // ── Totals ────────────────────────────────────────────────────
    const finalY = (doc as any).lastAutoTable.finalY + 6
    const totalsX = rightCol - 80

    const drawTotalRow = (label: string, value: string, bold = false, yPos: number) => {
      doc.setFontSize(bold ? 10 : 8.5)
      doc.setFont('helvetica', bold ? 'bold' : 'normal')
      doc.setTextColor(bold ? 15 : 71, bold ? 23 : 85, bold ? 42 : 105)
      doc.text(label, totalsX, yPos)
      doc.setFont('helvetica', bold ? 'bold' : 'normal')
      doc.text(value, rightCol, yPos, { align: 'right' })
    }

    let ty = finalY
    drawTotalRow('Subtotal', fmtCurrency(invoice.subtotal), false, ty)
    ty += 6
    drawTotalRow(`PPN`, fmtCurrency(invoice.taxAmount), false, ty)
    ty += 2
    doc.setDrawColor(226, 232, 240)
    doc.line(totalsX, ty, rightCol, ty)
    ty += 5

    // Highlight total box
    doc.setFillColor(238, 242, 255) // indigo-50
    doc.roundedRect(totalsX - 2, ty - 5, rightCol - totalsX + 4, 8, 1, 1, 'F')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(79, 70, 229)
    doc.text('Total', totalsX, ty, { align: 'left' })
    doc.text(fmtCurrency(invoice.totalAmount), rightCol, ty, { align: 'right' })

    // Partial payment info
    const amountPaid = parseFloat(invoice.amountPaid ?? '0')
    if (amountPaid > 0) {
      ty += 7
      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(71, 85, 105)
      doc.text('Sudah Dibayar', totalsX, ty)
      doc.text(fmtCurrency(invoice.amountPaid), rightCol, ty, { align: 'right' })
      ty += 5
      const remaining = parseFloat(invoice.totalAmount) - amountPaid
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(220, 38, 38)
      doc.text('Sisa Tagihan', totalsX, ty)
      doc.text(fmtCurrency(String(Math.max(0, remaining))), rightCol, ty, { align: 'right' })
    }

    // ── Bank Account & Notes (left column below totals) ──────────
    let leftColY = finalY

    if (invoice.paymentBankAccount) {
      const ba = invoice.paymentBankAccount
      const baX = margin
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(100, 116, 139)
      doc.text('REKENING TUJUAN TRANSFER', baX, leftColY)
      leftColY += 5

      doc.setFillColor(238, 242, 255) // indigo-50
      doc.roundedRect(baX, leftColY - 1, pageW / 2 - margin - 2, 18, 1.5, 1.5, 'F')

      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(15, 23, 42)
      doc.text(ba.bankName, baX + 3, leftColY + 5)

      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(30, 41, 59)
      doc.text(ba.accountNumber, baX + 3, leftColY + 11)

      doc.setFontSize(7.5)
      doc.setTextColor(100, 116, 139)
      doc.text(`a/n ${ba.accountHolder}`, baX + 3, leftColY + 16)
      leftColY += 22
    }

    if (invoice.notes) {
      const ny = leftColY + (invoice.paymentBankAccount ? 0 : 12)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(100, 116, 139)
      doc.text('CATATAN', margin, ny)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(71, 85, 105)
      doc.text(invoice.notes, margin, ny + 5, { maxWidth: pageW / 2 - margin })
    }

    // ── Footer ────────────────────────────────────────────────────
    const pageH = doc.internal.pageSize.getHeight()
    doc.setFillColor(248, 250, 252)
    doc.rect(0, pageH - 12, pageW, 12, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(148, 163, 184)
    doc.text(
      `Dicetak pada ${new Date().toLocaleString('id-ID')} · Dibuat dengan Moneytory Ledger`,
      pageW / 2,
      pageH - 5,
      { align: 'center' },
    )

    doc.save(`${invoice.invoiceNumber}.pdf`)
  }

  /**
   * Export Business Transactions list to Excel (Jurnal Umum format)
   */
  async exportBusinessTransactionsToExcel(
    transactions: BusinessTransaction[],
    companyName?: string,
    period?: { startDate?: string; endDate?: string },
  ) {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Jurnal Umum')

    const fmtDate = (d: string) =>
      new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

    // ── Title Header ──────────────────────────────────────────────
    worksheet.mergeCells('A1:H1')
    const titleCell = worksheet.getCell('A1')
    titleCell.value = 'Jurnal Umum'
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: '4F46E5' } }
    titleCell.alignment = { horizontal: 'left' }

    if (companyName) {
      worksheet.mergeCells('A2:H2')
      const companyCell = worksheet.getCell('A2')
      companyCell.value = companyName
      companyCell.font = { name: 'Arial', size: 10, color: { argb: '475569' } }
    }

    if (period?.startDate || period?.endDate) {
      worksheet.mergeCells('A3:H3')
      const periodCell = worksheet.getCell('A3')
      const from = period.startDate ? fmtDate(period.startDate) : '—'
      const to = period.endDate ? fmtDate(period.endDate) : '—'
      periodCell.value = `Periode: ${from} s/d ${to}`
      periodCell.font = { name: 'Arial', size: 9, color: { argb: '64748B' } }
    }

    worksheet.mergeCells('A4:H4')
    const printedCell = worksheet.getCell('A4')
    printedCell.value = `Dicetak pada: ${new Date().toLocaleString('id-ID')}`
    printedCell.font = { name: 'Arial', size: 9, color: { argb: '94A3B8' } }

    worksheet.addRow([]) // spacer

    // ── Table Header ──────────────────────────────────────────────
    const headerRow = worksheet.addRow([
      'Tanggal', 'Keterangan Jurnal', 'Sumber', 'Kode Akun', 'Nama Akun', 'Kontak', 'Debit', 'Kredit',
    ])
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F46E5' } }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = { bottom: { style: 'thin', color: { argb: 'C7D2FE' } } }
    })
    headerRow.height = 20

    // ── Rows ──────────────────────────────────────────────────────
    let grandTotalDebit = 0
    let grandTotalCredit = 0
    let rowIdx = 0

    transactions.forEach((tx) => {
      const source = tx.isSystemGenerated && tx.invoice
        ? `Invoice ${tx.invoice.invoiceNumber}`
        : 'Manual'

      tx.lines.forEach((line, lineIdx) => {
        const debit = line.type === 'DEBIT' ? parseFloat(line.amount) : 0
        const credit = line.type === 'CREDIT' ? parseFloat(line.amount) : 0
        grandTotalDebit += debit
        grandTotalCredit += credit

        const row = worksheet.addRow([
          lineIdx === 0 ? fmtDate(tx.transactionDate) : '',
          lineIdx === 0 ? tx.description : '',
          lineIdx === 0 ? source : '',
          line.coa.code,
          line.coa.name,
          line.contact?.name ?? '',
          debit > 0 ? debit : '',
          credit > 0 ? credit : '',
        ])

        const bgColor = rowIdx % 2 === 0 ? 'FFFFFF' : 'F8FAFC'
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } }
          cell.font = { name: 'Arial', size: 9, color: { argb: '1E293B' } }
        })
        row.getCell(1).font = { name: 'Arial', size: 9, color: { argb: '64748B' } }
        row.getCell(2).font = { name: 'Arial', size: 9, color: { argb: '334155' } }
        row.getCell(3).font = { name: 'Arial', size: 9, color: { argb: '6366F1' } }
        row.getCell(4).font = { name: 'Courier New', size: 9, color: { argb: '94A3B8' } }

        if (debit > 0) {
          row.getCell(7).numFmt = '#,##0'
          row.getCell(7).alignment = { horizontal: 'right' }
          row.getCell(7).font = { name: 'Arial', size: 9, color: { argb: '166534' } }
        }
        if (credit > 0) {
          row.getCell(8).numFmt = '#,##0'
          row.getCell(8).alignment = { horizontal: 'right' }
          row.getCell(8).font = { name: 'Arial', size: 9, color: { argb: 'B91C1C' } }
        }
        rowIdx++
      })

      // Thin separator after each entry
      const sepRow = worksheet.addRow([''])
      sepRow.height = 4
    })

    // ── Grand Total ───────────────────────────────────────────────
    worksheet.addRow([])
    const totalRow = worksheet.addRow(['', '', '', '', '', 'TOTAL', grandTotalDebit, grandTotalCredit])
    totalRow.getCell(6).font = { bold: true, color: { argb: '4F46E5' } }
    totalRow.getCell(6).alignment = { horizontal: 'right' }
    totalRow.getCell(7).numFmt = '#,##0'
    totalRow.getCell(7).font = { bold: true, color: { argb: '166534' } }
    totalRow.getCell(7).alignment = { horizontal: 'right' }
    totalRow.getCell(7).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } }
    totalRow.getCell(8).numFmt = '#,##0'
    totalRow.getCell(8).font = { bold: true, color: { argb: 'B91C1C' } }
    totalRow.getCell(8).alignment = { horizontal: 'right' }
    totalRow.getCell(8).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } }

    // ── Column widths ─────────────────────────────────────────────
    worksheet.getColumn(1).width = 20
    worksheet.getColumn(2).width = 34
    worksheet.getColumn(3).width = 18
    worksheet.getColumn(4).width = 13
    worksheet.getColumn(5).width = 28
    worksheet.getColumn(6).width = 22
    worksheet.getColumn(7).width = 18
    worksheet.getColumn(8).width = 18

    const dateTag = period?.startDate?.slice(0, 7) ?? new Date().toISOString().slice(0, 7)
    const buffer = await workbook.xlsx.writeBuffer()
    this.downloadFile(
      buffer,
      `jurnal_umum_${dateTag}.xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
  }

  /**
   * Export Business Transactions list to PDF (Jurnal Umum format)
   */
  exportBusinessTransactionsToPDF(
    transactions: BusinessTransaction[],
    companyName?: string,
    period?: { startDate?: string; endDate?: string },
  ) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })
    const pageW = doc.internal.pageSize.getWidth()
    const margin = 14

    const fmtCurrency = (val: string | number) => {
      const num = typeof val === 'string' ? parseFloat(val) : val
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
    }
    const fmtDate = (d: string) =>
      new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const fmtDateShort = (d: string) =>
      new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

    // ── Header strip ─────────────────────────────────────────────
    doc.setFillColor(79, 70, 229)
    doc.rect(0, 0, pageW, 26, 'F')

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text('Jurnal Umum', margin, 11)

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(199, 210, 254)
    if (companyName) doc.text(companyName, margin, 17)

    if (period?.startDate || period?.endDate) {
      const from = period.startDate ? fmtDateShort(period.startDate) : '—'
      const to = period.endDate ? fmtDateShort(period.endDate) : '—'
      doc.text(`Periode: ${from} s/d ${to}`, margin, 22)
    }

    doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, pageW - margin, 22, { align: 'right' })

    // ── Build rows ────────────────────────────────────────────────
    const tableRows: (string | { content: string; styles: object })[][] = []
    let grandTotalDebit = 0
    let grandTotalCredit = 0

    transactions.forEach((tx) => {
      const source = tx.isSystemGenerated && tx.invoice
        ? `Inv ${tx.invoice.invoiceNumber}`
        : 'Manual'

      tx.lines.forEach((line, lineIdx) => {
        const debit = line.type === 'DEBIT' ? parseFloat(line.amount) : 0
        const credit = line.type === 'CREDIT' ? parseFloat(line.amount) : 0
        grandTotalDebit += debit
        grandTotalCredit += credit

        tableRows.push([
          lineIdx === 0 ? fmtDate(tx.transactionDate) : '',
          lineIdx === 0 ? tx.description : '',
          lineIdx === 0 ? source : '',
          line.type === 'CREDIT' ? `    ${line.coa.code}` : line.coa.code,
          line.type === 'CREDIT' ? `    ${line.coa.name}` : line.coa.name,
          line.contact?.name ?? '—',
          debit > 0 ? fmtCurrency(debit) : '—',
          credit > 0 ? fmtCurrency(credit) : '—',
        ])
      })
    })

    autoTable(doc, {
      startY: 32,
      head: [['Tanggal', 'Keterangan', 'Sumber', 'Kode', 'Nama Akun', 'Kontak', 'Debit', 'Kredit']],
      body: tableRows,
      foot: [['', '', '', '', '', 'TOTAL', fmtCurrency(grandTotalDebit), fmtCurrency(grandTotalCredit)]],
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: [79, 70, 229], textColor: 255, fontSize: 7, fontStyle: 'bold', cellPadding: 3,
      },
      bodyStyles: { fontSize: 7, cellPadding: 2.5, textColor: [30, 41, 59] },
      footStyles: { fillColor: [238, 242, 255], textColor: [79, 70, 229], fontStyle: 'bold', fontSize: 7 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 26 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 22, textColor: [99, 102, 241] },
        3: { cellWidth: 18, fontStyle: 'normal', textColor: [148, 163, 184] },
        4: { cellWidth: 48 },
        5: { cellWidth: 30 },
        6: { cellWidth: 32, halign: 'right', textColor: [22, 101, 52] },
        7: { cellWidth: 32, halign: 'right', textColor: [185, 28, 28] },
      },
    })

    const dateTag = period?.startDate?.slice(0, 7) ?? new Date().toISOString().slice(0, 7)
    doc.save(`jurnal_umum_${dateTag}.pdf`)
  }

  // ─── Profit & Loss ────────────────────────────────────────────────────────

  async exportProfitLossToExcel(
    data: ProfitLossResponse,
    companyName?: string,
    period?: { startDate?: string; endDate?: string },
  ) {
    const workbook = new ExcelJS.Workbook()
    const ws = workbook.addWorksheet('Laba Rugi')

    const fmtDate = (d: string) =>
      new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const fmtNum = (v: string | number) => {
      const n = typeof v === 'string' ? parseFloat(v) : v
      return isNaN(n) ? 0 : n
    }

    const addTitle = (title: string, sub?: string) => {
      ws.mergeCells('A1:C1')
      ws.getCell('A1').value = title
      ws.getCell('A1').font = { name: 'Arial', size: 14, bold: true, color: { argb: '4F46E5' } }
      if (companyName) {
        ws.mergeCells('A2:C2')
        ws.getCell('A2').value = companyName
        ws.getCell('A2').font = { name: 'Arial', size: 10, color: { argb: '475569' } }
      }
      if (sub) {
        ws.mergeCells('A3:C3')
        ws.getCell('A3').value = sub
        ws.getCell('A3').font = { name: 'Arial', size: 9, color: { argb: '64748B' } }
      }
      ws.mergeCells('A4:C4')
      ws.getCell('A4').value = `Dicetak: ${new Date().toLocaleString('id-ID')}`
      ws.getCell('A4').font = { name: 'Arial', size: 9, color: { argb: '94A3B8' } }
      ws.addRow([])
    }

    const from = period?.startDate ? fmtDate(period.startDate) : 'Awal'
    const to = period?.endDate ? fmtDate(period.endDate) : 'Sekarang'
    addTitle('Laporan Laba Rugi', `Periode: ${from} s/d ${to}`)

    const addSectionHeader = (label: string, color: string) => {
      const r = ws.addRow([label, '', ''])
      r.eachCell(c => {
        c.font = { bold: true, color: { argb: 'FFFFFF' }, name: 'Arial', size: 10 }
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } }
      })
      ws.mergeCells(`A${r.number}:C${r.number}`)
    }

    const addAccountRow = (code: string, name: string, amount: string | number, idx: number) => {
      const r = ws.addRow([`${code}  ${name}`, '', fmtNum(amount)])
      const bg = idx % 2 === 0 ? 'FFFFFF' : 'F8FAFC'
      r.eachCell(c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }; c.font = { name: 'Arial', size: 9 } })
      r.getCell(1).font = { name: 'Arial', size: 9, color: { argb: '334155' } }
      r.getCell(3).numFmt = '#,##0'
      r.getCell(3).alignment = { horizontal: 'right' }
    }

    const addSubtotal = (label: string, amount: string | number, fontColor: string) => {
      ws.addRow([])
      const r = ws.addRow([label, '', fmtNum(amount)])
      r.getCell(1).font = { bold: true, color: { argb: fontColor }, name: 'Arial', size: 10 }
      r.getCell(3).numFmt = '#,##0'
      r.getCell(3).font = { bold: true, color: { argb: fontColor }, name: 'Arial', size: 10 }
      r.getCell(3).alignment = { horizontal: 'right' }
      r.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EEF2FF' } }
      ws.addRow([])
    }

    // Revenue
    addSectionHeader('PENDAPATAN', '059669')
    data.revenue.accounts.forEach((a, i) => addAccountRow(a.coaCode, a.coaName, a.amount, i))
    addSubtotal('Total Pendapatan', data.revenue.total, '047857')

    // Expense
    addSectionHeader('BEBAN', 'DC2626')
    data.expense.accounts.forEach((a, i) => addAccountRow(a.coaCode, a.coaName, a.amount, i))
    addSubtotal('Total Beban', data.expense.total, 'B91C1C')

    // Net
    const netRow = ws.addRow([data.isProfit ? 'LABA BERSIH' : 'RUGI BERSIH', '', fmtNum(data.netProfit)])
    const netColor = data.isProfit ? '166534' : 'B91C1C'
    const netBg = data.isProfit ? 'DCFCE7' : 'FEE2E2'
    netRow.eachCell(c => {
      c.font = { bold: true, name: 'Arial', size: 12, color: { argb: netColor } }
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: netBg } }
    })
    netRow.getCell(3).numFmt = '#,##0'
    netRow.getCell(3).alignment = { horizontal: 'right' }

    ws.getColumn(1).width = 44
    ws.getColumn(2).width = 5
    ws.getColumn(3).width = 22

    const buffer = await workbook.xlsx.writeBuffer()
    const tag = period?.startDate?.slice(0, 7) ?? new Date().toISOString().slice(0, 7)
    this.downloadFile(buffer, `laba_rugi_${tag}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  }

  exportProfitLossToPDF(
    data: ProfitLossResponse,
    companyName?: string,
    period?: { startDate?: string; endDate?: string },
  ) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const pageW = doc.internal.pageSize.getWidth()
    const margin = 14

    const fmtRp = (v: string | number) => {
      const n = typeof v === 'string' ? parseFloat(v) : v
      return 'Rp ' + (isNaN(n) ? 0 : Math.abs(n)).toLocaleString('id-ID')
    }
    const fmtDate = (d: string) =>
      new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

    doc.setFillColor(79, 70, 229)
    doc.rect(0, 0, pageW, 26, 'F')
    doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
    doc.text('Laporan Laba Rugi', margin, 11)
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(199, 210, 254)
    if (companyName) doc.text(companyName, margin, 17)
    const from = period?.startDate ? fmtDate(period.startDate) : 'Awal'
    const to = period?.endDate ? fmtDate(period.endDate) : 'Sekarang'
    doc.text(`Periode: ${from} s/d ${to}`, margin, 22)
    doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, pageW - margin, 22, { align: 'right' })

    const revenueRows = data.revenue.accounts.map(a => [a.coaCode, a.coaName, fmtRp(a.amount)])
    const expenseRows = data.expense.accounts.map(a => [a.coaCode, a.coaName, fmtRp(a.amount)])

    autoTable(doc, {
      startY: 32,
      head: [['Kode', 'Pendapatan', 'Jumlah']],
      body: [...revenueRows, [{ content: `Total Pendapatan: ${fmtRp(data.revenue.total)}`, colSpan: 3, styles: { fontStyle: 'bold', textColor: [5, 150, 105], fillColor: [209, 250, 229] } }]],
      margin: { left: margin, right: margin },
      headStyles: { fillColor: [5, 150, 105], textColor: 255, fontSize: 8, fontStyle: 'bold', cellPadding: 3 },
      bodyStyles: { fontSize: 8, cellPadding: 2.5, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 0: { cellWidth: 20, textColor: [148, 163, 184] }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 40, halign: 'right' } },
    })

    const afterRevenue = (doc as any).lastAutoTable.finalY + 6

    autoTable(doc, {
      startY: afterRevenue,
      head: [['Kode', 'Beban', 'Jumlah']],
      body: [...expenseRows, [{ content: `Total Beban: ${fmtRp(data.expense.total)}`, colSpan: 3, styles: { fontStyle: 'bold', textColor: [185, 28, 28], fillColor: [254, 226, 226] } }]],
      margin: { left: margin, right: margin },
      headStyles: { fillColor: [220, 38, 38], textColor: 255, fontSize: 8, fontStyle: 'bold', cellPadding: 3 },
      bodyStyles: { fontSize: 8, cellPadding: 2.5, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 0: { cellWidth: 20, textColor: [148, 163, 184] }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 40, halign: 'right' } },
    })

    const afterExpense = (doc as any).lastAutoTable.finalY + 8
    const netLabel = data.isProfit ? 'LABA BERSIH' : 'RUGI BERSIH'
    const [r, g, b] = data.isProfit ? [5, 150, 105] : [220, 38, 38]
    const [br, bg2, bb] = data.isProfit ? [209, 250, 229] : [254, 226, 226]
    autoTable(doc, {
      startY: afterExpense,
      body: [[{ content: netLabel, styles: { fontStyle: 'bold', textColor: [r, g, b], fillColor: [br, bg2, bb], fontSize: 11, cellPadding: 5 } }, { content: fmtRp(data.netProfit), styles: { halign: 'right', fontStyle: 'bold', textColor: [r, g, b], fillColor: [br, bg2, bb], fontSize: 11, cellPadding: 5 } }]],
      margin: { left: margin, right: margin },
      columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 50 } },
    })

    const tag = period?.startDate?.slice(0, 7) ?? new Date().toISOString().slice(0, 7)
    doc.save(`laba_rugi_${tag}.pdf`)
  }

  // ─── Balance Sheet ─────────────────────────────────────────────────────────

  async exportBalanceSheetToExcel(
    data: BalanceSheetResponse,
    companyName?: string,
  ) {
    const workbook = new ExcelJS.Workbook()
    const ws = workbook.addWorksheet('Neraca')

    const fmtDate = (d: string) =>
      new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const fmtNum = (v: string | number) => {
      const n = typeof v === 'string' ? parseFloat(v) : v
      return isNaN(n) ? 0 : n
    }

    ws.mergeCells('A1:C1'); ws.getCell('A1').value = 'Neraca Keuangan'
    ws.getCell('A1').font = { name: 'Arial', size: 14, bold: true, color: { argb: '4F46E5' } }
    if (companyName) {
      ws.mergeCells('A2:C2'); ws.getCell('A2').value = companyName
      ws.getCell('A2').font = { name: 'Arial', size: 10, color: { argb: '475569' } }
    }
    ws.mergeCells('A3:C3'); ws.getCell('A3').value = `Per tanggal: ${fmtDate(data.asOfDate)}`
    ws.getCell('A3').font = { name: 'Arial', size: 9, color: { argb: '64748B' } }
    ws.mergeCells('A4:C4'); ws.getCell('A4').value = `Dicetak: ${new Date().toLocaleString('id-ID')}`
    ws.getCell('A4').font = { name: 'Arial', size: 9, color: { argb: '94A3B8' } }
    ws.addRow([])

    const addSec = (label: string, argb: string) => {
      const r = ws.addRow([label])
      ws.mergeCells(`A${r.number}:C${r.number}`)
      r.eachCell(c => { c.font = { bold: true, color: { argb: 'FFFFFF' }, name: 'Arial', size: 10 }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb } } })
    }
    const addRow = (code: string, name: string, val: string | number, idx: number) => {
      const r = ws.addRow([`${code}  ${name}`, '', fmtNum(val)])
      const bg = idx % 2 === 0 ? 'FFFFFF' : 'F8FAFC'
      r.eachCell(c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }; c.font = { name: 'Arial', size: 9 } })
      r.getCell(3).numFmt = '#,##0'; r.getCell(3).alignment = { horizontal: 'right' }
    }
    const addTotal = (label: string, val: string | number, argb: string) => {
      const r = ws.addRow([label, '', fmtNum(val)])
      r.eachCell(c => { c.font = { bold: true, color: { argb: argb }, name: 'Arial', size: 10 }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EEF2FF' } } })
      r.getCell(3).numFmt = '#,##0'; r.getCell(3).alignment = { horizontal: 'right' }
      ws.addRow([])
    }

    addSec('ASET', '1D4ED8')
    data.assets.accounts.forEach((a, i) => addRow(a.coaCode, a.coaName, a.balance, i))
    addTotal('Total Aset', data.assets.total, '1E40AF')

    addSec('LIABILITAS', 'DC2626')
    data.liabilities.accounts.forEach((a, i) => addRow(a.coaCode, a.coaName, a.balance, i))
    addTotal('Total Liabilitas', data.liabilities.total, 'B91C1C')

    addSec('EKUITAS', '7C3AED')
    data.equity.accounts.forEach((a, i) => addRow(a.coaCode, a.coaName, a.balance, i))
    // Current period profit
    const pnl = fmtNum(data.equity.currentPeriodProfit)
    const pnlRow = ws.addRow(['Laba / Rugi Periode Ini', '', pnl])
    pnlRow.getCell(1).font = { name: 'Arial', size: 9, italic: true, color: { argb: pnl >= 0 ? '059669' : 'DC2626' } }
    pnlRow.getCell(3).numFmt = '#,##0'; pnlRow.getCell(3).alignment = { horizontal: 'right' }
    pnlRow.getCell(3).font = { name: 'Arial', size: 9, bold: true, color: { argb: pnl >= 0 ? '059669' : 'DC2626' } }
    addTotal('Total Ekuitas', data.equity.total, '6D28D9')

    const grandRow = ws.addRow(['Total Liabilitas + Ekuitas', '', fmtNum(data.totalLiabilitiesAndEquity)])
    grandRow.eachCell(c => { c.font = { bold: true, name: 'Arial', size: 11, color: { argb: '1E293B' } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } } })
    grandRow.getCell(3).numFmt = '#,##0'; grandRow.getCell(3).alignment = { horizontal: 'right' }

    ws.getColumn(1).width = 44; ws.getColumn(2).width = 5; ws.getColumn(3).width = 22

    const buffer = await workbook.xlsx.writeBuffer()
    const tag = data.asOfDate.slice(0, 10)
    this.downloadFile(buffer, `neraca_${tag}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  }

  exportBalanceSheetToPDF(data: BalanceSheetResponse, companyName?: string) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const pageW = doc.internal.pageSize.getWidth()
    const margin = 14

    const fmtRp = (v: string | number) => {
      const n = typeof v === 'string' ? parseFloat(v) : v
      return 'Rp ' + (isNaN(n) ? 0 : Math.abs(n)).toLocaleString('id-ID')
    }
    const fmtDate = (d: string) =>
      new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

    doc.setFillColor(79, 70, 229)
    doc.rect(0, 0, pageW, 26, 'F')
    doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
    doc.text('Neraca Keuangan', margin, 11)
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(199, 210, 254)
    if (companyName) doc.text(companyName, margin, 17)
    doc.text(`Per tanggal: ${fmtDate(data.asOfDate)}`, margin, 22)
    doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, pageW - margin, 22, { align: 'right' })

    const assetRows = data.assets.accounts.map(a => [a.coaCode, a.coaName, fmtRp(a.balance)])
    const liabRows = data.liabilities.accounts.map(a => [a.coaCode, a.coaName, fmtRp(a.balance)])
    const equityRows = [
      ...data.equity.accounts.map(a => [a.coaCode, a.coaName, fmtRp(a.balance)]),
      ['—', { content: 'Laba / Rugi Periode Ini', styles: { fontStyle: 'italic' } }, fmtRp(data.equity.currentPeriodProfit)],
    ]

    let y = 32
    const drawSection = (head: string[][], body: (string | object)[][], total: string, headColor: number[]) => {
      autoTable(doc, {
        startY: y,
        head: [head[0]],
        body: [...body, [{ content: total, colSpan: 3, styles: { fontStyle: 'bold', halign: 'right', fillColor: [238, 242, 255] } }]],
        margin: { left: margin, right: margin },
        headStyles: { fillColor: headColor as [number, number, number], textColor: 255, fontSize: 8, fontStyle: 'bold', cellPadding: 3 },
        bodyStyles: { fontSize: 8, cellPadding: 2.5, textColor: [30, 41, 59] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: { 0: { cellWidth: 20, textColor: [148, 163, 184] }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 42, halign: 'right' } },
      })
      y = (doc as any).lastAutoTable.finalY + 6
    }

    drawSection([['Kode', 'Aset', 'Saldo']], assetRows, `Total Aset: ${fmtRp(data.assets.total)}`, [29, 78, 216])
    drawSection([['Kode', 'Liabilitas', 'Saldo']], liabRows, `Total Liabilitas: ${fmtRp(data.liabilities.total)}`, [220, 38, 38])
    drawSection([['Kode', 'Ekuitas', 'Saldo']], equityRows, `Total Ekuitas: ${fmtRp(data.equity.total)}`, [124, 58, 237])

    autoTable(doc, {
      startY: y,
      body: [[{ content: 'Total Liabilitas + Ekuitas', styles: { fontStyle: 'bold', fontSize: 10, fillColor: [241, 245, 249] } }, { content: fmtRp(data.totalLiabilitiesAndEquity), styles: { halign: 'right', fontStyle: 'bold', fontSize: 10, fillColor: [241, 245, 249] } }]],
      margin: { left: margin, right: margin },
      columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 50 } },
    })

    doc.save(`neraca_${data.asOfDate.slice(0, 10)}.pdf`)
  }

  // ─── Cash Flow ─────────────────────────────────────────────────────────────

  async exportCashFlowToExcel(
    data: CashFlowResponse,
    companyName?: string,
    period?: { startDate?: string; endDate?: string },
  ) {
    const workbook = new ExcelJS.Workbook()
    const ws = workbook.addWorksheet('Arus Kas')

    const fmtDate = (d: string) =>
      new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const fmtNum = (v: string | number) => {
      const n = typeof v === 'string' ? parseFloat(v) : v
      return isNaN(n) ? 0 : n
    }

    ws.mergeCells('A1:C1'); ws.getCell('A1').value = 'Laporan Arus Kas'
    ws.getCell('A1').font = { name: 'Arial', size: 14, bold: true, color: { argb: '4F46E5' } }
    if (companyName) {
      ws.mergeCells('A2:C2'); ws.getCell('A2').value = companyName
      ws.getCell('A2').font = { name: 'Arial', size: 10, color: { argb: '475569' } }
    }
    const from = period?.startDate ? fmtDate(period.startDate) : 'Awal'
    const to = period?.endDate ? fmtDate(period.endDate) : 'Sekarang'
    ws.mergeCells('A3:C3'); ws.getCell('A3').value = `Periode: ${from} s/d ${to}`
    ws.getCell('A3').font = { name: 'Arial', size: 9, color: { argb: '64748B' } }
    ws.mergeCells('A4:C4'); ws.getCell('A4').value = `Dicetak: ${new Date().toLocaleString('id-ID')}`
    ws.getCell('A4').font = { name: 'Arial', size: 9, color: { argb: '94A3B8' } }
    ws.addRow([])

    // Summary block
    const summaryData = [
      ['Saldo Awal', fmtNum(data.openingCash)],
      ['Total Kas Masuk', fmtNum(data.totalInflow)],
      ['Total Kas Keluar', fmtNum(data.totalOutflow)],
      ['Arus Kas Bersih', fmtNum(data.netCashFlow)],
      ['Saldo Akhir', fmtNum(data.endingCash)],
    ]
    const netNeg = parseFloat(String(data.netCashFlow)) < 0
    summaryData.forEach(([label, val]) => {
      const r = ws.addRow([String(label), '', Number(val)])
      r.getCell(1).font = { name: 'Arial', size: 9, bold: true, color: { argb: '475569' } }
      r.getCell(3).numFmt = '#,##0'; r.getCell(3).alignment = { horizontal: 'right' }
      if (String(label) === 'Arus Kas Bersih') {
        r.getCell(3).font = { bold: true, color: { argb: netNeg ? 'B91C1C' : '166534' }, name: 'Arial', size: 9 }
        r.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: netNeg ? 'FEE2E2' : 'DCFCE7' } }
      }
    })
    ws.addRow([])

    const addSec = (label: string, argb: string) => {
      const r = ws.addRow([label]); ws.mergeCells(`A${r.number}:C${r.number}`)
      r.eachCell(c => { c.font = { bold: true, color: { argb: 'FFFFFF' }, name: 'Arial', size: 10 }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb } } })
    }

    addSec('KAS MASUK', '059669')
    if (data.cashInflows.length === 0) {
      ws.addRow(['(Tidak ada kas masuk)'])
    } else {
      data.cashInflows.forEach((a, i) => {
        const r = ws.addRow([`${a.coaCode}  ${a.coaName}`, '', fmtNum(a.amount)])
        const bg = i % 2 === 0 ? 'FFFFFF' : 'F0FDF4'
        r.eachCell(c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }; c.font = { name: 'Arial', size: 9 } })
        r.getCell(3).numFmt = '#,##0'; r.getCell(3).alignment = { horizontal: 'right' }
        r.getCell(3).font = { name: 'Arial', size: 9, color: { argb: '166534' } }
      })
    }
    const totInRow = ws.addRow(['Total Kas Masuk', '', fmtNum(data.totalInflow)])
    totInRow.eachCell(c => { c.font = { bold: true, color: { argb: '047857' }, name: 'Arial', size: 10 }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1FAE5' } } })
    totInRow.getCell(3).numFmt = '#,##0'; totInRow.getCell(3).alignment = { horizontal: 'right' }
    ws.addRow([])

    addSec('KAS KELUAR', 'DC2626')
    if (data.cashOutflows.length === 0) {
      ws.addRow(['(Tidak ada kas keluar)'])
    } else {
      data.cashOutflows.forEach((a, i) => {
        const r = ws.addRow([`${a.coaCode}  ${a.coaName}`, '', fmtNum(a.amount)])
        const bg = i % 2 === 0 ? 'FFFFFF' : 'FFF1F2'
        r.eachCell(c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }; c.font = { name: 'Arial', size: 9 } })
        r.getCell(3).numFmt = '#,##0'; r.getCell(3).alignment = { horizontal: 'right' }
        r.getCell(3).font = { name: 'Arial', size: 9, color: { argb: 'B91C1C' } }
      })
    }
    const totOutRow = ws.addRow(['Total Kas Keluar', '', fmtNum(data.totalOutflow)])
    totOutRow.eachCell(c => { c.font = { bold: true, color: { argb: 'B91C1C' }, name: 'Arial', size: 10 }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } } })
    totOutRow.getCell(3).numFmt = '#,##0'; totOutRow.getCell(3).alignment = { horizontal: 'right' }

    ws.getColumn(1).width = 44; ws.getColumn(2).width = 5; ws.getColumn(3).width = 22

    const buffer = await workbook.xlsx.writeBuffer()
    const tag = period?.startDate?.slice(0, 7) ?? new Date().toISOString().slice(0, 7)
    this.downloadFile(buffer, `arus_kas_${tag}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  }

  exportCashFlowToPDF(
    data: CashFlowResponse,
    companyName?: string,
    period?: { startDate?: string; endDate?: string },
  ) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const pageW = doc.internal.pageSize.getWidth()
    const margin = 14

    const fmtRp = (v: string | number) => {
      const n = typeof v === 'string' ? parseFloat(v) : v
      return 'Rp ' + (isNaN(n) ? 0 : Math.abs(n)).toLocaleString('id-ID')
    }
    const fmtDate = (d: string) =>
      new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

    doc.setFillColor(79, 70, 229)
    doc.rect(0, 0, pageW, 26, 'F')
    doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
    doc.text('Laporan Arus Kas', margin, 11)
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(199, 210, 254)
    if (companyName) doc.text(companyName, margin, 17)
    const from = period?.startDate ? fmtDate(period.startDate) : 'Awal'
    const to = period?.endDate ? fmtDate(period.endDate) : 'Sekarang'
    doc.text(`Periode: ${from} s/d ${to}`, margin, 22)
    doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, pageW - margin, 22, { align: 'right' })

    const netNeg = parseFloat(String(data.netCashFlow)) < 0

    // Summary table
    autoTable(doc, {
      startY: 32,
      body: [
        ['Saldo Awal', fmtRp(data.openingCash)],
        ['Total Kas Masuk', { content: fmtRp(data.totalInflow), styles: { textColor: [5, 150, 105] } }],
        ['Total Kas Keluar', { content: fmtRp(data.totalOutflow), styles: { textColor: [220, 38, 38] } }],
        [{ content: 'Arus Kas Bersih', styles: { fontStyle: 'bold' } }, { content: fmtRp(data.netCashFlow), styles: { fontStyle: 'bold', textColor: netNeg ? [220, 38, 38] : [5, 150, 105], fillColor: netNeg ? [254, 226, 226] : [209, 250, 229] } }],
        [{ content: 'Saldo Akhir', styles: { fontStyle: 'bold' } }, { content: fmtRp(data.endingCash), styles: { fontStyle: 'bold' } }],
      ],
      margin: { left: margin, right: margin },
      bodyStyles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 50, halign: 'right' } },
    })

    let y = (doc as any).lastAutoTable.finalY + 8

    const inflowRows = data.cashInflows.map(a => [a.coaCode, a.coaName, fmtRp(a.amount)])
    const outflowRows = data.cashOutflows.map(a => [a.coaCode, a.coaName, fmtRp(a.amount)])

    autoTable(doc, {
      startY: y,
      head: [['Kode', 'Kas Masuk', 'Jumlah']],
      body: inflowRows.length ? [...inflowRows, [{ content: `Total: ${fmtRp(data.totalInflow)}`, colSpan: 3, styles: { fontStyle: 'bold', textColor: [5, 150, 105], fillColor: [209, 250, 229] } }]] : [['', 'Tidak ada kas masuk', '']],
      margin: { left: margin, right: margin },
      headStyles: { fillColor: [5, 150, 105], textColor: 255, fontSize: 8, fontStyle: 'bold', cellPadding: 3 },
      bodyStyles: { fontSize: 8, cellPadding: 2.5 },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      columnStyles: { 0: { cellWidth: 20, textColor: [148, 163, 184] }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 40, halign: 'right', textColor: [5, 150, 105] } },
    })

    y = (doc as any).lastAutoTable.finalY + 6

    autoTable(doc, {
      startY: y,
      head: [['Kode', 'Kas Keluar', 'Jumlah']],
      body: outflowRows.length ? [...outflowRows, [{ content: `Total: ${fmtRp(data.totalOutflow)}`, colSpan: 3, styles: { fontStyle: 'bold', textColor: [185, 28, 28], fillColor: [254, 226, 226] } }]] : [['', 'Tidak ada kas keluar', '']],
      margin: { left: margin, right: margin },
      headStyles: { fillColor: [220, 38, 38], textColor: 255, fontSize: 8, fontStyle: 'bold', cellPadding: 3 },
      bodyStyles: { fontSize: 8, cellPadding: 2.5 },
      alternateRowStyles: { fillColor: [255, 241, 242] },
      columnStyles: { 0: { cellWidth: 20, textColor: [148, 163, 184] }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 40, halign: 'right', textColor: [185, 28, 28] } },
    })

    const tag = period?.startDate?.slice(0, 7) ?? new Date().toISOString().slice(0, 7)
    doc.save(`arus_kas_${tag}.pdf`)
  }

  // ─── Journal Report ────────────────────────────────────────────────────────

  async exportJournalReportToExcel(
    entries: JournalReportEntry[],
    companyName?: string,
    period?: { startDate?: string; endDate?: string },
  ) {
    const workbook = new ExcelJS.Workbook()
    const ws = workbook.addWorksheet('Jurnal Umum')

    const fmtDate = (d: string) =>
      new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const fmtNum = (v: string | number) => {
      const n = typeof v === 'string' ? parseFloat(v) : v
      return isNaN(n) ? 0 : n
    }

    ws.mergeCells('A1:G1'); ws.getCell('A1').value = 'Jurnal Umum'
    ws.getCell('A1').font = { name: 'Arial', size: 14, bold: true, color: { argb: '4F46E5' } }
    if (companyName) {
      ws.mergeCells('A2:G2'); ws.getCell('A2').value = companyName
      ws.getCell('A2').font = { name: 'Arial', size: 10, color: { argb: '475569' } }
    }
    const from = period?.startDate ? fmtDate(period.startDate) : 'Awal'
    const to = period?.endDate ? fmtDate(period.endDate) : 'Sekarang'
    ws.mergeCells('A3:G3'); ws.getCell('A3').value = `Periode: ${from} s/d ${to}`
    ws.getCell('A3').font = { name: 'Arial', size: 9, color: { argb: '64748B' } }
    ws.mergeCells('A4:G4'); ws.getCell('A4').value = `Dicetak: ${new Date().toLocaleString('id-ID')}`
    ws.getCell('A4').font = { name: 'Arial', size: 9, color: { argb: '94A3B8' } }
    ws.addRow([])

    const headerRow = ws.addRow(['Tanggal', 'Keterangan', 'Ref', 'Tipe', 'Kode', 'Nama Akun', 'Jumlah'])
    headerRow.eachCell(c => {
      c.font = { bold: true, color: { argb: 'FFFFFF' } }
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F46E5' } }
      c.alignment = { horizontal: 'center', vertical: 'middle' }
    })
    headerRow.height = 20

    let grandDebit = 0; let grandCredit = 0; let rowIdx = 0

    entries.forEach((entry) => {
      const allLines = [
        ...entry.debitLines.map(l => ({ ...l, type: 'D' })),
        ...entry.creditLines.map(l => ({ ...l, type: 'K' })),
      ]
      allLines.forEach((line, li) => {
        const amount = fmtNum(line.amount)
        if (line.type === 'D') grandDebit += amount; else grandCredit += amount
        const r = ws.addRow([
          li === 0 ? fmtDate(entry.date) : '',
          li === 0 ? entry.description : '',
          li === 0 ? (entry.reference ?? '') : '',
          line.type,
          line.type === 'K' ? `    ${line.coaCode}` : line.coaCode,
          line.type === 'K' ? `    ${line.coaName}` : line.coaName,
          amount,
        ])
        const bg = rowIdx % 2 === 0 ? 'FFFFFF' : 'F8FAFC'
        r.eachCell(c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }; c.font = { name: 'Arial', size: 9 } })
        r.getCell(4).font = { name: 'Arial', size: 9, bold: true, color: { argb: line.type === 'D' ? '166534' : 'B91C1C' } }
        r.getCell(5).font = { name: 'Courier New', size: 9, color: { argb: '94A3B8' } }
        r.getCell(7).numFmt = '#,##0'; r.getCell(7).alignment = { horizontal: 'right' }
        r.getCell(7).font = { name: 'Arial', size: 9, color: { argb: line.type === 'D' ? '166534' : 'B91C1C' } }
        rowIdx++
      })
      ws.addRow(['']); ws.lastRow!.height = 4
    })

    ws.addRow([])
    const totRow = ws.addRow(['', '', '', '', '', 'TOTAL DEBIT', grandDebit])
    totRow.getCell(6).font = { bold: true, color: { argb: '166534' }, name: 'Arial' }
    totRow.getCell(6).alignment = { horizontal: 'right' }
    totRow.getCell(7).numFmt = '#,##0'; totRow.getCell(7).font = { bold: true, color: { argb: '166534' }, name: 'Arial' }
    totRow.getCell(7).alignment = { horizontal: 'right' }
    totRow.getCell(7).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } }
    const totRow2 = ws.addRow(['', '', '', '', '', 'TOTAL KREDIT', grandCredit])
    totRow2.getCell(6).font = { bold: true, color: { argb: 'B91C1C' }, name: 'Arial' }
    totRow2.getCell(6).alignment = { horizontal: 'right' }
    totRow2.getCell(7).numFmt = '#,##0'; totRow2.getCell(7).font = { bold: true, color: { argb: 'B91C1C' }, name: 'Arial' }
    totRow2.getCell(7).alignment = { horizontal: 'right' }
    totRow2.getCell(7).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } }

    ws.getColumn(1).width = 22; ws.getColumn(2).width = 32; ws.getColumn(3).width = 16
    ws.getColumn(4).width = 7; ws.getColumn(5).width = 13; ws.getColumn(6).width = 30
    ws.getColumn(7).width = 20

    const buffer = await workbook.xlsx.writeBuffer()
    const tag = period?.startDate?.slice(0, 7) ?? new Date().toISOString().slice(0, 7)
    this.downloadFile(buffer, `jurnal_umum_laporan_${tag}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  }

  exportJournalReportToPDF(
    entries: JournalReportEntry[],
    companyName?: string,
    period?: { startDate?: string; endDate?: string },
  ) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })
    const pageW = doc.internal.pageSize.getWidth()
    const margin = 14

    const fmtRp = (v: string | number) => {
      const n = typeof v === 'string' ? parseFloat(v) : v
      return 'Rp ' + (isNaN(n) ? 0 : n).toLocaleString('id-ID')
    }
    const fmtDate = (d: string) =>
      new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

    doc.setFillColor(79, 70, 229)
    doc.rect(0, 0, pageW, 26, 'F')
    doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
    doc.text('Jurnal Umum', margin, 11)
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(199, 210, 254)
    if (companyName) doc.text(companyName, margin, 17)
    const from = period?.startDate ? fmtDate(period.startDate) : 'Awal'
    const to = period?.endDate ? fmtDate(period.endDate) : 'Sekarang'
    doc.text(`Periode: ${from} s/d ${to}`, margin, 22)
    doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, pageW - margin, 22, { align: 'right' })

    const rows: (string | object)[][] = []
    let grandDebit = 0; let grandCredit = 0

    entries.forEach((entry) => {
      const allLines = [
        ...entry.debitLines.map(l => ({ ...l, type: 'D' as const })),
        ...entry.creditLines.map(l => ({ ...l, type: 'K' as const })),
      ]
      allLines.forEach((line, li) => {
        const amount = parseFloat(line.amount)
        if (line.type === 'D') grandDebit += amount; else grandCredit += amount
        rows.push([
          li === 0 ? fmtDate(entry.date) : '',
          li === 0 ? entry.description : '',
          li === 0 ? (entry.reference ?? '—') : '',
          {
            content: line.type,
            styles: { fontStyle: 'bold', textColor: line.type === 'D' ? [22, 101, 52] : [185, 28, 28] },
          },
          line.type === 'K' ? `  ${line.coaCode}` : line.coaCode,
          line.type === 'K' ? `  ${line.coaName}` : line.coaName,
          { content: fmtRp(amount), styles: { halign: 'right', textColor: line.type === 'D' ? [22, 101, 52] : [185, 28, 28] } },
        ])
      })
    })

    autoTable(doc, {
      startY: 32,
      head: [['Tanggal', 'Keterangan', 'Ref', 'T', 'Kode', 'Nama Akun', 'Jumlah']],
      body: rows,
      foot: [['', '', '', '', '', 'TOTAL', `D: ${fmtRp(grandDebit)}  K: ${fmtRp(grandCredit)}`]],
      margin: { left: margin, right: margin },
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 7, fontStyle: 'bold', cellPadding: 3 },
      bodyStyles: { fontSize: 7, cellPadding: 2.5, textColor: [30, 41, 59] },
      footStyles: { fillColor: [238, 242, 255], textColor: [79, 70, 229], fontStyle: 'bold', fontSize: 7 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 26 }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 22 },
        3: { cellWidth: 10 }, 4: { cellWidth: 18, textColor: [148, 163, 184] },
        5: { cellWidth: 50 }, 6: { cellWidth: 38, halign: 'right' },
      },
    })

    const tag = period?.startDate?.slice(0, 7) ?? new Date().toISOString().slice(0, 7)
    doc.save(`jurnal_umum_laporan_${tag}.pdf`)
  }

  /**
   * Helper to download file in browser
   */
  private downloadFile(buffer: ExcelJS.Buffer, fileName: string, type: string) {
    const blob = new Blob([buffer], { type })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = fileName
    link.click()
    window.URL.revokeObjectURL(link.href)
  }
}

export default new ExportService()
