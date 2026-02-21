/*
 * ----------------------------------------------
 * API Route：裝置心跳（Admin SDK 寫入 Firestore）
 * 2026-02-21
 * app/api/heartbeat/route.ts
 * ----------------------------------------------
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      device_id: string
      battery_level: number | null
      last_photo_url?: string | null
      last_shot_at?: number | null
    }

    if (!body.device_id) {
      return NextResponse.json({ error: '缺少 device_id' }, { status: 400 })
    }

    const adminDb = getAdminDb()
    const now = Date.now()

    await adminDb.collection('devices').doc(body.device_id).set(
      {
        device_id: body.device_id,
        battery_level: body.battery_level ?? null,
        last_heartbeat: now,
        ...(body.last_photo_url !== undefined && { last_photo_url: body.last_photo_url }),
        ...(body.last_shot_at !== undefined && { last_shot_at: body.last_shot_at }),
      },
      { merge: true },
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('心跳寫入失敗：', err)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
