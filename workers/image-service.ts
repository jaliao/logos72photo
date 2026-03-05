/*
 * ----------------------------------------------
 * Cloudflare Worker：影像處理服務
 * 2026-03-05
 * workers/image-service.ts
 * ----------------------------------------------
 *
 * 路由：GET /resizing/{width}/{quality}/{r2_key}
 *
 * 快取策略（由外到內）：
 *   L1: Cloudflare Cache API（邊緣節點）
 *   L2: R2 thumbnails/ 資料夾（持久化）
 *   miss: 從 R2 原圖處理後同時寫入 L1 + L2
 *
 * 部署：wrangler deploy --config wrangler.image-service.toml
 */

import { resizeToWidth, encodeJpeg, applyWatermark } from './lib/photon-helper'

export interface Env {
  BUCKET: R2Bucket
  R2_PUBLIC_URL: string
  WATERMARK_ENABLED: string
}

// L2 快取的 R2 key 格式（.jpg：lossy JPEG）
function thumbKey(width: number, quality: number, r2Key: string): string {
  return `thumbnails/${width}w_${quality}q/${r2Key}.jpg`
}

// 快取回應的 headers
function cacheHeaders(): HeadersInit {
  return {
    'Content-Type': 'image/jpeg',
    'Cache-Control': 'public, max-age=86400',
    'Access-Control-Allow-Origin': '*',
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // 僅接受 GET
    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405 })
    }

    const url = new URL(request.url)
    // 解析路由：/resizing/{width}/{quality}/{r2_key...}
    const match = url.pathname.match(/^\/resizing\/(\d+)\/(\d+)\/(.+)$/)
    if (!match) {
      return new Response('Not Found', { status: 404 })
    }

    const width = parseInt(match[1], 10)
    const quality = parseInt(match[2], 10)
    const r2Key = match[3]

    // 參數驗證
    if (width < 1 || width > 3000) {
      return new Response('width 必須介於 1–3000', { status: 400 })
    }
    if (quality < 1 || quality > 100) {
      return new Response('quality 必須介於 1–100', { status: 400 })
    }

    const publicUrl = env.R2_PUBLIC_URL?.replace(/\/$/, '') ?? ''
    const fallbackUrl = `${publicUrl}/${r2Key}`

    try {
      // ── L1：Cloudflare Cache API ──────────────────────────────
      const cache = caches.default
      const cacheKey = new Request(request.url, { method: 'GET' })
      const cached = await cache.match(cacheKey)
      if (cached) return cached

      // ── L2：R2 thumbnails/ ────────────────────────────────────
      const l2Key = thumbKey(width, quality, r2Key)
      const l2Object = await env.BUCKET.get(l2Key)
      if (l2Object) {
        const body = await l2Object.arrayBuffer()
        const response = new Response(body, { headers: cacheHeaders() })
        // 非同步寫入 L1
        ctx.waitUntil(cache.put(cacheKey, response.clone()))
        return response
      }

      // ── Miss：從原圖處理 ──────────────────────────────────────
      const originalObject = await env.BUCKET.get(r2Key)
      if (!originalObject) {
        return new Response('Not Found', { status: 404 })
      }

      const originalBuffer = new Uint8Array(await originalObject.arrayBuffer())

      // Photon 影像處理
      const resized = resizeToWidth(originalBuffer, width)

      // 浮水印（可選）
      if (env.WATERMARK_ENABLED === 'true') {
        const markObject = await env.BUCKET.get('assets/watermark.png')
        if (markObject) {
          const markBuffer = new Uint8Array(await markObject.arrayBuffer())
          applyWatermark(resized, markBuffer)
        }
      }

      const webpBytes = encodeJpeg(resized, quality)
      resized.free()

      // 同步寫入 L2
      ctx.waitUntil(
        env.BUCKET.put(l2Key, webpBytes, {
          httpMetadata: { contentType: 'image/jpeg' },
        }),
      )

      const response = new Response(webpBytes, { headers: cacheHeaders() })
      // 非同步寫入 L1
      ctx.waitUntil(cache.put(cacheKey, response.clone()))

      return response
    } catch (err) {
      // 降級：302 Redirect 至 R2 原圖
      console.error('[image-service] 處理失敗，降級至原圖：', err)
      return Response.redirect(fallbackUrl, 302)
    }
  },
}
