/*
 * ----------------------------------------------
 * 全域常數
 * 2026-02-21
 * lib/constants.ts
 * ----------------------------------------------
 */

/** 心跳間隔（毫秒）。CameraClient 發送心跳的週期，監控頁用於計算下次心跳時間。 */
export const HEARTBEAT_INTERVAL_MS = 15_000

/** 裝置離線判定閾值（毫秒）。超過此時間未收到心跳視為失聯。 */
export const OFFLINE_THRESHOLD_MS = HEARTBEAT_INTERVAL_MS * 2 // 30 秒
