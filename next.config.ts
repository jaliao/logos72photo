/*
 * ----------------------------------------------
 * Next.js 設定
 * 2026-02-21 (Updated: 2026-02-21)
 * next.config.ts
 * ----------------------------------------------
 */

import type { NextConfig } from 'next'

// 本機開發時啟用 Cloudflare Pages 環境模擬（需 wrangler pages dev）
if (process.env.NODE_ENV === 'development') {
  void import('@cloudflare/next-on-pages/next-dev').then(({ setupDevPlatform }) =>
    setupDevPlatform()
  )
}

const nextConfig: NextConfig = {
  images: {
    // 允許 Cloudflare R2 公開 URL 的圖片
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '*.pages.dev',
      },
    ],
  },
}

export default nextConfig
