/*
 * ----------------------------------------------
 * iPhone 2 相機頁面（device_id: iphone-2）
 * 2026-02-21
 * app/camera2/page.tsx
 * ----------------------------------------------
 */

import type { Metadata } from 'next'
import CameraClient from '@/app/camera/CameraClient'

export const metadata: Metadata = {
  title: '接力相機 2',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '接力相機 2',
  },
}

export default function Camera2Page() {
  return <CameraClient deviceId="iphone-2" appTitle="接力相機 2" />
}
