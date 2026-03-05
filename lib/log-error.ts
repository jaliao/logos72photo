/*
 * ----------------------------------------------
 * 客戶端錯誤回報 Helper（fire-and-forget）
 * 2026-03-05
 * lib/log-error.ts
 * ----------------------------------------------
 */

/**
 * 將錯誤傳送至 /api/log-error（fire-and-forget，不影響主流程）
 * @param deviceId 裝置 ID
 * @param source   錯誤來源，例如 'camera:blob'、'camera:upload'
 * @param message  錯誤訊息
 */
export function logError(deviceId: string, source: string, message: string): void {
  fetch('/api/log-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ device_id: deviceId, source, message }),
  }).catch(() => {
    // 靜默失敗，避免遮蔽原始錯誤
  })
}
