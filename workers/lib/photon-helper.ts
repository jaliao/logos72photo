/*
 * ----------------------------------------------
 * Photon WASM 影像處理輔助函式
 * 2026-03-05
 * workers/lib/photon-helper.ts
 * ----------------------------------------------
 */

import { PhotonImage, SamplingFilter, resize } from '@cf-wasm/photon'

/**
 * 偵測 JPEG 是否為 CMYK 色彩空間。
 * Photon WASM 不支援 CMYK，強行解碼會造成顏色反轉（負片效果）。
 * 做法：掃描 SOF 標記（FF C0/C1/C2），取 nComponents 欄位，4 = CMYK/YCCK。
 */
export function isCmykJpeg(buffer: Uint8Array): boolean {
  for (let i = 0; i < buffer.length - 11; i++) {
    if (buffer[i] !== 0xFF) continue
    const marker = buffer[i + 1]
    if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2) {
      // SOF 結構：[FF][Cx][length(2)][precision(1)][height(2)][width(2)][nComponents(1)]
      const nComponents = buffer[i + 9]
      return nComponents === 4
    }
  }
  return false
}

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
 * 將 PhotonImage 編碼為 JPEG 二進位資料（lossy，quality 參數生效）
 *
 * 注意：photon 的 get_bytes_webp() 為 lossless WebP（無法傳入 quality），
 * 對照片而言比 lossy JPEG 大 5–10 倍。改用 get_bytes_jpeg(quality) 可大幅縮小體積。
 *
 * @param img     PhotonImage 實例（呼叫後不自動 free）
 * @param quality JPEG 壓縮品質 1–100（建議 75–85）
 * @returns       JPEG Uint8Array
 */
export function encodeJpeg(img: PhotonImage, quality: number): Uint8Array {
  return img.get_bytes_jpeg(quality)
}
