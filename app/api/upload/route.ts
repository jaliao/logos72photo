/*
 * ----------------------------------------------
 * API Route：照片上傳至 Cloudflare R2
 * 2026-02-21 (Updated: 2026-02-21)
 * app/api/upload/route.ts
 * ----------------------------------------------
 */

export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { uploadToR2 } from '@/lib/r2'
import { addDoc } from '@/lib/firebase-rest'
import { getSlot8h, getSlot15m, type PhotoDoc } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const photo = formData.get('photo') as File | null
    const deviceId = formData.get('device_id') as string | null

    if (!photo || !deviceId) {
      return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 })
    }

    const now = new Date()
    const timestamp = now.getTime()

    // 建立 R2 路徑：YYYY-MM-DD/device_id_timestamp.jpg
    const dateStr = now.toISOString().slice(0, 10)
    const key = `${dateStr}/${deviceId}_${timestamp}.jpg`

    // 上傳至 R2（使用 Uint8Array，相容 Edge Runtime）
    const arrayBuffer = await photo.arrayBuffer()
    const body = new Uint8Array(arrayBuffer)
    const r2Url = await uploadToR2(key, body)

    // 寫入 Firestore photos 集合（透過 REST API）
    const photoDoc: PhotoDoc = {
      r2_url: r2Url,
      timestamp,
      device_id: deviceId,
      date: dateStr,
      slot_8h: getSlot8h(now),
      slot_15m: getSlot15m(now),
    }
    await addDoc('photos', photoDoc as unknown as Record<string, unknown>)

    return NextResponse.json({ ok: true, url: r2Url })
  } catch (err) {
    console.error('上傳失敗：', err)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
