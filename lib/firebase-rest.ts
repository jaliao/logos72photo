/*
 * ----------------------------------------------
 * Firebase REST API 客戶端（Edge Runtime 相容）
 * 2026-02-21
 * lib/firebase-rest.ts
 * ----------------------------------------------
 *
 * 以 Web Crypto API（SubtleCrypto）簽署 Service Account JWT，
 * 取得 Google OAuth2 access token 後呼叫 Firestore / RTDB REST API。
 * 不依賴任何 Node.js 原生模組，可在 Cloudflare Workers Edge Runtime 執行。
 */

import type { PhotoDoc, ErrorLogDoc } from './types'

/** 模組層級 access token 快取（每個 Worker instance 內有效） */
let cachedToken: { value: string; expiresAt: number } | null = null

// ─── 內部工具函式 ───────────────────────────────────────────────────────────

/**
 * 將 PEM 私鑰字串解碼為 Buffer，供 SubtleCrypto.importKey 使用。
 *
 * 使用 Buffer.from(base64, 'base64') 而非 Uint8Array 手動解碼：
 * - 本地開發：Next.js edge runtime 以 VM sandbox 執行，手動建立的 Uint8Array
 *   屬於 VM realm，但 Node.js 原生 crypto.subtle 做 instanceof 檢查時用 host realm，
 *   導致「2nd argument is not instance of ArrayBuffer」錯誤。
 *   Node.js Buffer 是 host realm 物件，可跨 VM realm 被 WebCrypto 識別。
 * - Cloudflare Workers：原生提供 Buffer，行為相同。
 */
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN (?:RSA )?PRIVATE KEY-----/g, '')
    .replace(/-----END (?:RSA )?PRIVATE KEY-----/g, '')
    .replace(/\s/g, '')
  const buf = Buffer.from(base64, 'base64')
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
}

/** Base64URL 編碼（不含 padding） */
function base64url(data: ArrayBuffer | string): string {
  let bytes: Uint8Array
  if (typeof data === 'string') {
    bytes = new TextEncoder().encode(data)
  } else {
    bytes = new Uint8Array(data)
  }
  let str = ''
  bytes.forEach((b) => (str += String.fromCharCode(b)))
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// ─── Access Token ─────────────────────────────────────────────────────────

/**
 * 以 Service Account 私鑰產生 Google OAuth2 access token。
 * token 快取於模組層級，提前 30 秒判定過期以避免邊界情況。
 */
async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)

  if (cachedToken && cachedToken.expiresAt > now + 30) {
    return cachedToken.value
  }

  const privateKeyPem =
    process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n') ?? ''
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL ?? ''

  // 匯入 PKCS#8 私鑰
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(privateKeyPem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  // 建立 JWT header + payload
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = base64url(
    JSON.stringify({
      iss: clientEmail,
      sub: clientEmail,
      scope: [
        'https://www.googleapis.com/auth/datastore',
        'https://www.googleapis.com/auth/firebase.database',
      ].join(' '),
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  )

  const signingInput = `${header}.${payload}`
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput),
  )

  const jwt = `${signingInput}.${base64url(signature)}`

  // 交換 access token
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!res.ok) {
    throw new Error(`取得 access token 失敗：${res.status} ${await res.text()}`)
  }

  const data = (await res.json()) as { access_token: string; expires_in: number }
  cachedToken = { value: data.access_token, expiresAt: now + data.expires_in }
  return cachedToken.value
}

// ─── Firestore REST ────────────────────────────────────────────────────────

/** 將 JS 值轉換為 Firestore REST API Value 格式 */
function toFirestoreValue(value: unknown): Record<string, unknown> {
  if (value === null || value === undefined) return { nullValue: null }
  if (typeof value === 'boolean') return { booleanValue: value }
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value }
  }
  if (typeof value === 'string') return { stringValue: value }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } }
  }
  if (typeof value === 'object') {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value as Record<string, unknown>).map(([k, v]) => [
            k,
            toFirestoreValue(v),
          ]),
        ),
      },
    }
  }
  return { stringValue: String(value) }
}

/** 將 JS 物件頂層 key 轉換為 Firestore fields map */
function toFirestoreFields(
  data: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, toFirestoreValue(v)]),
  )
}

/**
 * Firestore REST：新增文件（自動產生 ID）
 * @param collection 集合路徑，例如 "photos"
 * @param data       要寫入的資料物件
 */
export async function addDoc(
  collection: string,
  data: Record<string, unknown>,
): Promise<void> {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const token = await getAccessToken()
  const fields = toFirestoreFields(data)

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    },
  )

  if (!res.ok) {
    throw new Error(`Firestore addDoc 失敗：${res.status} ${await res.text()}`)
  }
}

/**
 * Firestore REST：建立或合併文件（PATCH with updateMask）
 * @param collection 集合路徑，例如 "devices"
 * @param docId      文件 ID
 * @param data       要寫入的資料物件
 * @param merge      true = 只更新指定欄位；false = 完整覆寫
 */
export async function setDoc(
  collection: string,
  docId: string,
  data: Record<string, unknown>,
  merge = true,
): Promise<void> {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const token = await getAccessToken()
  const fields = toFirestoreFields(data)

  let url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`
  if (merge) {
    const mask = Object.keys(data)
      .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
      .join('&')
    url = `${url}?${mask}`
  }

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  })

  if (!res.ok) {
    throw new Error(`Firestore setDoc 失敗：${res.status} ${await res.text()}`)
  }
}

/**
 * Firestore REST：讀取集合所有文件
 * @param collectionPath 集合路徑，例如 "devices"
 * @returns 文件資料陣列（已解析為 JS 物件）
 */
export async function listDocs<T = Record<string, unknown>>(
  collectionPath: string,
): Promise<T[]> {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const token = await getAccessToken()

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionPath}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )

  if (!res.ok) {
    throw new Error(`Firestore listDocs 失敗：${res.status} ${await res.text()}`)
  }

  const data = (await res.json()) as { documents?: { fields: Record<string, unknown> }[] }
  if (!data.documents) return []

  return data.documents.map((doc) => parseFirestoreFields(doc.fields) as T)
}

/** 將 Firestore fields map 還原為 JS 物件 */
function parseFirestoreFields(fields: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(fields).map(([k, v]) => [k, parseFirestoreValue(v as Record<string, unknown>)]),
  )
}

/** 將 Firestore Value 格式還原為 JS 值 */
function parseFirestoreValue(value: Record<string, unknown>): unknown {
  if ('nullValue' in value) return null
  if ('booleanValue' in value) return value.booleanValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return value.doubleValue
  if ('stringValue' in value) return value.stringValue
  if ('timestampValue' in value) return new Date(value.timestampValue as string).getTime()
  if ('arrayValue' in value) {
    const arr = value.arrayValue as { values?: Record<string, unknown>[] }
    return (arr.values ?? []).map(parseFirestoreValue)
  }
  if ('mapValue' in value) {
    const map = value.mapValue as { fields?: Record<string, unknown> }
    return parseFirestoreFields((map.fields ?? {}) as Record<string, unknown>)
  }
  return null
}

// ─── Firestore 結構化查詢 ───────────────────────────────────────────────────

/** 將 filters 陣列轉換為 Firestore StructuredQuery 格式 */
function buildStructuredQuery(
  collectionId: string,
  filters: Array<{ field: string; value: unknown }>,
): Record<string, unknown> {
  const fieldFilters = filters.map(({ field, value }) => ({
    fieldFilter: {
      field: { fieldPath: field },
      op: 'EQUAL',
      value: toFirestoreValue(value),
    },
  }))

  return {
    structuredQuery: {
      from: [{ collectionId }],
      where:
        fieldFilters.length === 1
          ? fieldFilters[0]
          : { compositeFilter: { op: 'AND', filters: fieldFilters } },
    },
  }
}

/**
 * Firestore REST：以多條件 EQUAL 查詢集合文件
 * @param collectionId 集合名稱，例如 "photos"
 * @param filters      欄位過濾條件陣列（AND 組合）
 * @returns 文件陣列（已解析為 PhotoDoc）
 */
export async function queryPhotos(
  filters: Array<{ field: string; value: unknown }>,
): Promise<PhotoDoc[]> {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const token = await getAccessToken()
  const body = buildStructuredQuery('photos', filters)

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  )

  if (!res.ok) {
    throw new Error(`Firestore queryPhotos 失敗：${res.status} ${await res.text()}`)
  }

  const rows = (await res.json()) as Array<{ document?: { fields: Record<string, unknown> } }>
  return rows
    .filter((r) => r.document)
    .map((r) => parseFirestoreFields(r.document!.fields) as unknown as PhotoDoc)
}

/**
 * Firestore REST：依日期查詢 error_logs，依 timestamp 降冪排列
 * @param date 台灣時間日期字串，格式 YYYY-MM-DD
 */
export async function queryErrorLogs(date: string): Promise<ErrorLogDoc[]> {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const token = await getAccessToken()

  const body = {
    structuredQuery: {
      from: [{ collectionId: 'error_logs' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'date' },
          op: 'EQUAL',
          value: { stringValue: date },
        },
      },
      orderBy: [{ field: { fieldPath: 'timestamp' }, direction: 'DESCENDING' }],
      limit: 500,
    },
  }

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  )

  if (!res.ok) {
    throw new Error(`Firestore queryErrorLogs 失敗：${res.status} ${await res.text()}`)
  }

  const rows = (await res.json()) as Array<{ document?: { fields: Record<string, unknown> } }>
  return rows
    .filter((r) => r.document)
    .map((r) => parseFirestoreFields(r.document!.fields) as unknown as ErrorLogDoc)
}

// ─── RTDB REST ─────────────────────────────────────────────────────────────

/**
 * Firestore REST：查詢所有有照片的日期與時段索引
 * 使用 field mask 僅拉取 date 與 slot_8h，減少傳輸量。
 * @returns 依日期由新到舊排序的陣列，每項包含日期與有照片的時段 Set
 */
export async function queryDatesWithSlots(): Promise<
  Array<{ date: string; slots: Set<0 | 8 | 16> }>
> {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const token = await getAccessToken()

  const body = {
    structuredQuery: {
      from: [{ collectionId: 'photos' }],
      select: {
        fields: [{ fieldPath: 'date' }, { fieldPath: 'slot_8h' }],
      },
      limit: 2000,
    },
  }

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  )

  if (!res.ok) {
    throw new Error(`Firestore queryDatesWithSlots 失敗：${res.status} ${await res.text()}`)
  }

  const rows = (await res.json()) as Array<{ document?: { fields: Record<string, unknown> } }>

  // 建立 Map<date, Set<slot_8h>> 去重
  const map = new Map<string, Set<0 | 8 | 16>>()
  for (const row of rows) {
    if (!row.document) continue
    const fields = parseFirestoreFields(row.document.fields)
    const date = fields.date as string
    const slot = fields.slot_8h as 0 | 8 | 16
    if (!date || slot === undefined) continue
    if (!map.has(date)) map.set(date, new Set())
    map.get(date)!.add(slot)
  }

  // 依日期由新到舊排序
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, slots]) => ({ date, slots }))
}

// ─── photo_index 反正規化索引 ──────────────────────────────────────────────

/** photo_index 文件結構 */
export interface PhotoIndexDoc {
  slots: number[]
  hours: Record<string, number[]>
  hourCounts?: Record<string, Record<string, number>>
  firstPhotos?: Record<string, Record<string, string>>
}

/**
 * 讀取 photo_index/{date} 單一文件，取得該日期的小時索引 map。
 * 文件不存在時回傳空物件，不拋出例外。
 */
export async function getPhotoIndexByDate(
  date: string,
): Promise<{ hours: Record<string, number[]>; hourCounts: Record<string, Record<string, number>>; firstPhotos: Record<string, Record<string, string>> }> {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const token = await getAccessToken()

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/photo_index/${date}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )

  if (res.status === 404) return { hours: {}, hourCounts: {}, firstPhotos: {} }
  if (!res.ok) {
    throw new Error(`Firestore getPhotoIndexByDate 失敗：${res.status} ${await res.text()}`)
  }

  const data = (await res.json()) as { fields?: Record<string, unknown> }
  if (!data.fields) return { hours: {}, hourCounts: {}, firstPhotos: {} }

  const parsed = parseFirestoreFields(data.fields) as unknown as PhotoIndexDoc
  return {
    hours: (parsed.hours as Record<string, number[]>) ?? {},
    hourCounts: (parsed.hourCounts as Record<string, Record<string, number>>) ?? {},
    firstPhotos: (parsed.firstPhotos as Record<string, Record<string, string>>) ?? {},
  }
}

/**
 * 讀取 photo_index 集合所有文件，回傳與 queryDatesWithSlots 相同介面。
 * 用於首頁，讀取量為 O(日期數) 而非 O(照片數)。
 */
export async function queryPhotoIndex(
  startDate?: string,
  endDate?: string,
): Promise<Array<{ date: string; slots: Set<0 | 8 | 16> }>> {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const token = await getAccessToken()

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/photo_index`,
    { headers: { Authorization: `Bearer ${token}` } },
  )

  if (!res.ok) {
    throw new Error(`Firestore queryPhotoIndex 失敗：${res.status} ${await res.text()}`)
  }

  const data = (await res.json()) as {
    documents?: Array<{ name: string; fields: Record<string, unknown> }>
  }
  if (!data.documents) return []

  return data.documents
    .map((doc) => {
      // document name 末段為 date（YYYY-MM-DD）
      const date = doc.name.split('/').pop() ?? ''
      const parsed = parseFirestoreFields(doc.fields) as unknown as PhotoIndexDoc
      const slots = new Set<0 | 8 | 16>((parsed.slots ?? []) as Array<0 | 8 | 16>)
      return { date, slots }
    })
    .filter(({ date }) => {
      if (startDate && date < startDate) return false
      if (endDate && date > endDate) return false
      return true
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

/**
 * 更新 photo_index/{date} 文件，合併新的 slot_8h 與 hourMin。
 * 若文件不存在則建立；使用記憶體 Set 去重後整體 PATCH。
 */
export async function updatePhotoIndex(
  date: string,
  slot8h: 0 | 8 | 16,
  hourMin: number,
  r2Url?: string,
): Promise<void> {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const token = await getAccessToken()
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/photo_index/${date}`

  // 讀取現有文件（不存在則用空結構）
  const getRes = await fetch(baseUrl, { headers: { Authorization: `Bearer ${token}` } })
  let existing: PhotoIndexDoc = { slots: [], hours: {}, hourCounts: {}, firstPhotos: {} }
  if (getRes.ok) {
    const data = (await getRes.json()) as { fields?: Record<string, unknown> }
    if (data.fields) {
      existing = parseFirestoreFields(data.fields) as unknown as PhotoIndexDoc
      existing.slots = existing.slots ?? []
      existing.hours = (existing.hours as Record<string, number[]>) ?? {}
      existing.hourCounts = (existing.hourCounts as Record<string, Record<string, number>>) ?? {}
      existing.firstPhotos = (existing.firstPhotos as Record<string, Record<string, string>>) ?? {}
    }
  }

  // 記憶體合併（Set 去重）
  const slotsSet = new Set<number>(existing.slots)
  slotsSet.add(slot8h)

  const slotKey = String(slot8h)
  const hoursSet = new Set<number>(existing.hours[slotKey] ?? [])
  hoursSet.add(hourMin)

  // hourCounts 遞增
  const existingCounts = existing.hourCounts ?? {}
  const slotCounts = { ...(existingCounts[slotKey] ?? {}) }
  const hourKey = String(hourMin)
  slotCounts[hourKey] = (slotCounts[hourKey] ?? 0) + 1

  // firstPhotos first-write-wins：僅在尚未設定時寫入封面 URL
  const existingFirstPhotos = existing.firstPhotos ?? {}
  const slotFirstPhotos = { ...(existingFirstPhotos[slotKey] ?? {}) }
  if (r2Url && !slotFirstPhotos[hourKey]) {
    slotFirstPhotos[hourKey] = r2Url
  }

  const updated: PhotoIndexDoc = {
    slots: Array.from(slotsSet),
    hours: { ...existing.hours, [slotKey]: Array.from(hoursSet) },
    hourCounts: { ...existingCounts, [slotKey]: slotCounts },
    firstPhotos: { ...existingFirstPhotos, [slotKey]: slotFirstPhotos },
  }

  // PATCH 完整覆寫（updateMask 包含 slots + hours + hourCounts + firstPhotos）
  const fields = toFirestoreFields(updated as unknown as Record<string, unknown>)
  const patchRes = await fetch(
    `${baseUrl}?updateMask.fieldPaths=slots&updateMask.fieldPaths=hours&updateMask.fieldPaths=hourCounts&updateMask.fieldPaths=firstPhotos`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    },
  )

  if (!patchRes.ok) {
    throw new Error(`Firestore updatePhotoIndex 失敗：${patchRes.status} ${await patchRes.text()}`)
  }
}

/**
 * RTDB REST：寫入節點（PUT 完整覆寫）
 * @param path  節點路徑，例如 "trigger/last_shot"
 * @param value 要寫入的值
 */
export async function rtdbSet(path: string, value: unknown): Promise<void> {
  const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.replace(/\/$/, '')

  // trigger/last_shot 為公開寫入節點（RTDB 規則 .write: true），不需要 access token
  // 安全性由 /api/trigger 的 x-trigger-secret 驗證保障
  const res = await fetch(`${dbUrl}/${path}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  })

  if (!res.ok) {
    throw new Error(`RTDB rtdbSet 失敗：${res.status} ${await res.text()}`)
  }
}
