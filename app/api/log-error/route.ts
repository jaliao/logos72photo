/*
 * ----------------------------------------------
 * API Route：錯誤日誌寫入 Firestore（TTL 7 天）
 * 2026-03-04
 * app/api/log-error/route.ts
 * ----------------------------------------------
 */

export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { addDoc } from '@/lib/firebase-rest'

const TW_OFFSET_MS = 8 * 60 * 60 * 1000
const TTL_MS = 7 * 24 * 60 * 60 * 1000

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      device_id?: string
      source?: string
      message?: string
    }

    const device_id = body.device_id ?? 'unknown'
    const source = body.source ?? 'unknown'
    const message = body.message ?? '（無訊息）'

    const now = Date.now()
    const date = new Date(now + TW_OFFSET_MS).toISOString().slice(0, 10)
    // expires_at 以 ISO 字串儲存為 Firestore timestampValue（供 TTL policy 使用）
    const expires_at = new Date(now + TTL_MS).toISOString()

    await addDoc('error_logs', { device_id, source, message, timestamp: now, date, expires_at })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('log-error 寫入失敗：', err)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
