/*
 * ----------------------------------------------
 * 管理 API：批次清除指定日期的測試資料
 * 2026-03-08
 * app/api/admin/purge-date/route.ts
 * ----------------------------------------------
 *
 * 使用方式（curl）：
 *   curl -X POST https://<domain>/api/admin/purge-date \
 *        -H "x-admin-secret: <ADMIN_SECRET>" \
 *        -H "Content-Type: application/json" \
 *        -d '{"date":"2026-03-08","targets":["r2","photos","photo_index","error_logs","devices"]}'
 *
 * 環境變數：ADMIN_SECRET、FIREBASE_ADMIN_PROJECT_ID、R2_BUCKET_NAME 等
 */

export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { deleteR2ObjectsByPrefix } from '@/lib/r2'

// ─── 內部工具：取得 Firestore access token ─────────────────────────────────

async function getToken(): Promise<string> {
  const pemToArrayBuffer = (pem: string): ArrayBuffer => {
    const base64 = pem
      .replace(/-----BEGIN (?:RSA )?PRIVATE KEY-----/g, '')
      .replace(/-----END (?:RSA )?PRIVATE KEY-----/g, '')
      .replace(/\s/g, '')
    const buf = Buffer.from(base64, 'base64')
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
  }
  const b64url = (s: string) =>
    btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

  const privateKeyPem =
    process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n') ?? ''
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL ?? ''
  const now = Math.floor(Date.now() / 1000)

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(privateKeyPem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = b64url(
    JSON.stringify({
      iss: clientEmail,
      sub: clientEmail,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
      scope: 'https://www.googleapis.com/auth/datastore',
    }),
  )
  const sig = b64url(
    String.fromCharCode(
      ...new Uint8Array(
        await crypto.subtle.sign(
          'RSASSA-PKCS1-v1_5',
          cryptoKey,
          new TextEncoder().encode(`${header}.${payload}`),
        ),
      ),
    ),
  )

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${header}.${payload}.${sig}`,
  })
  const json = (await tokenRes.json()) as { access_token: string }
  return json.access_token
}

// ─── 各 target 清除實作 ────────────────────────────────────────────────────

type PurgeResult = { deleted?: number; updated?: number; error?: string }

/** 清除 R2 指定日期前綴的所有原圖 */
async function purgeR2(date: string): Promise<PurgeResult> {
  try {
    const deleted = await deleteR2ObjectsByPrefix(`${date}/`)
    return { deleted }
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) }
  }
}

/** 以 Firestore structured query 查詢 date 欄位，回傳文件 name 清單 */
async function queryDocNamesByDate(
  collectionId: string,
  date: string,
  token: string,
): Promise<string[]> {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'date' },
              op: 'EQUAL',
              value: { stringValue: date },
            },
          },
          select: { fields: [{ fieldPath: 'date' }] },
          limit: 2000,
        },
      }),
    },
  )
  if (!res.ok) throw new Error(`runQuery ${collectionId} 失敗：${res.status}`)
  const rows = (await res.json()) as Array<{ document?: { name: string } }>
  return rows.filter((r) => r.document?.name).map((r) => r.document!.name)
}

/** 逐一 DELETE Firestore 文件（依 name 完整路徑） */
async function deleteDocsByNames(names: string[], token: string): Promise<number> {
  let count = 0
  for (const name of names) {
    const res = await fetch(`https://firestore.googleapis.com/v1/${name}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) count++
  }
  return count
}

/** 清除 Firestore photos 集合中指定日期的文件 */
async function purgePhotos(date: string, token: string): Promise<PurgeResult> {
  try {
    const names = await queryDocNamesByDate('photos', date, token)
    const deleted = await deleteDocsByNames(names, token)
    return { deleted }
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) }
  }
}

/** 清除 photo_index/{date} 文件 */
async function purgePhotoIndex(date: string, token: string): Promise<PurgeResult> {
  try {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/photo_index/${date}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
    )
    if (!res.ok && res.status !== 404) throw new Error(`DELETE photo_index 失敗：${res.status}`)
    return { deleted: res.status === 404 ? 0 : 1 }
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) }
  }
}

/** 清除 error_logs 集合中指定日期的文件 */
async function purgeErrorLogs(date: string, token: string): Promise<PurgeResult> {
  try {
    const names = await queryDocNamesByDate('error_logs', date, token)
    const deleted = await deleteDocsByNames(names, token)
    return { deleted }
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) }
  }
}

/** 清除 devices 集合中所有文件的 last_photo_url / last_shot_at */
async function purgeDevices(token: string): Promise<PurgeResult> {
  try {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
    const listRes = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/devices`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    if (!listRes.ok) throw new Error(`LIST devices 失敗：${listRes.status}`)
    const data = (await listRes.json()) as { documents?: Array<{ name: string }> }
    const docs = data.documents ?? []

    let updated = 0
    for (const doc of docs) {
      const patchRes = await fetch(
        `https://firestore.googleapis.com/v1/${doc.name}?updateMask.fieldPaths=last_photo_url&updateMask.fieldPaths=last_shot_at`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: {
              last_photo_url: { nullValue: null },
              last_shot_at: { nullValue: null },
            },
          }),
        },
      )
      if (patchRes.ok) updated++
    }
    return { updated }
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) }
  }
}

// ─── Route Handler ─────────────────────────────────────────────────────────

const VALID_TARGETS = ['r2', 'photos', 'photo_index', 'error_logs', 'devices'] as const
type Target = (typeof VALID_TARGETS)[number]

export async function POST(req: NextRequest) {
  // 驗證 admin secret
  const secret = req.headers.get('x-admin-secret')
  const expected = process.env.ADMIN_SECRET
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  // 解析 body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON 解析失敗' }, { status: 400 })
  }

  const { date, targets } = body as { date?: string; targets?: string[] }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: '缺少或格式錯誤的 date（需為 YYYY-MM-DD）' }, { status: 400 })
  }

  const resolvedTargets = (targets ?? []).filter((t): t is Target =>
    (VALID_TARGETS as readonly string[]).includes(t),
  )
  if (resolvedTargets.length === 0) {
    return NextResponse.json({ error: '未指定有效的 targets' }, { status: 400 })
  }

  // 取得 Firestore token（R2 不需要）
  let token = ''
  const needsFirestore = resolvedTargets.some((t) => t !== 'r2')
  if (needsFirestore) {
    try {
      token = await getToken()
    } catch (err) {
      return NextResponse.json(
        { error: `取得 Firestore token 失敗：${err instanceof Error ? err.message : String(err)}` },
        { status: 500 },
      )
    }
  }

  // 依 target 逐一執行，失敗不中斷
  const results: Record<string, PurgeResult> = {}
  for (const target of resolvedTargets) {
    switch (target) {
      case 'r2':
        results.r2 = await purgeR2(date)
        break
      case 'photos':
        results.photos = await purgePhotos(date, token)
        break
      case 'photo_index':
        results.photo_index = await purgePhotoIndex(date, token)
        break
      case 'error_logs':
        results.error_logs = await purgeErrorLogs(date, token)
        break
      case 'devices':
        results.devices = await purgeDevices(token)
        break
    }
  }

  return NextResponse.json({ ok: true, date, results })
}
