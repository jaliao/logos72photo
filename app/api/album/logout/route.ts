/*
 * ----------------------------------------------
 * API Route：來賓時段相簿登出
 * 2026-03-15
 * app/api/album/logout/route.ts
 * ----------------------------------------------
 */

export const runtime = 'edge'

import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('album_session', '', {
    httpOnly: true,
    path: '/album',
    maxAge: 0,
  })
  return res
}
