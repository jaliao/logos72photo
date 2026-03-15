/*
 * ----------------------------------------------
 * API Route：來賓時段相簿登入
 * 2026-03-15
 * app/api/album/login/route.ts
 * ----------------------------------------------
 */

export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { derivePassword, signSlotGroup } from '@/lib/slot-password'

export async function POST(req: NextRequest) {
  const { slotGroup, password } = await req.json().catch(() => ({}))

  if (typeof slotGroup !== 'string' || !/^\d{8}$/.test(slotGroup)) {
    return NextResponse.json({ error: '帳號格式錯誤' }, { status: 400 })
  }
  if (typeof password !== 'string') {
    return NextResponse.json({ error: '缺少密碼' }, { status: 400 })
  }

  const expected = await derivePassword(slotGroup)
  if (password !== expected) {
    return NextResponse.json({ error: '帳號或密碼錯誤' }, { status: 401 })
  }

  const sig = await signSlotGroup(slotGroup)
  const cookieValue = `${slotGroup}:${sig}`

  const res = NextResponse.json({ ok: true })
  res.cookies.set('album_session', cookieValue, {
    httpOnly: true,
    path: '/album',
    maxAge: 86400,
    sameSite: 'lax',
  })
  return res
}
