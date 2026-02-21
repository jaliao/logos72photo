/*
 * ----------------------------------------------
 * Firebase 初始化（Client SDK）
 * 2026-02-21
 * lib/firebase.ts
 * ----------------------------------------------
 */

import { getFirestore } from 'firebase/firestore'
import { getFirebaseApp } from '@/lib/firebase-app'

/** Firestore 資料庫實例 */
export const db = getFirestore(getFirebaseApp())
