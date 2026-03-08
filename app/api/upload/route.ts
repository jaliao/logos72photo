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
import { addDoc, updatePhotoIndex } from '@/lib/firebase-rest'
import { getSlot8h, getSlot15m, type PhotoDoc } from '@/lib/types'

const TW_OFFSET_MS = 8 * 60 * 60 * 1000
const TTL_MS = 7 * 24 * 60 * 60 * 1000

async function writeErrorLog(deviceId: string, message: string): Promise<void> {
  try {
    const now = Date.now()
    await addDoc('error_logs', {
      device_id: deviceId,
      source: 'api:upload',
      message,
      timestamp: now,
      date: new Date(now + TW_OFFSET_MS).toISOString().slice(0, 10),
      expires_at: new Date(now + TTL_MS).toISOString(),
    })
  } catch {
    // 靜默失敗，避免遮蔽原始錯誤
  }
}

export async function POST(req: NextRequest) {
  let deviceId = 'unknown'
  try {
    const formData = await req.formData()
    const photo = formData.get('photo') as File | null
    deviceId = (formData.get('device_id') as string | null) ?? 'unknown'

    if (!photo || !deviceId) {
      return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 })
    }

    const now = new Date()
    const timestamp = now.getTime()

    // 台灣時間（UTC+8）計算日期與時段
    const taiwanNow = new Date(timestamp + TW_OFFSET_MS)

    // 建立 R2 路徑：YYYY-MM-DD/device_id_timestamp.jpg（台灣日期）
    const dateStr = taiwanNow.toISOString().slice(0, 10)
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
      date: dateStr,           // 台灣日期
      slot_8h: getSlot8h(taiwanNow),   // 台灣時段
      slot_15m: getSlot15m(taiwanNow), // 台灣 15 分鐘子相簿
    }
    await addDoc('photos', photoDoc as unknown as Record<string, unknown>)

    // 更新反正規化索引（await 確保 Cloudflare Workers edge runtime 不在回應後提前終止）
    const slot8h = getSlot8h(taiwanNow)
    const hourMin = taiwanNow.getUTCHours() * 60
    try {
      await updatePhotoIndex(dateStr, slot8h, hourMin)
    } catch (err) {
      // 索引更新失敗不阻斷上傳，但記錄錯誤
      console.error('updatePhotoIndex 失敗：', err instanceof Error ? err.message : String(err))
    }

    return NextResponse.json({ ok: true, url: r2Url })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('上傳失敗：', message)
    await writeErrorLog(deviceId, message)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
