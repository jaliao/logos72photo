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
import { generateAllSlotGroups, derivePassword } from '@/lib/slot-password'

/** slotGroup → "3/25/2026" */
function getDate(sg: string): string {
  return `${parseInt(sg.slice(0, 2), 10)}/${parseInt(sg.slice(2, 4), 10)}/2026`
}

/** slotGroup → "18:30" */
function getTime(sg: string): string {
  const hh = sg.slice(4, 6)
  const min = String((parseInt(sg.slice(6, 8), 10) - 1) * 15).padStart(2, '0')
  return `${hh}:${min}`
}

export async function GET(req: NextRequest) {
  // 驗證管理員 session
  const session = req.cookies.get('admin_session')?.value
  if (!session || session !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 產生 slotGroups：03/25 18:30 – 03/28 23:59
  const allGroups = generateAllSlotGroups('2026-03-25', '2026-03-28')
  const groups = allGroups.filter((sg) => sg >= '03251803')

  // 批次計算密碼（每批 96 筆）
  const BATCH = 96
  const passwords: string[] = []
  for (let i = 0; i < groups.length; i += BATCH) {
    const batch = await Promise.all(groups.slice(i, i + BATCH).map(derivePassword))
    passwords.push(...batch)
  }

  // 建立工作表資料（格式對齊明信片）
  const rows = groups.map((sg, i) => ({
    Date: getDate(sg),
    Time: getTime(sg),
    'Username/Password': `${sg}/${passwords[i]}`,
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
