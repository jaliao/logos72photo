/*
 * ----------------------------------------------
 * Photon WASM 影像處理輔助函式
 * 2026-03-05
 * workers/lib/photon-helper.ts
 * ----------------------------------------------
 */

import { PhotonImage, SamplingFilter, resize, watermark } from '@cf-wasm/photon'

/**
 * 將圖片縮放至指定寬度（高度等比例）
 * @param buffer  原始圖片二進位資料（JPEG / PNG）
 * @param width   目標寬度（px）
 * @returns       縮放後的 PhotonImage（需手動 free()）
 */
export function resizeToWidth(buffer: Uint8Array, width: number): PhotonImage {
  const img = PhotonImage.new_from_byteslice(buffer)
  const origW = img.get_width()
  const origH = img.get_height()
  const height = Math.round((origH / origW) * width)
  const resized = resize(img, width, height, SamplingFilter.Lanczos3)
  img.free()
  return resized
}

/**
 * 將 PhotonImage 編碼為 WebP 二進位資料
 * @param img     PhotonImage 實例（呼叫後不自動 free）
 * @returns       WebP Uint8Array
 */
export function encodeWebP(img: PhotonImage): Uint8Array {
  return img.get_bytes_webp()
}

/**
 * 在圖片右下角疊加浮水印
 * @param img             目標 PhotonImage（原地修改）
 * @param watermarkBuffer 浮水印 PNG 二進位資料
 * @param marginRatio     邊距比例（佔圖片寬度，預設 0.02）
 */
export function applyWatermark(
  img: PhotonImage,
  watermarkBuffer: Uint8Array,
  marginRatio = 0.02,
): void {
  const mark = PhotonImage.new_from_byteslice(watermarkBuffer)
  const margin = Math.round(img.get_width() * marginRatio)
  const x = BigInt(img.get_width() - mark.get_width() - margin)
  const y = BigInt(img.get_height() - mark.get_height() - margin)
  watermark(img, mark, x, y)
  mark.free()
}
