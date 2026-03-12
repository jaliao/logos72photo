/*
 * ----------------------------------------------
 * 縮圖 URL 產生工具函式
 * 2026-03-12
 * lib/image.ts
 * ----------------------------------------------
 */

/**
 * 產生 Image Service 縮圖 URL。
 * 若 NEXT_PUBLIC_IMAGE_SERVICE_URL 未設定，fallback 回傳原始 r2Url。
 */
export function toThumbUrl(r2Url: string, width: number, quality: number): string {
  const imageServiceUrl = process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL?.replace(/\/$/, '') ?? ''
  if (!imageServiceUrl) return r2Url
  try {
    const r2Key = new URL(r2Url).pathname.slice(1)
    return `${imageServiceUrl}/resizing/${width}/${quality}/${r2Key}`
  } catch {
    return r2Url
  }
}

/** 640px 縮圖（quality 80），用於 grid 縮圖顯示 */
export function toThumb640(r2Url: string): string {
  return toThumbUrl(r2Url, 640, 80)
}

/** 1280px 縮圖（quality 85），用於幻燈片主畫面顯示與 iOS 分享 */
export function toThumb1280(r2Url: string): string {
  return toThumbUrl(r2Url, 1280, 85)
}
