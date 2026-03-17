/*
 * ----------------------------------------------
 * API Route：後台帳密 Excel 匯出
 * 2026-03-17
 * app/api/admin/slot-passwords/export/route.ts
 * ----------------------------------------------
 */

export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import {
  generateAllSlotGroups,
  derivePassword,
  formatSlotGroupLabel,
} from '@/lib/slot-password'

export async function GET(req: NextRequest) {
  // 驗證管理員 session
  const session = req.cookies.get('admin_session')?.value
  if (!session || session !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 產生 slotGroups，從 03/25 18:30（03251803）開始
  const allGroups = generateAllSlotGroups('2026-03-25', '2026-03-30')
  const groups = allGroups.filter((sg) => sg >= '03251803')

  // 批次計算密碼（每批 96 筆）
  const BATCH = 96
  const passwords: string[] = []
  for (let i = 0; i < groups.length; i += BATCH) {
    const batch = await Promise.all(groups.slice(i, i + BATCH).map(derivePassword))
    passwords.push(...batch)
  }

  // 建立工作表資料
  const rows = groups.map((sg, i) => ({
    時段: formatSlotGroupLabel(sg),
    帳號: sg,
    密碼: passwords[i],
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '帳密清單')

  // 產生 xlsx ArrayBuffer
  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer

  // 檔名含日期
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const filename = `slot-passwords-${today}.xlsx`

  return new Response(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
