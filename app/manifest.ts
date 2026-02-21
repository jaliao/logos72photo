/*
 * ----------------------------------------------
 * PWA Manifest（支援 iPhone 全螢幕模式）
 * 2026-02-21
 * app/manifest.ts
 * ----------------------------------------------
 */

import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '讀經接力相機',
    short_name: '接力相機',
    description: '72 小時讀經接力自動拍照系統',
    start_url: '/camera',
    display: 'fullscreen',
    orientation: 'portrait',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
