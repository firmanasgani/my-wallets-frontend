import ExcelJS from 'exceljs'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Transaction } from '@/types/transaction'
import type { BudgetReportItem } from '@/types/budget'

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
