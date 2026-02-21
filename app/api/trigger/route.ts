/*
 * ----------------------------------------------
 * API Route：觸發拍照（更新 RTDB trigger/last_shot）
 * 2026-02-21
 * app/api/trigger/route.ts
 * ----------------------------------------------
 */

import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app'
import { getDatabase as getAdminDatabase } from 'firebase-admin/database'

// 使用 Admin SDK 進行伺服器端 RTDB 寫入
function getAdminDb() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    })
  } else {
    getApp()
  }
  return getAdminDatabase()
}

export async function POST(req: NextRequest) {
  // 驗證安全金鑰
  const secret = req.headers.get('x-trigger-secret')
  if (secret !== process.env.TRIGGER_API_SECRET) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  try {
    const db = getAdminDb()
    const triggerRef = db.ref('trigger/last_shot')
    await triggerRef.set(Date.now())

    return NextResponse.json({ ok: true, triggered_at: Date.now() })
  } catch (err) {
    console.error('觸發失敗：', err)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

// 允許 GET（用於手動測試）
export async function GET(req: NextRequest) {
  return POST(req)
}
