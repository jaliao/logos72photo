/*
 * ----------------------------------------------
 * iPhone 相機拍照頁面（PWA 全螢幕）
 * 2026-02-21
 * app/camera/page.tsx
 * ----------------------------------------------
 */

import type { Metadata } from 'next'
import CameraClient from './CameraClient'

export const metadata: Metadata = {
  title: '讀經接力相機',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '接力相機',
  },
}

export default function CameraPage() {
  return <CameraClient />
}
