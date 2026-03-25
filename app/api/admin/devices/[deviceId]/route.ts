/*
 * ----------------------------------------------
 * Admin API：切換裝置啟用狀態
 * 2026-03-25
 * app/api/admin/devices/[deviceId]/route.ts
 * ----------------------------------------------
 */

export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { setDoc } from '@/lib/firebase-rest'

const KNOWN_DEVICES = ['iphone-1', 'iphone-2', 'iphone-3']

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> },
) {
  const session = req.cookies.get('admin_session')?.value
  if (!session || session !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { deviceId } = await params

  if (!KNOWN_DEVICES.includes(deviceId)) {
    return NextResponse.json({ error: '未知裝置' }, { status: 400 })
  }

  let body: { enabled?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON 解析失敗' }, { status: 400 })
  }

  if (typeof body.enabled !== 'boolean') {
    return NextResponse.json({ error: '缺少 enabled 欄位' }, { status: 400 })
  }

  await setDoc('devices', deviceId, { enabled: body.enabled })

  return NextResponse.json({ ok: true, device_id: deviceId, enabled: body.enabled })
}
