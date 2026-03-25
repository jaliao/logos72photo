/*
 * ----------------------------------------------
 * iPhone 3 相機頁面（device_id: iphone-3）
 * 2026-03-26
 * app/camera3/page.tsx
 * ----------------------------------------------
 */

export const runtime = 'edge'

import type { Metadata } from 'next'
import { getDoc } from '@/lib/firebase-rest'
import CameraClient from '@/app/camera/CameraClient'

export const metadata: Metadata = {
  title: '接力相機 3',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '接力相機 3',
  },
}

export default async function Camera3Page() {
  let initialEnabled = true
  try {
    const doc = await getDoc<{ enabled?: boolean }>('devices', 'iphone-3')
    initialEnabled = doc?.enabled !== false
  } catch {
    // fail open
  }

  return (
    <CameraClient deviceId="iphone-3" appTitle="接力相機 3" initialEnabled={initialEnabled} />
  )
}
