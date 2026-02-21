/*
 * ----------------------------------------------
 * Next.js 設定
 * 2026-02-21
 * next.config.ts
 * ----------------------------------------------
 */

import type { NextConfig } from 'next'

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
