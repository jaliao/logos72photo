/*
 * ----------------------------------------------
 * 全域型別定義
 * 2026-02-21
 * lib/types.ts
 * ----------------------------------------------
 */

/** Firestore `photos` 集合的文件結構 */
export interface PhotoDoc {
  /** Cloudflare R2 公開存取 URL */
  r2_url: string
  /** 拍照時間（Unix timestamp，毫秒） */
  timestamp: number
  /** 拍照裝置 ID（例如 "iphone-1"） */
  device_id: string
  /** 日期字串，格式 YYYY-MM-DD */
  date: string
  /** 8 小時大時段起始小時：0、8、或 16 */
  slot_8h: 0 | 8 | 16
  /** 15 分鐘子相簿起始時間（當日分鐘數，例如 480 代表 08:00） */
  slot_15m: number
}

/** Firestore `devices` 集合的文件結構（裝置心跳狀態） */
export interface DeviceDoc {
  /** 裝置 ID */
  device_id: string
  /** 電池電量（0-1） */
  battery_level: number | null
  /** 最後心跳時間（Unix timestamp，毫秒） */
  last_heartbeat: number
  /** 最後一張照片的 R2 URL */
  last_photo_url: string | null
  /** 最後拍照時間（Unix timestamp，毫秒） */
  last_shot_at: number | null
}

/** 8 小時大時段 */
export type Slot8h = 0 | 8 | 16

/** 從 timestamp 計算 slot_8h */
export function getSlot8h(date: Date): Slot8h {
  const hour = date.getHours()
  if (hour < 8) return 0
  if (hour < 16) return 8
  return 16
}

/** 從 timestamp 計算 slot_15m（當日分鐘數，對齊到 15 分鐘） */
export function getSlot15m(date: Date): number {
  const totalMinutes = date.getHours() * 60 + date.getMinutes()
  return Math.floor(totalMinutes / 15) * 15
}

/** 從當日分鐘數格式化為 HH:MM 字串 */
export function formatSlot15m(slot: number): string {
  const h = Math.floor(slot / 60).toString().padStart(2, '0')
  const m = (slot % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}
