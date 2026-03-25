/*
 * ----------------------------------------------
 * iPhone 1 相機頁面（device_id: iphone-1）
 * 2026-02-21 (Updated: 2026-03-25)
 * app/camera1/page.tsx
 * ----------------------------------------------
 */

export const runtime = 'edge'

import type { Metadata } from 'next'
import { getDoc } from '@/lib/firebase-rest'
import CameraClient from '@/app/camera/CameraClient'

export const metadata: Metadata = {
  title: '接力相機 1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '接力相機 1',
  },
}

export default async function Camera1Page() {
  let initialEnabled = true
  try {
    const doc = await getDoc<{ enabled?: boolean }>('devices', 'iphone-1')
    initialEnabled = doc?.enabled !== false
  } catch {
    // fail open
  }

  return (
    <CameraClient deviceId="iphone-1" appTitle="接力相機 1" initialEnabled={initialEnabled} />
  )
}
