/*
 * ----------------------------------------------
 * Firebase Cloud Functions 進入點
 * 2026-03-17
 * functions/src/index.ts
 * ----------------------------------------------
 */

import * as admin from 'firebase-admin'

// 初始化 Firebase Admin SDK（使用 Application Default Credentials）
admin.initializeApp()

export { generateCover } from './generateCover'
