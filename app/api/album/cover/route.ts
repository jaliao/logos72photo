/*
 * ----------------------------------------------
 * API Route：訪客刪除自己時段的封面照片
 * 2026-03-20
 * app/api/album/cover/route.ts
 * ----------------------------------------------
 */

export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { verifyAlbumSession } from '@/lib/slot-password'
import { deleteR2Object } from '@/lib/r2'

export async function DELETE(req: NextRequest) {
  // 驗證 album_session cookie
  const cookieValue = req.cookies.get('album_session')?.value ?? ''
  const slotGroup = await verifyAlbumSession(cookieValue)
  if (!slotGroup) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  // 從 session 推導封面 R2 key，不接受前端傳入路徑
  const key = `covers/${slotGroup}.jpg`
  await deleteR2Object(key)

  return NextResponse.json({ ok: true })
}
