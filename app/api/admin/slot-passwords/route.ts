/*
 * ----------------------------------------------
 * API Route：後台帳密查詢
 * 2026-03-15
 * app/api/admin/slot-passwords/route.ts
 * ----------------------------------------------
 */

export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { derivePassword } from '@/lib/slot-password'

export async function GET(req: NextRequest) {
  // 驗證管理員 session
  const session = req.cookies.get('admin_session')?.value
  if (!session || session !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const slotGroup = req.nextUrl.searchParams.get('slotGroup') ?? ''
  if (!/^\d{8}$/.test(slotGroup)) {
    return NextResponse.json({ error: '格式錯誤' }, { status: 400 })
  }

  const password = await derivePassword(slotGroup)
  return NextResponse.json({ slotGroup, password })
}
