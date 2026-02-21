/*
 * ----------------------------------------------
 * Firebase Admin SDK（僅在 Server 端使用）
 * 2026-02-21
 * lib/firebase-admin.ts
 * ----------------------------------------------
 */

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getDatabase } from 'firebase-admin/database'

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0]
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  })
}

/** Admin Firestore（繞過 Security Rules） */
export function getAdminDb() {
  return getFirestore(getAdminApp())
}

/** Admin RTDB（繞過 Security Rules） */
export function getAdminRtdb() {
  return getDatabase(getAdminApp())
}
