/*
 * ----------------------------------------------
 * Firebase Realtime Database（僅在客戶端使用）
 * 2026-02-21
 * lib/firebase-rtdb.ts
 * ----------------------------------------------
 * 與 firebase.ts 分離，避免 getDatabase() 在 build 時崩潰（需要 databaseURL）。
 * 僅在 Client Components（相機頁面）中匯入此模組。
 */

import { getDatabase } from 'firebase/database'
import { getFirebaseApp } from '@/lib/firebase-app'

export function getRtdb() {
  return getDatabase(getFirebaseApp())
}
