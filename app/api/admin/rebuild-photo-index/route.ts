/*
 * ----------------------------------------------
 * 一次性管理 API：從 photos 集合重建 photo_index
 * 2026-03-05
 * app/api/admin/rebuild-photo-index/route.ts
 * ----------------------------------------------
 *
 * 使用方式：
 *   curl -X POST https://<your-domain>/api/admin/rebuild-photo-index \
 *        -H "x-admin-secret: <ADMIN_SECRET>"
 *
 * 環境變數：ADMIN_SECRET（自行設定，用於保護此端點）
 * 完成後可刪除此檔案。
 */

export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { queryDatesWithSlots, queryPhotos, updatePhotoIndex } from '@/lib/firebase-rest'

export async function POST(req: NextRequest) {
  // 驗證 admin secret
  const secret = req.headers.get('x-admin-secret')
  const expected = process.env.ADMIN_SECRET
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  try {
    // 取得所有有照片的日期與時段（使用舊函式，此為一次性操作）
    const dateList = await queryDatesWithSlots()

    let totalDates = 0
    let totalPhotos = 0
    const results: Array<{ date: string; slots: number[]; status: string }> = []

    for (const { date, slots } of dateList) {
      totalDates++
      for (const slot8h of slots) {
        // 查詢該日期+時段的所有照片，取得 hourMin
        const photos = await queryPhotos([
          { field: 'date', value: date },
          { field: 'slot_8h', value: slot8h },
        ])

        // 計算各照片的 hourMin，記錄每小時第一張照片 URL
        const hourFirstPhoto = new Map<number, string>()
        for (const photo of photos) {
          const hourMin = Math.floor(photo.slot_15m / 60) * 60
          if (!hourFirstPhoto.has(hourMin)) {
            hourFirstPhoto.set(hourMin, photo.r2_url)
          }
          totalPhotos++
        }

        for (const [hourMin, r2Url] of hourFirstPhoto) {
          await updatePhotoIndex(date, slot8h as 0 | 8 | 16, hourMin, r2Url)
        }
      }

      results.push({
        date,
        slots: Array.from(slots),
        status: 'done',
      })
    }

    return NextResponse.json({
      ok: true,
      message: `重建完成：${totalDates} 個日期，${totalPhotos} 張照片`,
      results,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
