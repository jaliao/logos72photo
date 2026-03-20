/*
 * ----------------------------------------------
 * API Route：訪客刪除自己的照片
 * 2026-03-20
 * app/api/album/photos/route.ts
 * ----------------------------------------------
 */

export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { verifyAlbumSession } from '@/lib/slot-password'
import { queryPhotoByR2Url, deleteFirestoreDoc } from '@/lib/firebase-rest'

export async function DELETE(req: NextRequest) {
  // 驗證 album_session cookie
  const cookieValue = req.cookies.get('album_session')?.value ?? ''
  const sessionSlotGroup = await verifyAlbumSession(cookieValue)
  if (!sessionSlotGroup) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  // 解析請求體
  const { r2Url } = await req.json().catch(() => ({} as { r2Url?: string }))
  if (typeof r2Url !== 'string' || !r2Url) {
    return NextResponse.json({ error: '缺少 r2Url' }, { status: 400 })
  }

  // 查詢 Firestore 文件
  const photo = await queryPhotoByR2Url(r2Url)
  if (!photo) {
    return NextResponse.json({ error: '找不到照片' }, { status: 404 })
  }

  // 驗證 slot_group 與 session 一致
  if (photo.slot_group !== sessionSlotGroup) {
    return NextResponse.json({ error: '無權刪除此照片' }, { status: 403 })
  }

  // 執行刪除
  await deleteFirestoreDoc('photos', photo.docId)

  return NextResponse.json({ ok: true })
}
