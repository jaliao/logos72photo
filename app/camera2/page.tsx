/*
 * ----------------------------------------------
 * iPhone 2 相機頁面（device_id: iphone-2）
 * 2026-02-21 (Updated: 2026-03-25)
 * app/camera2/page.tsx
 * ----------------------------------------------
 */

export const runtime = 'edge'

import type { Metadata } from 'next'
import { getDoc } from '@/lib/firebase-rest'
import CameraClient from '@/app/camera/CameraClient'

export const metadata: Metadata = {
  title: '接力相機 2',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '接力相機 2',
  },
}

export default async function Camera2Page() {
  let initialEnabled = true
  try {
    const doc = await getDoc<{ enabled?: boolean }>('devices', 'iphone-2')
    initialEnabled = doc?.enabled !== false
  } catch {
    // fail open
  }

  return (
    <CameraClient deviceId="iphone-2" appTitle="接力相機 2" initialEnabled={initialEnabled} />
  )
}
