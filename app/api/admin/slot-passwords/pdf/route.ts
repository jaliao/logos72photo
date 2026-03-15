/*
 * ----------------------------------------------
 * API Route：後台帳密 PDF 下載
 * 2026-03-15
 * app/api/admin/slot-passwords/pdf/route.ts
 * ----------------------------------------------
 */

export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'
import { derivePassword, generateAllSlotGroups, formatSlotGroupLabel } from '@/lib/slot-password'

export async function GET(req: NextRequest) {
  // 驗證管理員 session
  const session = req.cookies.get('admin_session')?.value
  if (!session || session !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const groups = generateAllSlotGroups('2026-03-15', '2026-03-30')

  // 批次派生所有密碼（分批避免一次開太多 Promise）
  const BATCH = 96
  const passwords: string[] = []
  for (let i = 0; i < groups.length; i += BATCH) {
    const batch = await Promise.all(groups.slice(i, i + BATCH).map(derivePassword))
    passwords.push(...batch)
  }

  // 產生 PDF
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const LINE_H = 5.5
  const MARGIN_X = 14
  const MARGIN_Y = 16
  const PAGE_H = 297
  const COL = [MARGIN_X, MARGIN_X + 38, MARGIN_X + 88]

  doc.setFont('helvetica')

  function addHeader(pageNum: number, total: number) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('2026 \u4e0d\u9593\u65b7\u8b80\u7d93\u63a5\u529b \u2014 \u6642\u6bb5\u76f8\u7c3f\u5e33\u5bc6', MARGIN_X, 10)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(`Page ${pageNum} / ${total}`, 196, 10, { align: 'right' })
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('\u5206\u7d44\u865f\u78bc', COL[0], MARGIN_Y)
    doc.text('\u6642\u6bb5', COL[1], MARGIN_Y)
    doc.text('\u5bc6\u78bc', COL[2], MARGIN_Y)
    doc.setLineWidth(0.3)
    doc.line(MARGIN_X, MARGIN_Y + 1.5, 196, MARGIN_Y + 1.5)
  }

  const ROWS_PER_PAGE = 50
  const totalPages = Math.ceil(groups.length / ROWS_PER_PAGE)

  for (let p = 0; p < totalPages; p++) {
    if (p > 0) doc.addPage()
    addHeader(p + 1, totalPages)

    const startIdx = p * ROWS_PER_PAGE
    const slice = groups.slice(startIdx, startIdx + ROWS_PER_PAGE)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    slice.forEach((sg, i) => {
      const y = MARGIN_Y + LINE_H * (i + 1) + 2
      if (y > PAGE_H - 10) return
      doc.text(sg, COL[0], y)
      doc.text(formatSlotGroupLabel(sg), COL[1], y)
      doc.text(passwords[startIdx + i] ?? '', COL[2], y)
    })
  }

  const pdfBytes = doc.output('arraybuffer')
  return new NextResponse(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="slot-passwords.pdf"',
    },
  })
}
