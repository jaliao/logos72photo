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
  /** 個人時段分組號碼（8 碼 MMDDHHSS，例如 "03130103"） */
  slot_group?: string
}

/** Firestore `photos` 集合的文件結構，含 Firestore 文件 ID */
export type PhotoDocWithId = PhotoDoc & { docId: string }

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

/** Firestore `error_logs` 集合的文件結構 */
export interface ErrorLogDoc {
  /** 裝置 ID（client 端錯誤）或 'server'（API 端錯誤） */
  device_id: string
  /** 錯誤來源，例如 'camera:blob'、'camera:upload'、'api:upload' */
  source: string
  /** 錯誤訊息 */
  message: string
  /** 發生時間（Unix timestamp，毫秒） */
  timestamp: number
  /** 台灣時間日期字串，格式 YYYY-MM-DD（供查詢過濾） */
  date: string
  /** TTL 欄位（UTC ISO 字串，7 天後由 Firestore 自動刪除） */
  expires_at: string
}

/** 8 小時大時段 */
export type Slot8h = 0 | 8 | 16

/** 從 timestamp 計算 slot_8h */
export function getSlot8h(date: Date): Slot8h {
  // 使用 getUTCHours()：傳入的 date 為 new Date(timestamp + TW_OFFSET_MS)，UTC 時間即台灣時間
  const hour = date.getUTCHours()
  if (hour < 8) return 0
  if (hour < 16) return 8
  return 16
}

/** 從 timestamp 計算 slot_15m（當日分鐘數，對齊到 15 分鐘） */
export function getSlot15m(date: Date): number {
  // 使用 getUTCHours/Minutes()：傳入的 date 為 new Date(timestamp + TW_OFFSET_MS)，UTC 時間即台灣時間
  const totalMinutes = date.getUTCHours() * 60 + date.getUTCMinutes()
  return Math.floor(totalMinutes / 15) * 15
}

/**
 * 從 dateStr（YYYY-MM-DD）與 slot_15m（當日對齊 15 分鐘的分鐘數）計算 8 碼分組號碼 MMDDHHSS
 * SS = Math.floor((slot_15m % 60) / 15) + 1（01–04）
 * 範例：date="2026-03-13", slot_15m=90 → "03130103"
 */
export function getSlotGroup(dateStr: string, slot15m: number): string {
  const mm = dateStr.slice(5, 7)
  const dd = dateStr.slice(8, 10)
  const hh = Math.floor(slot15m / 60).toString().padStart(2, '0')
  const ss = (Math.floor((slot15m % 60) / 15) + 1).toString().padStart(2, '0')
  return `${mm}${dd}${hh}${ss}`
}

/** 從當日分鐘數格式化為 HH:MM 字串 */
export function formatSlot15m(slot: number): string {
  const h = Math.floor(slot / 60).toString().padStart(2, '0')
  const m = (slot % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}
