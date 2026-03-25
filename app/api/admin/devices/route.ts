/*
 * ----------------------------------------------
 * Admin API：裝置啟用狀態查詢
 * 2026-03-25
 * app/api/admin/devices/route.ts
 * ----------------------------------------------
 */

export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getDoc } from '@/lib/firebase-rest'

const KNOWN_DEVICES = ['iphone-1', 'iphone-2']

export async function GET(req: NextRequest) {
  const session = req.cookies.get('admin_session')?.value
  if (!session || session !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = await Promise.all(
    KNOWN_DEVICES.map(async (device_id) => {
      try {
        const doc = await getDoc<{ enabled?: boolean }>('devices', device_id)
        return { device_id, enabled: doc?.enabled !== false }
      } catch {
        return { device_id, enabled: true }
      }
    }),
  )

  return NextResponse.json(results)
}
