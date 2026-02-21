/*
 * ----------------------------------------------
 * iPhone 1 相機頁面（device_id: iphone-1）
 * 2026-02-21
 * app/camera1/page.tsx
 * ----------------------------------------------
 */

import type { Metadata } from 'next'
import CameraClient from '@/app/camera/CameraClient'

export const metadata: Metadata = {
  title: '接力相機 1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '接力相機 1',
  },
}

export default function Camera1Page() {
  return <CameraClient deviceId="iphone-1" appTitle="接力相機 1" />
}
