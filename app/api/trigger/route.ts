/*
 * ----------------------------------------------
 * API Route：時間同步（更新 RTDB sync/server_time）
 * 2026-02-21 (Updated: 2026-03-04)
 * app/api/trigger/route.ts
 * ----------------------------------------------
 */

export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { rtdbSet } from '@/lib/firebase-rest'

export async function POST(req: NextRequest) {
  // 驗證安全金鑰
  const secret = req.headers.get('x-trigger-secret')
  if (secret !== process.env.TRIGGER_API_SECRET) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  try {
    const serverTime = Date.now()
    // 寫入時間同步節點（裝置用於計算與伺服器的時差）
    await rtdbSet('sync/server_time', serverTime)

    return NextResponse.json({ ok: true, server_time: serverTime })
  } catch (err) {
    console.error('觸發失敗：', err)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

// 允許 GET（用於手動測試）
export async function GET(req: NextRequest) {
  return POST(req)
}
